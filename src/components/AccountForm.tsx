
import React, { useState } from 'react';
import type { Account } from '../types';

interface AccountFormProps {
    onSave: (account: Account) => void;
    onCancel: () => void;
    initialData?: Account | null;
}

export const AccountForm: React.FC<AccountFormProps> = ({ onSave, onCancel, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [apy, setApy] = useState(initialData?.apy ? (initialData.apy * 100).toString() : '0');
    const [transferTime, setTransferTime] = useState(initialData?.transferTime?.toString() || '1');
    const [balance, setBalance] = useState(initialData?.balance?.toString() || '0');
    const [isMain, setIsMain] = useState(initialData?.isMain || false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            name,
            apy: parseFloat(apy) / 100,
            transferTime: parseInt(transferTime),
            isMain,
            balance: parseFloat(balance),
        });
        // Reset if new
        if (!initialData) {
            setName('');
            setApy('0');
            setTransferTime('1');
            setBalance('0');
            setIsMain(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card">
            <h3>{initialData ? 'Edit Account' : 'Add Account'}</h3>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                <div>
                    <label>Account Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Chase Checking" />
                </div>
                <div>
                    <label>APY (%)</label>
                    <input type="number" step="0.01" value={apy} onChange={e => setApy(e.target.value)} required />
                </div>
                <div>
                    <label>Transfer Time (Days to Checking)</label>
                    <input type="number" value={transferTime} onChange={e => setTransferTime(e.target.value)} required />
                </div>
                <div>
                    <label>Current Balance</label>
                    <input type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        checked={isMain}
                        onChange={e => setIsMain(e.target.checked)}
                        style={{ width: 'auto' }}
                    />
                    <label>Is Main Payment Account?</label>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit">{initialData ? 'Update Account' : 'Save Account'}</button>
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
