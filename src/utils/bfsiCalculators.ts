import {
  AmortizationRow,
  CreditFactor,
  CreditReport,
  Currency,
  EmiCalculationResult,
  LoanApplication,
  LoanEligibilityResult,
} from '../types/bfsi';

/**
 * Currency formatter
 */
export function formatCurrency(amount: number, currency: Currency = 'INR'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return currency === 'INR' ? '₹0' : '$0';

  if (currency === 'INR') {
    // Format in Indian number system (Lakhs and Crores) if large
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // USD
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Detailed Number formatter with exact digits
 */
export function formatExactCurrency(amount: number, currency: Currency = 'INR'): string {
  if (isNaN(amount)) return currency === 'INR' ? '₹0' : '$0';
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Benchmark interest rates by loan type
 */
export function getBenchmarkInterestRate(loanType: string, creditScore: number): number {
  let baseRate = 8.5;
  switch (loanType) {
    case 'home':
      baseRate = 8.4;
      break;
    case 'personal':
      baseRate = 11.5;
      break;
    case 'auto':
      baseRate = 8.9;
      break;
    case 'business':
      baseRate = 12.0;
      break;
    case 'education':
      baseRate = 9.25;
      break;
    default:
      baseRate = 10.0;
  }

  // Credit score risk premium or discount
  if (creditScore >= 800) {
    baseRate -= 0.5;
  } else if (creditScore >= 750) {
    baseRate -= 0.25;
  } else if (creditScore < 650) {
    baseRate += 1.75;
  } else if (creditScore < 700) {
    baseRate += 0.85;
  }

  return Math.max(6.5, Math.round(baseRate * 100) / 100);
}

/**
 * Standard EMI Calculator formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEmi(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  lumpSumPrepayment: number = 0,
  prepaymentMonth: number = 12
): EmiCalculationResult {
  if (principal <= 0 || tenureMonths <= 0) {
    return {
      principal: 0,
      annualRate,
      tenureMonths: 0,
      monthlyEmi: 0,
      totalInterest: 0,
      totalAmount: 0,
      interestToPrincipalRatio: 0,
      amortizationSchedule: [],
    };
  }

  const monthlyRate = annualRate / 12 / 100;
  let monthlyEmi = 0;

  if (monthlyRate === 0) {
    monthlyEmi = principal / tenureMonths;
  } else {
    monthlyEmi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  }

  const totalAmount = monthlyEmi * tenureMonths;
  const totalInterest = Math.max(0, totalAmount - principal);
  const interestToPrincipalRatio = principal > 0 ? (totalInterest / principal) * 100 : 0;

  // Generate complete amortization schedule
  const amortizationSchedule: AmortizationRow[] = [];
  let currentBalance = principal;

  for (let m = 1; m <= tenureMonths; m++) {
    const interestPayment = currentBalance * monthlyRate;
    let principalPayment = monthlyEmi - interestPayment;

    if (m === tenureMonths || currentBalance < principalPayment) {
      principalPayment = currentBalance;
    }

    currentBalance = Math.max(0, currentBalance - principalPayment);
    const loanPaidPercent = ((principal - currentBalance) / principal) * 100;

    amortizationSchedule.push({
      month: m,
      year: Math.ceil(m / 12),
      principalPayment: Math.round(principalPayment),
      interestPayment: Math.round(interestPayment),
      totalPayment: Math.round(monthlyEmi),
      balanceRemaining: Math.round(currentBalance),
      loanPaidPercent: Math.round(loanPaidPercent * 10) / 10,
    });

    if (currentBalance <= 0) break;
  }

  // Prepayment analysis if requested
  let prepaymentAnalysis: EmiCalculationResult['prepaymentAnalysis'] = undefined;
  if (lumpSumPrepayment > 0 && lumpSumPrepayment < principal) {
    let prepayBalance = principal;
    let newInterest = 0;
    let newMonths = 0;

    for (let m = 1; m <= tenureMonths; m++) {
      if (m === prepaymentMonth) {
        prepayBalance = Math.max(0, prepayBalance - lumpSumPrepayment);
      }
      if (prepayBalance <= 0) break;

      const intPart = prepayBalance * monthlyRate;
      let princPart = monthlyEmi - intPart;
      if (prepayBalance < princPart) {
        princPart = prepayBalance;
      }
      prepayBalance -= princPart;
      newInterest += intPart;
      newMonths = m;
    }

    prepaymentAnalysis = {
      lumpSumAmount: lumpSumPrepayment,
      newTotalInterest: Math.round(newInterest),
      interestSaved: Math.max(0, Math.round(totalInterest - newInterest)),
      tenureReducedMonths: Math.max(0, tenureMonths - newMonths),
    };
  }

  return {
    principal,
    annualRate,
    tenureMonths,
    monthlyEmi: Math.round(monthlyEmi),
    totalInterest: Math.round(totalInterest),
    totalAmount: Math.round(totalAmount),
    interestToPrincipalRatio: Math.round(interestToPrincipalRatio * 10) / 10,
    amortizationSchedule,
    prepaymentAnalysis,
  };
}

/**
 * Comprehensive BFSI Loan Eligibility Prediction Engine
 */
export function evaluateLoanEligibility(app: LoanApplication): LoanEligibilityResult {
  const annualRate = app.expectedInterestRate || getBenchmarkInterestRate(app.loanType, app.creditScore);
  const tenureMonths = app.tenureYears * 12;

  // Max permissible FOIR (Fixed Obligation to Income Ratio)
  // Higher income brackets & higher credit scores receive higher permissible FOIR
  let maxPermissibleFoir = 0.50; // 50% baseline

  if (app.monthlyIncome >= 200000) {
    maxPermissibleFoir = 0.65; // 65% for affluent applicants
  } else if (app.monthlyIncome >= 100000) {
    maxPermissibleFoir = 0.60;
  } else if (app.monthlyIncome >= 50000) {
    maxPermissibleFoir = 0.55;
  } else {
    maxPermissibleFoir = 0.45;
  }

  // Adjust permissible FOIR by credit score
  if (app.creditScore >= 780) {
    maxPermissibleFoir += 0.05;
  } else if (app.creditScore < 650) {
    maxPermissibleFoir -= 0.10;
  }

  // Max tenure allowed based on retirement age (typically 60 for salaried, 65 for business)
  const maxRetirementAge = app.employmentType === 'salaried' ? 60 : 65;
  const maxAllowedYears = Math.max(1, Math.min(app.tenureYears, maxRetirementAge - app.age));
  const effectiveTenureMonths = maxAllowedYears * 12;

  // Monthly available surplus for new EMI
  const existingObligations = app.existingEmi || 0;
  const maxAllowableEmi = Math.max(0, (app.monthlyIncome * maxPermissibleFoir) - existingObligations);

  // Compute maximum eligible loan amount from max allowable EMI
  const monthlyRate = annualRate / 12 / 100;
  let maxEligibleLoan = 0;

  if (maxAllowableEmi > 0 && effectiveTenureMonths > 0) {
    if (monthlyRate === 0) {
      maxEligibleLoan = maxAllowableEmi * effectiveTenureMonths;
    } else {
      // P = E * ((1 + r)^n - 1) / (r * (1 + r)^n)
      maxEligibleLoan =
        (maxAllowableEmi * (Math.pow(1 + monthlyRate, effectiveTenureMonths) - 1)) /
        (monthlyRate * Math.pow(1 + monthlyRate, effectiveTenureMonths));
    }
  }

  // Actual EMI for requested amount
  const actualEmiCalc = calculateEmi(app.requestedAmount, annualRate, tenureMonths);
  const actualEmi = actualEmiCalc.monthlyEmi;

  // Actual FOIR with requested loan
  const totalProjectedEmi = existingObligations + actualEmi;
  const foir = app.monthlyIncome > 0 ? (totalProjectedEmi / app.monthlyIncome) * 100 : 100;
  const dti = app.monthlyIncome > 0 ? ((existingObligations + app.otherMonthlyExpenses + actualEmi) / app.monthlyIncome) * 100 : 100;
  const disposableIncome = Math.max(0, app.monthlyIncome - totalProjectedEmi - app.otherMonthlyExpenses);

  // Score components
  let score = 100;
  const keyStrengths: string[] = [];
  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  // 1. Credit Score evaluation
  if (app.creditScore >= 780) {
    keyStrengths.push(`Excellent credit score (${app.creditScore}) qualifies for prime interest rates.`);
  } else if (app.creditScore >= 720) {
    keyStrengths.push(`Healthy credit profile (${app.creditScore}) meets Tier-1 institutional standards.`);
  } else if (app.creditScore >= 650) {
    score -= 20;
    riskFactors.push(`Moderate credit score (${app.creditScore}) indicates elevated default potential.`);
    recommendations.push(`Clear short-term credit card balances to bring credit score above 720.`);
  } else {
    score -= 45;
    riskFactors.push(`Subprime credit score (${app.creditScore}) triggers automatic risk escalation.`);
    recommendations.push(`Dispute errors on CIBIL/Experian and maintain flawless on-time payments for 6+ months.`);
  }

  // 2. FOIR Evaluation
  if (foir > (maxPermissibleFoir * 100) + 10) {
    score -= 35;
    riskFactors.push(`Projected FOIR of ${foir.toFixed(1)}% exceeds the banking ceiling of ${(maxPermissibleFoir * 100).toFixed(0)}%.`);
    recommendations.push(`Reduce requested loan amount or close existing loans to bring FOIR below 50%.`);
  } else if (foir > maxPermissibleFoir * 100) {
    score -= 18;
    riskFactors.push(`FOIR of ${foir.toFixed(1)}% is slightly beyond standard lending guidelines.`);
    recommendations.push(`Increase loan tenure from ${app.tenureYears} to ${Math.min(30, app.tenureYears + 5)} years to lower monthly EMI.`);
  } else {
    keyStrengths.push(`Comfortable debt obligation ratio (FOIR ${foir.toFixed(1)}%), leaving ample debt service coverage.`);
  }

  // 3. Age & Tenure evaluation
  if (app.age < 21) {
    score -= 20;
    riskFactors.push(`Applicant age (${app.age}) is below prime underwriting threshold.`);
  } else if (app.age + app.tenureYears > maxRetirementAge) {
    score -= 25;
    riskFactors.push(`Loan tenure extends past retirement age of ${maxRetirementAge} years (Age: ${app.age}, Tenure: ${app.tenureYears} yrs).`);
    recommendations.push(`Restrict maximum loan tenure to ${maxRetirementAge - app.age} years or add a younger co-applicant.`);
  } else {
    keyStrengths.push(`Applicant age and tenure are well within active earning lifespan.`);
  }

  // 4. Employment & Experience
  if (app.workExperienceYears >= 3) {
    keyStrengths.push(`Solid employment stability with ${app.workExperienceYears} years of verifiable track record.`);
  } else if (app.workExperienceYears < 1) {
    score -= 15;
    riskFactors.push(`Employment vintage under 1 year may require collateral or guarantor endorsement.`);
  }

  // 5. Loan-to-Income / Amount Fit
  const requestedVsMaxRatio = maxEligibleLoan > 0 ? (app.requestedAmount / maxEligibleLoan) : 999;
  if (requestedVsMaxRatio <= 0.9) {
    keyStrengths.push(`Requested amount is well within the calculated maximum capacity of ${formatCurrency(maxEligibleLoan)}.`);
  } else if (requestedVsMaxRatio > 1.25) {
    score -= 25;
    riskFactors.push(`Requested sum (${formatCurrency(app.requestedAmount)}) is ${((requestedVsMaxRatio - 1) * 100).toFixed(0)}% higher than maximum allowable borrowing.`);
    recommendations.push(`Consider applying for max eligible amount: ${formatCurrency(maxEligibleLoan)}.`);
  }

  // Final approval calculation
  const approvalProbability = Math.max(5, Math.min(98, score));
  const isEligible = approvalProbability >= 55 && app.creditScore >= 620 && foir <= (maxPermissibleFoir * 100) + 5;

  let riskCategory: LoanEligibilityResult['riskCategory'] = 'Low';
  if (approvalProbability < 40 || app.creditScore < 600) {
    riskCategory = 'Critical';
  } else if (approvalProbability < 60 || foir > 60) {
    riskCategory = 'High';
  } else if (approvalProbability < 78) {
    riskCategory = 'Moderate';
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain auto-debit payments to safeguard your prime lending bracket.');
    recommendations.push('Explore home loan balance transfer after 12 months if benchmark repo rates decrease.');
  }

  return {
    isEligible,
    approvalProbability,
    eligibilityScore: approvalProbability,
    maxEligibleLoan: Math.round(maxEligibleLoan),
    recommendedEmi: Math.round(maxAllowableEmi),
    actualEmi,
    foir: Math.round(foir * 10) / 10,
    dti: Math.round(dti * 10) / 10,
    disposableIncome: Math.round(disposableIncome),
    interestRateOffered: annualRate,
    riskCategory,
    maxTenureAllowed: maxAllowedYears,
    keyStrengths,
    riskFactors,
    recommendations,
  };
}

/**
 * Deep Credit Score Breakdown Analysis
 */
export function analyzeCreditScore(
  score: number,
  activeCards: number = 2,
  utilizationPercent: number = 28,
  latePayments: number = 0,
  oldestAccountYears: number = 5
): CreditReport {
  let rating: CreditReport['rating'] = 'Fair';
  let ratingColor = '#f59e0b';
  let summary = '';

  if (score >= 800) {
    rating = 'Excellent';
    ratingColor = '#10b981';
    summary = 'Super-prime borrower status. Unlocks the lowest retail interest rates, waived processing fees, and instant pre-approvals.';
  } else if (score >= 740) {
    rating = 'Very Good';
    ratingColor = '#06b6d4';
    summary = 'Prime borrower status. Demonstrates dependable financial responsibility with high approval certainty across institutional lenders.';
  } else if (score >= 670) {
    rating = 'Good';
    ratingColor = '#3b82f6';
    summary = 'Acceptable credit standing. Qualifies for standard market rates, though large unsecured loans may require manual income verification.';
  } else if (score >= 580) {
    rating = 'Fair';
    ratingColor = '#f59e0b';
    summary = 'Near-prime standing with heightened risk indicators. Lenders may charge higher risk premiums or demand additional collateral.';
  } else {
    rating = 'Poor';
    ratingColor = '#ef4444';
    summary = 'Subprime or distressed status. Significant risk of loan denial. Immediate credit rehabilitation and debt restructuring needed.';
  }

  // 5 Factors:
  // 1. Payment History (35%)
  const paymentScore = Math.max(20, 100 - latePayments * 30);
  const paymentFactor: CreditFactor = {
    name: 'Payment History',
    weight: 35,
    score: paymentScore,
    status: paymentScore >= 90 ? 'Excellent' : paymentScore >= 70 ? 'Good' : paymentScore >= 50 ? 'Average' : 'Poor',
    detail: latePayments === 0 ? '100% on-time record across reported credit lines' : `${latePayments} missed or delayed payment(s) registered in bureau history`,
    tip: 'Set up standing instructions/NACH auto-pay to ensure 0 late payment slips.',
  };

  // 2. Credit Utilization Ratio (30%)
  let utilScore = 95;
  if (utilizationPercent > 70) utilScore = 30;
  else if (utilizationPercent > 50) utilScore = 55;
  else if (utilizationPercent > 30) utilScore = 75;
  else if (utilizationPercent > 10) utilScore = 95;
  else utilScore = 88; // <10%

  const utilFactor: CreditFactor = {
    name: 'Credit Utilization Ratio',
    weight: 30,
    score: utilScore,
    status: utilScore >= 90 ? 'Excellent' : utilScore >= 70 ? 'Good' : utilScore >= 50 ? 'Average' : 'Poor',
    detail: `Current credit utilization is at ${utilizationPercent}%. Industry standard benchmark is ≤ 30%.`,
    tip: utilizationPercent > 30 ? 'Request a credit limit increase or pay mid-cycle before statement generation.' : 'Keep keeping utilization under 30% to maximize score boost.',
  };

  // 3. Credit History Vintage (15%)
  const ageScore = Math.min(100, Math.max(30, oldestAccountYears * 15));
  const ageFactor: CreditFactor = {
    name: 'Credit History Age',
    weight: 15,
    score: ageScore,
    status: ageScore >= 80 ? 'Excellent' : ageScore >= 60 ? 'Good' : 'Average',
    detail: `Oldest credit trade-line age is approximately ${oldestAccountYears} years.`,
    tip: 'Avoid closing your oldest credit cards even if rarely used; they anchor your credit vintage.',
  };

  // 4. Credit Mix (10%)
  const mixScore = activeCards >= 2 ? 85 : 65;
  const mixFactor: CreditFactor = {
    name: 'Credit Diversity & Mix',
    weight: 10,
    score: mixScore,
    status: mixScore >= 80 ? 'Good' : 'Average',
    detail: 'Balanced combination of revolving credit (cards) and installment term debt.',
    tip: 'Having a healthy mix of secured (home/auto) and unsecured lines indicates financial maturity.',
  };

  // 5. New Credit Inquiries (10%)
  const inqScore = score > 750 ? 90 : score > 680 ? 75 : 55;
  const inqFactor: CreditFactor = {
    name: 'Hard Inquiries (Last 6 Mos)',
    weight: 10,
    score: inqScore,
    status: inqScore >= 85 ? 'Excellent' : inqScore >= 70 ? 'Good' : 'Average',
    detail: score > 700 ? 'Low hard inquiry velocity (0-1 inquiries)' : 'Multiple hard inquiries detected by financing institutions',
    tip: 'Space out credit applications by at least 90-120 days to avoid triggering rate shopping flags.',
  };

  const negativeRemarks: string[] = [];
  const positiveRemarks: string[] = [];

  if (latePayments > 0) negativeRemarks.push(`${latePayments} delinquent mark(s) dragging down credit rating`);
  if (utilizationPercent > 30) negativeRemarks.push(`Elevated card utilization (${utilizationPercent}%) above 30% limit`);
  if (oldestAccountYears < 2) negativeRemarks.push('Short credit history length reduces scoring confidence');

  if (latePayments === 0) positiveRemarks.push('Pristine on-time repayment history with zero 30+ DPD defaults');
  if (utilizationPercent <= 30) positiveRemarks.push(`Optimal credit utilization maintained below the 30% ceiling`);
  if (oldestAccountYears >= 4) positiveRemarks.push(`Mature credit vintage exceeding ${oldestAccountYears} years`);

  // 6-month improvement roadmap
  const targetStep = Math.min(900, score + 45);
  const targetStep2 = Math.min(900, score + 75);
  const targetStep3 = Math.min(900, score + 110);

  const improvementRoadmap = [
    {
      month: 'Month 1-2',
      targetScore: targetStep,
      action: 'Pay down balances on cards with >40% utilization. Set all bill cycles to auto-pay.',
    },
    {
      month: 'Month 3-4',
      targetScore: targetStep2,
      action: 'Request soft-pull credit limit enhancements from primary banks to instantly deflate utilization ratio.',
    },
    {
      month: 'Month 5-6',
      targetScore: targetStep3,
      action: 'Verify bureau dispute clearance for any historical reporting discrepancies; refrain from new credit lines.',
    },
  ];

  return {
    score,
    rating,
    ratingColor,
    summary,
    factors: [paymentFactor, utilFactor, ageFactor, mixFactor, inqFactor],
    negativeRemarks,
    positiveRemarks,
    estimatedTotalCreditLimit: 500000,
    currentCreditUtilizationPercent: utilizationPercent,
    inquiriesLast6Months: score > 720 ? 1 : 3,
    improvementRoadmap,
  };
}
