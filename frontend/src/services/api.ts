import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { loginFailure, loginSuccess, logout, registerFailure, registerSuccess } from "../redux/authReducer.jsx";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginResponse {
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  success: boolean;
}

interface RegisterResponse {
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  success: boolean;
}

interface ProfileResponse {
  data: User;
  message: string;
  success: boolean;
}

interface LogoutResponse {
  data?: null;
  message: string;
  success?: boolean;
}

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: "/users/refresh-token",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as {
          accessToken: string;
          refreshToken: string;
        };

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        api.dispatch(
          loginSuccess({
            user: api.getState().auth.user,
            accessToken,
            refreshToken: newRefreshToken,
          })
        );

        result = await baseQuery(
          {
            ...args,
            headers: {
              ...args.headers,
              Authorization: `Bearer ${accessToken}`,
            },
          },
          api,
          extraOptions
        );
      } else {
        api.dispatch(loginFailure("Session expired. Please log in again."));
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } else {
      api.dispatch(loginFailure("Session expired. Please log in again."));
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    loginUser: builder.mutation<LoginResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
      onQueryStarted: async (arg, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          if (data && data.data.accessToken) {
            dispatch(
              loginSuccess({
                user: data.data.user,
                accessToken: data.data.accessToken,
                refreshToken: data.data.refreshToken,
              })
            );
            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("refreshToken", data.data.refreshToken);
          }
        } catch (err) {
          dispatch(loginFailure("Login failed"));
        }
      },
    }),

    registerUser: builder.mutation<RegisterResponse, { name: string; email: string; role: string; password: string }>({
      query: (userDetails) => ({
        url: "/users/register",
        method: "POST",
        body: userDetails,
      }),
      onQueryStarted: async (arg, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data.accessToken) {
            dispatch(
              registerSuccess({
                user: data.data.user,
                accessToken: data.data.accessToken,
                refreshToken: data.data.refreshToken,
              })
            );
            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("refreshToken", data.data.refreshToken);
          }
        } catch (err) {
          dispatch(registerFailure("Registration failed"));
        }
      },
    }),

    logoutUser: builder.mutation<LogoutResponse, void>({
      query: () => {
        const refreshToken = localStorage.getItem("refreshToken");
        return {
          url: "/users/logout",
          method: "POST",
          body: { refreshToken },
        };
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
          dispatch(api.util.resetApiState());
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    }),

    getUserProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: "/users/profile",
      }),
    }),
  }),
});

export const { useLoginUserMutation, useRegisterUserMutation, useGetUserProfileQuery, useLogoutUserMutation } = api;
