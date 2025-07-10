import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { loginFailure, loginSuccess, logout, registerFailure, registerSuccess } from "../redux/authReducer.jsx";

// User interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  balance?: number;
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

// Transaction interfaces
interface Transaction {
  _id: string;
  fromId: string | User;
  toId: string | User;
  amount: number;
  type: "transfer" | "deposit" | "withdrawal" | "payment";
  status: "pending" | "approved" | "rejected" | "completed";
  isInternational: boolean;
  commission: number;
  description?: string;
  processedBy?: string | User;
  processedAt?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTransactionRequest {
  toId: string;
  amount: number;
  type: "transfer" | "deposit" | "withdrawal" | "payment";
  description?: string;
  isInternational?: boolean;
}

interface ApproveTransactionRequest {
  status: "approved" | "rejected" | "completed";
  remarks?: string;
}

interface TransactionResponse {
  data: Transaction;
  message: string;
  success: boolean;
}

interface TransactionsResponse {
  data: Transaction[];
  message: string;
  success: boolean;
}

interface TransactionStatsResponse {
  data: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  message: string;
  success: boolean;
}

// Password reset interfaces
interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ApiResponse {
  data?: any;
  message: string;
  success: boolean;
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
  tagTypes: ["User", "Transaction", "Profile"],
  endpoints: (builder) => ({
    // ================================
    // USER AUTHENTICATION ENDPOINTS
    // ================================
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
      invalidatesTags: ["User", "Profile"],
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
      invalidatesTags: ["User", "Profile"],
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
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        } catch (error) {
          console.error("Logout failed:", error);
          // Still clear local storage and logout on error
          dispatch(logout());
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      },
    }),

    getUserProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: "/users/profile",
      }),
      providesTags: ["Profile"],
    }),

    updateUserProfile: builder.mutation<ProfileResponse, Partial<User>>({
      query: (updateData) => ({
        url: "/users/profile",
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: ["Profile", "User"],
    }),

    // ================================
    // PASSWORD MANAGEMENT ENDPOINTS
    // ================================
    forgotPassword: builder.mutation<ApiResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: "/users/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation<ApiResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: "/users/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    changePassword: builder.mutation<ApiResponse, ChangePasswordRequest>({
      query: (data) => ({
        url: "/users/change-password",
        method: "POST",
        body: data,
      }),
    }),

    // ================================
    // TRANSACTION ENDPOINTS
    // ================================
    requestTransaction: builder.mutation<TransactionResponse, CreateTransactionRequest>({
      query: (transactionData) => ({
        url: "/transactions/request",
        method: "POST",
        body: transactionData,
      }),
      invalidatesTags: ["Transaction", "Profile"],
    }),

    getUserTransactions: builder.query<TransactionsResponse, void>({
      query: () => ({
        url: "/transactions/my-transactions",
      }),
      providesTags: ["Transaction"],
    }),

    getTransactionById: builder.query<TransactionResponse, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Transaction", id }],
    }),

    getTransactionStats: builder.query<TransactionStatsResponse, void>({
      query: () => ({
        url: "/transactions/stats",
      }),
      providesTags: ["Transaction"],
    }),

    // ================================
    // ADMIN TRANSACTION ENDPOINTS
    // ================================
    getAllTransactions: builder.query<TransactionsResponse, void>({
      query: () => ({
        url: "/transactions/admin/all",
      }),
      providesTags: ["Transaction"],
    }),

    getPendingTransactions: builder.query<TransactionsResponse, void>({
      query: () => ({
        url: "/transactions/admin/pending",
      }),
      providesTags: ["Transaction"],
    }),

    approveTransaction: builder.mutation<TransactionResponse, { id: string } & ApproveTransactionRequest>({
      query: ({ id, ...data }) => ({
        url: `/transactions/${id}/approve`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Transaction", "Profile"],
    }),

    // ================================
    // REFRESH TOKEN ENDPOINT
    // ================================
    refreshToken: builder.mutation<{ accessToken: string; refreshToken: string }, { refreshToken: string }>({
      query: (data) => ({
        url: "/users/refresh-token",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// Export hooks for all endpoints
export const {
  // Authentication hooks
  useLoginUserMutation,
  useRegisterUserMutation,
  useLogoutUserMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,

  // Password management hooks
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,

  // Transaction hooks
  useRequestTransactionMutation,
  useGetUserTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetTransactionStatsQuery,

  // Admin transaction hooks
  useGetAllTransactionsQuery,
  useGetPendingTransactionsQuery,
  useApproveTransactionMutation,

  // Utility hooks
  useRefreshTokenMutation,
} = api;

// Export types for use in components
export type {
  User,
  Transaction,
  CreateTransactionRequest,
  ApproveTransactionRequest,
  LoginResponse,
  RegisterResponse,
  TransactionResponse,
  TransactionsResponse,
  TransactionStatsResponse,
};
