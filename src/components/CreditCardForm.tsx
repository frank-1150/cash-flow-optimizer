
import React, { useState } from 'react';
import type { CreditCard } from '../types';

interface CreditCardFormProps {
    onSave: (card: CreditCard) => void;
    onCancel: () => void;
    initialData?: CreditCard | null;
}

export const CreditCardForm: React.FC<CreditCardFormProps> = ({ onSave, onCancel, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [dueDay, setDueDay] = useState(initialData?.dueDay?.toString() || '1');
    const [balance, setBalance] = useState(initialData?.balance?.toString() || '0');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            name,
            dueDay: parseInt(dueDay),
            balance: parseFloat(balance),
            paymentAccount: '', // Will be linked to main account automatically in logic for now
        });
        if (!initialData) {
            setName('');
            setDueDay('1');
            setBalance('0');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card">
            <h3>{initialData ? 'Edit Credit Card' : 'Add Credit Card'}</h3>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                <div>
                    <label>Card Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Amex Gold" />
                </div>
                <div>
                    <label>Due Day of Month</label>
                    <input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} required />
                </div>
                <div>
                    <label>Current Balance</label>
                    <input type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit">{initialData ? 'Update Card' : 'Save Card'}</button>
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
