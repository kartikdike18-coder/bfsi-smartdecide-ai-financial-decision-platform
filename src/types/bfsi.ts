export type LoanType = 'home' | 'personal' | 'auto' | 'business' | 'education';

export type EmploymentType = 'salaried' | 'self_employed' | 'business_owner' | 'professional';

export type Currency = 'INR' | 'USD';

export interface LoanApplication {
  fullName: string;
  email: string;
  phone: string;
  age: number;
  employmentType: EmploymentType;
  workExperienceYears: number;
  monthlyIncome: number;
  existingEmi: number;
  otherMonthlyExpenses: number;
  creditScore: number;
  loanType: LoanType;
  requestedAmount: number;
  tenureYears: number;
  expectedInterestRate?: number;
}

export interface LoanEligibilityResult {
  isEligible: boolean;
  approvalProbability: number; // 0 - 100%
  eligibilityScore: number; // 0 - 100
  maxEligibleLoan: number;
  recommendedEmi: number;
  actualEmi: number;
  foir: number; // Fixed Obligation to Income Ratio %
  dti: number; // Debt to Income %
  disposableIncome: number;
  interestRateOffered: number;
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  maxTenureAllowed: number;
  keyStrengths: string[];
  riskFactors: string[];
  recommendations: string[];
}

export interface CreditFactor {
  name: string;
  weight: number; // e.g. 35%
  score: number; // 0 - 100
  status: 'Excellent' | 'Good' | 'Average' | 'Poor';
  detail: string;
  tip: string;
}

export interface CreditReport {
  score: number;
  rating: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
  ratingColor: string;
  summary: string;
  factors: CreditFactor[];
  negativeRemarks: string[];
  positiveRemarks: string[];
  estimatedTotalCreditLimit: number;
  currentCreditUtilizationPercent: number;
  inquiriesLast6Months: number;
  improvementRoadmap: {
    month: string;
    targetScore: number;
    action: string;
  }[];
}

export interface AmortizationRow {
  month: number;
  year: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  balanceRemaining: number;
  loanPaidPercent: number;
}

export interface EmiCalculationResult {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  totalAmount: number;
  interestToPrincipalRatio: number;
  amortizationSchedule: AmortizationRow[];
  prepaymentAnalysis?: {
    lumpSumAmount: number;
    newTotalInterest: number;
    interestSaved: number;
    tenureReducedMonths: number;
  };
}

export interface FinancialRecord {
  id: string;
  timestamp: string;
  applicantName: string;
  email: string;
  phone: string;
  loanType: LoanType;
  requestedAmount: number;
  monthlyIncome: number;
  creditScore: number;
  maxEligibleLoan: number;
  foir: number;
  status: 'Approved' | 'Conditional' | 'High Risk' | 'Rejected';
  notes: string;
  syncedToGoogleSheets?: boolean;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: string[];
  tags?: string[];
}

export interface GoogleSheetsConfig {
  webhookUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime?: string;
}
