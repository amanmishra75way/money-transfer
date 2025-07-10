import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

const savedTxns = localStorage.getItem("transactions");

const initialState = {
  transactions: savedTxns ? JSON.parse(savedTxns) : [],
};

const txnSlice = createSlice({
  name: "txn",
  initialState,
  reducers: {
    requestTransaction(state, action) {
      const { fromId, toId, amount, type, isInternational } = action.payload;
      const commission = isInternational ? 0.1 * amount : 0.02 * amount;

      const newTxn = {
        id: uuid(),
        fromId,
        toId,
        amount,
        type,
        status: "pending",
        isInternational,
        commission,
        timestamp: new Date().toISOString(),
      };

      state.transactions.push(newTxn);
      localStorage.setItem("transactions", JSON.stringify(state.transactions));
    },

    approveTransaction(state, action) {
      const txn = state.transactions.find((txn) => txn.id === action.payload);
      if (txn) {
        txn.status = "approved";
        localStorage.setItem("transactions", JSON.stringify(state.transactions));
      }
    },
  },
});

export const { requestTransaction, approveTransaction } = txnSlice.actions;
export default txnSlice.reducer;
