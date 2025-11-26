'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';

export default function Goals() {
  const { goals, currentGoal, addGoal, updateGoal, deleteGoal, setCurrentGoal, getTotalBalance, settings } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: ''
  });

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD'
    }).format(amount);
  };

  const calculateProgress = (goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const handleSelectGoal = (goal) => {
    setCurrentGoal(goal);
    showNotification(`Switched to "${goal.name}" goal`);
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
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-emerald-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-white/80 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}

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

      {/* Goal Selection */}
      {goals.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Select Active Goal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => handleSelectGoal(goal)}
                className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  currentGoal?.id === goal.id
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                        {goal.name}
                      </h3>
                      {currentGoal?.id === goal.id && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Created {format(new Date(goal.createdAt || goal.id.substring(0, 10)), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-900">{Math.round(calculateProgress(goal))}%</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Target</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(goal.targetAmount)}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress(goal)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Goal Display */}
      {currentGoal && (
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight mb-1">{currentGoal.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Active Goal</span>
                  <span className="text-sm text-gray-500">
                    Due {format(parseISO(currentGoal.deadline), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Progress</span>
                <span className="text-sm font-bold text-gray-900">{Math.round(calculateProgress(currentGoal))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${calculateProgress(currentGoal)}%` }}
                ></div>
              </div>
            </div>

            {/* Amount Details */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 font-medium mb-1">Current</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(currentGoal.currentAmount)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-medium mb-1">Target</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(currentGoal.targetAmount)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-medium mb-1">Remaining</p>
                <p className="text-lg font-bold text-red-500">
                  {formatCurrency(currentGoal.targetAmount - currentGoal.currentAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Goals Grid */}
      {goals.length > 0 ? (
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">All Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {goals.map((goal) => {
              const progress = calculateProgress(goal);

              return (
                <div
                  key={goal.id}
                  onClick={() => handleSelectGoal(goal)}
                  className="cursor-pointer rounded-2xl p-7 shadow-sm border bg-white hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 tracking-tight">{goal.name}</h3>
                      {currentGoal?.id === goal.id && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGoal(goal.id);
                      }}
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
