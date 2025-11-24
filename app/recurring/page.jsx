'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';

export default function Recurring() {
  const { recurringExpenses, addRecurringExpense, deleteRecurringExpense, settings } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [sortBy, setSortBy] = useState('nextDueDate');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    frequency: 'monthly',
    nextDueDate: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD'
    }).format(amount);
  };

  const categories = [...new Set(recurringExpenses.map(e => e.category).filter(Boolean))];
  const frequencies = ['monthly', 'weekly', 'yearly'];

  const filteredExpenses = recurringExpenses
    .filter(expense => {
      const matchesSearch = expense.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      const matchesFrequency = selectedFrequency === 'all' || expense.frequency === selectedFrequency;
      return matchesSearch && matchesCategory && matchesFrequency;
    })
    .sort((a, b) => {
      if (sortBy === 'nextDueDate') {
        return parseISO(a.nextDueDate) - parseISO(b.nextDueDate);
      } else if (sortBy === 'amount') {
        return b.amount - a.amount;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  const totalMonthly = recurringExpenses
    .filter(e => e.frequency === 'monthly')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalYearly = recurringExpenses
    .reduce((sum, e) => {
      if (e.frequency === 'monthly') return sum + (e.amount * 12);
      if (e.frequency === 'weekly') return sum + (e.amount * 52);
      return sum + e.amount;
    }, 0);

  const activeSubscriptions = recurringExpenses.filter(e => e.status === 'active').length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.category || !formData.nextDueDate) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await addRecurringExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData({
        name: '',
        category: '',
        amount: '',
        frequency: 'monthly',
        nextDueDate: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding recurring expense:', error);
      alert('Failed to add recurring expense. Please try again.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedExpenses.size === 0) return;
    if (window.confirm(`Delete ${selectedExpenses.size} recurring expense(s)?`)) {
      for (const id of selectedExpenses) {
        await deleteRecurringExpense(id);
      }
      setSelectedExpenses(new Set());
    }
  };

  const handleSelectExpense = (id) => {
    const newSelected = new Set(selectedExpenses);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedExpenses(newSelected);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5 tracking-tight">Recurring Expenses</h1>
          <p className="text-xs sm:text-[13px] text-gray-500 font-normal">Manage your recurring payments and subscriptions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="text-base">+</span>
            <span className="hidden sm:inline">Add Recurring Expense</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedExpenses.size === 0}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
          >
            <span className="text-base">×</span>
            <span className="hidden sm:inline">Delete ({selectedExpenses.size})</span>
            <span className="sm:hidden">({selectedExpenses.size})</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white text-lg font-bold">
              $
            </div>
            <div className="flex-1">
              <p className="text-xs text-purple-700 font-semibold mb-0.5">Total Monthly</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMonthly)}</p>
            </div>
          </div>
          <p className="text-xs text-purple-600 font-medium">** Tracked expenses 📈</p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5 border border-teal-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center text-white text-xl font-bold">
              ✓
            </div>
            <div className="flex-1">
              <p className="text-xs text-teal-700 font-semibold mb-0.5">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{activeSubscriptions}</p>
            </div>
          </div>
          <p className="text-xs text-teal-600 font-medium">Out of {recurringExpenses.length} total</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white text-lg">
              📅
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-700 font-semibold mb-0.5">Total Yearly</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalYearly)}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 font-medium">Annual projection</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search recurring expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white text-gray-700 font-medium hover:border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select
              value={selectedFrequency}
              onChange={(e) => setSelectedFrequency(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white text-gray-700 font-medium hover:border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            >
              <option value="all">All Frequencies</option>
              {frequencies.map(freq => <option key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</option>)}
            </select>
          </div>
          <p className="text-xs text-gray-500 font-medium">{filteredExpenses.length} expenses found</p>
        </div>
        
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-600 font-medium">Sort by:</span>
          <button
            onClick={() => setSortBy('nextDueDate')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              sortBy === 'nextDueDate'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Next Due Date
          </button>
          <button
            onClick={() => setSortBy('amount')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              sortBy === 'amount'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Amount
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              sortBy === 'name'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Name
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left w-8">
                <input
                  type="checkbox"
                  checked={selectedExpenses.size === filteredExpenses.length && filteredExpenses.length > 0}
                  onChange={(e) => {
                    setSelectedExpenses(e.target.checked ? new Set(filteredExpenses.map(e => e.id)) : new Set());
                  }}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Category</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Frequency</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Next Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.has(expense.id)}
                      onChange={() => handleSelectExpense(expense.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                      <span className="text-sm font-semibold text-gray-900">{expense.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{expense.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 capitalize">{expense.frequency}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{format(parseISO(expense.nextDueDate), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                      expense.status === 'active' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {expense.status === 'active' && '+ '}Active
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center text-gray-400 text-sm font-medium">
                  No recurring expenses yet. Add your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Add Recurring Expense</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Netflix Subscription"
                  className="px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Housing">Housing</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Health & Fitness">Health & Fitness</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Next Due Date</label>
                <input
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextDueDate: e.target.value }))}
                  className="px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 shadow-md shadow-gray-900/20 transition-all"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
