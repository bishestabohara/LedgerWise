'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, isAfter, parseISO } from 'date-fns';

// Shared categories for transactions and budgets
export const TRANSACTION_CATEGORIES = [
  'Groceries', 'Bills', 'Entertainment', 'Transportation', 'Housing',
  'Health & Fitness', 'Utilities', 'Shopping', 'Food & Dining', 'Education', 'Other'
];

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
  const [currentGoal, setCurrentGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedTransactions = localStorage.getItem('ledgerwise-transactions');
        const savedBudgets = localStorage.getItem('ledgerwise-budgets');
        const savedCurrentBudget = localStorage.getItem('ledgerwise-current-budget');
        const savedRecurring = localStorage.getItem('ledgerwise-recurring');
        const savedGoals = localStorage.getItem('ledgerwise-goals');
        const savedCurrentGoal = localStorage.getItem('ledgerwise-current-goal');
        const savedSettings = localStorage.getItem('ledgerwise-settings');

        if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
        if (savedBudgets) {
          const parsedBudgets = JSON.parse(savedBudgets);
          setBudgets(parsedBudgets);

          // Set current budget - try saved current budget first, then fallback to first budget
          if (savedCurrentBudget) {
            const parsedCurrentBudget = JSON.parse(savedCurrentBudget);
            // Verify the saved current budget still exists in the budgets array
            const currentBudgetExists = parsedBudgets.find(b => b.id === parsedCurrentBudget.id);
            if (currentBudgetExists) {
              setCurrentBudget(parsedCurrentBudget);
            } else if (parsedBudgets.length > 0) {
              setCurrentBudget(parsedBudgets[0]);
            }
          } else if (parsedBudgets.length > 0) {
            setCurrentBudget(parsedBudgets[0]);
          }
        }
        if (savedRecurring) setRecurringExpenses(JSON.parse(savedRecurring));
        if (savedGoals) {
          const parsedGoals = JSON.parse(savedGoals);
          setGoals(parsedGoals);

          // Set current goal - try saved current goal first, then fallback to first goal
          if (savedCurrentGoal) {
            const parsedCurrentGoal = JSON.parse(savedCurrentGoal);
            // Verify the saved current goal still exists in the goals array
            const currentGoalExists = parsedGoals.find(g => g.id === parsedCurrentGoal.id);
            if (currentGoalExists) {
              setCurrentGoal(parsedCurrentGoal);
            } else if (parsedGoals.length > 0) {
              setCurrentGoal(parsedGoals[0]);
            }
          } else if (parsedGoals.length > 0) {
            setCurrentGoal(parsedGoals[0]);
          }
        }
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
    if (!loading && currentBudget) {
      localStorage.setItem('ledgerwise-current-budget', JSON.stringify(currentBudget));
    }
  }, [currentBudget, loading]);

  useEffect(() => {
    if (!loading && currentGoal) {
      localStorage.setItem('ledgerwise-current-goal', JSON.stringify(currentGoal));
    }
  }, [currentGoal, loading]);

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
    const newBudgets = budgets.filter(b => b.id !== id);
    setBudgets(newBudgets);

    if (currentBudget?.id === id) {
      // If the current budget is being deleted, switch to the first available budget
      if (newBudgets.length > 0) {
        setCurrentBudget(newBudgets[0]);
      } else {
        setCurrentBudget(null);
      }
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
    setCurrentGoal(newGoal);
    return newGoal;
  };

  const updateGoal = async (id, updates) => {
    setGoals(prev =>
      prev.map(g => g.id === id ? { ...g, ...updates } : g)
    );
    if (currentGoal?.id === id) {
      setCurrentGoal(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteGoal = async (id) => {
    const newGoals = goals.filter(g => g.id !== id);
    setGoals(newGoals);

    if (currentGoal?.id === id) {
      // If the current goal is being deleted, switch to the first available goal
      if (newGoals.length > 0) {
        setCurrentGoal(newGoals[0]);
      } else {
        setCurrentGoal(null);
      }
    }
  };

  // Settings functions
  const updateSettings = (updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Helper functions
  const getTotalBalance = () => {
    return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  };

  // Budget analysis functions
  const getBudgetCategorySpending = (budgetId, category) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return 0;

    // Calculate spending for this category (all transactions with this category)
    return transactions
      .filter(t => t.category === category && t.amount < 0) // Only expenses
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getBudgetProgress = (budgetId) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget || !budget.categories) return { totalSpent: 0, totalBudget: 0, categories: [] };

    let totalSpent = 0;
    let totalBudget = budget.limit;

    const categoryProgress = budget.categories.map(cat => {
      const spent = getBudgetCategorySpending(budgetId, cat.name);
      const budgeted = (budget.limit * cat.percentage) / 100;
      totalSpent += spent;

      return {
        name: cat.name,
        budgeted: budgeted,
        spent: spent,
        remaining: Math.max(0, budgeted - spent),
        percentage: cat.percentage,
        status: spent > budgeted ? 'over' : spent > budgeted * 0.8 ? 'warning' : 'good'
      };
    });

    return {
      totalSpent,
      totalBudget,
      categories: categoryProgress,
      overallProgress: Math.min((totalSpent / totalBudget) * 100, 100)
    };
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
    currentGoal,
    settings,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    createBudget,
    updateBudget,
    deleteBudget,
    setCurrentBudget,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    addGoal,
    updateGoal,
    deleteGoal,
    setCurrentGoal,
    updateSettings,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    getUpcomingBills,
    getBudgetCategorySpending,
    getBudgetProgress,
    TRANSACTION_CATEGORIES,
    getRecentTransactions
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
