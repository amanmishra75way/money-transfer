// transaction.dto.ts
export interface ITransactionDTO {
  fromId: string;
  toId: string;
  amount: number;
  type: "transfer" | "deposit" | "withdrawal" | "payment";
  description?: string;
  isInternational?: boolean;
}

export interface ICreateTransactionDTO {
  toId: string;
  amount: number;
  type: "transfer" | "deposit" | "withdrawal" | "payment";
  description?: string;
  isInternational?: boolean;
}

export interface IApproveTransactionDTO {
  status: "approved" | "rejected" | "completed";
  remarks?: string;
}
