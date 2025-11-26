'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, TRANSACTION_CATEGORIES } from '../context/AppContext';

export default function AddTransaction() {
  const { addTransaction, settings } = useApp();
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: 'expense',
    description: '',
    amount: '',
    category: ''
  });

  const categories = TRANSACTION_CATEGORIES;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.category) {
      alert('Please fill in all fields');
      return;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount === 0) {
      alert('Please enter a valid amount');
      return;
    }
    try {
      await addTransaction({
        type: formData.type,
        description: formData.description,
        amount: formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        category: formData.category,
        date: new Date().toISOString()
      });
      router.push('/transactions');
    } catch (error) {
      alert('Failed to add transaction. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-2xl p-5 sm:p-8 md:p-10 shadow-sm border border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Add Transaction</h1>
        <div className="pb-4 sm:pb-6 mb-6 sm:mb-8 border-b border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 tracking-tight">New Transaction</h2>
          <p className="text-xs sm:text-sm text-gray-500">Enter the details of your transaction below</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="type" className="text-xs sm:text-sm font-semibold text-gray-700 tracking-tight">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-[15px] bg-white text-gray-900 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-xs sm:text-sm font-semibold text-gray-700 tracking-tight">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Weekly grocery shopping"
              className="px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-[15px] bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="amount" className="text-xs sm:text-sm font-semibold text-gray-700 tracking-tight">Amount</label>
            <div className="relative">
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g., 50.00"
                step="0.01"
                min="0"
                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 pr-10 sm:pr-12 border border-gray-300 rounded-xl text-sm sm:text-[15px] bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                required
              />
              <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold text-sm">
                {settings.currency === 'USD' ? '$' : settings.currency}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="category" className="text-xs sm:text-sm font-semibold text-gray-700 tracking-tight">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 rounded-xl text-sm sm:text-[15px] bg-white text-gray-900 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <button
            type="submit"
            className="mt-4 sm:mt-6 px-6 sm:px-8 py-3.5 sm:py-4 bg-gray-900 text-white rounded-xl text-sm sm:text-[15px] font-bold hover:bg-gray-800 shadow-md shadow-gray-900/20 hover:shadow-lg hover:shadow-gray-900/30 transition-all duration-200 active:translate-y-0 tracking-tight"
          >
            + Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
