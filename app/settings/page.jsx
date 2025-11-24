'use client';

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { settings, updateSettings } = useApp();
  const [personalDetails, setPersonalDetails] = useState(settings.personalDetails || {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
  ];

  const handleThemeChange = (theme) => {
    updateSettings({ theme });
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
  };

  const handleCurrencyChange = (currency) => {
    updateSettings({ currency });
  };

  const handlePersonalDetailsChange = (field, value) => {
    const updated = { ...personalDetails, [field]: value };
    setPersonalDetails(updated);
    updateSettings({ personalDetails: updated });
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      updateSettings({
        theme: 'light',
        currency: 'USD',
        personalDetails: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        }
      });
      setPersonalDetails({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      });
      document.body.className = '';
      alert('Settings have been reset to defaults.');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This action cannot be undone!')) {
      if (window.confirm('This will delete all transactions, budgets, goals, and recurring expenses. Are you absolutely sure?')) {
        // Clear localStorage
        localStorage.clear();
        // Reload page to reset state
        window.location.reload();
      }
    }
  };

  // Apply theme on mount
  useEffect(() => {
    document.body.className = settings.theme === 'dark' ? 'dark-theme' : '';
  }, [settings.theme]);

  return (
    <div className="w-full max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-[30px] font-bold text-gray-900 mb-1 tracking-tight leading-tight">Settings</h1>
        <p className="text-xs sm:text-sm text-gray-500 font-normal">Manage your app preferences and account settings</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-white rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">Appearance</h2>
              <p className="text-xs text-gray-500 font-medium">Customize how the app looks</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Theme</label>
            <div className="flex gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                  settings.theme === 'light'
                    ? 'bg-gray-900 border-gray-900 text-white shadow-md shadow-gray-900/20'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-semibold">Light</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-gray-900 border-gray-900 text-white shadow-md shadow-gray-900/20'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="font-semibold">Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="bg-white rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">Currency</h2>
              <p className="text-xs text-gray-500 font-medium">Set your preferred currency</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Preferred Currency</label>
            <select
              value={settings.currency || 'USD'}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 font-medium hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">Personal Details</h2>
              <p className="text-xs text-gray-500 font-medium">Update your personal information</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="text-sm font-semibold text-gray-700 mb-2 block">First Name</label>
              <input
                type="text"
                id="firstName"
                value={personalDetails.firstName}
                onChange={(e) => handlePersonalDetailsChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="text-sm font-semibold text-gray-700 mb-2 block">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={personalDetails.lastName}
                onChange={(e) => handlePersonalDetailsChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-2 block">Email</label>
              <input
                type="email"
                id="email"
                value={personalDetails.email}
                onChange={(e) => handlePersonalDetailsChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[15px] bg-white text-gray-900 hover:border-gray-400 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl p-7 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">Data Management</h2>
              <p className="text-xs text-gray-500 font-medium">Manage your app data and reset preferences</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-3 shadow-sm">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Reset Settings</h3>
              <p className="text-xs text-gray-500 mb-4 font-medium">Restore default preferences</p>
              <button
                onClick={handleResetSettings}
                className="w-full px-4 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all shadow-sm"
              >
                Reset Settings
              </button>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-3 shadow-sm">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Clear All Data</h3>
              <p className="text-xs text-gray-500 mb-4 font-medium">Permanently delete everything</p>
              <button
                onClick={handleClearAllData}
                className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all shadow-md shadow-red-600/20"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
