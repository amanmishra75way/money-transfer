export interface ITransactionDTO {
  fromId: string;
  toId: string;
  amount: number;
  type: "transfer" | "deposit" | "withdrawal" | "payment";
  description?: string;
  isInternational?: boolean;
}
