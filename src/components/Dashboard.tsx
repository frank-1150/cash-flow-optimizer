import React from 'react';
import type { Account, CreditCard, TransferPlan } from '../types';

interface DashboardProps {
    accounts: Account[];
    cards: CreditCard[];
    plans: TransferPlan[];
    projectedInterest: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ accounts, cards, plans, projectedInterest }) => {
    const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalDebt = cards.reduce((sum, card) => sum + card.balance, 0);
    const netWorth = totalAssets - totalDebt;

    return (
        <div style={{ display: 'grid', gap: '2rem' }}>
            <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                    <h4>Total Assets</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${totalAssets.toFixed(2)}</div>
                </div>
                <div>
                    <h4>Total Credit Card Debt</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>${totalDebt.toFixed(2)}</div>
                </div>
                <div>
                    <h4>Net Cash Position</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>${netWorth.toFixed(2)}</div>
                </div>
                <div>
                    <h4>Est. 30-Day Interest</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>+${projectedInterest.toFixed(2)}</div>
                </div>
            </div>

            <div className="card">
                <h3>Action Plan (Next 30 Days)</h3>
                {plans.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>No transfers needed currently.</p>
                ) : (
                    <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '0.5rem' }}>Date</th>
                                <th style={{ padding: '0.5rem' }}>From</th>
                                <th style={{ padding: '0.5rem' }}>To</th>
                                <th style={{ padding: '0.5rem' }}>Amount</th>
                                <th style={{ padding: '0.5rem' }}>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan, idx) => {
                                const fromName = accounts.find(a => a.id === plan.fromAccountId)?.name || 'Unknown';
                                const toName = accounts.find(a => a.id === plan.toAccountId)?.name || 'Unknown';
                                return (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '0.5rem' }}>{plan.date}</td>
                                        <td style={{ padding: '0.5rem' }}>{fromName}</td>
                                        <td style={{ padding: '0.5rem' }}>{toName}</td>
                                        <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>${plan.amount.toFixed(2)}</td>
                                        <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{plan.reason}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
