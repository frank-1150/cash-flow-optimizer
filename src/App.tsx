import { useState, useMemo, useEffect } from 'react';
import type { Account, CreditCard, RecurringExpense } from './types';
import { calculateOptimizationPlan } from './engine/optimizer';
import { AccountForm } from './components/AccountForm';
import { CreditCardForm } from './components/CreditCardForm';
import { RecurringExpenseForm } from './components/RecurringExpenseForm';
import { Dashboard } from './components/Dashboard';

function App() {
  // Load from localStorage or use defaults
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('accounts');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Chase Checking', apy: 0.0, transferTime: 0, isMain: true, balance: 2000 },
      { id: '2', name: 'SoFi Savings', apy: 0.036, transferTime: 2, isMain: false, balance: 15000 },
      { id: '3', name: 'Coinbase USDC', apy: 0.0385, transferTime: 3, isMain: false, balance: 5000 },
    ];
  });

  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('cards');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', name: 'Chase Sapphire', dueDay: 5, balance: 1200, paymentAccount: '1' },
      { id: 'c2', name: 'Amex Gold', dueDay: 20, balance: 800, paymentAccount: '1' },
    ];
  });

  const [expenses, setExpenses] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [
      { id: 'e1', name: 'Rent', amount: 2000, dueDay: 1, paymentAccount: '1' },
    ];
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);

  const { plans, projectedInterest } = useMemo(() => {
    return calculateOptimizationPlan(accounts, cards, expenses);
  }, [accounts, cards, expenses]);

  const handleSaveAccount = (account: Account) => {
    if (editingAccount) {
      setAccounts(accounts.map(a => a.id === account.id ? account : a));
      setEditingAccount(null);
    } else {
      setAccounts([...accounts, account]);
    }
  };

  const handleSaveCard = (card: CreditCard) => {
    if (editingCard) {
      setCards(cards.map(c => c.id === card.id ? card : c));
      setEditingCard(null);
    } else {
      setCards([...cards, card]);
    }
  };

  const handleSaveExpense = (expense: RecurringExpense) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === expense.id ? expense : e));
      setEditingExpense(null);
    } else {
      setExpenses([...expenses, expense]);
    }
  };

  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'account' | 'card' | 'expense' } | null>(null);

  const handleDeleteAccount = (id: string) => {
    setConfirmDelete({ id, type: 'account' });
  };

  const handleDeleteCard = (id: string) => {
    setConfirmDelete({ id, type: 'card' });
  };

  const handleDeleteExpense = (id: string) => {
    setConfirmDelete({ id, type: 'expense' });
  };

  const executeDelete = () => {
    if (!confirmDelete) return;
    const { id, type } = confirmDelete;

    if (type === 'account') {
      setAccounts(accounts.filter(a => a.id !== id));
      if (editingAccount?.id === id) setEditingAccount(null);
    } else if (type === 'card') {
      setCards(cards.filter(c => c.id !== id));
      if (editingCard?.id === id) setEditingCard(null);
    } else if (type === 'expense') {
      setExpenses(expenses.filter(e => e.id !== id));
      if (editingExpense?.id === id) setEditingExpense(null);
    }
    setConfirmDelete(null);
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1>Cash Flow Optimizer</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Maximize your interest returns while paying bills on time.</p>
      </header>

      <Dashboard
        accounts={accounts}
        cards={cards}
        plans={plans}
        projectedInterest={projectedInterest}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Accounts</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {accounts.map(acc => (
              <div key={acc.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>{acc.name}</strong>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      APY: {(acc.apy * 100).toFixed(2)}% | Transfer: {acc.transferTime} days
                      {acc.isMain && <span style={{ marginLeft: '0.5rem', color: 'var(--accent-color)' }}>(Main)</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span>${acc.balance.toFixed(2)}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setEditingAccount(acc)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--secondary-color)' }}
                      >
                        Edit
                      </button>
                      {confirmDelete?.id === acc.id && confirmDelete.type === 'account' ? (
                        <>
                          <button
                            onClick={executeDelete}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#ff4444', color: 'white', border: 'none' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={cancelDelete}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--secondary-color)', border: 'none' }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#ff4444', color: 'white', border: 'none' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <AccountForm
              onSave={handleSaveAccount}
              onCancel={() => setEditingAccount(null)}
              initialData={editingAccount}
              key={editingAccount ? editingAccount.id : 'new'}
            />
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: '1rem' }}>Credit Cards</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {cards.map(card => (
              <div key={card.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>{card.name}</strong>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Due Day: {card.dueDay}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span>${card.balance.toFixed(2)}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setEditingCard(card)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--secondary-color)' }}
                      >
                        Edit
                      </button>
                      {confirmDelete?.id === card.id && confirmDelete.type === 'card' ? (
                        <>
                          <button
                            onClick={executeDelete}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#ff4444', color: 'white', border: 'none' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={cancelDelete}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--secondary-color)', border: 'none' }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#ff4444', color: 'white', border: 'none' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <CreditCardForm
              onSave={handleSaveCard}
              onCancel={() => setEditingCard(null)}
              initialData={editingCard}
              key={editingCard ? editingCard.id : 'new'}
            />
          </div>
        </div>

        <div>
          <h2 style={{ marginBottom: '1rem' }}>Recurring Expenses</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {expenses.map(expense => (
              <div key={expense.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong>{expense.name}</strong>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Due Day: {expense.dueDay}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span>${expense.amount.toFixed(2)}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setEditingExpense(expense)}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--secondary-color)' }}
                      >
                        Edit
                      </button>
                      {confirmDelete?.id === expense.id && confirmDelete.type === 'expense' ? (
                        <>
                          <button
                            onClick={executeDelete}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#ff4444', color: 'white', border: 'none' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={cancelDelete}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--secondary-color)', border: 'none' }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#ff4444', color: 'white', border: 'none' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <RecurringExpenseForm
              onSave={handleSaveExpense}
              onCancel={() => setEditingExpense(null)}
              initialData={editingExpense}
              key={editingExpense ? editingExpense.id : 'new'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
