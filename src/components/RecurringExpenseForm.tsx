import React, { useState } from 'react';
import type { RecurringExpense } from '../types';

interface RecurringExpenseFormProps {
    onSave: (expense: RecurringExpense) => void;
    onCancel: () => void;
    initialData?: RecurringExpense | null;
}

export const RecurringExpenseForm: React.FC<RecurringExpenseFormProps> = ({ onSave, onCancel, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [amount, setAmount] = useState(initialData?.amount?.toString() || '0');
    const [dueDay, setDueDay] = useState(initialData?.dueDay?.toString() || '1');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            name,
            amount: parseFloat(amount),
            dueDay: parseInt(dueDay),
            paymentAccount: '', // Will be linked to main account automatically in logic for now
        });
        if (!initialData) {
            setName('');
            setAmount('0');
            setDueDay('1');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card">
            <h3>{initialData ? 'Edit Recurring Expense' : 'Add Recurring Expense'}</h3>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                <div>
                    <label>Expense Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Rent" />
                </div>
                <div>
                    <label>Amount</label>
                    <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                </div>
                <div>
                    <label>Due Day of Month</label>
                    <input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit">{initialData ? 'Update Expense' : 'Save Expense'}</button>
                    {initialData && (
                        <button type="button" onClick={onCancel} style={{ background: 'var(--secondary-color)' }}>
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
};
