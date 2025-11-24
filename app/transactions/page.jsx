'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';

export default function Transactions() {
  const { transactions, deleteTransaction, settings } = useApp();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD'
    }).format(amount);
  };

  const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchesType = selectedType === 'all' || 
                         (selectedType === 'income' && t.amount >= 0) ||
                         (selectedType === 'expense' && t.amount < 0);
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return parseISO(b.date) - parseISO(a.date);
      if (sortBy === 'amount') return Math.abs(b.amount) - Math.abs(a.amount);
      return 0;
    });

  const handleSelectTransaction = (id) => {
    const newSelected = new Set(selectedTransactions);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedTransactions(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedTransactions.size === 0) return;
    if (window.confirm(`Delete ${selectedTransactions.size} transaction(s)?`)) {
      for (const id of selectedTransactions) await deleteTransaction(id);
      setSelectedTransactions(new Set());
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Transactions</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/add-transaction')}
            className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            + Add
          </button>
          <button 
            onClick={handleDeleteSelected}
            disabled={selectedTransactions.size === 0}
            className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            🗑️ Delete ({selectedTransactions.size})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center bg-gray-50 rounded-xl px-4 py-3 mb-4 border border-gray-200">
          <span className="text-lg mr-2.5 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>
        <div className="flex gap-3 mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 font-medium hover:border-purple-600 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 font-medium hover:border-purple-600 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 font-semibold">Sort by:</span>
          <button
            onClick={() => setSortBy('date')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              sortBy === 'date'
                ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            Date
          </button>
          <button
            onClick={() => setSortBy('amount')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              sortBy === 'amount'
                ? 'bg-gray-900 text-white shadow-md shadow-gray-900/20'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            Amount
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-10">
                <input
                  type="checkbox"
                  checked={selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0}
                  onChange={(e) => {
                    setSelectedTransactions(e.target.checked ? new Set(filteredTransactions.map(t => t.id)) : new Set());
                  }}
                  className="rounded"
                />
              </th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-5 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.has(transaction.id)}
                      onChange={() => handleSelectTransaction(transaction.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                      transaction.amount >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.amount >= 0 ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-900">{transaction.description || 'No description'}</td>
                  <td className="px-5 py-4 text-sm text-gray-900">{transaction.category || 'Uncategorized'}</td>
                  <td className="px-5 py-4 text-sm text-gray-900">{format(parseISO(transaction.date), 'MMM d, yyyy')}</td>
                  <td className={`px-5 py-4 text-sm font-bold ${transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-5 py-16 text-center text-gray-400 text-sm font-medium">
                  No transactions yet. Add your first transaction!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
