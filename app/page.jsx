'use client';

import { useApp } from './context/AppContext';
import { format, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const {
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    getUpcomingBills,
    getRecentTransactions,
    recurringExpenses,
    settings
  } = useApp();
  const router = useRouter();

  const totalBalance = getTotalBalance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const upcomingBills = getUpcomingBills();
  const recentTransactions = getRecentTransactions();
  const currentDate = new Date();
  const monthYear = format(currentDate, 'MMMM yyyy');

  // Find the closest upcoming recurring expense
  const getClosestRecurringExpense = () => {
    const now = new Date();
    const upcoming = recurringExpenses
      .filter(expense => parseISO(expense.nextDueDate) >= now)
      .sort((a, b) => parseISO(a.nextDueDate) - parseISO(b.nextDueDate));

    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const closestRecurringExpense = getClosestRecurringExpense();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD'
    }).format(amount);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-[30px] font-bold text-gray-900 mb-1 tracking-tight leading-tight">Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-500 font-normal">{monthYear}</p>
      </div>

      {/* Current Budget Section */}
      <div className="mb-8 sm:mb-10">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5 tracking-tight">Current Budget</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Total Balance Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80 relative overflow-hidden group hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 tracking-tight">Total Balance</h3>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Preview</span>
            </div>
            <div>
              <p className={`text-2xl sm:text-[32px] font-bold mb-0.5 tracking-tight leading-none ${totalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium mt-2">Available to spend</p>
            </div>
          </div>

          {/* Total Income Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80 relative overflow-hidden group hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 tracking-tight">Total Income</h3>
              <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl sm:text-[32px] font-bold mb-0.5 tracking-tight leading-none text-gray-900">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium mt-2">This month</p>
            </div>
          </div>

          {/* Total Expenses Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80 relative overflow-hidden group hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 tracking-tight">Total Expenses</h3>
              <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div>
              <p className="text-2xl sm:text-[32px] font-bold mb-0.5 tracking-tight leading-none text-gray-900">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium mt-2">This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Recurring Expense Alert */}
      {closestRecurringExpense && (
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm sm:text-base font-semibold text-amber-800">Upcoming Payment Alert</h3>
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">
                    Due Soon
                  </span>
                </div>
                <p className="text-sm text-amber-700 mb-2">
                  <span className="font-semibold">{closestRecurringExpense.name}</span> - {formatCurrency(closestRecurringExpense.amount)} due on{' '}
                  <span className="font-semibold">{format(parseISO(closestRecurringExpense.nextDueDate), 'MMM d, yyyy')}</span>
                </p>
                <div className="flex items-center gap-4 text-xs text-amber-600">
                  <span className="capitalize">{closestRecurringExpense.frequency}</span>
                  <span>•</span>
                  <span>{closestRecurringExpense.category}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => router.push('/recurring')}
                  className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Bills Section */}
      <div className="mb-8 sm:mb-10">
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Upcoming Bills</h2>
          </div>
          <p className="text-xs text-gray-500 font-medium ml-6 sm:ml-7 hidden sm:block">Bills Due Soon</p>
          <p className="text-[11px] sm:text-xs text-gray-400 ml-6 sm:ml-7 hidden sm:block">Recent bill payments and upcoming due dates</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80 min-h-[180px]">
          {upcomingBills.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="flex justify-between items-center py-3 sm:py-3.5 first:pt-0 last:pb-0 gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-[15px] font-semibold text-gray-900 mb-0.5 truncate">{bill.name}</h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                      {formatCurrency(bill.amount)} • Due {format(parseISO(bill.nextDueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400 mb-1">No upcoming bills</p>
              <p className="text-xs text-gray-300">Bills from the last 30 days will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight">Recent Transactions</h2>
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-gray-200/80 min-h-[180px]">
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-3 sm:py-3.5 first:pt-0 last:pb-0 gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-[15px] font-semibold text-gray-900 mb-0.5 truncate">
                      {transaction.description || 'No description'}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">
                      {transaction.category || 'Uncategorized'} • {format(parseISO(transaction.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className={`text-sm sm:text-base font-bold tabular-nums whitespace-nowrap ${transaction.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400 mb-1">No recent transactions</p>
              <p className="text-xs text-gray-300">Latest Activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
