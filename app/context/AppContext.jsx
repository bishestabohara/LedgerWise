'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isAfter, parseISO } from 'date-fns';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [settings, setSettings] = useState({
    theme: 'light',
    currency: 'USD',
    personalDetails: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    }
  });
  const [currentBudget, setCurrentBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedTransactions = localStorage.getItem('ledgerwise-transactions');
        const savedBudgets = localStorage.getItem('ledgerwise-budgets');
        const savedRecurring = localStorage.getItem('ledgerwise-recurring');
        const savedGoals = localStorage.getItem('ledgerwise-goals');
        const savedSettings = localStorage.getItem('ledgerwise-settings');

        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
        if (savedBudgets) {
          const parsedBudgets = JSON.parse(savedBudgets);
          setBudgets(parsedBudgets);
          if (parsedBudgets.length > 0) {
            setCurrentBudget(parsedBudgets[0]);
          }
        }
        if (savedRecurring) setRecurringExpenses(JSON.parse(savedRecurring));
        if (savedGoals) setGoals(JSON.parse(savedGoals));
        if (savedSettings) setSettings(JSON.parse(savedSettings));

        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerwise-transactions', JSON.stringify(transactions));
    }
  }, [transactions, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerwise-budgets', JSON.stringify(budgets));
    }
  }, [budgets, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerwise-recurring', JSON.stringify(recurringExpenses));
    }
  }, [recurringExpenses, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ledgerwise-goals', JSON.stringify(goals));
    }
  }, [goals, loading]);

  useEffect(() => {
    localStorage.setItem('ledgerwise-settings', JSON.stringify(settings));
  }, [settings]);

  // Transaction functions
  const addTransaction = async (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };

  const updateTransaction = async (id, updates) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const deleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Budget functions
  const createBudget = async (budget) => {
    const newBudget = {
      ...budget,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setBudgets(prev => [newBudget, ...prev]);
    setCurrentBudget(newBudget);
    return newBudget;
  };

  const updateBudget = async (id, updates) => {
    setBudgets(prev =>
      prev.map(b => b.id === id ? { ...b, ...updates } : b)
    );
    if (currentBudget?.id === id) {
      setCurrentBudget(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteBudget = async (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    if (currentBudget?.id === id) {
      setCurrentBudget(null);
    }
  };

  // Recurring expense functions
  const addRecurringExpense = async (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setRecurringExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const updateRecurringExpense = async (id, updates) => {
    setRecurringExpenses(prev =>
      prev.map(e => e.id === id ? { ...e, ...updates } : e)
    );
  };

  const deleteRecurringExpense = async (id) => {
    setRecurringExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Goal functions
  const addGoal = async (goal) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setGoals(prev => [newGoal, ...prev]);
    return newGoal;
  };

  const updateGoal = async (id, updates) => {
    setGoals(prev =>
      prev.map(g => g.id === id ? { ...g, ...updates } : g)
    );
  };

  const deleteGoal = async (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Settings functions
  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Helper functions
  const getTotalBalance = () => {
    return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  const getTotalIncome = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    return transactions
      .filter(t => {
        const transactionDate = parseISO(t.date);
        return t.amount > 0 && transactionDate >= monthStart && transactionDate <= monthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    return Math.abs(
      transactions
        .filter(t => {
          const transactionDate = parseISO(t.date);
          return t.amount < 0 && transactionDate >= monthStart && transactionDate <= monthEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0)
    );
  };

  const getUpcomingBills = () => {
    const now = new Date();
    return recurringExpenses
      .filter(e => {
        const dueDate = parseISO(e.nextDueDate);
        const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff <= 30;
      })
      .sort((a, b) => parseISO(a.nextDueDate) - parseISO(b.nextDueDate))
      .slice(0, 5);
  };

  const getRecentTransactions = () => {
    return transactions.slice(0, 5);
  };

  const value = {
    transactions,
    budgets,
    currentBudget,
    recurringExpenses,
    goals,
    settings,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    createBudget,
    updateBudget,
    deleteBudget,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    addGoal,
    updateGoal,
    deleteGoal,
    updateSettings,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    getUpcomingBills,
    getRecentTransactions
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
