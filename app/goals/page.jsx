'use client';

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, getTotalBalance, settings } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD'
    }).format(amount);
  };

  const calculateProgress = (goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const calculateTimeToGoal = (goal) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    const monthlySavings = Math.max(getTotalBalance(), 0);
    
    if (monthlySavings <= 0) {
      return 'N/A (negative balance)';
    }
    
    const months = Math.ceil(remaining / monthlySavings);
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      }
      return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await addGoal({
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        deadline: formData.deadline,
        progress: 0
      });
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Failed to add goal. Please try again.');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(id);
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal. Please try again.');
      }
    }
  };

  const handleUpdateProgress = async (goalId, newAmount) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        await updateGoal(goalId, {
          currentAmount: parseFloat(newAmount),
          progress: Math.min((parseFloat(newAmount) / goal.targetAmount) * 100, 100)
        });
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-[30px] font-bold text-gray-900 mb-1 tracking-tight leading-tight">Goals</h1>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">Set and track your financial goals</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-800 shadow-md shadow-gray-900/20 hover:shadow-lg hover:shadow-gray-900/30 transition-all duration-200"
        >
          + New Goal
        </button>
      </div>

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal);
            const timeToGoal = calculateTimeToGoal(goal);
            
            return (
              <div
                key={goal.id}
                className="bg-white rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">{goal.name}</h3>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-600">Progress</span>
                    <span className="text-sm font-bold text-gray-900">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-900">{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-gray-500 font-medium">of {formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Target</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Current</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(goal.currentAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Remaining</span>
                    <span className="text-sm font-bold text-red-500">
                      {formatCurrency(goal.targetAmount - goal.currentAmount)}
                    </span>
                  </div>
                  {goal.deadline && (
                    <div className="flex justify-between items-center pt-2.5 border-t border-gray-200">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Deadline</span>
                      <span className="text-sm font-bold text-gray-900">
                        {format(parseISO(goal.deadline), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2.5 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Time to Goal</span>
                    <span className="text-sm font-bold text-purple-600">{timeToGoal}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Update current amount"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateProgress(goal.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.parentElement.querySelector('input');
                      if (input.value) {
                        handleUpdateProgress(goal.id, input.value);
                        input.value = '';
                      }
                    }}
                    className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all"
                  >
                    Update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-base font-medium text-gray-400 mb-2">No goals yet</p>
          <p className="text-sm text-gray-300 mb-6">Add your first goal to start tracking your progress</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 shadow-md shadow-gray-900/20 hover:shadow-lg hover:shadow-gray-900/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            + Add Your First Goal
          </button>
        </div>
      )}

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
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Add Goal</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Save for vacation"
                  className="px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                  placeholder="0.00"
                  className="px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                  placeholder="0.00"
                  className="px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
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
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
