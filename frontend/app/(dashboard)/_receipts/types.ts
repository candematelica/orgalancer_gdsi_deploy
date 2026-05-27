export type ReceiptStatus = "pending" | "paid" | "cancelled";

export interface Receipt {
  id:           string;
  concept:      string;
  amount:       number;
  status:       ReceiptStatus;
  date_emitted: string;
  project_id:   string;
  project_name?: string;
  client_id?:   string;
  client_name?: string;
}

export interface ReceiptCreatePayload {
  concept:      string;
  amount:       number;
  status?:      ReceiptStatus;
  date_emitted: string;
  project_id?:   string;
  client_id?:   string;
}