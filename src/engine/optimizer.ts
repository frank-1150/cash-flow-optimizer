import type { Account, CreditCard, TransferPlan, RecurringExpense } from '../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function addDays(dateStr: string, days: number): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    // Use Date.UTC to ensure we are working with UTC dates, avoiding timezone offsets affecting the date
    const date = new Date(Date.UTC(y, m - 1, d + days));
    return date.toISOString().split('T')[0];
}

export function getDaysDiff(dateStr1: string, dateStr2: string): number {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    return Math.round((d2.getTime() - d1.getTime()) / MS_PER_DAY);
}

export function calculateOptimizationPlan(
    accounts: Account[],
    cards: CreditCard[],
    expenses: RecurringExpense[] = [],
    startDate: string = new Date().toISOString().split('T')[0],
    horizonDays: number = 30
): { plans: TransferPlan[]; projectedInterest: number } {
    const plans: TransferPlan[] = [];
    let totalInterest = 0;

    // 1. Identify Payment Account (Main Checking)
    const mainAccount = accounts.find((a) => a.isMain);
    if (!mainAccount) {
        console.error('No main account found');
        return { plans: [], projectedInterest: 0 };
    }

    // 2. Identify High Yield Account (Highest APY)
    // For simplicity, we pick the one with highest APY that is NOT the main account.
    const savingsAccounts = accounts.filter((a) => !a.isMain);
    const bestSavings = savingsAccounts.reduce((prev, current) =>
        (prev.apy > current.apy) ? prev : current
        , savingsAccounts[0]);

    if (!bestSavings) {
        // If no savings account, we can't optimize much other than paying on time.
        return { plans: [], projectedInterest: 0 };
    }

    // 3. Simulate day by day
    // We need to track the simulated balance of the main account to ensure it doesn't go negative.
    // However, the strategy is: keep Main Account at minimum buffer (e.g. $0 or $100), 
    // and pull from Savings only when needed.

    // Let's iterate through upcoming credit card payments AND recurring expenses.
    // For each item, find the next due date within the horizon.

    const upcomingPayments: { date: string; amount: number; name: string }[] = [];

    // Process Credit Cards
    cards.forEach(card => {
        const [y, m, d] = startDate.split('-').map(Number);

        let targetMonth = m;
        let targetYear = y;

        if (d > card.dueDay) {
            targetMonth++;
            if (targetMonth > 12) {
                targetMonth = 1;
                targetYear++;
            }
        }

        const dueDateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(card.dueDay).padStart(2, '0')}`;

        // Check if within horizon
        if (getDaysDiff(startDate, dueDateStr) <= horizonDays) {
            upcomingPayments.push({
                date: dueDateStr,
                amount: card.balance, // Assuming full balance payment for now
                name: card.name
            });
        }
    });

    // Process Recurring Expenses
    expenses.forEach(expense => {
        const [y, m, d] = startDate.split('-').map(Number);

        let targetMonth = m;
        let targetYear = y;

        if (d > expense.dueDay) {
            targetMonth++;
            if (targetMonth > 12) {
                targetMonth = 1;
                targetYear++;
            }
        }

        const dueDateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(expense.dueDay).padStart(2, '0')}`;

        // Check if within horizon
        if (getDaysDiff(startDate, dueDateStr) <= horizonDays) {
            upcomingPayments.push({
                date: dueDateStr,
                amount: expense.amount,
                name: expense.name
            });
        }
    });

    // Sort payments by date
    upcomingPayments.sort((a, b) => getDaysDiff(startDate, a.date) - getDaysDiff(startDate, b.date));

    // Schedule transfers
    upcomingPayments.forEach(payment => {
        // We need money in Main Account by payment.date
        // Transfer takes bestSavings.transferTime days.
        // So initiate transfer on payment.date - transferTime - 1 (buffer)

        const bufferDays = 1;
        const daysNeeded = bestSavings.transferTime + bufferDays;
        const initiateDate = addDays(payment.date, -daysNeeded);

        // If initiate date is in the past, we are late! But for simulation we just say "ASAP" (today)
        // or we might mark it as urgent.
        const actualInitiateDate = getDaysDiff(startDate, initiateDate) < 0 ? startDate : initiateDate;

        plans.push({
            date: actualInitiateDate,
            fromAccountId: bestSavings.id,
            toAccountId: mainAccount.id,
            amount: payment.amount,
            reason: `Cover ${payment.name} payment due on ${payment.date}`
        });
    });

    // Calculate Interest
    // This is a simplified calculation: Average Daily Balance * (APY / 365) * Days
    // We assume all money sits in Best Savings until transferred.
    // In reality, we should simulate daily balances.

    // Let's do a quick simulation of balances for interest calculation.
    // Initial state:
    // Main Account: Current Balance
    // Savings Account: Current Balance

    let simSavingsBalance = bestSavings.balance;

    // Map of date -> net flow for savings
    const savingsFlow = new Map<string, number>();
    plans.forEach(p => {
        const current = savingsFlow.get(p.date) || 0;
        savingsFlow.set(p.date, current - p.amount);
    });

    for (let i = 0; i < horizonDays; i++) {
        const currentDate = addDays(startDate, i);

        // Apply transfers
        if (savingsFlow.has(currentDate)) {
            simSavingsBalance += savingsFlow.get(currentDate)!;
        }

        // Accrue interest for this day
        const dailyRate = bestSavings.apy / 365;
        if (simSavingsBalance > 0) {
            totalInterest += simSavingsBalance * dailyRate;
        }
    }

    return { plans, projectedInterest: totalInterest };
}
