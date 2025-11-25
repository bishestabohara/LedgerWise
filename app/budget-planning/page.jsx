'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, parseISO } from 'date-fns';

export default function BudgetPlanning() {
  const { budgets, currentBudget, createBudget, updateBudget, deleteBudget, setCurrentBudget, settings } = useApp();

  // UI State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    limit: '',
    categories: []
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

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.limit || parseFloat(formData.limit) <= 0) {
        showNotification('Please enter a valid budget limit greater than 0', 'error');
        return;
      }

      if (formData.categories.length === 0) {
        showNotification('Please add at least one category', 'error');
        return;
      }

      // Check for empty category names
      const hasEmptyNames = formData.categories.some(cat => !cat.name.trim());
      if (hasEmptyNames) {
        showNotification('All categories must have names', 'error');
        return;
      }

      // Validate percentages
      const total = formData.categories.reduce((sum, cat) => sum + (parseFloat(cat.percentage) || 0), 0);
      if (Math.abs(total - 100) > 0.1) {
        showNotification('Category percentages must add up to exactly 100%', 'error');
        return;
      }

      // Check for duplicate category names
      const categoryNames = formData.categories.map(cat => cat.name.toLowerCase().trim());
      const hasDuplicates = categoryNames.length !== new Set(categoryNames).size;
      if (hasDuplicates) {
        showNotification('Category names must be unique', 'error');
      return;
    }

      await createBudget({
        limit: parseFloat(formData.limit),
        categories: formData.categories.map(cat => ({
          name: cat.name.trim(),
          percentage: parseFloat(cat.percentage)
        })),
        month: new Date().toISOString()
      });

      // Reset form and close modal
      setFormData({ limit: '', categories: [] });
      setShowCreateForm(false);
      showNotification('Budget created successfully!');
    } catch (error) {
      console.error('Error creating budget:', error);
      showNotification('Failed to create budget. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.limit || parseFloat(formData.limit) <= 0) {
        showNotification('Please enter a valid budget limit greater than 0', 'error');
        return;
      }

      if (formData.categories.length === 0) {
        showNotification('Please add at least one category', 'error');
        return;
      }

      // Check for empty category names
      const hasEmptyNames = formData.categories.some(cat => !cat.name.trim());
      if (hasEmptyNames) {
        showNotification('All categories must have names', 'error');
        return;
      }

      // Validate percentages
      const total = formData.categories.reduce((sum, cat) => sum + (parseFloat(cat.percentage) || 0), 0);
      if (Math.abs(total - 100) > 0.1) {
        showNotification('Category percentages must add up to exactly 100%', 'error');
        return;
      }

      // Check for duplicate category names
      const categoryNames = formData.categories.map(cat => cat.name.toLowerCase().trim());
      const hasDuplicates = categoryNames.length !== new Set(categoryNames).size;
      if (hasDuplicates) {
        showNotification('Category names must be unique', 'error');
        return;
      }

      await updateBudget(editingBudget.id, {
        limit: parseFloat(formData.limit),
        categories: formData.categories.map(cat => ({
          name: cat.name.trim(),
          percentage: parseFloat(cat.percentage)
        })),
        month: editingBudget.month
      });

      // Reset form and close modal
      setFormData({ limit: '', categories: [] });
      setShowEditForm(false);
      setEditingBudget(null);
      showNotification('Budget updated successfully!');
    } catch (error) {
      console.error('Error updating budget:', error);
      showNotification('Failed to update budget. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBudget = async (budget) => {
    try {
      setCurrentBudget(budget);
      showNotification(`Switched to ${budget.limit ? `$${budget.limit.toLocaleString()}` : 'budget'} budget`);
    } catch (error) {
      console.error('Error selecting budget:', error);
      showNotification('Failed to switch budget', 'error');
    }
  };

  const handleDeleteSpecificBudget = async (budgetId) => {
    if (budgets.length <= 1) {
      showNotification('You must have at least one budget. Create a new budget before deleting this one.', 'error');
      return;
    }

    const budgetToDelete = budgets.find(b => b.id === budgetId);
    const confirmMessage = `Are you sure you want to delete the budget "${budgetToDelete?.limit ? `$${budgetToDelete.limit.toLocaleString()}` : 'this budget'}"? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteBudget(budgetId);
        showNotification('Budget deleted successfully!');
      } catch (error) {
        console.error('Error deleting budget:', error);
        showNotification('Failed to delete budget. Please try again.', 'error');
      }
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setFormData({
      limit: budget.limit.toString(),
      categories: budget.categories.map(cat => ({
        name: cat.name,
        percentage: cat.percentage.toString()
      }))
    });
    setShowEditForm(true);
  };

  const handleAddCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, { name: '', percentage: 0 }]
    }));
  };

  const handleCategoryChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      )
    }));
  };

  const handleDeleteCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteBudget = async () => {
    if (!currentBudget) return;
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(currentBudget.id);
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Failed to delete budget. Please try again.');
      }
    }
  };

  const totalPercentage = formData.categories.reduce((sum, cat) => sum + (parseFloat(cat.percentage) || 0), 0);

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
          <h1 className="text-2xl sm:text-[30px] font-bold text-gray-900 mb-1 tracking-tight leading-tight">Budget Planning</h1>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">Create and manage your monthly budgets</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-800 shadow-md shadow-gray-900/20 hover:shadow-lg hover:shadow-gray-900/30 transition-all duration-200"
          >
            + Create Budget
              </button>
        </div>
      </div>

      {/* Budget Overview Stats */}
      {budgets.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Budgets</p>
                  <p className="text-lg font-bold text-gray-900">{budgets.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Active Budget</p>
                  <p className="text-lg font-bold text-gray-900">{currentBudget ? formatCurrency(currentBudget.limit) : 'None'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Categories</p>
                  <p className="text-lg font-bold text-gray-900">
                    {budgets.reduce((sum, budget) => sum + budget.categories.length, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Select Active Budget</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                onClick={() => handleSelectBudget(budget)}
                className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  currentBudget?.id === budget.id
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                        {formatCurrency(budget.limit)}
                      </h3>
                      {currentBudget?.id === budget.id && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Created {format(new Date(budget.createdAt || budget.month), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditBudget(budget);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit budget"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSpecificBudget(budget.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={budgets.length <= 1 ? "Cannot delete last budget" : "Delete budget"}
                      disabled={budgets.length <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Categories</span>
                    <span className="font-semibold text-gray-900">{budget.categories.length}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total Allocation</span>
                    <span className="font-semibold text-gray-900">100%</span>
                  </div>

                  {budget.categories.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1">
                        {budget.categories.slice(0, 3).map((category, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
                          >
                            {category.name}
                          </span>
                        ))}
                        {budget.categories.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{budget.categories.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Creating Budget */}
      {showCreateForm && !showEditForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Create New Budget</h2>
            <form onSubmit={handleCreateBudget} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Budget Limit</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                  placeholder="Enter budget limit"
                  className="px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-700">Categories</label>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-all"
                  >
                    + Add Category
                  </button>
                </div>

                {formData.categories.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">Total Percentage:</span>
                      <span className={`font-bold ${totalPercentage === 100 ? 'text-green-600' : totalPercentage > 100 ? 'text-red-600' : 'text-gray-900'}`}>
                        {totalPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {formData.categories.map((category, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Category name"
                        value={category.name}
                        onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                        required
                      />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="%"
                        value={category.percentage}
                        onChange={(e) => handleCategoryChange(index, 'percentage', parseFloat(e.target.value) || 0)}
                        className="w-24 px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(index)}
                        className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-bold text-xl"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-gray-900/20 transition-all flex items-center gap-2"
                >
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Creating...' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Budget */}
      {showEditForm && editingBudget && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Edit Budget</h2>
            <form onSubmit={handleUpdateBudget} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Budget Limit</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, limit: e.target.value }))}
                  placeholder="Enter budget limit"
                  className="px-4 py-3.5 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">Categories</label>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-all"
                  >
                    + Add Category
                  </button>
                </div>
                {formData.categories.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-3">
                    <div className="flex justify-between items-center text-sm mb-3">
                      <span className="text-gray-600 font-medium">Total Percentage:</span>
                      <span className={`font-bold ${totalPercentage === 100 ? 'text-green-600' : totalPercentage > 100 ? 'text-red-600' : 'text-gray-900'}`}>
                        {totalPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                {formData.categories.map((category, index) => (
                        <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={category.name}
                      onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                      required
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="%"
                      value={category.percentage}
                            onChange={(e) => handleCategoryChange(index, 'percentage', parseFloat(e.target.value) || 0)}
                            className="w-16 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(index)}
                            className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-bold text-sm"
                            disabled={formData.categories.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingBudget(null);
                    setFormData({ limit: '', categories: [] });
                  }}
                  disabled={loading}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Updating...' : 'Update Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {budgets.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Create your first budget to start managing your monthly expenses effectively.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 shadow-md shadow-gray-900/20 transition-all duration-200"
          >
            Create Your First Budget
          </button>
        </div>
      )}

      {/* Active Budget Display */}
      {currentBudget ? (
        <div>
          <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80 mb-6">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Active Budget Details</h2>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Active</span>
            </div>
            <p className="text-2xl sm:text-[32px] font-bold text-gray-900 tracking-tight leading-none">{formatCurrency(currentBudget.limit)}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Monthly budget limit</p>
          </div>

          {currentBudget.categories && currentBudget.categories.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">Budget Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentBudget.categories.map((category, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-base font-semibold text-gray-900">{category.name}</h4>
                      <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold">
                        {category.percentage}%
                      </span>
                  </div>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">
                    {formatCurrency((currentBudget.limit * category.percentage) / 100)}
                    </p>
                    <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-base font-medium text-gray-400 mb-2">No active budget</p>
          <p className="text-sm text-gray-300 mb-6">Create one to get started with budget planning</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 shadow-md shadow-gray-900/20 hover:shadow-lg hover:shadow-gray-900/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            + Create Your First Budget
          </button>
        </div>
      )}
    </div>
  );
}
