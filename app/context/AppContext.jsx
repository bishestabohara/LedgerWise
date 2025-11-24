'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
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

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('ledgerwise-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('ledgerwise-settings', JSON.stringify(settings));
  }, [settings]);

  // Load transactions
  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load budgets
  useEffect(() => {
    const q = query(collection(db, 'budgets'), where('isActive', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      if (data.length > 0) {
        setCurrentBudget(data[0]);
        setBudgets(data);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load recurring expenses
  useEffect(() => {
    const q = query(collection(db, 'recurringExpenses'), orderBy('nextDueDate', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecurringExpenses(data);
    });
    return () => unsubscribe();
  }, []);

  // Load goals
  useEffect(() => {
    const q = query(collection(db, 'goals'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGoals(data);
    });
    return () => unsubscribe();
  }, []);

  // Transactions
  const addTransaction = async (transaction) => {
    try {
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        date: transaction.date || new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  // Budgets
  const createBudget = async (budget) => {
    try {
      // Deactivate all existing budgets
      const existingBudgets = await getDocs(query(collection(db, 'budgets'), where('isActive', '==', true)));
      existingBudgets.forEach(async (budgetDoc) => {
        await updateDoc(doc(db, 'budgets', budgetDoc.id), { isActive: false });
      });

      // Create new active budget
      const docRef = await addDoc(collection(db, 'budgets'), {
        ...budget,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  };

  const updateBudget = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'budgets', id), updates);
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  };

  const deleteBudget = async (id) => {
    try {
      await deleteDoc(doc(db, 'budgets', id));
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  };

  // Recurring Expenses
  const addRecurringExpense = async (expense) => {
    try {
      await addDoc(collection(db, 'recurringExpenses'), {
        ...expense,
        status: 'active',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding recurring expense:', error);
      throw error;
    }
  };

  const deleteRecurringExpense = async (id) => {
    try {
      await deleteDoc(doc(db, 'recurringExpenses', id));
    } catch (error) {
      console.error('Error deleting recurring expense:', error);
      throw error;
    }
  };

  // Goals
  const addGoal = async (goal) => {
    try {
      await addDoc(collection(db, 'goals'), {
        ...goal,
        createdAt: new Date().toISOString(),
        progress: 0
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };

  const updateGoal = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'goals', id), updates);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (id) => {
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  // Settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Calculations
  const getCurrentMonthTransactions = () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return transactions.filter(t => {
      const date = parseISO(t.date);
      return date >= start && date <= end;
    });
  };

  const getTotalIncome = () => {
    const monthTransactions = getCurrentMonthTransactions();
    return monthTransactions
      .filter(t => t.type === 'income' || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getTotalExpenses = () => {
    const monthTransactions = getCurrentMonthTransactions();
    return monthTransactions
      .filter(t => t.type === 'expense' || t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getTotalBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getUpcomingBills = () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return recurringExpenses
      .filter(expense => {
        const dueDate = parseISO(expense.nextDueDate);
        return isAfter(dueDate, now) && dueDate <= thirtyDaysFromNow && expense.status === 'active';
      })
      .sort((a, b) => parseISO(a.nextDueDate) - parseISO(b.nextDueDate));
  };

  const getRecentTransactions = () => {
    return transactions.slice(0, 5);
  };

  const value = {
    transactions,
    budgets,
    recurringExpenses,
    goals,
    settings,
    currentBudget,
    loading,
    addTransaction,
    deleteTransaction,
    createBudget,
    updateBudget,
    deleteBudget,
    addRecurringExpense,
    deleteRecurringExpense,
    addGoal,
    updateGoal,
    deleteGoal,
    updateSettings,
    getTotalIncome,
    getTotalExpenses,
    getTotalBalance,
    getUpcomingBills,
    getRecentTransactions,
    getCurrentMonthTransactions
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
