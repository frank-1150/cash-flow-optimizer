export interface Account {
    id: string;
    name: string;
    apy: number; // e.g., 0.036 for 3.6%
    transferTime: number; // days to transfer TO main checking
    isMain: boolean; // Checking account used for payments
    balance: number;
}

export interface CreditCard {
    id: string;
    name: string;
    dueDay: number; // day of month (1-31)
    statementDate?: number; // day of month, optional for estimation
    balance: number;
    paymentAccount: string; // ID of the account used to pay this card
}

export interface Transaction {
    id: string;
    date: string; // ISO date string YYYY-MM-DD
    amount: number;
    type: 'income' | 'expense' | 'transfer' | 'payment';
    description: string;
    relatedId?: string; // ID of the account or card related to this transaction
}

export interface TransferPlan {
    date: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    reason: string;
}

export interface RecurringExpense {
    id: string;
    name: string;
    amount: number;
    dueDay: number; // day of month (1-31)
    paymentAccount: string; // ID of the account used to pay this expense
}
