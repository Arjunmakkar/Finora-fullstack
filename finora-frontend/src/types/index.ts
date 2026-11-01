export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number; // paise
  category: string;
  description: string;
  merchant?: string | null;
  date: string;
  paymentMethod: string;
  recurring: boolean;
  notes?: string | null;
}

export interface Budget {
  id: string;
  category: string;
  month: string;
  limitAmount: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface Investment {
  id: string;
  assetName: string;
  symbol?: string | null;
  assetType: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  invested: number;
  currentValue: number;
  profitLoss: number;
  returnPercent: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  deadline: string;
  progressPercent: number;
  remaining: number;
  monthsLeft: number;
  requiredMonthly: number;
  onTrack: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextPayment: string;
  category: string;
  paymentMethod: string;
  active: boolean;
}

export interface DashboardSummary {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  investmentValue: number;
  cashFlow: number;
  savingsRate: number;
  budgetUsagePercent: number;
}

export interface FinancialHealth {
  score: number;
  label: string;
  breakdown: Record<string, number>;
  insights: { type: 'positive' | 'warning' | 'suggestion'; message: string }[];
}
