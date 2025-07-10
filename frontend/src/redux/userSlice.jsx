import { createSlice } from "@reduxjs/toolkit";

const savedUsers = localStorage.getItem("users");
const savedCurrentUser = localStorage.getItem("currentUser");

const initialState = {
  users: savedUsers
    ? JSON.parse(savedUsers)
    : [
        { id: "u1", name: "Alice", password: "alice123", balance: 1000, isAdmin: false },
        { id: "u2", name: "Bob", password: "bob123", balance: 1500, isAdmin: false },
        { id: "admin", name: "Admin", password: "admin123", balance: 0, isAdmin: true },
      ],
  currentUser: savedCurrentUser ? JSON.parse(savedCurrentUser) : null,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action) {
      const { id, password } = action.payload;
      const user = state.users.find((u) => u.id === id && u.password === password);
      if (user) {
        const payload = { id: user.id, name: user.name, isAdmin: user.isAdmin };
        state.currentUser = payload;
        state.error = null;
        localStorage.setItem("currentUser", JSON.stringify(payload));
      } else {
        state.error = "Invalid credentials";
      }
    },

    logout(state) {
      state.currentUser = null;
      state.error = null;
      localStorage.removeItem("currentUser");
    },

    updateBalance(state, action) {
      const { userId, amount } = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (user) {
        user.balance = (user.balance || 0) + amount;
        localStorage.setItem("users", JSON.stringify(state.users)); // 💾 Save update
      }
    },

    resetUsers(state) {
      state.users = initialState.users;
      localStorage.removeItem("users");
    },
  },
});

export const { login, logout, updateBalance, resetUsers } = userSlice.actions;
export default userSlice.reducer;
