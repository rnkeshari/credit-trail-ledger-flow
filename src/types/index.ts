
export interface Person {
  id: string;
  name: string;
  locations: Location[];
  transactions: Transaction[];
}

export interface Location {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  personId: string;
  locationId: string;
  type: "money" | "item";
  amount: number;
  itemName?: string;
  date: string;
  isCredit: boolean; // true for lending/credit, false for repayment
  notes?: string;
}

export interface Dashboard {
  totalCredits: number;
  totalRepayments: number;
  outstandingAmount: number;
  totalPeople: number;
}

export interface DataBackupOptions {
  includeTransactions: boolean;
  includePeople: boolean;
  includeLocations: boolean;
}
