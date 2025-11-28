// Simple test script for optimizer logic
// We need to compile TS to JS or just write JS. Let's write JS that mimics the TS logic for quick testing.
// Or we can use ts-node if available, but let's stick to plain JS for simplicity in this environment.

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function addDays(dateStr, days) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const newDate = new Date(Date.UTC(y, m - 1, d + days));
    return newDate.toISOString().split('T')[0];
}

function getDaysDiff(dateStr1, dateStr2) {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    return Math.round((d2.getTime() - d1.getTime()) / MS_PER_DAY);
}

function calculateOptimizationPlan(accounts, cards, startDate, horizonDays = 30) {
    const plans = [];
    let totalInterest = 0;

    const mainAccount = accounts.find((a) => a.isMain);
    const savingsAccounts = accounts.filter((a) => !a.isMain);
    const bestSavings = savingsAccounts.reduce((prev, current) =>
        (prev.apy > current.apy) ? prev : current
        , savingsAccounts[0]);

    if (!mainAccount || !bestSavings) {
        return { plans, projectedInterest: 0 };
    }

    const upcomingPayments = [];

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

        if (getDaysDiff(startDate, dueDateStr) <= horizonDays) {
            upcomingPayments.push({
                date: dueDateStr,
                amount: card.balance,
                cardName: card.name
            });
        }
    });

    upcomingPayments.sort((a, b) => getDaysDiff(startDate, a.date) - getDaysDiff(startDate, b.date));

    upcomingPayments.forEach(payment => {
        const bufferDays = 1;
        const daysNeeded = bestSavings.transferTime + bufferDays;
        const initiateDate = addDays(payment.date, -daysNeeded);
        const actualInitiateDate = getDaysDiff(startDate, initiateDate) < 0 ? startDate : initiateDate;

        plans.push({
            date: actualInitiateDate,
            fromAccountId: bestSavings.id,
            toAccountId: mainAccount.id,
            amount: payment.amount,
            reason: `Cover ${payment.cardName} payment due on ${payment.date}`
        });
    });

    return { plans };
}

// Test Case
const accounts = [
    { id: '1', name: 'Chase Checking', apy: 0.0, transferTime: 0, isMain: true, balance: 2000 },
    { id: '2', name: 'SoFi Savings', apy: 0.036, transferTime: 2, isMain: false, balance: 15000 },
];

const cards = [
    { id: 'c1', name: 'Chase Sapphire', dueDay: 5, balance: 1200 }, // Due soon if today is 2023-10-27
];

const today = '2023-10-27'; // Fixed date for testing
const result = calculateOptimizationPlan(accounts, cards, today);

console.log('Test Result:', JSON.stringify(result, null, 2));

// Expected:
// Due date: 2023-11-05
// Transfer Time: 2 days
// Buffer: 1 day
// Initiate Date: 2023-11-05 - 3 days = 2023-11-02
