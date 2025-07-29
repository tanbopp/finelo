// Local Storage Keys
const STORAGE_KEYS = {
    TRANSACTIONS: 'moneyTracker_transactions',
    GOALS: 'moneyTracker_goals',
    SAVINGS: 'moneyTracker_savings',
    DAILY_LIMIT: 'moneyTracker_dailyLimit',
    CATEGORIES: 'moneyTracker_categories',
    STATISTICS_CONFIG: 'moneyTracker_statisticsConfig',
    WALLETS: 'moneyTracker_wallets'
};

// Global variables
let transactions = [];
let goals = [];
let savings = [];
let dailyLimitSettings = {
    enabled: false,
    amount: 50000,
    resetTime: 'midnight',
    customResetTime: '00:00',
    warnings: {
        fifty: true,
        seventyFive: true,
        ninety: true
    },
    blockExceed: true,
    lastResetDate: null,
    excludeSavings: true, // Exclude savings from daily limit
    excludeGoals: true // Exclude goal contributions from daily limit
};

// Custom categories
let customCategories = {
    income: ['Gaji', 'Freelance', 'Bonus', 'Investasi', 'Lainnya'],
    expense: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya']
};

// Statistics display configuration
let statisticsConfig = {
    keyMetrics: true,
    incomeExpenseChart: true,
    balanceChart: true,
    categoryPieChart: true,
    monthlyComparisonChart: true,
    dailyActivityChart: true,
    topCategories: true,
    spendingPatterns: true,
    goalsProgress: true,
    spendingHeatmap: true,
    financialHealth: true,
    monthlyForecast: true,
    financialInsights: true
};

// Wallet system
let wallets = [
    { id: 'bank', name: 'Bank', balance: 0, color: '#3B82F6' },
    { id: 'cash', name: 'Cash', balance: 0, color: '#10B981' },
    { id: 'ewallet', name: 'E-Wallet', balance: 0, color: '#8B5CF6' }
];

// AI Chat variables
let aiStats = {
    processedCount: 0,
    messagesTotal: 0,
    messagesToday: 0,
    lastMessageDate: null
};

// Chart instances
let charts = {
    incomeExpense: null,
    balance: null,
    categoryPie: null,
    monthlyComparison: null,
    dailyActivity: null
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    checkDailyLimitReset();
    updateDashboard();
    updateTransactionsList();
    updateGoalsList();
    updateSavingsDisplay();
    updateFilterCategories();
    updateCategoryDropdowns();
    updateWalletDisplay();
    updateDailyLimitDisplay();
    loadDailyLimitSettings();
    setupEventListeners();
    initializeStatistics();
    updateAIStats();
    initializeInvestmentSection(); // Initialize investment functions
    showSection('dashboard');
});

// Load data from localStorage
function loadData() {
    transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) || [];
    goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS)) || [];
    savings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS)) || [];
    
    const savedDailyLimit = localStorage.getItem(STORAGE_KEYS.DAILY_LIMIT);
    if (savedDailyLimit) {
        dailyLimitSettings = { ...dailyLimitSettings, ...JSON.parse(savedDailyLimit) };
    }
    
    const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (savedCategories) {
        customCategories = { ...customCategories, ...JSON.parse(savedCategories) };
    }
    
    const savedStatisticsConfig = localStorage.getItem(STORAGE_KEYS.STATISTICS_CONFIG);
    if (savedStatisticsConfig) {
        statisticsConfig = { ...statisticsConfig, ...JSON.parse(savedStatisticsConfig) };
    }
    
    const savedWallets = localStorage.getItem(STORAGE_KEYS.WALLETS);
    if (savedWallets) {
        wallets = JSON.parse(savedWallets);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    localStorage.setItem(STORAGE_KEYS.SAVINGS, JSON.stringify(savings));
    localStorage.setItem(STORAGE_KEYS.DAILY_LIMIT, JSON.stringify(dailyLimitSettings));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(customCategories));
    localStorage.setItem(STORAGE_KEYS.STATISTICS_CONFIG, JSON.stringify(statisticsConfig));
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
}

// Currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount).replace('IDR', 'Rp.');
}

// Date formatting
function formatDate(dateString) {
    // Handle undefined, null, or invalid dates
    if (!dateString) {
        return 'Tanggal tidak valid';
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Tanggal tidak valid';
        }
        
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: 'Asia/Jakarta'
        };
        return date.toLocaleDateString('id-ID', options);
    } catch (error) {
        return 'Tanggal tidak valid';
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const icon = document.getElementById('notification-icon');
    const text = document.getElementById('notification-text');
    
    // Set icon based on type
    let iconClass = '';
    let iconColor = '';
    
    switch(type) {
        case 'success':
            iconClass = 'fas fa-check-circle';
            iconColor = 'text-green-600';
            break;
        case 'error':
            iconClass = 'fas fa-exclamation-circle';
            iconColor = 'text-red-600';
            break;
        case 'warning':
            iconClass = 'fas fa-exclamation-triangle';
            iconColor = 'text-yellow-600';
            break;
        default:
            iconClass = 'fas fa-info-circle';
            iconColor = 'text-blue-600';
    }
    
    icon.innerHTML = `<i class="${iconClass} ${iconColor}"></i>`;
    text.textContent = message;
    
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

// Hide notification
function hideNotification() {
    document.getElementById('notification').classList.add('hidden');
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.remove('hidden');
    
    // Update navigation active state
    document.querySelectorAll('.nav-btn, .nav-btn-mobile').forEach(btn => {
        btn.classList.remove('text-primary', 'font-semibold');
        btn.classList.add('text-gray-700');
    });
    
    // Set active nav button
    const activeButtons = document.querySelectorAll(`[onclick="showSection('${sectionName}')"]`);
    activeButtons.forEach(btn => {
        btn.classList.remove('text-gray-700');
        btn.classList.add('text-primary', 'font-semibold');
    });
    
    // Hide mobile menu
    document.getElementById('mobile-menu').classList.add('hidden');
    
    // Update statistics if statistics section is opened
    if (sectionName === 'statistics') {
        setTimeout(() => {
            setupStatisticsFilters();
            updateStatistics();
        }, 100);
    }
}

function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
}

// Transaction functions
function addIncome(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('income-amount').value);
    const category = document.getElementById('income-category').value;
    const description = document.getElementById('income-description').value;
    const wallet = document.getElementById('income-wallet') ? document.getElementById('income-wallet').value : 'bank';
    
    if (amount <= 0) {
        showNotification('Jumlah harus lebih dari 0', 'error');
        return;
    }
    
    const transaction = {
        id: Date.now().toString(),
        type: 'income',
        amount: amount,
        category: category,
        description: description || '',
        wallet: wallet,
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('id-ID')
    };
    
    transactions.unshift(transaction);
    updateWalletBalances();
    saveData();
    updateDashboard();
    updateTransactionsList();
    updateFilterCategories();
    
    // Update statistics if visible
    if (!document.getElementById('statistics-section').classList.contains('hidden')) {
        updateStatistics();
    }
    
    // Reset form
    document.getElementById('income-amount').value = '';
    document.getElementById('income-description').value = '';
    
    showNotification('Pemasukan berhasil ditambahkan!', 'success');
}

function addExpense(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const description = document.getElementById('expense-description').value;
    const wallet = document.getElementById('expense-wallet') ? document.getElementById('expense-wallet').value : 'bank';
    
    if (amount <= 0) {
        showNotification('Jumlah harus lebih dari 0', 'error');
        return;
    }
    
    // Check daily limit before adding expense (excluding savings and goals if configured)
    if (dailyLimitSettings.enabled) {
        const shouldCheckLimit = !(dailyLimitSettings.excludeSavings && category === 'Tabungan') && 
                                !(dailyLimitSettings.excludeGoals && category === 'Target/Goal');
        
        if (shouldCheckLimit) {
            const dailySpent = getTodayExpenses();
            const newTotal = dailySpent + amount;
            
            if (newTotal > dailyLimitSettings.amount) {
                if (dailyLimitSettings.blockExceed) {
                    const remaining = dailyLimitSettings.amount - dailySpent;
                    showNotification(
                        `Pengeluaran melebihi batas harian! Sisa limit: ${formatCurrency(Math.max(0, remaining))}`, 
                        'error'
                    );
                    return;
                } else {
                    if (!confirm(`Pengeluaran akan melebihi batas harian Anda (${formatCurrency(dailyLimitSettings.amount)}). Lanjutkan?`)) {
                        return;
                    }
                }
            }
            
            // Check for warnings
            const percentage = (newTotal / dailyLimitSettings.amount) * 100;
            if (percentage >= 90 && dailyLimitSettings.warnings.ninety && dailySpent < dailyLimitSettings.amount * 0.9) {
                showNotification('Peringatan: 90% dari batas harian telah tercapai!', 'warning');
            } else if (percentage >= 75 && dailyLimitSettings.warnings.seventyFive && dailySpent < dailyLimitSettings.amount * 0.75) {
                showNotification('Peringatan: 75% dari batas harian telah tercapai!', 'warning');
            } else if (percentage >= 50 && dailyLimitSettings.warnings.fifty && dailySpent < dailyLimitSettings.amount * 0.5) {
                showNotification('Peringatan: 50% dari batas harian telah tercapai!', 'warning');
            }
        }
    }
    
    const transaction = {
        id: Date.now().toString(),
        type: 'expense',
        amount: amount,
        category: category,
        description: description || '',
        wallet: wallet,
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('id-ID')
    };
    
    transactions.unshift(transaction);
    updateWalletBalances();
    saveData();
    updateDashboard();
    updateTransactionsList();
    updateFilterCategories();
    updateDailyLimitDisplay();
    
    // Update statistics if visible
    if (!document.getElementById('statistics-section').classList.contains('hidden')) {
        updateStatistics();
    }
    
    // Reset form
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-description').value = '';
    
    showNotification('Pengeluaran berhasil ditambahkan!', 'success');
}

function deleteTransaction(id) {
    // Transactions cannot be deleted - history protection
    showNotification('Transaksi tidak dapat dihapus untuk melindungi riwayat keuangan. Gunakan Reset Aplikasi di pengaturan untuk memulai dari awal.', 'error');
}

// Reset application function
function resetApplication() {
    const confirmText = 'RESET';
    const userInput = prompt(`PERINGATAN: Ini akan menghapus SEMUA data aplikasi termasuk transaksi, target, tabungan, dan pengaturan.\n\nKetik "${confirmText}" untuk melanjutkan:`);
    
    if (userInput === confirmText) {
        // Clear all data
        transactions = [];
        goals = [];
        savings = [];
        dailyLimitSettings = {
            enabled: false,
            amount: 50000,
            resetTime: 'midnight',
            customResetTime: '00:00',
            warnings: {
                fifty: true,
                seventyFive: true,
                ninety: true
            },
            blockExceed: true,
            lastResetDate: null,
            excludeSavings: true,
            excludeGoals: true
        };
        customCategories = {
            income: ['Gaji', 'Freelance', 'Bonus', 'Investasi', 'Lainnya'],
            expense: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya']
        };
        statisticsConfig = {
            keyMetrics: true,
            incomeExpenseChart: true,
            balanceChart: true,
            categoryPieChart: true,
            monthlyComparisonChart: true,
            dailyActivityChart: true,
            topCategories: true,
            spendingPatterns: true,
            goalsProgress: true,
            spendingHeatmap: true,
            financialHealth: true,
            monthlyForecast: true,
            financialInsights: true
        };
        wallets = [
            { id: 'bank', name: 'Bank', balance: 0, color: '#3B82F6' },
            { id: 'cash', name: 'Cash', balance: 0, color: '#10B981' },
            { id: 'ewallet', name: 'E-Wallet', balance: 0, color: '#8B5CF6' }
        ];
        
        // Clear localStorage
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Reset AI stats
        localStorage.removeItem('moneyTracker_aiStats');
        
        // Save default data
        saveData();
        
        // Update UI
        updateDashboard();
        updateTransactionsList();
        updateGoalsList();
        updateSavingsDisplay();
        updateFilterCategories();
        updateCategoryDropdowns();
        updateDailyLimitDisplay();
        
        // Show dashboard section
        showSection('dashboard');
        
        showNotification('Aplikasi berhasil direset! Semua data telah dihapus.', 'success');
    } else if (userInput !== null) {
        showNotification('Reset dibatalkan. Ketik "RESET" dengan huruf kapital untuk melanjutkan.', 'error');
    }
}

// Calculate total balance
function calculateBalance() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    return totalIncome - totalExpense;
}

// Calculate savings balance
function calculateSavingsBalance() {
    return savings.reduce((sum, s) => {
        if (s.type === 'deposit') {
            return sum + s.amount;
        } else if (s.type === 'withdraw') {
            return sum - s.amount;
        }
        return sum;
    }, 0);
}

// Update dashboard
function updateDashboard() {
    // Update wallet balances first
    updateWalletBalances();
    
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalSavingsAmount = savings.reduce((sum, s) => sum + s.amount, 0);
    const balance = totalIncome - totalExpense - totalSavingsAmount;
    
    document.getElementById('total-balance').textContent = formatCurrency(balance);
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expense').textContent = formatCurrency(totalExpense);
    
    // Update wallet display
    updateWalletDisplay();
    
    // Update recent transactions
    updateRecentTransactions();
}

function updateRecentTransactions() {
    const recentTransactions = transactions.slice(0, 5);
    const container = document.getElementById('recent-transactions');
    
    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-receipt text-4xl mb-2"></i>
                <p>Belum ada transaksi</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentTransactions.map(transaction => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
                <div class="p-2 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'} rounded-lg mr-3">
                    <i class="fas ${transaction.type === 'income' ? 'fa-arrow-up text-green-600' : 'fa-arrow-down text-red-600'}"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-900">${transaction.category}</p>
                    <p class="text-sm text-gray-600">${transaction.description || '-'}</p>
                    <p class="text-xs text-gray-500">${formatDate(transaction.date)}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                </p>
            </div>
        </div>
    `).join('');
}

// Update transactions list
function updateTransactionsList() {
    const container = document.getElementById('transactions-list');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-receipt text-4xl mb-2"></i>
                <p>Belum ada transaksi</p>
            </div>
        `;
        return;
    }
    
    const filteredTransactions = getFilteredTransactions();
    
    if (filteredTransactions.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-filter text-4xl mb-2"></i>
                <p>Tidak ada transaksi yang sesuai dengan filter</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTransactions.map(transaction => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center flex-1">
                <div class="p-2 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'} rounded-lg mr-4">
                    <i class="fas ${transaction.type === 'income' ? 'fa-arrow-up text-green-600' : 'fa-arrow-down text-red-600'}"></i>
                </div>
                <div class="flex-1">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p class="font-medium text-gray-900">${transaction.category}</p>
                            <p class="text-sm text-gray-600">${transaction.description || '-'}</p>
                            <p class="text-xs text-gray-500">${formatDate(transaction.date)}</p>
                        </div>
                        <div class="flex items-center mt-2 sm:mt-0">
                            <p class="font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'} mr-3">
                                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                            </p>
                            <button onclick="deleteTransaction('${transaction.id}')" class="text-red-500 hover:text-red-700 p-1">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getFilteredTransactions() {
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    
    return transactions.filter(transaction => {
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
        return matchesType && matchesCategory;
    });
}

function filterTransactions() {
    updateTransactionsList();
}

function updateFilterCategories() {
    const categoryFilter = document.getElementById('filter-category');
    const categories = [...new Set(transactions.map(t => t.category))].sort();
    
    // Keep the "Semua Kategori" option and add unique categories
    categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>' + 
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Update category dropdowns in forms
function updateCategoryDropdowns() {
    const incomeSelect = document.getElementById('income-category');
    const expenseSelect = document.getElementById('expense-category');
    const incomeWallet = document.getElementById('income-wallet');
    const expenseWallet = document.getElementById('expense-wallet');
    
    if (incomeSelect) {
        incomeSelect.innerHTML = customCategories.income.map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');
    }
    
    if (expenseSelect) {
        expenseSelect.innerHTML = customCategories.expense.map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');
    }
    
    // Update wallet dropdowns
    const walletOptions = wallets.map(wallet => 
        `<option value="${wallet.id}">${wallet.name}</option>`
    ).join('');
    
    if (incomeWallet) {
        incomeWallet.innerHTML = walletOptions;
    }
    
    if (expenseWallet) {
        expenseWallet.innerHTML = walletOptions;
    }
}

// Custom category management
function addCustomCategory(type) {
    const categoryName = prompt(`Masukkan nama kategori ${type === 'income' ? 'pemasukan' : 'pengeluaran'} baru:`);
    if (categoryName && categoryName.trim()) {
        const trimmedName = categoryName.trim();
        if (!customCategories[type].includes(trimmedName)) {
            customCategories[type].push(trimmedName);
            saveData();
            updateCategoryDropdowns();
            showNotification(`Kategori "${trimmedName}" berhasil ditambahkan!`, 'success');
        } else {
            showNotification('Kategori sudah ada!', 'error');
        }
    }
}

function removeCustomCategory(type, categoryName) {
    if (confirm(`Hapus kategori "${categoryName}"? Transaksi dengan kategori ini tidak akan terhapus.`)) {
        customCategories[type] = customCategories[type].filter(cat => cat !== categoryName);
        saveData();
        updateCategoryDropdowns();
        showNotification(`Kategori "${categoryName}" berhasil dihapus!`, 'success');
    }
}

// Wallet management functions
function updateWalletBalances() {
    wallets.forEach(wallet => {
        const walletTransactions = transactions.filter(t => t.wallet === wallet.id);
        const income = walletTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = walletTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        wallet.balance = income - expense;
    });
    saveData();
}

// Goals functions
function addGoal(event) {
    event.preventDefault();
    
    const name = document.getElementById('goal-name').value.trim();
    const amount = parseFloat(document.getElementById('goal-amount').value);
    const date = document.getElementById('goal-date').value;
    const description = document.getElementById('goal-description').value.trim();
    
    if (!name) {
        showNotification('Nama target harus diisi', 'error');
        return;
    }
    
    if (amount <= 0) {
        showNotification('Target jumlah harus lebih dari 0', 'error');
        return;
    }
    
    const goal = {
        id: Date.now().toString(),
        name: name,
        amount: amount,
        targetDate: date,
        description: description,
        savedAmount: 0,
        dateCreated: new Date().toISOString()
    };
    
    goals.unshift(goal);
    saveData();
    updateGoalsList();
    
    // Reset form
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-amount').value = '';
    document.getElementById('goal-date').value = '';
    document.getElementById('goal-description').value = '';
    
    showNotification('Target berhasil ditambahkan!', 'success');
}

function updateGoalsList() {
    const container = document.getElementById('goals-list');
    
    if (goals.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-bullseye text-4xl mb-2"></i>
                <p>Belum ada target yang dibuat</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = goals.map(goal => {
        const progress = (goal.savedAmount / goal.amount) * 100;
        const isCompleted = progress >= 100;
        
        return `
            <div class="border border-gray-200 rounded-lg p-4 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900 mb-1">${goal.name}</h3>
                        <p class="text-sm text-gray-600">${goal.description || 'Tidak ada keterangan'}</p>
                        ${goal.targetDate ? `<p class="text-xs text-gray-500 mt-1">Target: ${formatDate(goal.targetDate)}</p>` : ''}
                    </div>
                    <div class="mt-2 sm:mt-0 sm:ml-4">
                        <button onclick="deleteGoal('${goal.id}')" class="text-red-500 hover:text-red-700 p-1">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                </div>
                
                <div class="mb-3">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-600">${formatCurrency(goal.savedAmount)} / ${formatCurrency(goal.amount)}</span>
                        <span class="font-medium ${isCompleted ? 'text-green-600' : 'text-primary'}">${Math.min(progress, 100).toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="h-2 rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-primary'}" 
                             style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
                
                ${!isCompleted ? `
                    <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <input type="number" id="contribute-${goal.id}" placeholder="Jumlah kontribusi" 
                               class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
                        <button onclick="contributeToGoal('${goal.id}')" 
                                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition duration-200 text-sm">
                            <i class="fas fa-plus mr-1"></i>Kontribusi
                        </button>
                        ${goal.savedAmount > 0 ? `
                            <button onclick="withdrawFromGoal('${goal.id}')" 
                                    class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-200 text-sm">
                                <i class="fas fa-minus mr-1"></i>Tarik
                            </button>
                        ` : ''}
                    </div>
                ` : `
                    <div class="text-center py-2">
                        <p class="text-green-600 font-semibold mb-2">
                            <i class="fas fa-check-circle mr-2"></i>Target tercapai!
                        </p>
                        <div class="flex justify-center space-x-2">
                            <button onclick="withdrawFromGoal('${goal.id}')" 
                                    class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200 text-sm">
                                <i class="fas fa-hand-holding-usd mr-1"></i>Kembalikan ke Saldo
                            </button>
                            <button onclick="partialWithdrawFromGoal('${goal.id}')" 
                                    class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 text-sm">
                                <i class="fas fa-minus mr-1"></i>Tarik Sebagian
                            </button>
                        </div>
                    </div>
                `}
            </div>
        `;
    }).join('');
}

function contributeToGoal(goalId) {
    const input = document.getElementById(`contribute-${goalId}`);
    const amount = parseFloat(input.value);
    
    if (!amount || amount <= 0) {
        showNotification('Jumlah kontribusi harus lebih dari 0', 'error');
        return;
    }
    
    // Check if user has enough balance
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalSavingsAmount = savings.reduce((sum, s) => sum + s.amount, 0);
    const currentBalance = totalIncome - totalExpense - totalSavingsAmount;
    
    if (amount > currentBalance) {
        showNotification('Saldo tidak mencukupi untuk kontribusi ini', 'error');
        return;
    }
    
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
        goal.savedAmount += amount;
        
        // Add as expense transaction
        const transaction = {
            id: Date.now().toString(),
            type: 'expense',
            amount: amount,
            category: 'Target/Goal',
            description: `Kontribusi untuk ${goal.name}`,
            date: new Date().toISOString(),
            formattedDate: new Date().toLocaleDateString('id-ID')
        };
        
        transactions.unshift(transaction);
        saveData();
        updateGoalsList();
        updateDashboard();
        updateTransactionsList();
        
        input.value = '';
        
        if (goal.savedAmount >= goal.amount) {
            showNotification(`Selamat! Target "${goal.name}" telah tercapai!`, 'success');
        } else {
            showNotification('Kontribusi berhasil ditambahkan!', 'success');
        }
    }
}

function withdrawFromGoal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.savedAmount <= 0) {
        showNotification('Tidak ada dana yang bisa ditarik dari target ini', 'error');
        return;
    }
    
    const isCompleted = goal.savedAmount >= goal.amount;
    const message = isCompleted ? 
        `Kembalikan semua dana (${formatCurrency(goal.savedAmount)}) dari target "${goal.name}" ke saldo?` :
        `Tarik semua dana (${formatCurrency(goal.savedAmount)}) dari target "${goal.name}"?`;
    
    if (confirm(message)) {
        const withdrawAmount = goal.savedAmount;
        
        // Add as income transaction (money back to balance)
        const transaction = {
            id: Date.now().toString(),
            type: 'income',
            amount: withdrawAmount,
            category: 'Penarikan Target',
            description: `Penarikan dari ${goal.name}`,
            date: new Date().toISOString(),
            formattedDate: new Date().toLocaleDateString('id-ID')
        };
        
        transactions.unshift(transaction);
        goal.savedAmount = 0;
        
        saveData();
        updateGoalsList();
        updateDashboard();
        updateTransactionsList();
        
        showNotification(`${formatCurrency(withdrawAmount)} berhasil dikembalikan ke saldo!`, 'success');
    }
}

function partialWithdrawFromGoal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.savedAmount <= 0) {
        showNotification('Tidak ada dana yang bisa ditarik dari target ini', 'error');
        return;
    }
    
    const withdrawAmount = parseFloat(prompt(`Masukkan jumlah yang ingin ditarik (Maksimal: ${formatCurrency(goal.savedAmount)}):`));
    
    if (!withdrawAmount || withdrawAmount <= 0) {
        showNotification('Jumlah penarikan tidak valid', 'error');
        return;
    }
    
    if (withdrawAmount > goal.savedAmount) {
        showNotification('Jumlah penarikan melebihi dana yang tersedia', 'error');
        return;
    }
    
    // Add as income transaction (money back to balance)
    const transaction = {
        id: Date.now().toString(),
        type: 'income',
        amount: withdrawAmount,
        category: 'Penarikan Target',
        description: `Penarikan sebagian dari ${goal.name}`,
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('id-ID')
    };
    
    transactions.unshift(transaction);
    goal.savedAmount -= withdrawAmount;
    
    saveData();
    updateGoalsList();
    updateDashboard();
    updateTransactionsList();
    
    showNotification(`${formatCurrency(withdrawAmount)} berhasil ditarik dari target!`, 'success');
}

function deleteGoal(id) {
    if (confirm('Apakah Anda yakin ingin menghapus target ini?')) {
        goals = goals.filter(g => g.id !== id);
        saveData();
        updateGoalsList();
        showNotification('Target berhasil dihapus!', 'success');
    }
}

// Savings functions
function addSavings(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('savings-amount').value);
    const description = document.getElementById('savings-description').value.trim();
    
    if (amount <= 0) {
        showNotification('Jumlah harus lebih dari 0', 'error');
        return;
    }
    
    // Check if user has enough balance
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalSavingsAmount = savings.reduce((sum, s) => sum + s.amount, 0);
    const currentBalance = totalIncome - totalExpense - totalSavingsAmount;
    
    if (amount > currentBalance) {
        showNotification('Saldo tidak mencukupi untuk menabung', 'error');
        return;
    }
    
    const savingEntry = {
        id: Date.now().toString(),
        type: 'deposit',
        amount: amount,
        description: description || 'Menabung',
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('id-ID')
    };
    
    savings.unshift(savingEntry);
    saveData();
    updateSavingsDisplay();
    updateDashboard();
    
    // Reset form
    document.getElementById('savings-amount').value = '';
    document.getElementById('savings-description').value = '';
    
    showNotification('Berhasil menambah tabungan!', 'success');
}

function withdrawSavings(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const description = document.getElementById('withdraw-description').value.trim();
    
    if (amount <= 0) {
        showNotification('Jumlah harus lebih dari 0', 'error');
        return;
    }
    
    const totalSavingsAmount = savings.reduce((sum, s) => sum + s.amount, 0);
    
    if (amount > totalSavingsAmount) {
        showNotification('Jumlah penarikan melebihi saldo tabungan', 'error');
        return;
    }
    
    const savingEntry = {
        id: Date.now().toString(),
        type: 'withdrawal',
        amount: -amount,
        description: description || 'Penarikan tabungan',
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('id-ID')
    };
    
    savings.unshift(savingEntry);
    saveData();
    updateSavingsDisplay();
    updateDashboard();
    
    // Reset form
    document.getElementById('withdraw-amount').value = '';
    document.getElementById('withdraw-description').value = '';
    
    showNotification('Berhasil menarik dari tabungan!', 'success');
}

function updateSavingsDisplay() {
    const totalSavingsAmount = savings.reduce((sum, s) => sum + s.amount, 0);
    document.getElementById('total-savings').textContent = formatCurrency(totalSavingsAmount);
    
    updateSavingsHistory();
}

function updateSavingsHistory() {
    const container = document.getElementById('savings-history');
    
    if (savings.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-piggy-bank text-4xl mb-2"></i>
                <p>Belum ada riwayat tabungan</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = savings.map(saving => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center">
                <div class="p-2 ${saving.type === 'deposit' ? 'bg-blue-100' : 'bg-yellow-100'} rounded-lg mr-3">
                    <i class="fas ${saving.type === 'deposit' ? 'fa-piggy-bank text-blue-600' : 'fa-money-bill-wave text-yellow-600'}"></i>
                </div>
                <div>
                    <p class="font-medium text-gray-900">${saving.type === 'deposit' ? 'Menabung' : 'Penarikan'}</p>
                    <p class="text-sm text-gray-600">${saving.description}</p>
                    <p class="text-xs text-gray-500">${saving.formattedDate}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-semibold ${saving.type === 'deposit' ? 'text-blue-600' : 'text-yellow-600'}">
                    ${saving.type === 'deposit' ? '+' : ''}${formatCurrency(Math.abs(saving.amount))}
                </p>
                <button onclick="deleteSaving('${saving.id}')" class="text-red-500 hover:text-red-700 p-1 mt-1">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function deleteSaving(id) {
    if (confirm('Apakah Anda yakin ingin menghapus riwayat tabungan ini?')) {
        savings = savings.filter(s => s.id !== id);
        saveData();
        updateSavingsDisplay();
        updateDashboard();
        showNotification('Riwayat tabungan berhasil dihapus!', 'success');
    }
}

// Daily Limit Functions
function getTodayExpenses() {
    const today = new Date().toLocaleDateString('id-ID');
    return transactions
        .filter(t => {
            if (t.type !== 'expense' || t.formattedDate !== today) return false;
            
            // Exclude savings from daily limit if setting is enabled
            if (dailyLimitSettings.excludeSavings && t.category === 'Tabungan') return false;
            
            // Exclude goal contributions from daily limit if setting is enabled
            if (dailyLimitSettings.excludeGoals && t.category === 'Target/Goal') return false;
            
            return true;
        })
        .reduce((sum, t) => sum + t.amount, 0);
}

function checkDailyLimitReset() {
    if (!dailyLimitSettings.enabled) return;
    
    const now = new Date();
    const today = now.toLocaleDateString('id-ID');
    
    // Check if we need to reset (new day)
    if (dailyLimitSettings.lastResetDate !== today) {
        let shouldReset = false;
        
        if (dailyLimitSettings.resetTime === 'midnight') {
            shouldReset = true;
        } else if (dailyLimitSettings.resetTime === 'custom') {
            const [hours, minutes] = dailyLimitSettings.customResetTime.split(':');
            const resetTime = new Date();
            resetTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            if (now >= resetTime && dailyLimitSettings.lastResetDate !== today) {
                shouldReset = true;
            }
        }
        
        if (shouldReset) {
            dailyLimitSettings.lastResetDate = today;
            saveData();
        }
    }
}

function updateDailyLimitDisplay() {
    const dailySpentCard = document.getElementById('daily-spending-card');
    const dailyAlert = document.getElementById('daily-limit-alert');
    
    if (!dailyLimitSettings.enabled) {
        dailySpentCard.classList.add('hidden');
        dailyAlert.classList.add('hidden');
        return;
    }
    
    const dailySpent = getTodayExpenses();
    const remaining = Math.max(0, dailyLimitSettings.amount - dailySpent);
    const percentage = Math.min(100, (dailySpent / dailyLimitSettings.amount) * 100);
    
    // Update spending card
    dailySpentCard.classList.remove('hidden');
    document.getElementById('daily-spent-amount').textContent = formatCurrency(dailySpent);
    document.getElementById('daily-limit-amount').textContent = formatCurrency(dailyLimitSettings.amount);
    document.getElementById('daily-remaining-amount').textContent = formatCurrency(remaining);
    document.getElementById('daily-progress-percentage').textContent = `${percentage.toFixed(1)}%`;
    
    // Update progress bar
    const progressBar = document.getElementById('daily-progress-bar');
    progressBar.style.width = `${percentage}%`;
    
    // Change color based on percentage
    if (percentage >= 90) {
        progressBar.className = 'h-3 rounded-full transition-all duration-300 bg-red-500';
        document.getElementById('daily-remaining-amount').className = 'font-medium text-red-600';
    } else if (percentage >= 75) {
        progressBar.className = 'h-3 rounded-full transition-all duration-300 bg-orange-500';
        document.getElementById('daily-remaining-amount').className = 'font-medium text-orange-600';
    } else if (percentage >= 50) {
        progressBar.className = 'h-3 rounded-full transition-all duration-300 bg-yellow-500';
        document.getElementById('daily-remaining-amount').className = 'font-medium text-yellow-600';
    } else {
        progressBar.className = 'h-3 rounded-full transition-all duration-300 bg-green-500';
        document.getElementById('daily-remaining-amount').className = 'font-medium text-green-600';
    }
    
    // Update alert
    if (percentage >= 100) {
        dailyAlert.classList.remove('hidden');
        dailyAlert.className = 'mb-6 p-4 rounded-lg border-l-4 bg-red-50 border-red-400';
        document.getElementById('limit-alert-icon').className = 'fas fa-exclamation-circle text-xl text-red-600';
        document.getElementById('limit-alert-text').textContent = 'Batas harian terlampaui!';
        document.getElementById('limit-alert-text').className = 'text-sm font-medium text-red-800';
        document.getElementById('limit-alert-subtext').textContent = `Anda telah melampaui batas pengeluaran harian sebesar ${formatCurrency(dailySpent - dailyLimitSettings.amount)}`;
        document.getElementById('limit-alert-subtext').className = 'text-xs mt-1 text-red-700';
    } else if (percentage >= 90) {
        dailyAlert.classList.remove('hidden');
        dailyAlert.className = 'mb-6 p-4 rounded-lg border-l-4 bg-orange-50 border-orange-400';
        document.getElementById('limit-alert-icon').className = 'fas fa-exclamation-triangle text-xl text-orange-600';
        document.getElementById('limit-alert-text').textContent = 'Hampir mencapai batas harian!';
        document.getElementById('limit-alert-text').className = 'text-sm font-medium text-orange-800';
        document.getElementById('limit-alert-subtext').textContent = `Sisa ${formatCurrency(remaining)} dari batas harian Anda`;
        document.getElementById('limit-alert-subtext').className = 'text-xs mt-1 text-orange-700';
    } else {
        dailyAlert.classList.add('hidden');
    }
}

function toggleDailyLimit() {
    const toggle = document.getElementById('daily-limit-toggle');
    const settings = document.getElementById('daily-limit-settings');
    const stats = document.getElementById('daily-stats');
    
    dailyLimitSettings.enabled = toggle.checked;
    
    if (dailyLimitSettings.enabled) {
        settings.classList.remove('hidden');
        updateDailyStats();
    } else {
        settings.classList.add('hidden');
        stats.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-chart-line text-4xl mb-2"></i>
                <p>Aktifkan batas harian untuk melihat statistik</p>
            </div>
        `;
    }
    
    updateDailyLimitDisplay();
    saveData();
}

function saveDailyLimitSettings() {
    const limitInput = document.getElementById('daily-limit-input');
    const resetMidnight = document.getElementById('reset-midnight');
    const customResetTime = document.getElementById('custom-reset-time');
    const warning50 = document.getElementById('warning-50');
    const warning75 = document.getElementById('warning-75');
    const warning90 = document.getElementById('warning-90');
    const blockExceed = document.getElementById('block-exceed');
    const excludeSavings = document.getElementById('exclude-savings');
    const excludeGoals = document.getElementById('exclude-goals');
    
    const amount = parseFloat(limitInput.value);
    
    if (!amount || amount < 1000) {
        showNotification('Batas harian minimal Rp. 1.000', 'error');
        return;
    }
    
    dailyLimitSettings.amount = amount;
    dailyLimitSettings.resetTime = resetMidnight.checked ? 'midnight' : 'custom';
    dailyLimitSettings.customResetTime = customResetTime.value || '00:00';
    dailyLimitSettings.warnings.fifty = warning50.checked;
    dailyLimitSettings.warnings.seventyFive = warning75.checked;
    dailyLimitSettings.warnings.ninety = warning90.checked;
    dailyLimitSettings.blockExceed = blockExceed.checked;
    dailyLimitSettings.excludeSavings = excludeSavings.checked;
    dailyLimitSettings.excludeGoals = excludeGoals.checked;
    
    saveData();
    updateDailyLimitDisplay();
    updateDailyStats();
    showNotification('Pengaturan batas harian berhasil disimpan!', 'success');
}

function loadDailyLimitSettings() {
    const toggle = document.getElementById('daily-limit-toggle');
    const limitInput = document.getElementById('daily-limit-input');
    const resetMidnight = document.getElementById('reset-midnight');
    const resetCustom = document.getElementById('reset-custom');
    const customResetTime = document.getElementById('custom-reset-time');
    const warning50 = document.getElementById('warning-50');
    const warning75 = document.getElementById('warning-75');
    const warning90 = document.getElementById('warning-90');
    const blockExceed = document.getElementById('block-exceed');
    const excludeSavings = document.getElementById('exclude-savings');
    const excludeGoals = document.getElementById('exclude-goals');
    
    if (toggle) toggle.checked = dailyLimitSettings.enabled;
    if (limitInput) limitInput.value = dailyLimitSettings.amount;
    
    if (dailyLimitSettings.resetTime === 'midnight') {
        if (resetMidnight) resetMidnight.checked = true;
        if (customResetTime) customResetTime.disabled = true;
    } else {
        if (resetCustom) resetCustom.checked = true;
        if (customResetTime) customResetTime.disabled = false;
    }
    
    if (customResetTime) customResetTime.value = dailyLimitSettings.customResetTime;
    if (warning50) warning50.checked = dailyLimitSettings.warnings.fifty;
    if (warning75) warning75.checked = dailyLimitSettings.warnings.seventyFive;
    if (warning90) warning90.checked = dailyLimitSettings.warnings.ninety;
    if (blockExceed) blockExceed.checked = dailyLimitSettings.blockExceed;
    if (excludeSavings) excludeSavings.checked = dailyLimitSettings.excludeSavings;
    if (excludeGoals) excludeGoals.checked = dailyLimitSettings.excludeGoals;
    
    // Show/hide settings based on enabled state
    const settings = document.getElementById('daily-limit-settings');
    if (settings && dailyLimitSettings.enabled) {
        settings.classList.remove('hidden');
        updateDailyStats();
    }
}

function updateDailyStats() {
    const statsContainer = document.getElementById('daily-stats');
    
    if (!dailyLimitSettings.enabled) {
        statsContainer.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-chart-line text-4xl mb-2"></i>
                <p>Aktifkan batas harian untuk melihat statistik</p>
            </div>
        `;
        return;
    }
    
    // Get last 7 days expenses
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('id-ID');
        
        const dayExpenses = transactions
            .filter(t => t.type === 'expense' && t.formattedDate === dateStr)
            .reduce((sum, t) => sum + t.amount, 0);
            
        last7Days.push({
            date: dateStr,
            amount: dayExpenses,
            dayName: date.toLocaleDateString('id-ID', { weekday: 'short' })
        });
    }
    
    const todayExpenses = getTodayExpenses();
    const avgDailySpend = last7Days.reduce((sum, day) => sum + day.amount, 0) / 7;
    const daysOverLimit = last7Days.filter(day => day.amount > dailyLimitSettings.amount).length;
    
    statsContainer.innerHTML = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-3 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-600 font-medium">Hari Ini</p>
                    <p class="text-lg font-bold text-blue-800">${formatCurrency(todayExpenses)}</p>
                </div>
                <div class="text-center p-3 bg-green-50 rounded-lg">
                    <p class="text-sm text-green-600 font-medium">Rata-rata 7 Hari</p>
                    <p class="text-lg font-bold text-green-800">${formatCurrency(avgDailySpend)}</p>
                </div>
            </div>
            
            <div class="p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 font-medium mb-2">7 Hari Terakhir</p>
                <div class="grid grid-cols-7 gap-1">
                    ${last7Days.map(day => {
                        const percentage = Math.min(100, (day.amount / dailyLimitSettings.amount) * 100);
                        const isOverLimit = day.amount > dailyLimitSettings.amount;
                        return `
                            <div class="text-center">
                                <div class="text-xs text-gray-500 mb-1">${day.dayName}</div>
                                <div class="h-12 bg-gray-200 rounded relative overflow-hidden">
                                    <div class="absolute bottom-0 w-full transition-all duration-300 ${isOverLimit ? 'bg-red-500' : percentage >= 75 ? 'bg-orange-500' : 'bg-blue-500'}" 
                                         style="height: ${Math.min(100, percentage)}%"></div>
                                </div>
                                <div class="text-xs mt-1 ${isOverLimit ? 'text-red-600' : 'text-gray-600'}">${formatCurrency(day.amount).replace('Rp. ', '').replace(',00', 'k').replace('.000', 'k')}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div class="text-center p-3 ${daysOverLimit > 0 ? 'bg-red-50' : 'bg-green-50'} rounded-lg">
                <p class="text-sm ${daysOverLimit > 0 ? 'text-red-600' : 'text-green-600'} font-medium">
                    ${daysOverLimit} dari 7 hari melampaui batas
                </p>
            </div>
        </div>  
    `;
}

function setupEventListeners() {
    // Custom reset time toggle
    const resetMidnight = document.getElementById('reset-midnight');
    const resetCustom = document.getElementById('reset-custom');
    const customResetTime = document.getElementById('custom-reset-time');
    
    if (resetMidnight && resetCustom && customResetTime) {
        resetMidnight.addEventListener('change', function() {
            customResetTime.disabled = true;
        });
        
        resetCustom.addEventListener('change', function() {
            customResetTime.disabled = false;
        });
    }
    
    // Initialize category dropdowns
    updateCategoryDropdowns();
}

// Statistics Functions
function initializeStatistics() {
    setupStatisticsFilters();
    updateStatistics();
}

function setupStatisticsFilters() {
    const yearSelect = document.getElementById('stats-year');
    const monthSelect = document.getElementById('stats-month');
    
    // Setup year options
    const currentYear = new Date().getFullYear();
    const transactionYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))];
    const allYears = [...new Set([currentYear, ...transactionYears])].sort((a, b) => b - a);
    
    yearSelect.innerHTML = allYears.map(year => 
        `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`
    ).join('');
    
    // Setup month options
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const currentMonth = new Date().getMonth();
    
    monthSelect.innerHTML = months.map((month, index) => 
        `<option value="${index}" ${index === currentMonth ? 'selected' : ''}>${month}</option>`
    ).join('');
}

function updateStatistics() {
    const period = document.getElementById('stats-period').value;
    const year = parseInt(document.getElementById('stats-year').value);
    const month = parseInt(document.getElementById('stats-month').value);
    
    // Show/hide month selector based on period
    const monthSelect = document.getElementById('stats-month');
    if (period === 'yearly') {
        monthSelect.style.display = 'none';
    } else {
        monthSelect.style.display = 'block';
    }
    
    // Update statistics components based on configuration
    if (statisticsConfig.keyMetrics) {
        updateKeyMetrics(period, year, month);
        document.getElementById('key-metrics-container').style.display = 'block';
    } else {
        document.getElementById('key-metrics-container').style.display = 'none';
    }
    
    updateCharts(period, year, month);
    updateDetailedAnalytics(period, year, month);
    
    if (statisticsConfig.financialHealth) {
        updateFinancialHealth();
        document.getElementById('financial-health-container').style.display = 'block';
    } else {
        document.getElementById('financial-health-container').style.display = 'none';
    }
    
    if (statisticsConfig.monthlyForecast) {
        updateMonthlyForecast();
        document.getElementById('monthly-forecast-container').style.display = 'block';
    } else {
        document.getElementById('monthly-forecast-container').style.display = 'none';
    }
    
    if (statisticsConfig.financialInsights) {
        updateFinancialInsights();
        document.getElementById('financial-insights-container').style.display = 'block';
    } else {
        document.getElementById('financial-insights-container').style.display = 'none';
    }
}

function updateKeyMetrics(period, year, month) {
    const filteredTransactions = getFilteredTransactionsByPeriod(period, year, month);
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const income = filteredTransactions.filter(t => t.type === 'income');
    
    // Calculate daily average
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const daysInPeriod = getDaysInPeriod(period, year, month);
    const avgDaily = daysInPeriod > 0 ? totalExpenses / daysInPeriod : 0;
    
    // Most transactions in a day
    const transactionsByDate = groupTransactionsByDate(filteredTransactions);
    const mostTransactions = Math.max(0, ...Object.values(transactionsByDate).map(arr => arr.length));
    
    // Highest expense
    const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(t => t.amount)) : 0;
    
    // Savings ratio
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalSavingsInPeriod = getSavingsInPeriod(period, year, month);
    const savingsRatio = totalIncome > 0 ? (totalSavingsInPeriod / totalIncome) * 100 : 0;
    
    document.getElementById('avg-daily').textContent = formatCurrency(avgDaily);
    document.getElementById('most-transactions').textContent = mostTransactions.toString();
    document.getElementById('highest-expense').textContent = formatCurrency(highestExpense);
    document.getElementById('savings-ratio').textContent = `${savingsRatio.toFixed(1)}%`;
}

function updateCharts(period, year, month) {
    if (statisticsConfig.incomeExpenseChart) {
        updateIncomeExpenseChart(period, year, month);
        document.getElementById('income-expense-chart-container').style.display = 'block';
    } else {
        document.getElementById('income-expense-chart-container').style.display = 'none';
    }
    
    if (statisticsConfig.balanceChart) {
        updateBalanceChart(period, year, month);
        document.getElementById('balance-chart-container').style.display = 'block';
    } else {
        document.getElementById('balance-chart-container').style.display = 'none';
    }
    
    if (statisticsConfig.categoryPieChart) {
        updateCategoryPieChart(period, year, month);
        document.getElementById('category-pie-chart-container').style.display = 'block';
    } else {
        document.getElementById('category-pie-chart-container').style.display = 'none';
    }
    
    if (statisticsConfig.monthlyComparisonChart) {
        updateMonthlyComparisonChart(period, year, month);
        document.getElementById('monthly-comparison-chart-container').style.display = 'block';
    } else {
        document.getElementById('monthly-comparison-chart-container').style.display = 'none';
    }
    
    if (statisticsConfig.dailyActivityChart) {
        updateDailyActivityChart(period, year, month);
        document.getElementById('daily-activity-chart-container').style.display = 'block';
    } else {
        document.getElementById('daily-activity-chart-container').style.display = 'none';
    }
}

function updateIncomeExpenseChart(period, year, month) {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    if (charts.incomeExpense) {
        charts.incomeExpense.destroy();
    }
    
    const data = getIncomeExpenseChartData(period, year, month);
    
    charts.incomeExpense = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Pemasukan',
                data: data.income,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Pengeluaran',
                data: data.expenses,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrencyShort(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

function updateBalanceChart(period, year, month) {
    const ctx = document.getElementById('balanceChart').getContext('2d');
    
    if (charts.balance) {
        charts.balance.destroy();
    }
    
    const data = getBalanceChartData(period, year, month);
    
    charts.balance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Saldo',
                data: data.balance,
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return formatCurrencyShort(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Saldo: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

function updateCategoryPieChart(period, year, month) {
    const ctx = document.getElementById('categoryPieChart').getContext('2d');
    
    if (charts.categoryPie) {
        charts.categoryPie.destroy();
    }
    
    const data = getCategoryPieChartData(period, year, month);
    
    charts.categoryPie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
                    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + formatCurrency(context.parsed) + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

function updateMonthlyComparisonChart(period, year, month) {
    const ctx = document.getElementById('monthlyComparisonChart').getContext('2d');
    
    if (charts.monthlyComparison) {
        charts.monthlyComparison.destroy();
    }
    
    const data = getMonthlyComparisonData(year);
    
    charts.monthlyComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Pemasukan',
                data: data.income,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
            }, {
                label: 'Pengeluaran',
                data: data.expenses,
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrencyShort(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            }
        }
    });
}

function updateDailyActivityChart(period, year, month) {
    const ctx = document.getElementById('dailyActivityChart').getContext('2d');
    
    if (charts.dailyActivity) {
        charts.dailyActivity.destroy();
    }
    
    const data = getDailyActivityData(period, year, month);
    
    charts.dailyActivity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
            datasets: [{
                label: 'Rata-rata Pengeluaran',
                data: data.averageExpenses,
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
            }, {
                label: 'Jumlah Transaksi',
                data: data.transactionCounts,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrencyShort(value);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return 'Rata-rata: ' + formatCurrency(context.parsed.y);
                            } else {
                                return 'Transaksi: ' + context.parsed.y;
                            }
                        }
                    }
                }
            }
        }
    });
}

function updateDetailedAnalytics(period, year, month) {
    if (statisticsConfig.topCategories) {
        updateTopCategories(period, year, month);
        document.getElementById('top-categories-container').style.display = 'block';
    } else {
        document.getElementById('top-categories-container').style.display = 'none';
    }
    
    if (statisticsConfig.spendingPatterns) {
        updateSpendingPatterns(period, year, month);
        document.getElementById('spending-patterns-container').style.display = 'block';
    } else {
        document.getElementById('spending-patterns-container').style.display = 'none';
    }
    
    if (statisticsConfig.goalsProgress) {
        updateGoalsProgress();
        document.getElementById('goals-progress-container').style.display = 'block';
    } else {
        document.getElementById('goals-progress-container').style.display = 'none';
    }
    
    if (statisticsConfig.spendingHeatmap) {
        updateSpendingHeatmap(period, year, month);
        document.getElementById('spending-heatmap-container').style.display = 'block';
    } else {
        document.getElementById('spending-heatmap-container').style.display = 'none';
    }
}

function updateTopCategories(period, year, month) {
    const container = document.getElementById('top-categories');
    const expenses = getFilteredTransactionsByPeriod(period, year, month).filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-chart-bar text-4xl mb-2"></i>
                <p>Belum ada data</p>
            </div>
        `;
        return;
    }
    
    const categoryTotals = expenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});
    
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const maxAmount = Math.max(...sortedCategories.map(([_, amount]) => amount));
    
    container.innerHTML = sortedCategories.map(([category, amount]) => {
        const percentage = (amount / maxAmount) * 100;
        return `
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span class="font-medium text-gray-900">${category}</span>
                    <span class="text-gray-600">${formatCurrency(amount)}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-red-500 h-2 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function updateSpendingPatterns(period, year, month) {
    const container = document.getElementById('spending-patterns');
    const expenses = getFilteredTransactionsByPeriod(period, year, month).filter(t => t.type === 'expense');
    
    if (expenses.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-clock text-4xl mb-2"></i>
                <p>Belum ada data</p>
            </div>
        `;
        return;
    }
    
    // Group by day of week
    const dayTotals = expenses.reduce((acc, t) => {
        const dayOfWeek = new Date(t.date).getDay();
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayName = dayNames[dayOfWeek];
        acc[dayName] = (acc[dayName] || 0) + t.amount;
        return acc;
    }, {});
    
    const sortedDays = Object.entries(dayTotals)
        .sort((a, b) => b[1] - a[1]);
    
    // Calculate insights
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const highestDay = sortedDays[0];
    
    container.innerHTML = `
        <div class="space-y-3">
            <div class="p-3 bg-blue-50 rounded-lg">
                <p class="text-xs font-medium text-blue-800">Hari Pengeluaran Tertinggi</p>
                <p class="text-sm text-blue-700">${highestDay ? highestDay[0] : '-'}</p>
                <p class="text-xs text-blue-600">${highestDay ? formatCurrency(highestDay[1]) : 'Rp. 0,00'}</p>
            </div>
            <div class="p-3 bg-green-50 rounded-lg">
                <p class="text-xs font-medium text-green-800">Rata-rata per Transaksi</p>
                <p class="text-sm text-green-700">${formatCurrency(avgExpense)}</p>
            </div>
            <div class="p-3 bg-yellow-50 rounded-lg">
                <p class="text-xs font-medium text-yellow-800">Total Transaksi</p>
                <p class="text-sm text-yellow-700">${expenses.length} transaksi</p>
            </div>
        </div>
    `;
}

function updateFinancialInsights() {
    const container = document.getElementById('financial-insights');
    const insights = generateFinancialInsights();
    
    if (insights.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-lightbulb text-4xl mb-2"></i>
                <p>Belum ada insight</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = insights.slice(0, 5).map(insight => `
        <div class="p-3 bg-${insight.type === 'positive' ? 'green' : insight.type === 'warning' ? 'yellow' : 'red'}-50 rounded-lg">
            <div class="flex items-start">
                <i class="fas ${insight.type === 'positive' ? 'fa-check-circle' : 
                               insight.type === 'warning' ? 'fa-exclamation-triangle' : 
                               'fa-times-circle'} 
                       ${insight.type === 'positive' ? 'text-green-600' : 
                         insight.type === 'warning' ? 'text-yellow-600' : 
                         'text-red-600'} mr-2 mt-1"></i>
                <div>
                    <p class="text-sm font-medium ${insight.type === 'positive' ? 'text-green-800' : 
                                                   insight.type === 'warning' ? 'text-yellow-800' : 
                                                   'text-red-800'}">${insight.title}</p>
                    <p class="text-xs ${insight.type === 'positive' ? 'text-green-700' : 
                                       insight.type === 'warning' ? 'text-yellow-700' : 
                                       'text-red-700'} mt-1">${insight.message}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function generateFinancialInsights() {
    const insights = [];
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalSavingsAmount = savings.reduce((sum, s) => sum + s.amount, 0);
    
    // Income insights
    if (totalIncome > 0) {
        const savingsRatio = (totalSavingsAmount / totalIncome) * 100;
        const expenseRatio = (totalExpenses / totalIncome) * 100;
        
        if (savingsRatio >= 20) {
            insights.push({
                type: 'positive',
                title: 'Tabungan Sangat Baik',
                message: `Anda menabung ${savingsRatio.toFixed(1)}% dari penghasilan. Pertahankan!`
            });
        } else if (savingsRatio >= 10) {
            insights.push({
                type: 'positive',
                title: 'Tabungan Baik',
                message: `Anda menabung ${savingsRatio.toFixed(1)}% dari penghasilan. Coba tingkatkan ke 20%.`
            });
        } else if (savingsRatio > 0) {
            insights.push({
                type: 'warning',
                title: 'Tabungan Perlu Ditingkatkan',
                message: `Hanya ${savingsRatio.toFixed(1)}% yang ditabung. Target minimal 10%.`
            });
        } else {
            insights.push({
                type: 'negative',
                title: 'Tidak Ada Tabungan',
                message: 'Mulai sisihkan minimal 10% dari penghasilan untuk tabungan.'
            });
        }
        
        if (expenseRatio <= 50) {
            insights.push({
                type: 'positive',
                title: 'Pengeluaran Terkendali',
                message: `Pengeluaran hanya ${expenseRatio.toFixed(1)}% dari penghasilan.`
            });
        } else if (expenseRatio <= 80) {
            insights.push({
                type: 'warning',
                title: 'Pengeluaran Cukup Tinggi',
                message: `${expenseRatio.toFixed(1)}% penghasilan untuk pengeluaran. Pertimbangkan untuk berhemat.`
            });
        } else {
            insights.push({
                type: 'negative',
                title: 'Pengeluaran Berlebihan',
                message: `${expenseRatio.toFixed(1)}% penghasilan habis untuk pengeluaran. Sangat perlu berhemat!`
            });
        }
    }
    
    // Daily limit insights
    if (dailyLimitSettings.enabled) {
        const todayExpenses = getTodayExpenses();
        const percentage = (todayExpenses / dailyLimitSettings.amount) * 100;
        
        if (percentage > 100) {
            insights.push({
                type: 'negative',
                title: 'Melebihi Batas Harian',
                message: `Pengeluaran hari ini ${percentage.toFixed(1)}% dari batas yang ditetapkan.`
            });
        } else if (percentage >= 80) {
            insights.push({
                type: 'warning',
                title: 'Mendekati Batas Harian',
                message: `Sudah menggunakan ${percentage.toFixed(1)}% dari batas harian.`
            });
        }
    }
    
    // Category insights
    const categoryExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});
    
    const topCategory = Object.entries(categoryExpenses)
        .sort((a, b) => b[1] - a[1])[0];
    
    if (topCategory && totalExpenses > 0) {
        const percentage = (topCategory[1] / totalExpenses) * 100;
        if (percentage > 50) {
            insights.push({
                type: 'warning',
                title: 'Dominasi Kategori',
                message: `${percentage.toFixed(1)}% pengeluaran untuk ${topCategory[0]}. Pertimbangkan diversifikasi.`
            });
        }
    }
    
    return insights;
}

function updateGoalsProgress() {
    const container = document.getElementById('goals-progress');
    
    if (goals.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-bullseye text-4xl mb-2"></i>
                <p>Belum ada target</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = goals.slice(0, 3).map(goal => {
        const progress = Math.min(100, (goal.savedAmount / goal.amount) * 100);
        return `
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span class="font-medium text-gray-900">${goal.name}</span>
                    <span class="text-gray-600">${progress.toFixed(1)}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-primary h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                </div>
                <div class="text-xs text-gray-500">
                    ${formatCurrency(goal.savedAmount)} / ${formatCurrency(goal.amount)}
                </div>
            </div>
        `;
    }).join('');
}

function updateSpendingHeatmap(period, year, month) {
    const container = document.getElementById('spending-heatmap');
    
    if (period !== 'monthly') {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-calendar-alt text-4xl mb-2"></i>
                <p>Pilih tampilan bulanan untuk melihat heatmap</p>
            </div>
        `;
        return;
    }
    
    const expenses = getFilteredTransactionsByPeriod(period, year, month).filter(t => t.type === 'expense');
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Group expenses by day
    const dailyExpenses = {};
    expenses.forEach(t => {
        const day = new Date(t.date).getDate();
        dailyExpenses[day] = (dailyExpenses[day] || 0) + t.amount;
    });
    
    const maxDailyExpense = Math.max(...Object.values(dailyExpenses), 1);
    
    // Create calendar grid
    const firstDay = new Date(year, month, 1).getDay();
    const totalCells = Math.ceil((daysInMonth + firstDay) / 7) * 7;
    
    let heatmapHTML = `
        <div class="grid grid-cols-7 gap-1 text-center">
            <div class="text-xs font-medium text-gray-500 p-1">Min</div>
            <div class="text-xs font-medium text-gray-500 p-1">Sen</div>
            <div class="text-xs font-medium text-gray-500 p-1">Sel</div>
            <div class="text-xs font-medium text-gray-500 p-1">Rab</div>
            <div class="text-xs font-medium text-gray-500 p-1">Kam</div>
            <div class="text-xs font-medium text-gray-500 p-1">Jum</div>
            <div class="text-xs font-medium text-gray-500 p-1">Sab</div>
    `;
    
    for (let i = 0; i < totalCells; i++) {
        const day = i - firstDay + 1;
        const isValidDay = day > 0 && day <= daysInMonth;
        const expense = dailyExpenses[day] || 0;
        const intensity = expense > 0 ? Math.ceil((expense / maxDailyExpense) * 4) : 0;
        
        const colorClasses = {
            0: 'bg-gray-100',
            1: 'bg-red-200',
            2: 'bg-red-300',
            3: 'bg-red-400',
            4: 'bg-red-500'
        };
        
        heatmapHTML += `
            <div class="relative aspect-square ${isValidDay ? colorClasses[intensity] : 'bg-transparent'} rounded text-xs flex items-center justify-center ${isValidDay ? 'hover:bg-opacity-80 cursor-pointer' : ''}" 
                 ${isValidDay ? `title="Tanggal ${day}: ${formatCurrency(expense)}"` : ''}>
                ${isValidDay ? day : ''}
            </div>
        `;
    }
    
    heatmapHTML += '</div>';
    
    container.innerHTML = heatmapHTML;
}

function updateFinancialHealth() {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalSavingsAmount = savings.reduce((sum, s) => sum + s.amount, 0);
    
    let score = 0;
    let description = '';
    
    if (totalIncome > 0) {
        const savingsRatio = (totalSavingsAmount / totalIncome) * 100;
        const expenseRatio = (totalExpenses / totalIncome) * 100;
        
        // Calculate score based on various factors
        if (savingsRatio >= 20) score += 30;
        else if (savingsRatio >= 10) score += 20;
        else if (savingsRatio >= 5) score += 10;
        
        if (expenseRatio <= 50) score += 25;
        else if (expenseRatio <= 70) score += 15;
        else if (expenseRatio <= 80) score += 10;
        
        if (totalIncome > totalExpenses) score += 20;
        
        if (goals.length > 0) score += 15;
        if (dailyLimitSettings.enabled) score += 10;
        
        // Set description
        if (score >= 80) description = 'Excellent! Keuangan sangat sehat';
        else if (score >= 60) description = 'Good! Keuangan dalam kondisi baik';
        else if (score >= 40) description = 'Fair! Perlu sedikit perbaikan';
        else description = 'Poor! Perlu perhatian serius';
    } else {
        description = 'Mulai catat pemasukan untuk analisis';
    }
    
    // Update circular progress
    const circle = document.getElementById('health-score-circle');
    const circumference = 2 * Math.PI * 56;
    const offset = circumference - (score / 100) * circumference;
    
    circle.style.strokeDashoffset = offset;
    document.getElementById('health-score-text').textContent = `${score}%`;
    document.getElementById('health-score-description').textContent = description;
}

function updateMonthlyForecast() {
    const lastThreeMonthsTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return transactionDate >= threeMonthsAgo;
    });
    
    const monthlyIncome = lastThreeMonthsTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) / 3;
    
    const monthlyExpenses = lastThreeMonthsTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) / 3;
    
    const forecastBalance = monthlyIncome - monthlyExpenses;
    const recommendedSavings = Math.max(0, forecastBalance * 0.2);
    
    document.getElementById('forecast-income').textContent = formatCurrency(monthlyIncome);
    document.getElementById('forecast-expense').textContent = formatCurrency(monthlyExpenses);
    document.getElementById('forecast-balance').textContent = formatCurrency(forecastBalance);
    document.getElementById('recommended-savings').textContent = formatCurrency(recommendedSavings);
}

function updateFinancialInsights() {
    const container = document.getElementById('financial-insights');
    const insights = generateFinancialInsights();
    
    if (insights.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-lightbulb text-4xl mb-2"></i>
                <p>Belum ada insight</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = insights.map(insight => `
        <div class="p-3 ${insight.type === 'positive' ? 'bg-green-50 border-l-4 border-green-400' : 
                           insight.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 
                           'bg-red-50 border-l-4 border-red-400'} rounded">
            <div class="flex">
                <i class="fas ${insight.icon} ${insight.type === 'positive' ? 'text-green-600' : 
                                                insight.type === 'warning' ? 'text-yellow-600' : 
                                                'text-red-600'} mr-2 mt-1"></i>
                <div>
                    <p class="text-sm font-medium ${insight.type === 'positive' ? 'text-green-800' : 
                                                   insight.type === 'warning' ? 'text-yellow-800' : 
                                                   'text-red-800'}">${insight.title}</p>
                    <p class="text-xs ${insight.type === 'positive' ? 'text-green-700' : 
                                       insight.type === 'warning' ? 'text-yellow-700' : 
                                       'text-red-700'} mt-1">${insight.message}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Helper functions for statistics
function getFilteredTransactionsByPeriod(period, year, month) {
    return transactions.filter(t => {
        const transactionDate = new Date(t.date);
        
        if (period === 'yearly') {
            return transactionDate.getFullYear() === year;
        } else if (period === 'monthly') {
            return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
        } else { // daily
            const today = new Date();
            return transactionDate.toDateString() === today.toDateString();
        }
    });
}

function getDaysInPeriod(period, year, month) {
    if (period === 'yearly') {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0) ? 366 : 365;
    } else if (period === 'monthly') {
        return new Date(year, month + 1, 0).getDate();
    } else {
        return 1;
    }
}

function getSavingsInPeriod(period, year, month) {
    return savings.filter(s => {
        const savingDate = new Date(s.date);
        
        if (period === 'yearly') {
            return savingDate.getFullYear() === year;
        } else if (period === 'monthly') {
            return savingDate.getFullYear() === year && savingDate.getMonth() === month;
        } else {
            const today = new Date();
            return savingDate.toDateString() === today.toDateString();
        }
    }).reduce((sum, s) => sum + s.amount, 0);
}

function groupTransactionsByDate(transactions) {
    return transactions.reduce((acc, t) => {
        const date = new Date(t.date).toDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(t);
        return acc;
    }, {});
}

function getIncomeExpenseChartData(period, year, month) {
    const transactions = getFilteredTransactionsByPeriod(period, year, month);
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    
    if (period === 'yearly') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        for (let i = 0; i < 12; i++) {
            labels.push(months[i]);
            
            const monthTransactions = transactions.filter(t => new Date(t.date).getMonth() === i);
            const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            
            incomeData.push(monthIncome);
            expenseData.push(monthExpense);
        }
    } else if (period === 'monthly') {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            labels.push(day.toString());
            
            const dayTransactions = transactions.filter(t => new Date(t.date).getDate() === day);
            const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            
            incomeData.push(dayIncome);
            expenseData.push(dayExpense);
        }
    } else {
        // For daily, show hourly data
        for (let hour = 0; hour < 24; hour++) {
            labels.push(`${hour}:00`);
            
            const hourTransactions = transactions.filter(t => new Date(t.date).getHours() === hour);
            const hourIncome = hourTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const hourExpense = hourTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            
            incomeData.push(hourIncome);
            expenseData.push(hourExpense);
        }
    }
    
    return { labels, income: incomeData, expenses: expenseData };
}

function getBalanceChartData(period, year, month) {
    const data = getIncomeExpenseChartData(period, year, month);
    const balanceData = [];
    let runningBalance = 0;
    
    for (let i = 0; i < data.labels.length; i++) {
        runningBalance += data.income[i] - data.expenses[i];
        balanceData.push(runningBalance);
    }
    
    return { labels: data.labels, balance: balanceData };
}

function getCategoryPieChartData(period, year, month) {
    const expenses = getFilteredTransactionsByPeriod(period, year, month).filter(t => t.type === 'expense');
    
    const categoryTotals = expenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {});
    
    return {
        labels: Object.keys(categoryTotals),
        values: Object.values(categoryTotals)
    };
}

function getMonthlyComparisonData(year) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 0; i < 12; i++) {
        const monthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date.getFullYear() === year && date.getMonth() === i;
        });
        
        const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        incomeData.push(monthIncome);
        expenseData.push(monthExpense);
    }
    
    return { labels: months, income: incomeData, expenses: expenseData };
}

function getDailyActivityData(period, year, month) {
    const expenses = getFilteredTransactionsByPeriod(period, year, month).filter(t => t.type === 'expense');
    
    const dayData = Array(7).fill(0).map(() => ({ total: 0, count: 0 }));
    
    expenses.forEach(t => {
        const dayOfWeek = new Date(t.date).getDay();
        dayData[dayOfWeek].total += t.amount;
        dayData[dayOfWeek].count += 1;
    });
    
    return {
        averageExpenses: dayData.map(d => d.count > 0 ? d.total / d.count : 0),
        transactionCounts: dayData.map(d => d.count)
    };
}

function generateFinancialInsights() {
    const insights = [];
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalSavingsAmount = savings.reduce((sum, s) => sum + s.amount, 0);
    
    // Savings ratio insight
    if (totalIncome > 0) {
        const savingsRatio = (totalSavingsAmount / totalIncome) * 100;
        if (savingsRatio >= 20) {
            insights.push({
                type: 'positive',
                icon: 'fa-thumbs-up',
                title: 'Hebat!',
                message: `Anda menabung ${savingsRatio.toFixed(1)}% dari pemasukan. Terus pertahankan!`
            });
        } else if (savingsRatio < 10) {
            insights.push({
                type: 'warning',
                icon: 'fa-exclamation-triangle',
                title: 'Tingkatkan Tabungan',
                message: 'Cobalah menabung minimal 10% dari pemasukan Anda.'
            });
        }
    }
    
    // Expense ratio insight
    if (totalIncome > 0) {
        const expenseRatio = (totalExpenses / totalIncome) * 100;
        if (expenseRatio > 80) {
            insights.push({
                type: 'negative',
                icon: 'fa-exclamation-circle',
                title: 'Pengeluaran Tinggi',
                message: `${expenseRatio.toFixed(1)}% pemasukan terpakai. Pertimbangkan untuk mengurangi pengeluaran.`
            });
        }
    }
    
    // Daily limit insight
    if (dailyLimitSettings.enabled) {
        const todayExpenses = getTodayExpenses();
        const percentage = (todayExpenses / dailyLimitSettings.amount) * 100;
        
        if (percentage > 100) {
            insights.push({
                type: 'negative',
                icon: 'fa-times-circle',
                title: 'Batas Harian Terlampaui',
                message: 'Anda telah melampaui batas pengeluaran harian yang ditetapkan.'
            });
        } else if (percentage > 75) {
            insights.push({
                type: 'warning',
                icon: 'fa-clock',
                title: 'Mendekati Batas Harian',
                message: `${percentage.toFixed(1)}% dari batas harian telah terpakai.`
            });
        }
    }
    
    // Goals insight
    const completedGoals = goals.filter(g => g.savedAmount >= g.amount).length;
    if (completedGoals > 0) {
        insights.push({
            type: 'positive',
            icon: 'fa-trophy',
            title: 'Target Tercapai',
            message: `Selamat! Anda telah menyelesaikan ${completedGoals} target keuangan.`
        });
    }
    
    return insights;
}

function formatCurrencyShort(amount) {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
}

// ========================================
// AI CHAT SYSTEM - NATURAL LANGUAGE PROCESSING
// ========================================

// AI Natural Language Processing Engine
class MoneyTrackerAI {
    constructor() {
        // Initialize AI stats
        this.aiStats = {
            processedCount: 0,
            messagesTotal: 0,
            messagesToday: 0,
            lastMessageDate: null
        };

        this.patterns = {
            // Transaction patterns
            expense: {
                keywords: ['beli', 'bayar', 'belanja', 'buat', 'untuk', 'keluar', 'habis', 'spend', 'buat beli', 'utk', 'byr', 'bli', 'blnja', 'keluarin', 'pake', 'pakai', 'pkai'],
                categories: {
                    'Makanan': ['makan', 'nasi', 'bakso', 'soto', 'gudeg', 'ayam', 'ikan', 'sayur', 'buah', 'jajan', 'snack', 'minum', 'kopi', 'teh', 'restoran', 'warung', 'food', 'cafe', 'mkn', 'mknan', 'jjn', 'kfe'],
                    'Transportasi': ['bensin', 'spbu', 'ojek', 'gojek', 'grab', 'bus', 'taxi', 'motor', 'mobil', 'parkir', 'tol', 'tiket', 'transport', 'bnsn', 'ojol', 'grb', 'trnsprt', 'isi bensin', 'isi', 'shell', 'pertamina', 'bbm', 'solar', 'premium', 'pertalite'],
                    'Belanja': ['baju', 'celana', 'sepatu', 'tas', 'kosmetik', 'shopping', 'mall', 'toko', 'online', 'marketplace', 'skincare', 'bj', 'sptu', 'kosmetk', 'shp', 'ol'],
                    'Tagihan': ['listrik', 'air', 'internet', 'wifi', 'pulsa', 'token', 'pln', 'pdam', 'telkom', 'indihome', 'tv', 'kabel', 'lstrk', 'intrnt', 'wf', 'plsa', 'tkn'],
                    'Hiburan': ['film', 'bioskop', 'game', 'konser', 'wisata', 'liburan', 'rekreasi', 'netflix', 'spotify', 'youtube', 'flm', 'bioskp', 'gm', 'wsta', 'lbrn'],
                    'Kesehatan': ['dokter', 'obat', 'apotek', 'rumah sakit', 'rs', 'vitamin', 'medical', 'therapy', 'checkup', 'dktr', 'obt', 'aptk', 'rs', 'vtmn', 'chckp']
                }
            },
            income: {
                keywords: ['gaji', 'gajian', 'terima', 'dapat', 'income', 'masuk', 'bayaran', 'honor', 'bonus', 'untung', 'profit', 'duit', 'uang masuk', 'gj', 'gjn', 'trma', 'dpt', 'duit masuk', 'uang', 'duwit'],
                categories: {
                    'Gaji': ['gaji', 'gajian', 'salary', 'bulanan', 'tetap', 'gj', 'gjn', 'slry'],
                    'Freelance': ['freelance', 'project', 'kerja', 'jasa', 'service', 'frelnc', 'prjct', 'krj', 'js', 'srvc'],
                    'Bonus': ['bonus', 'thr', 'reward', 'hadiah', 'extra', 'bns', 'rwrd', 'hdh', 'xtr'],
                    'Investasi': ['investasi', 'saham', 'dividen', 'bunga', 'deposito', 'reksadana', 'invst', 'shm', 'dvdn', 'bng', 'dpst']
                }
            },
            savings: {
                keywords: ['nabung', 'menabung', 'tabung', 'simpan', 'saving', 'celengan', 'setor', 'masukin', 'masukkan', 'taruh tabungan'],
                action: 'save'
            },
            withdraw: {
                keywords: ['ambil', 'tarik', 'withdraw', 'keluar dari tabungan', 'ambil tabungan', 'keluarkan', 'cairkan', 'pake tabungan', 'pakai tabungan', 'gunakan tabungan'],
                action: 'withdraw'
            }
        };

        this.numberPatterns = {
            // Indonesian number patterns
            'rb': 1000,
            'ribu': 1000,
            'jt': 1000000,
            'juta': 1000000,
            'ratus': 100,
            'puluh': 10,
            'k': 1000,
            'm': 1000000
        };

        // Date/time patterns for Indonesian
        this.datePatterns = {
            today: ['hari ini', 'sekarang', 'tadi', 'skrg'],
            yesterday: ['kemarin', 'kemaren', 'kmrn'],
            tomorrow: ['besok', 'esok'],
            dayAfterTomorrow: ['lusa', 'tulat'],
            thisWeek: ['minggu ini', 'pekan ini'],
            lastWeek: ['minggu lalu', 'pekan lalu', 'seminggu lalu'],
            lastSunday: ['minggu kemarin'], // Hari minggu yang baru lewat
            nextWeek: ['minggu depan', 'minggu besok', 'pekan depan'],
            thisMonth: ['bulan ini'],
            lastMonth: ['bulan lalu', 'bulan kemarin', 'sebulan lalu'],
            nextMonth: ['bulan depan', 'bulan besok'],
            thisYear: ['tahun ini'],
            lastYear: ['tahun lalu', 'tahun kemarin', 'setahun lalu'],
            nextYear: ['tahun depan', 'tahun besok'],
            // Specific days
            monday: ['senin', 'monday'],
            tuesday: ['selasa', 'tuesday'],
            wednesday: ['rabu', 'wednesday'], 
            thursday: ['kamis', 'thursday'],
            friday: ['jumat', 'friday'],
            saturday: ['sabtu', 'saturday'],
            sunday: ['minggu', 'sunday', 'ahad']
        };

        this.loadAIStats();
    }

    // Main AI processing function
    processMessage(message) {
        const result = {
            understood: false,
            action: null,
            data: null,
            response: '',
            confidence: 0
        };

        const normalizedMessage = this.normalizeMessage(message);
        const amount = this.extractAmount(normalizedMessage);
        
        // Detect action type first
        const actionType = this.detectActionType(normalizedMessage);
        
        // If no amount found, ask for clarification based on action type
        if (!amount || amount <= 0) {
            if (actionType === 'withdraw') {
                result.response = "Berapa jumlah yang ingin Anda ambil dari tabungan? Contoh: 'ambil tabungan 50rb' atau 'tarik 100 ribu'.";
                return result;
            } else if (actionType === 'savings') {
                result.response = "Berapa jumlah yang ingin Anda tabung? Contoh: 'nabung 50rb' atau 'simpan 100 ribu'.";
                return result;
            } else if (actionType === 'income') {
                result.response = "Berapa jumlah pemasukan yang ingin dicatat? Contoh: 'gaji 5 juta' atau 'bonus 500rb'.";
                return result;
            } else {
                result.response = "Berapa jumlah pengeluaran yang ingin dicatat? Contoh: 'beli makanan 25rb' atau 'bayar listrik 150 ribu'.";
                return result;
            }
        }

        // Extract date from message
        const transactionDate = this.extractDate(normalizedMessage);

        // Use the already detected action type
        
        if (actionType === 'expense') {
            const category = this.detectCategory(normalizedMessage, 'expense');
            const description = this.generateDescription(normalizedMessage, 'expense');
            
            result.understood = true;
            result.action = 'expense';
            result.data = {
                amount: amount,
                category: category,
                description: description,
                date: transactionDate
            };
            result.confidence = 0.9;
            result.response = `Saya mendeteksi pengeluaran ${formatCurrency(amount)} untuk kategori ${category}${transactionDate !== new Date().toISOString() ? ' pada ' + this.formatDetectedDate(transactionDate) : ''}. Apakah sudah benar?`;
            
        } else if (actionType === 'income') {
            const category = this.detectCategory(normalizedMessage, 'income');
            const description = this.generateDescription(normalizedMessage, 'income');
            
            result.understood = true;
            result.action = 'income';
            result.data = {
                amount: amount,
                category: category,
                description: description,
                date: transactionDate
            };
            result.confidence = 0.9;
            result.response = `Saya mendeteksi pemasukan ${formatCurrency(amount)} untuk kategori ${category}${transactionDate !== new Date().toISOString() ? ' pada ' + this.formatDetectedDate(transactionDate) : ''}. Apakah sudah benar?`;
            
        } else if (actionType === 'savings') {
            const description = this.generateDescription(normalizedMessage, 'savings');
            
            result.understood = true;
            result.action = 'savings';
            result.data = {
                amount: amount,
                description: description,
                date: transactionDate
            };
            result.confidence = 0.85;
            result.response = `Saya akan menambahkan ${formatCurrency(amount)} ke tabungan Anda${transactionDate !== new Date().toISOString() ? ' dengan tanggal ' + this.formatDetectedDate(transactionDate) : ''}.`;
            
        } else if (actionType === 'withdraw') {
            const description = this.generateDescription(normalizedMessage, 'withdraw');
            
            result.understood = true;
            result.action = 'withdraw';
            result.data = {
                amount: amount,
                description: description,
                date: transactionDate
            };
            result.confidence = 0.85;
            result.response = `Saya akan menarik ${formatCurrency(amount)} dari tabungan Anda${transactionDate !== new Date().toISOString() ? ' dengan tanggal ' + this.formatDetectedDate(transactionDate) : ''}.`;
        } else {
            result.response = "Maaf, saya tidak bisa memahami maksud Anda. Coba gunakan kata-kata seperti 'beli', 'bayar', 'gaji', atau 'nabung'.";
        }

        return result;
    }

    normalizeMessage(message) {
        return message.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    extractAmount(message) {
        // Pattern untuk mendeteksi angka dan multiplier
        const patterns = [
            // Format: 25rb, 50ribu, 5jt, 2juta
            /(\d+(?:[.,]\d+)?)\s*(rb|ribu|jt|juta|k|m|ratus|puluh)/gi,
            // Format: 25.000, 50,000
            /(\d+(?:[.,]\d{3})*)/g,
            // Format angka biasa: 25000
            /(\d+)/g
        ];

        for (const pattern of patterns) {
            const matches = message.match(pattern);
            if (matches) {
                for (const match of matches) {
                    const amount = this.parseAmount(match);
                    if (amount > 0) {
                        return amount;
                    }
                }
            }
        }
        return 0;
    }

    parseAmount(text) {
        let amount = 0;
        const cleanText = text.toLowerCase().replace(/[.,]/g, '');
        
        // Check for multipliers
        for (const [suffix, multiplier] of Object.entries(this.numberPatterns)) {
            if (cleanText.includes(suffix)) {
                const numberPart = cleanText.replace(suffix, '').trim();
                const number = parseFloat(numberPart) || 0;
                amount = number * multiplier;
                break;
            }
        }
        
        // If no multiplier found, parse as regular number
        if (amount === 0) {
            amount = parseFloat(cleanText.replace(/[^\d]/g, '')) || 0;
        }
        
        return amount;
    }

    detectActionType(message) {
        const words = message.split(' ');
        
        // Check for savings first (higher priority)
        if (this.containsAny(words, this.patterns.savings.keywords)) {
            return 'savings';
        }
        
        // Check for withdraw
        if (this.containsAny(words, this.patterns.withdraw.keywords)) {
            return 'withdraw';
        }
        
        // Check for income
        if (this.containsAny(words, this.patterns.income.keywords)) {
            return 'income';
        }
        
        // Default to expense (most common)
        if (this.containsAny(words, this.patterns.expense.keywords)) {
            return 'expense';
        }
        
        // If no explicit keywords, assume expense
        return 'expense';
    }

    detectCategory(message, type) {
        const words = message.split(' ');
        const categories = this.patterns[type].categories;
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (this.containsAny(words, keywords)) {
                return category;
            }
        }
        
        // Return default category
        return type === 'expense' ? 'Lainnya' : 'Lainnya';
    }

    generateDescription(message, type) {
        const words = message.split(' ');
        
        // Remove common patterns and numbers
        const filteredWords = words.filter(word => {
            return !this.isNumber(word) && 
                   !this.isCommonWord(word) &&
                   word.length > 2;
        });
        
        if (filteredWords.length > 0) {
            return filteredWords.slice(0, 3).join(' ');
        }
        
        // Generate default description based on type
        const defaults = {
            'expense': 'Pengeluaran via AI Chat',
            'income': 'Pemasukan via AI Chat',
            'savings': 'Tabungan via AI Chat',
            'withdraw': 'Penarikan via AI Chat'
        };
        
        return defaults[type] || 'Transaksi via AI Chat';
    }

    containsAny(array, keywords) {
        return keywords.some(keyword => 
            array.some(word => {
                // Exact match
                if (word.includes(keyword) || keyword.includes(word)) {
                    return true;
                }
                
                // Fuzzy match for typos (Levenshtein distance)
                if (this.isTypo(word, keyword)) {
                    return true;
                }
                
                return false;
            })
        );
    }

    // Strict exact matching for date keywords only (no fuzzy matching)
    containsExactDateKeywords(array, keywords) {
        return keywords.some(keyword => 
            array.some(word => word === keyword || word.includes(keyword))
        );
    }

    // Simple typo detection using Levenshtein distance
    isTypo(word1, word2) {
        // Only check for typos if words are similar in length
        if (Math.abs(word1.length - word2.length) > 2) return false;
        if (word1.length < 3 || word2.length < 3) return false;
        
        const distance = this.levenshteinDistance(word1, word2);
        const maxLength = Math.max(word1.length, word2.length);
        
        // Allow 1-2 character differences for typos
        return distance <= 2 && distance / maxLength <= 0.4;
    }

    // Calculate Levenshtein distance between two strings
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    isNumber(word) {
        const cleanWord = word.replace(/[^\d]/g, '');
        return /^\d+$/.test(cleanWord) || Object.keys(this.numberPatterns).includes(word);
    }

    isCommonWord(word) {
        const commonWords = ['saya', 'aku', 'mau', 'ingin', 'untuk', 'dari', 'ke', 'di', 'dan', 'atau', 'yang', 'sudah', 'akan', 'bisa', 'dapat'];
        return commonWords.includes(word);
    }

    // Extract date from message
    extractDate(message) {
        const words = message.split(' ');
        const today = new Date();
        const normalizedMessage = message.toLowerCase();
        
        // Check for specific date with month names (e.g., "12 juni", "15 januari 2024")
        const monthNames = {
            'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
            'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11,
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'jun': 5, 'jul': 6,
            'agu': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11
        };
        
        const monthDateRegex = /(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|jun|jul|agu|sep|okt|nov|des)(?:\s+(\d{2,4}))?/i;
        const monthMatch = normalizedMessage.match(monthDateRegex);
        if (monthMatch) {
            const day = parseInt(monthMatch[1]);
            const monthName = monthMatch[2].toLowerCase();
            const year = monthMatch[3] ? 
                (monthMatch[3].length === 2 ? 2000 + parseInt(monthMatch[3]) : parseInt(monthMatch[3])) : 
                today.getFullYear();
            
            const month = monthNames[monthName];
            if (month !== undefined) {
                const specificDate = new Date(year, month, day);
                if (specificDate instanceof Date && !isNaN(specificDate)) {
                    console.log(`Detected month date: ${day} ${monthName} ${year} = ${specificDate.toISOString()}`);
                    return specificDate.toISOString();
                }
            }
        }
        
        // Check for "bulan lalu", "tahun lalu" patterns
        if (normalizedMessage.includes('bulan lalu') || normalizedMessage.includes('bulan kemarin')) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - 1);
            console.log(`Detected: bulan lalu = ${date.toISOString()}`);
            return date.toISOString();
        }
        
        if (normalizedMessage.includes('tahun lalu') || normalizedMessage.includes('tahun kemarin')) {
            const date = new Date(today);
            date.setFullYear(date.getFullYear() - 1);
            console.log(`Detected: tahun lalu = ${date.toISOString()}`);
            return date.toISOString();
        }
        
        // Check for relative time patterns like "3 hari lalu", "2 minggu lalu", etc.
        const relativeTimeRegex = /(\d+)\s*(hari|minggu|bulan|tahun)\s*(lalu|yang lalu|kemarin)/i;
        const relativeMatch = normalizedMessage.match(relativeTimeRegex);
        if (relativeMatch) {
            const number = parseInt(relativeMatch[1]);
            const unit = relativeMatch[2].toLowerCase();
            const direction = relativeMatch[3].toLowerCase();
            
            const date = new Date(today);
            if (direction.includes('lalu') || direction.includes('kemarin')) {
                switch (unit) {
                    case 'hari':
                        date.setDate(date.getDate() - number);
                        break;
                    case 'minggu':
                        date.setDate(date.getDate() - (number * 7));
                        break;
                    case 'bulan':
                        date.setMonth(date.getMonth() - number);
                        break;
                    case 'tahun':
                        date.setFullYear(date.getFullYear() - number);
                        break;
                }
                console.log(`Detected relative date: ${number} ${unit} ${direction} = ${date.toISOString()}`);
                return date.toISOString();
            }
        }
        
        // Check for simple date patterns (kemarin, besok, etc.) - EXACT MATCH ONLY
        for (const [timeframe, keywords] of Object.entries(this.datePatterns)) {
            // Use strict keyword matching without fuzzy logic for date detection
            if (this.containsExactDateKeywords(words, keywords)) {
                const calculatedDate = this.calculateDate(timeframe, today);
                console.log(`Detected date pattern: ${timeframe} = ${calculatedDate}`);
                return calculatedDate;
            }
        }
        
        // Check for specific date formats (DD/MM, DD-MM, DD MM)
        const dateRegex = /(\d{1,2})[\/\-\s](\d{1,2})(?:[\/\-\s](\d{2,4}))?/;
        const dateMatch = normalizedMessage.match(dateRegex);
        if (dateMatch) {
            const day = parseInt(dateMatch[1]);
            const month = parseInt(dateMatch[2]) - 1; // JavaScript months are 0-indexed
            const year = dateMatch[3] ? 
                (dateMatch[3].length === 2 ? 2000 + parseInt(dateMatch[3]) : parseInt(dateMatch[3])) : 
                today.getFullYear();
                
            const specificDate = new Date(year, month, day);
            if (specificDate instanceof Date && !isNaN(specificDate)) {
                console.log(`Detected numeric date: ${specificDate.toISOString()}`);
                return specificDate.toISOString();
            }
        }
        
        // IMPORTANT: Default to today if no time indicators found
        console.log(`No date indicators found, using today: ${new Date().toISOString()}`);
        return new Date().toISOString();
    }

    calculateDate(timeframe, baseDate) {
        const date = new Date(baseDate);
        
        switch (timeframe) {
            case 'today':
                return date.toISOString();
                
            case 'yesterday':
                date.setDate(date.getDate() - 1);
                return date.toISOString();
                
            case 'tomorrow':
                date.setDate(date.getDate() + 1);
                return date.toISOString();
                
            case 'dayAfterTomorrow':
                date.setDate(date.getDate() + 2);
                return date.toISOString();
                
            case 'lastWeek':
                date.setDate(date.getDate() - 7);
                return date.toISOString();
                
            case 'lastSunday':
                // Find the most recent Sunday (hari minggu yang baru lewat)
                const currentDay = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                let daysToSubtract;
                if (currentDay === 0) { // Today is Sunday
                    daysToSubtract = 7; // Last Sunday (a week ago)
                } else {
                    daysToSubtract = currentDay; // Days since last Sunday
                }
                date.setDate(date.getDate() - daysToSubtract);
                return date.toISOString();
                
            case 'nextWeek':
                date.setDate(date.getDate() + 7);
                return date.toISOString();
                
            case 'lastMonth':
                date.setMonth(date.getMonth() - 1);
                return date.toISOString();
                
            case 'nextMonth':
                date.setMonth(date.getMonth() + 1);
                return date.toISOString();
                
            case 'thisYear':
                return date.toISOString();
                
            case 'lastYear':
                date.setFullYear(date.getFullYear() - 1);
                return date.toISOString();
                
            case 'nextYear':
                date.setFullYear(date.getFullYear() + 1);
                return date.toISOString();
                
            // For specific days of week, find the most recent or next occurrence
            case 'monday':
            case 'tuesday':
            case 'wednesday':
            case 'thursday':
            case 'friday':
            case 'saturday':
            case 'sunday':
                return this.getDateForDayOfWeek(timeframe, baseDate);
                
            default:
                return date.toISOString();
        }
    }

    getDateForDayOfWeek(dayName, baseDate) {
        const dayMap = {
            'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4,
            'friday': 5, 'saturday': 6, 'sunday': 0
        };
        
        const targetDay = dayMap[dayName];
        const date = new Date(baseDate);
        const currentDay = date.getDay();
        
        // Calculate days difference
        let daysDiff = targetDay - currentDay;
        
        // If the target day has passed this week, get next week's occurrence
        if (daysDiff <= 0) {
            daysDiff += 7;
        }
        
        date.setDate(date.getDate() + daysDiff);
        return date.toISOString();
    }

    formatDetectedDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        
        // Check if it's today
        if (date.toDateString() === today.toDateString()) {
            return 'hari ini';
        }
        
        // Check if it's yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'kemarin';
        }
        
        // Check if it's tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'besok';
        }
        
        // Return formatted date
        return date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    updateStats() {
        this.aiStats.processedCount++;
        this.aiStats.messagesTotal++;
        
        const today = new Date().toDateString();
        if (this.aiStats.lastMessageDate !== today) {
            this.aiStats.messagesToday = 1;
            this.aiStats.lastMessageDate = today;
        } else {
            this.aiStats.messagesToday++;
        }
        
        this.saveAIStats();
    }

    loadAIStats() {
        const saved = localStorage.getItem('moneyTracker_aiStats');
        if (saved) {
            this.aiStats = { ...this.aiStats, ...JSON.parse(saved) };
        }
    }

    saveAIStats() {
        localStorage.setItem('moneyTracker_aiStats', JSON.stringify(this.aiStats));
    }

    getStats() {
        return this.aiStats;
    }
}

// Initialize AI instance
const moneyAI = new MoneyTrackerAI();

// Chat functions
function sendChatMessage(event) {
    event.preventDefault();
    
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Process with AI
    setTimeout(() => {
        processAIMessage(message);
    }, 500);
}

function sendQuickMessage(message) {
    document.getElementById('chat-input').value = message;
    addChatMessage(message, 'user');
    
    setTimeout(() => {
        processAIMessage(message);
    }, 500);
}

function processAIMessage(message) {
    const result = moneyAI.processMessage(message);
    
    if (result.understood) {
        // Execute the action
        try {
            let successMessage = '';
            
            switch (result.action) {
                case 'expense':
                    addTransactionFromAI('expense', result.data.amount, result.data.category, result.data.description, result.data.date);
                    successMessage = `✅ Berhasil mencatat pengeluaran ${formatCurrency(result.data.amount)} untuk kategori ${result.data.category}!`;
                    break;
                case 'income':
                    addTransactionFromAI('income', result.data.amount, result.data.category, result.data.description, result.data.date);
                    successMessage = `✅ Berhasil mencatat pemasukan ${formatCurrency(result.data.amount)} untuk kategori ${result.data.category}!`;
                    break;
                case 'savings':
                    addToSavingsFromAI(result.data.amount, result.data.description, result.data.date);
                    successMessage = `✅ Berhasil menambahkan ${formatCurrency(result.data.amount)} ke tabungan!`;
                    break;
                case 'withdraw':
                    withdrawFromSavingsFromAI(result.data.amount, result.data.description, result.data.date);
                    successMessage = `✅ Berhasil menarik ${formatCurrency(result.data.amount)} dari tabungan!`;
                    break;
            }
            
            // Update AI stats
            moneyAI.updateStats();
            updateAIStats();
            
            // Add success message
            addChatMessage(successMessage, 'ai');
            
        } catch (error) {
            addChatMessage("Maaf, terjadi kesalahan saat memproses transaksi: " + error.message, 'ai');
        }
    } else {
        // Check if it's a financial consultation request
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('saran') || lowerMessage.includes('tips') || 
            lowerMessage.includes('analisis') || lowerMessage.includes('konsultasi') ||
            lowerMessage.includes('panduan') || lowerMessage.includes('strategi') ||
            lowerMessage.includes('budget') || lowerMessage.includes('investasi') ||
            lowerMessage.includes('hutang') || lowerMessage.includes('hemat')) {
            
            const consultationResult = processAIFinancialConsultation(message);
            addChatMessage(consultationResult, 'ai');
        } else {
            // Add AI response for ununderstood messages
            addChatMessage(result.response, 'ai');
        }
    }
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start space-x-3';
    
    const time = new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="flex-1"></div>
            <div class="max-w-xs lg:max-w-md">
                <div class="bg-primary text-white rounded-lg p-3">
                    <p class="text-sm">${message}</p>
                </div>
                <span class="text-xs text-gray-500 mt-1 block text-right">${time}</span>
            </div>
            <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <i class="fas fa-user text-gray-600 text-sm"></i>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <i class="fas fa-robot text-white text-sm"></i>
            </div>
            <div class="flex-1 max-w-xs lg:max-w-md">
                <div class="bg-gray-100 rounded-lg p-3">
                    <p class="text-sm text-gray-800">${message}</p>
                </div>
                <span class="text-xs text-gray-500 mt-1 block">${time}</span>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addTransactionFromAI(type, amount, category, description, date = null) {
    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        category: category,
        description: description,
        wallet: 'bank', // Default wallet for AI transactions
        date: date || new Date().toISOString(),
        formattedDate: new Date(date || new Date().toISOString()).toLocaleDateString('id-ID')
    };
    
    transactions.unshift(transaction);
    updateWalletBalances();
    saveData();
    updateDashboard();
    updateTransactionsList();
    updateFilterCategories();
    updateDailyLimitDisplay();
    
    // Only check daily limit for expenses on today's date
    if (type === 'expense') {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        
        // Check if the transaction is for today
        if (transactionDate.toDateString() === today.toDateString()) {
            checkDailyLimit(amount);
        }
    }
}

function addToSavingsFromAI(amount, description, date = null) {
    const currentBalance = calculateBalance();
    
    if (amount > currentBalance) {
        throw new Error('Saldo tidak mencukupi untuk menabung.');
    }
    
    const transactionDate = date || new Date().toISOString();
    
    // Add expense transaction for the savings
    const transaction = {
        id: Date.now(),
        type: 'expense',
        amount: amount,
        category: 'Tabungan',
        description: description || 'Menabung via AI Chat',
        wallet: 'bank', // Default wallet for AI transactions
        date: transactionDate,
        formattedDate: new Date(transactionDate).toLocaleDateString('id-ID')
    };
    
    transactions.unshift(transaction);
    
    // Add to savings
    const savingEntry = {
        id: Date.now() + 1,
        type: 'deposit',
        amount: amount,
        description: description || 'Menabung via AI Chat',
        date: transactionDate
    };
    
    savings.unshift(savingEntry);
    
    updateWalletBalances();
    saveData();
    updateDashboard();
    updateTransactionsList();
    updateSavingsDisplay();
}

function withdrawFromSavingsFromAI(amount, description, date = null) {
    const currentSavings = calculateSavingsBalance();
    
    if (amount > currentSavings) {
        throw new Error('Saldo tabungan tidak mencukupi.');
    }
    
    const transactionDate = date || new Date().toISOString();
    
    // Add income transaction for the withdrawal
    const transaction = {
        id: Date.now(),
        type: 'income',
        amount: amount,
        category: 'Penarikan Tabungan',
        description: description || 'Penarikan tabungan via AI Chat',
        wallet: 'bank', // Default wallet for AI transactions
        date: transactionDate,
        formattedDate: new Date(transactionDate).toLocaleDateString('id-ID')
    };
    
    transactions.unshift(transaction);
    
    // Add withdrawal record
    const withdrawEntry = {
        id: Date.now() + 1,
        type: 'withdraw',
        amount: amount,
        description: description || 'Penarikan tabungan via AI Chat',
        date: transactionDate
    };
    
    savings.unshift(withdrawEntry);
    
    updateWalletBalances();
    saveData();
    updateDashboard();
    updateTransactionsList();
    updateSavingsDisplay();
}

function updateAIStats() {
    const stats = moneyAI.getStats();
    
    document.getElementById('ai-processed-count').textContent = stats.processedCount;
    document.getElementById('ai-messages-today').textContent = stats.messagesToday;
}

// Function to check daily limit when adding expense
function checkDailyLimit(amount) {
    if (!dailyLimitSettings.enabled) return true;
    
    const todayExpenses = getTodayExpenses();
    const newTotal = todayExpenses + amount;
    const limitAmount = dailyLimitSettings.amount;
    const percentage = (newTotal / limitAmount) * 100;
    
    // Show warnings based on settings
    if (percentage >= 90 && dailyLimitSettings.warnings.ninety) {
        showDailyLimitAlert('danger', 'Peringatan! Anda telah menggunakan 90% dari batas harian!', 
            `Sisa limit: ${formatCurrency(limitAmount - newTotal)}`);
    } else if (percentage >= 75 && dailyLimitSettings.warnings.seventyFive) {
        showDailyLimitAlert('warning', 'Perhatian! Anda telah menggunakan 75% dari batas harian.', 
            `Sisa limit: ${formatCurrency(limitAmount - newTotal)}`);
    } else if (percentage >= 50 && dailyLimitSettings.warnings.fifty) {
        showDailyLimitAlert('info', 'Info: Anda telah menggunakan 50% dari batas harian.', 
            `Sisa limit: ${formatCurrency(limitAmount - newTotal)}`);
    }
    
    // Block transaction if exceeds limit and blocking is enabled
    if (newTotal > limitAmount && dailyLimitSettings.blockExceed) {
        showDailyLimitAlert('danger', 'Transaksi ditolak! Melebihi batas pengeluaran harian.', 
            `Batas harian: ${formatCurrency(limitAmount)}`);
        return false;
    }
    
    return true;
}

function showDailyLimitAlert(type, message, subMessage) {
    const alert = document.getElementById('daily-limit-alert');
    const icon = document.getElementById('limit-alert-icon');
    const text = document.getElementById('limit-alert-text');
    const subtext = document.getElementById('limit-alert-subtext');
    
    // Reset classes
    alert.className = 'mb-6 p-4 rounded-lg border-l-4';
    
    // Set type-specific styling
    switch (type) {
        case 'danger':
            alert.classList.add('bg-red-50', 'border-red-400', 'text-red-700');
            icon.className = 'fas fa-exclamation-triangle text-xl text-red-500';
            break;
        case 'warning':
            alert.classList.add('bg-yellow-50', 'border-yellow-400', 'text-yellow-700');
            icon.className = 'fas fa-exclamation-triangle text-xl text-yellow-500';
            break;
        case 'info':
            alert.classList.add('bg-blue-50', 'border-blue-400', 'text-blue-700');
            icon.className = 'fas fa-info-circle text-xl text-blue-500';
            break;
    }
    
    text.textContent = message;
    subtext.textContent = subMessage;
    alert.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alert.classList.add('hidden');
    }, 5000);
}

// ========================================
// EXTENDED FEATURES
// ========================================

// Statistics Configuration Functions
function toggleStatisticsConfig(configKey) {
    statisticsConfig[configKey] = !statisticsConfig[configKey];
    saveData();
    updateStatistics();
    showNotification(`Tampilan ${configKey} ${statisticsConfig[configKey] ? 'diaktifkan' : 'dinonaktifkan'}`, 'success');
}

function loadStatisticsConfig() {
    Object.keys(statisticsConfig).forEach(key => {
        const checkbox = document.getElementById(`stats-${key}`);
        if (checkbox) {
            checkbox.checked = statisticsConfig[key];
        }
    });
}

// Wallet Management Functions
function updateWalletDisplay() {
    const walletContainer = document.getElementById('wallet-cards');
    if (!walletContainer) return;
    
    walletContainer.innerHTML = wallets.map(wallet => `
        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center">
                    <div class="w-4 h-4 rounded-full mr-3" style="background-color: ${wallet.color}"></div>
                    <h3 class="font-semibold text-gray-900">${wallet.name}</h3>
                </div>
                <button onclick="editWallet('${wallet.id}')" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <p class="text-2xl font-bold text-gray-900">${formatCurrency(wallet.balance)}</p>
            <div class="mt-4 flex space-x-2">
                <button onclick="transferBetweenWallets('${wallet.id}')" 
                        class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                    Transfer
                </button>
                <button onclick="viewWalletTransactions('${wallet.id}')" 
                        class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                    Riwayat
                </button>
            </div>
        </div>
    `).join('');
}

function editWallet(walletId) {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;
    
    const newName = prompt('Nama wallet baru:', wallet.name);
    if (newName && newName.trim()) {
        wallet.name = newName.trim();
        saveData();
        updateWalletDisplay();
        showNotification('Wallet berhasil diperbarui!', 'success');
    }
}

function addCustomWallet() {
    const name = prompt('Nama wallet baru:');
    if (name && name.trim()) {
        const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const newWallet = {
            id: Date.now().toString(),
            name: name.trim(),
            balance: 0,
            color: color
        };
        
        wallets.push(newWallet);
        saveData();
        updateWalletDisplay();
        updateCategoryDropdowns();
        showNotification('Wallet baru berhasil ditambahkan!', 'success');
    }
}

function transferBetweenWallets(fromWalletId) {
    const fromWallet = wallets.find(w => w.id === fromWalletId);
    if (!fromWallet || fromWallet.balance <= 0) {
        showNotification('Wallet tidak memiliki saldo untuk ditransfer', 'error');
        return;
    }
    
    // Create transfer modal UI
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Transfer Antar Wallet</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dari Wallet</label>
                    <div class="p-3 bg-gray-50 rounded-lg flex items-center">
                        <div class="w-4 h-4 rounded-full mr-3" style="background-color: ${fromWallet.color}"></div>
                        <div>
                            <p class="font-medium">${fromWallet.name}</p>
                            <p class="text-sm text-gray-600">Saldo: ${formatCurrency(fromWallet.balance)}</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ke Wallet</label>
                    <select id="transfer-to-wallet" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">Pilih wallet tujuan</option>
                        ${wallets
                            .filter(w => w.id !== fromWalletId)
                            .map(w => `<option value="${w.id}">${w.name} (${formatCurrency(w.balance)})</option>`)
                            .join('')}
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah Transfer</label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-gray-500">Rp.</span>
                        <input type="number" 
                               id="transfer-amount" 
                               class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                               placeholder="0"
                               max="${fromWallet.balance}"
                               min="1">
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Maksimal: ${formatCurrency(fromWallet.balance)}</p>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan (Opsional)</label>
                    <input type="text" 
                           id="transfer-description" 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                           placeholder="Keterangan transfer">
                </div>
            </div>
            
            <div class="flex space-x-3 mt-6">
                <button onclick="this.closest('.fixed').remove()" 
                        class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200">
                    Batal
                </button>
                <button onclick="executeTransfer('${fromWalletId}')" 
                        class="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition duration-200">
                    <i class="fas fa-exchange-alt mr-2"></i>Transfer
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function executeTransfer(fromWalletId) {
    const toWalletId = document.getElementById('transfer-to-wallet').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    const description = document.getElementById('transfer-description').value;
    
    const fromWallet = wallets.find(w => w.id === fromWalletId);
    const toWallet = wallets.find(w => w.id === toWalletId);
    
    // Validation
    if (!toWallet) {
        showNotification('Pilih wallet tujuan', 'error');
        return;
    }
    
    if (!amount || amount <= 0) {
        showNotification('Masukkan jumlah transfer yang valid', 'error');
        return;
    }
    
    if (amount > fromWallet.balance) {
        showNotification('Jumlah transfer melebihi saldo wallet', 'error');
        return;
    }
    
    // Create transfer transactions
    const transferDescription = description || `Transfer ${fromWallet.name} → ${toWallet.name}`;
    
    const outTransaction = {
        id: Date.now().toString(),
        type: 'expense',
        amount: amount,
        category: 'Transfer',
        description: `Transfer ke ${toWallet.name}${description ? ' - ' + description : ''}`,
        wallet: fromWallet.id,
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('id-ID')
    };
    
    const inTransaction = {
        id: (Date.now() + 1).toString(),
        type: 'income',
        amount: amount,
        category: 'Transfer',
        description: `Transfer dari ${fromWallet.name}${description ? ' - ' + description : ''}`,
        wallet: toWallet.id,
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString('id-ID')
    };
    
    transactions.unshift(outTransaction, inTransaction);
    updateWalletBalances();
    saveData();
    updateDashboard();
    updateTransactionsList();
    updateWalletDisplay();
    
    // Close modal
    document.querySelector('.fixed.inset-0').remove();
    
    showNotification(`Transfer ${formatCurrency(amount)} dari ${fromWallet.name} ke ${toWallet.name} berhasil!`, 'success');
}

function viewWalletTransactions(walletId) {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;
    
    const walletTransactions = transactions.filter(t => t.wallet === walletId);
    
    if (walletTransactions.length === 0) {
        alert(`Tidak ada transaksi di wallet ${wallet.name}`);
        return;
    }
    
    const transactionList = walletTransactions.slice(0, 10).map(t => 
        `${formatDate(t.date)} - ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)} - ${t.description}`
    ).join('\n');
    
    alert(`Riwayat Transaksi ${wallet.name} (10 terakhir):\n\n${transactionList}`);
}

// Category Management Functions
function manageCategoriesUI() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Kelola Kategori</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="space-y-4">
                <div>
                    <h4 class="font-medium mb-2">Kategori Pemasukan</h4>
                    <div class="space-y-2">
                        ${customCategories.income.map(cat => `
                            <div class="flex justify-between items-center">
                                <span>${cat}</span>
                                ${cat !== 'Lainnya' ? `
                                    <button onclick="removeCustomCategory('income', '${cat}'); this.closest('.fixed').remove();" 
                                            class="text-red-500 hover:text-red-700">
                                        <i class="fas fa-trash text-xs"></i>
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="addCustomCategory('income'); this.closest('.fixed').remove();" 
                            class="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                        + Tambah Kategori
                    </button>
                </div>
                
                <div>
                    <h4 class="font-medium mb-2">Kategori Pengeluaran</h4>
                    <div class="space-y-2">
                        ${customCategories.expense.map(cat => `
                            <div class="flex justify-between items-center">
                                <span>${cat}</span>
                                ${cat !== 'Lainnya' ? `
                                    <button onclick="removeCustomCategory('expense', '${cat}'); this.closest('.fixed').remove();" 
                                            class="text-red-500 hover:text-red-700">
                                        <i class="fas fa-trash text-xs"></i>
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="addCustomCategory('expense'); this.closest('.fixed').remove();" 
                            class="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                        + Tambah Kategori
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Statistics Configuration UI
function manageStatisticsConfigUI() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Pengaturan Statistik</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="space-y-3 max-h-96 overflow-y-auto">
                ${Object.keys(statisticsConfig).map(key => `
                    <label class="flex items-center">
                        <input type="checkbox" 
                               ${statisticsConfig[key] ? 'checked' : ''} 
                               onchange="toggleStatisticsConfig('${key}')"
                               class="mr-3">
                        <span class="text-sm">${getStatisticsDisplayName(key)}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function getStatisticsDisplayName(key) {
    const names = {
        keyMetrics: 'Metrik Utama',
        incomeExpenseChart: 'Grafik Pemasukan & Pengeluaran',
        balanceChart: 'Grafik Saldo',
        categoryPieChart: 'Grafik Pie Kategori',
        monthlyComparisonChart: 'Perbandingan Bulanan',
        dailyActivityChart: 'Aktivitas Harian',
        topCategories: 'Kategori Teratas',
        spendingPatterns: 'Pola Pengeluaran',
        goalsProgress: 'Progress Target',
        spendingHeatmap: 'Heatmap Pengeluaran',
        financialHealth: 'Kesehatan Finansial',
        monthlyForecast: 'Perkiraan Bulanan',
        financialInsights: 'Wawasan Finansial'
    };
    return names[key] || key;
}

// Export transactions to Excel
function exportToExcel() {
    if (transactions.length === 0) {
        showNotification('Tidak ada transaksi untuk diekspor', 'warning');
        return;
    }

    // Prepare data for Excel
    const exportData = transactions.map(transaction => ({
        'Tanggal': new Date(transaction.date).toLocaleDateString('id-ID'),
        'Tipe': transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        'Kategori': transaction.category,
        'Jumlah': transaction.amount,
        'Wallet': transaction.wallet ? walletNames[transaction.wallet] || transaction.wallet : 'Bank',
        'Keterangan': transaction.description || '-',
        'ID': transaction.id
    }));

    // Calculate summary
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Add summary rows
    exportData.push({});
    exportData.push({
        'Tanggal': 'RINGKASAN',
        'Tipe': '',
        'Kategori': '',
        'Jumlah': '',
        'Wallet': '',
        'Keterangan': '',
        'ID': ''
    });
    exportData.push({
        'Tanggal': 'Total Pemasukan',
        'Tipe': '',
        'Kategori': '',
        'Jumlah': totalIncome,
        'Wallet': '',
        'Keterangan': '',
        'ID': ''
    });
    exportData.push({
        'Tanggal': 'Total Pengeluaran',
        'Tipe': '',
        'Kategori': '',
        'Jumlah': totalExpense,
        'Wallet': '',
        'Keterangan': '',
        'ID': ''
    });
    exportData.push({
        'Tanggal': 'Saldo',
        'Tipe': '',
        'Kategori': '',
        'Jumlah': balance,
        'Wallet': '',
        'Keterangan': '',
        'ID': ''
    });

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mutasi Keuangan");

    // Style the worksheet
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Set column widths
    ws['!cols'] = [
        {wch: 12}, // Tanggal
        {wch: 12}, // Tipe
        {wch: 15}, // Kategori
        {wch: 15}, // Jumlah
        {wch: 12}, // Wallet
        {wch: 25}, // Keterangan
        {wch: 20}  // ID
    ];

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Mutasi_Keuangan_${currentDate}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
    
    showNotification(`File ${filename} berhasil diunduh!`, 'success');
}

// Enhanced AI Consultant Functions
function getMonthlyAverage(type) {
    const filteredTransactions = transactions.filter(t => t.type === type);
    if (filteredTransactions.length === 0) return 0;
    
    // Get unique months
    const months = [...new Set(filteredTransactions.map(t => t.date.substring(0, 7)))];
    if (months.length === 0) return 0;
    
    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    return total / months.length;
}

function processAIFinancialConsultation(message) {
    const lowerMessage = message.toLowerCase();
    
    // Get current financial data
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalSavingsAmount = savings.reduce((sum, s) => sum + s.amount, 0);
    const currentBalance = totalIncome - totalExpense;
    
    // Category analysis
    const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});
    
    const monthlyIncome = getMonthlyAverage('income');
    const monthlyExpense = getMonthlyAverage('expense');
    
    // Financial consultation responses
    if (lowerMessage.includes('saran') && (lowerMessage.includes('gaji') || lowerMessage.includes('penghasilan'))) {
        return generateSalaryAdvice(monthlyIncome, monthlyExpense, totalSavingsAmount);
    }
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('anggaran')) {
        return generateBudgetAdvice(monthlyIncome, expensesByCategory);
    }
    
    if (lowerMessage.includes('tabung') || lowerMessage.includes('saving')) {
        return generateSavingsAdvice(monthlyIncome, monthlyExpense, totalSavingsAmount);
    }
    
    if (lowerMessage.includes('investasi') || lowerMessage.includes('invest')) {
        return generateInvestmentAdvice(monthlyIncome, monthlyExpense, totalSavingsAmount);
    }
    
    if (lowerMessage.includes('hutang') || lowerMessage.includes('debt')) {
        return generateDebtAdvice(monthlyIncome, monthlyExpense);
    }
    
    if (lowerMessage.includes('hemat') || lowerMessage.includes('saving money')) {
        return generateSavingTipsAdvice(expensesByCategory, monthlyExpense);
    }
    
    if (lowerMessage.includes('analisis') || lowerMessage.includes('laporan')) {
        return generateFinancialAnalysis(totalIncome, totalExpense, totalSavingsAmount, expensesByCategory);
    }
    
    // General financial consultation
    return generateGeneralFinancialAdvice(monthlyIncome, monthlyExpense, totalSavingsAmount);
}

function generateSalaryAdvice(monthlyIncome, monthlyExpense, savings) {
    if (monthlyIncome === 0) {
        return "Saya melihat belum ada pencatatan penghasilan bulanan. Untuk memberikan saran yang tepat, mulai catat penghasilan Anda terlebih dahulu. Secara umum, alokasi ideal adalah:\n\n50% untuk kebutuhan pokok\n30% untuk keinginan\n20% untuk tabungan dan investasi";
    }
    
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
    const expenseRate = monthlyIncome > 0 ? (monthlyExpense / monthlyIncome) * 100 : 0;
    
    let advice = `📊 **Analisis Penghasilan Bulanan Anda (${formatCurrency(monthlyIncome)})**\n\n`;
    
    // 50/30/20 rule recommendation
    const needs = monthlyIncome * 0.5; // 50% kebutuhan
    const wants = monthlyIncome * 0.3; // 30% keinginan
    const savingsTarget = monthlyIncome * 0.2; // 20% tabungan
    
    advice += `💡 **Rekomendasi Alokasi (Aturan 50/30/20):**\n`;
    advice += `• Kebutuhan Pokok: ${formatCurrency(needs)} (50%)\n`;
    advice += `• Keinginan: ${formatCurrency(wants)} (30%)\n`;
    advice += `• Tabungan & Investasi: ${formatCurrency(savingsTarget)} (20%)\n\n`;
    
    // Current performance analysis
    advice += `📈 **Status Keuangan Anda Saat Ini:**\n`;
    advice += `• Pengeluaran: ${formatCurrency(monthlyExpense)} (${expenseRate.toFixed(1)}%)\n`;
    advice += `• Tingkat Tabungan: ${savingsRate.toFixed(1)}%\n\n`;
    
    // Specific recommendations
    if (expenseRate > 80) {
        advice += `⚠️ **Perhatian:** Pengeluaran Anda ${expenseRate.toFixed(1)}% dari penghasilan. Ini terlalu tinggi!\n`;
        advice += `🎯 **Saran:** Kurangi pengeluaran tidak penting dan targetkan maksimal 70% untuk pengeluaran.\n\n`;
    }
    
    if (savingsRate < 10) {
        advice += `💰 **Tabungan Perlu Ditingkatkan**\n`;
        advice += `Mulai dengan target 10% dari gaji, lalu tingkatkan bertahap ke 20%.\n\n`;
    } else if (savingsRate >= 20) {
        advice += `🎉 **Excellent!** Tingkat tabungan Anda sudah ideal (${savingsRate.toFixed(1)}%)\n\n`;
    }
    
    advice += `📝 **Action Plan:**\n`;
    advice += `1. Buat anggaran bulanan berdasarkan alokasi di atas\n`;
    advice += `2. Pisahkan rekening untuk kebutuhan, keinginan, dan tabungan\n`;
    advice += `3. Otomatisasi transfer ke tabungan setiap gajian\n`;
    advice += `4. Review dan evaluasi setiap bulan`;
    
    return advice;
}

function generateBudgetAdvice(monthlyIncome, expensesByCategory) {
    let advice = `📋 **Analisis Anggaran Anda**\n\n`;
    
    if (Object.keys(expensesByCategory).length === 0) {
        return advice + "Belum ada data pengeluaran untuk dianalisis. Mulai catat pengeluaran Anda untuk mendapat saran anggaran yang tepat.";
    }
    
    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    const sortedCategories = Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    advice += `💸 **Top 5 Kategori Pengeluaran:**\n`;
    sortedCategories.forEach(([category, amount], index) => {
        const percentage = monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0;
        advice += `${index + 1}. ${category}: ${formatCurrency(amount)} (${percentage.toFixed(1)}%)\n`;
    });
    
    advice += `\n📊 **Rekomendasi Anggaran Bulanan:**\n`;
    
    // Budget recommendations based on categories
    const budgetRecommendations = {
        'Makanan': monthlyIncome * 0.15, // 15%
        'Transportasi': monthlyIncome * 0.10, // 10%
        'Tagihan': monthlyIncome * 0.15, // 15%
        'Hiburan': monthlyIncome * 0.05, // 5%
        'Belanja': monthlyIncome * 0.10, // 10%
        'Kesehatan': monthlyIncome * 0.05, // 5%
    };
    
    for (const [category, recommendedAmount] of Object.entries(budgetRecommendations)) {
        const currentAmount = expensesByCategory[category] || 0;
        const status = currentAmount > recommendedAmount ? '⚠️' : '✅';
        advice += `• ${category}: ${formatCurrency(recommendedAmount)} ${status}\n`;
        
        if (currentAmount > recommendedAmount) {
            advice += `  Saat ini: ${formatCurrency(currentAmount)} - Kurangi ${formatCurrency(currentAmount - recommendedAmount)}\n`;
        }
    }
    
    return advice;
}

function generateSavingsAdvice(monthlyIncome, monthlyExpense, totalSavings) {
    let advice = `💰 **Strategi Menabung yang Efektif**\n\n`;
    
    const netIncome = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0 ? (totalSavings / monthlyIncome) * 100 : 0;
    
    advice += `📊 **Status Tabungan Saat Ini:**\n`;
    advice += `• Total Tabungan: ${formatCurrency(totalSavings)}\n`;
    advice += `• Sisa Bulanan: ${formatCurrency(netIncome)}\n`;
    advice += `• Tingkat Tabungan: ${savingsRate.toFixed(1)}%\n\n`;
    
    if (netIncome <= 0) {
        advice += `⚠️ **Urgent:** Pengeluaran melebihi pemasukan!\n`;
        advice += `🎯 **Action Plan:**\n`;
        advice += `1. Audit semua pengeluaran dan eliminasi yang tidak penting\n`;
        advice += `2. Cari sumber penghasilan tambahan\n`;
        advice += `3. Fokus pada stabilitas keuangan dulu sebelum menabung\n`;
        return advice;
    }
    
    // Savings targets
    const emergencyFund = monthlyExpense * 6; // 6 months emergency fund
    const monthlyTarget = monthlyIncome * 0.2; // 20% monthly savings
    
    advice += `🎯 **Target Tabungan yang Disarankan:**\n`;
    advice += `• Dana Darurat: ${formatCurrency(emergencyFund)} (6x pengeluaran bulanan)\n`;
    advice += `• Target Bulanan: ${formatCurrency(monthlyTarget)} (20% dari penghasilan)\n\n`;
    
    advice += `💡 **Strategi Menabung:**\n`;
    advice += `1. **Pay Yourself First** - Sisihkan untuk tabungan sebelum pengeluaran lain\n`;
    advice += `2. **Automated Savings** - Set auto transfer ke rekening tabungan\n`;
    advice += `3. **50/30/20 Rule** - 50% kebutuhan, 30% keinginan, 20% tabungan\n`;
    advice += `4. **Emergency Fund First** - Prioritaskan dana darurat sebelum investasi\n\n`;
    
    if (totalSavings < emergencyFund) {
        const monthsNeeded = Math.ceil((emergencyFund - totalSavings) / monthlyTarget);
        advice += `⏰ **Priority:** Selesaikan dana darurat dalam ${monthsNeeded} bulan\n`;
        advice += `Tabung ${formatCurrency(monthlyTarget)} per bulan untuk mencapai target.\n`;
    } else {
        advice += `🎉 **Great!** Dana darurat sudah terpenuhi!\n`;
        advice += `Sekarang fokus pada investasi jangka panjang untuk masa depan.\n`;
    }
    
    return advice;
}

function generateInvestmentAdvice(monthlyIncome, monthlyExpense, totalSavings) {
    let advice = `📈 **Panduan Investasi untuk Anda**\n\n`;
    
    const emergencyFund = monthlyExpense * 6;
    const availableForInvestment = totalSavings - emergencyFund;
    const monthlyInvestmentCapacity = (monthlyIncome - monthlyExpense) * 0.7; // 70% of surplus
    
    advice += `💰 **Kesiapan Investasi:**\n`;
    advice += `• Dana Darurat Target: ${formatCurrency(emergencyFund)}\n`;
    advice += `• Dana Siap Investasi: ${formatCurrency(Math.max(0, availableForInvestment))}\n`;
    advice += `• Kapasitas Investasi Bulanan: ${formatCurrency(monthlyInvestmentCapacity)}\n\n`;
    
    if (totalSavings < emergencyFund) {
        advice += `⚠️ **Belum Siap Investasi**\n`;
        advice += `Lengkapi dana darurat terlebih dahulu sebelum berinvestasi.\n`;
        advice += `Dana darurat melindungi investasi Anda dari penarikan dini.\n\n`;
        advice += `🎯 **Fokus Sekarang:** Tabung ${formatCurrency(emergencyFund - totalSavings)} lagi untuk dana darurat.`;
        return advice;
    }
    
    advice += `✅ **Siap Berinvestasi!**\n\n`;
    advice += `📊 **Rekomendasi Alokasi Investasi:**\n`;
    
    if (monthlyIncome < 5000000) {
        advice += `**Untuk Penghasilan di bawah 5 juta:**\n`;
        advice += `• 60% Reksa Dana Saham (untuk pertumbuhan jangka panjang)\n`;
        advice += `• 30% Reksa Dana Pendapatan Tetap (untuk stabilitas)\n`;
        advice += `• 10% Emas/Obligasi (untuk proteksi inflasi)\n\n`;
    } else if (monthlyIncome < 10000000) {
        advice += `**Untuk Penghasilan 5-10 juta:**\n`;
        advice += `• 50% Saham/Reksa Dana Saham\n`;
        advice += `• 25% Reksa Dana Pendapatan Tetap\n`;
        advice += `• 15% Properti/REITs\n`;
        advice += `• 10% Emas/Komoditas\n\n`;
    } else {
        advice += `**Untuk Penghasilan di atas 10 juta:**\n`;
        advice += `• 40% Saham Individual/Reksa Dana Saham\n`;
        advice += `• 25% Properti/REITs\n`;
        advice += `• 20% Obligasi/Sukuk\n`;
        advice += `• 10% Emas/Komoditas\n`;
        advice += `• 5% Alternatif (P2P, Crypto untuk risk taker)\n\n`;
    }
    
    advice += `⏰ **Timeline Investasi:**\n`;
    advice += `• Jangka Pendek (1-3 tahun): Deposito, Reksa Dana Pasar Uang\n`;
    advice += `• Jangka Menengah (3-5 tahun): Reksa Dana Campuran\n`;
    advice += `• Jangka Panjang (5+ tahun): Saham, Reksa Dana Saham\n\n`;
    
    advice += `💡 **Tips Investasi:**\n`;
    advice += `1. Diversifikasi untuk mengurangi risiko\n`;
    advice += `2. Investasi rutin (Dollar Cost Averaging)\n`;
    advice += `3. Review portofolio setiap 6 bulan\n`;
    advice += `4. Jangan panic selling saat market turun\n`;
    advice += `5. Pelajari dulu sebelum investasi`;
    
    return advice;
}

function generateDebtAdvice(monthlyIncome, monthlyExpense) {
    let advice = `💳 **Strategi Mengelola Hutang**\n\n`;
    
    const availableForDebt = monthlyIncome - monthlyExpense;
    
    advice += `💰 **Kapasitas Pembayaran Hutang:**\n`;
    advice += `• Sisa Penghasilan: ${formatCurrency(availableForDebt)}\n\n`;
    
    if (availableForDebt <= 0) {
        advice += `⚠️ **Situasi Darurat!**\n`;
        advice += `Pengeluaran melebihi pemasukan. Ini adalah red flag finansial.\n\n`;
        advice += `🆘 **Action Plan Darurat:**\n`;
        advice += `1. Stop semua pengeluaran non-esensial\n`;
        advice += `2. Negosiasi dengan kreditur untuk restrukturisasi\n`;
        advice += `3. Cari penghasilan tambahan segera\n`;
        advice += `4. Jual aset non-produktif jika perlu\n`;
        advice += `5. Pertimbangkan konseling keuangan profesional`;
        return advice;
    }
    
    advice += `📋 **Strategi Pelunasan Hutang:**\n\n`;
    advice += `**1. Metode Avalanche (Recommended):**\n`;
    advice += `• Bayar minimum di semua hutang\n`;
    advice += `• Fokus bayar extra di hutang dengan bunga tertinggi\n`;
    advice += `• Menghemat biaya bunga total\n\n`;
    
    advice += `**2. Metode Snowball (Motivasi):**\n`;
    advice += `• Bayar minimum di semua hutang\n`;
    advice += `• Fokus lunasi hutang terkecil dulu\n`;
    advice += `• Memberikan motivasi psikologis\n\n`;
    
    advice += `💡 **Tips Mengelola Hutang:**\n`;
    advice += `1. **50% Rule**: Maksimal 50% penghasilan untuk semua hutang\n`;
    advice += `2. **Konsolidasi**: Gabungkan hutang berbunga tinggi\n`;
    advice += `3. **Stop New Debt**: Jangan tambah hutang baru\n`;
    advice += `4. **Emergency Fund**: Tetap sisihkan untuk dana darurat minimal\n`;
    advice += `5. **Track Progress**: Catat perkembangan setiap bulan\n\n`;
    
    const recommendedDebtPayment = availableForDebt * 0.7; // 70% for debt, 30% for savings
    advice += `🎯 **Rekomendasi Alokasi:**\n`;
    advice += `• Pembayaran Hutang: ${formatCurrency(recommendedDebtPayment)} (70%)\n`;
    advice += `• Dana Darurat: ${formatCurrency(availableForDebt * 0.3)} (30%)\n\n`;
    
    advice += `⚠️ **Red Flags yang Harus Dihindari:**\n`;
    advice += `• Hutang total > 40% penghasilan\n`;
    advice += `• Bayar hutang dengan hutang baru\n`;
    advice += `• Hanya bayar minimum terus-menerus\n`;
    advice += `• Mengabaikan komunikasi dengan kreditur`;
    
    return advice;
}

function generateSavingTipsAdvice(expensesByCategory, monthlyExpense) {
    let advice = `💡 **Tips Berhemat Berdasarkan Pengeluaran Anda**\n\n`;
    
    if (Object.keys(expensesByCategory).length === 0) {
        advice += "Mulai catat pengeluaran detail untuk mendapat tips berhemat yang personal.";
        return advice;
    }
    
    const sortedExpenses = Object.entries(expensesByCategory)
        .sort((a, b) => b[1] - a[1]);
    
    advice += `📊 **Analisis Pengeluaran Terbesar:**\n`;
    
    sortedExpenses.slice(0, 3).forEach(([category, amount], index) => {
        const percentage = (amount / monthlyExpense) * 100;
        advice += `${index + 1}. ${category}: ${formatCurrency(amount)} (${percentage.toFixed(1)}%)\n`;
        
        // Category-specific saving tips
        switch(category.toLowerCase()) {
            case 'makanan':
                advice += `   💡 Tips: Masak di rumah, meal prep, kurangi delivery\n`;
                advice += `   🎯 Target penghematan: 20-30% atau ${formatCurrency(amount * 0.25)}\n\n`;
                break;
            case 'transportasi':
                advice += `   💡 Tips: Gunakan transportasi umum, carpooling, jalan kaki\n`;
                advice += `   🎯 Target penghematan: 15-25% atau ${formatCurrency(amount * 0.2)}\n\n`;
                break;
            case 'hiburan':
                advice += `   💡 Tips: Cari hiburan gratis, promo, hiburan di rumah\n`;
                advice += `   🎯 Target penghematan: 30-50% atau ${formatCurrency(amount * 0.4)}\n\n`;
                break;
            case 'belanja':
                advice += `   💡 Tips: Buat list belanja, hindari impulse buying, tunggu sale\n`;
                advice += `   🎯 Target penghematan: 25-40% atau ${formatCurrency(amount * 0.3)}\n\n`;
                break;
            case 'tagihan':
                advice += `   💡 Tips: Review paket internet/telp, hemat listrik, air\n`;
                advice += `   🎯 Target penghematan: 10-20% atau ${formatCurrency(amount * 0.15)}\n\n`;
                break;
            default:
                advice += `   💡 Tips: Evaluasi kebutuhan vs keinginan di kategori ini\n\n`;
        }
    });
    
    advice += `🎯 **Strategi Berhemat 50/30/20:**\n`;
    advice += `• Kurangi pengeluaran "wants" dari 30% ke 20%\n`;
    advice += `• Tingkatkan tabungan dari 20% ke 30%\n`;
    advice += `• Maintain kebutuhan pokok di 50%\n\n`;
    
    advice += `📱 **Tools & Teknik Berhemat:**\n`;
    advice += `1. **Envelope Method**: Alokasi cash untuk setiap kategori\n`;
    advice += `2. **24-Hour Rule**: Tunda pembelian non-urgent 24 jam\n`;
    advice += `3. **Price Comparison**: Bandingkan harga sebelum beli\n`;
    advice += `4. **Cashback Apps**: Gunakan aplikasi cashback\n`;
    advice += `5. **Bulk Buying**: Beli dalam jumlah besar untuk kebutuhan pokok\n\n`;
    
    const totalPotentialSavings = sortedExpenses.reduce((sum, [category, amount]) => {
        const savingRate = category.toLowerCase() === 'hiburan' ? 0.4 : 
                          category.toLowerCase() === 'belanja' ? 0.3 : 
                          category.toLowerCase() === 'makanan' ? 0.25 : 0.15;
        return sum + (amount * savingRate);
    }, 0);
    
    advice += `💰 **Potensi Penghematan Total: ${formatCurrency(totalPotentialSavings)}/bulan**\n`;
    advice += `Ini bisa menjadi tambahan untuk tabungan atau investasi!`;
    
    return advice;
}

function generateFinancialAnalysis(totalIncome, totalExpense, totalSavings, expensesByCategory) {
    let advice = `📊 **Analisis Keuangan Komprehensif**\n\n`;
    
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
    const expenseRate = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    
    // Financial Health Score
    let healthScore = 0;
    if (balance > 0) healthScore += 25;
    if (savingsRate >= 20) healthScore += 25;
    else if (savingsRate >= 10) healthScore += 15;
    if (expenseRate <= 70) healthScore += 25;
    else if (expenseRate <= 80) healthScore += 15;
    if (totalSavings >= (totalExpense/12) * 6) healthScore += 25; // 6 months emergency fund
    
    advice += `🏥 **Skor Kesehatan Keuangan: ${healthScore}/100**\n`;
    
    if (healthScore >= 80) advice += `🎉 Excellent! Keuangan Anda sangat sehat!\n\n`;
    else if (healthScore >= 60) advice += `👍 Good! Keuangan Anda dalam kondisi baik.\n\n`;
    else if (healthScore >= 40) advice += `⚠️ Fair. Ada beberapa area yang perlu diperbaiki.\n\n`;
    else advice += `🚨 Poor. Perlu perbaikan mendesak dalam pengelolaan keuangan.\n\n`;
    
    advice += `📈 **Ringkasan Keuangan:**\n`;
    advice += `• Total Pemasukan: ${formatCurrency(totalIncome)}\n`;
    advice += `• Total Pengeluaran: ${formatCurrency(totalExpense)} (${expenseRate.toFixed(1)}%)\n`;
    advice += `• Total Tabungan: ${formatCurrency(totalSavings)} (${savingsRate.toFixed(1)}%)\n`;
    advice += `• Net Worth: ${formatCurrency(balance + totalSavings)}\n\n`;
    
    // Category analysis
    if (Object.keys(expensesByCategory).length > 0) {
        const topCategory = Object.entries(expensesByCategory)
            .sort((a, b) => b[1] - a[1])[0];
        
        advice += `💸 **Kategori Pengeluaran Terbesar:**\n`;
        advice += `${topCategory[0]}: ${formatCurrency(topCategory[1])} (${((topCategory[1]/totalExpense)*100).toFixed(1)}%)\n\n`;
    }
    
    // Recommendations based on analysis
    advice += `🎯 **Rekomendasi Prioritas:**\n`;
    
    if (balance <= 0) {
        advice += `1. 🚨 URGENT: Kurangi pengeluaran atau tingkatkan penghasilan\n`;
    } else if (savingsRate < 10) {
        advice += `1. 💰 Tingkatkan tingkat tabungan minimal ke 10%\n`;
    } else if (savingsRate < 20) {
        advice += `1. 💰 Tingkatkan tingkat tabungan ke target ideal 20%\n`;
    } else {
        advice += `1. 📈 Mulai fokus pada investasi untuk pertumbuhan wealth\n`;
    }
    
    if (expenseRate > 80) {
        advice += `2. ✂️ Kurangi pengeluaran, target maksimal 70% dari penghasilan\n`;
    }
    
    const emergencyFundTarget = (totalExpense / 12) * 6;
    if (totalSavings < emergencyFundTarget) {
        advice += `3. 🛡️ Lengkapi dana darurat: ${formatCurrency(emergencyFundTarget - totalSavings)} lagi\n`;
    }
    
    advice += `\n📅 **Langkah 30 Hari ke Depan:**\n`;
    advice += `• Week 1: Audit semua pengeluaran dan identifikasi area pemborosan\n`;
    advice += `• Week 2: Buat budget berdasarkan analisis ini\n`;
    advice += `• Week 3: Implementasi strategi berhemat\n`;
    advice += `• Week 4: Review progress dan adjust strategi\n`;
    
    return advice;
}

function generateGeneralFinancialAdvice(monthlyIncome, monthlyExpense, totalSavings) {
    let advice = `🤖 **AI Financial Consultant**\n\n`;
    advice += `Halo! Saya siap membantu Anda mengelola keuangan dengan lebih baik.\n\n`;
    
    advice += `💡 **Apa yang bisa saya bantu?**\n`;
    advice += `• "Saran pembagian gaji" - Cara ideal mengalokasikan penghasilan\n`;
    advice += `• "Tips berhemat" - Strategi mengurangi pengeluaran\n`;
    advice += `• "Saran tabungan" - Strategi menabung yang efektif\n`;
    advice += `• "Panduan investasi" - Mulai berinvestasi dengan benar\n`;
    advice += `• "Analisis keuangan" - Laporan kesehatan keuangan lengkap\n`;
    advice += `• "Strategi hutang" - Cara mengelola dan melunasi hutang\n\n`;
    
    if (monthlyIncome > 0 || monthlyExpense > 0 || totalSavings > 0) {
        advice += `📊 **Quick Financial Overview:**\n`;
        if (monthlyIncome > 0) advice += `• Penghasilan bulanan rata-rata: ${formatCurrency(monthlyIncome)}\n`;
        if (monthlyExpense > 0) advice += `• Pengeluaran bulanan rata-rata: ${formatCurrency(monthlyExpense)}\n`;
        if (totalSavings > 0) advice += `• Total tabungan: ${formatCurrency(totalSavings)}\n`;
        advice += `\nSilakan tanya hal spesifik yang ingin Anda konsultasikan!\n`;
    } else {
        advice += `📝 **Mulai Pencatatan Keuangan:**\n`;
        advice += `Untuk memberikan saran yang lebih personal, mulai catat:\n`;
        advice += `• Pemasukan dan pengeluaran harian\n`;
        advice += `• Kategorisasi pengeluaran\n`;
        advice += `• Target dan tujuan keuangan\n\n`;
        advice += `Semakin lengkap data Anda, semakin akurat saran yang bisa saya berikan!`;
    }
    
    return advice;
}

// ===== INVESTMENT FUNCTIONS =====

// Configuration for Google Apps Script
const STOCK_API_CONFIG = {
    // URL Production Google Apps Script (real-time data) - UPDATED
    baseUrl: 'https://script.google.com/macros/s/AKfycbypME8VADy5niE7OsCekT0G18RWVUzCCgL2uf5kS6rDWjTDrEBcA5KjY1v0WfDi7Z1_2w/exec',
    timeout: 30000, // 30 seconds timeout
    
    // Demo mode - false by default for production, will auto-fallback if needed
    demoMode: false
};

// Storage for recent searches and auto-refresh
let recentStockSearches = JSON.parse(localStorage.getItem('recentStockSearches')) || [];
let autoRefreshInterval = null;
let currentStockCode = null;

/**
 * Get stock price from Google Apps Script or demo data
 */
async function getStockPrice() {
    const stockCode = document.getElementById('stock-code').value.trim().toUpperCase();
    
    if (!stockCode) {
        showError('Masukkan kode saham terlebih dahulu');
        return;
    }
    
    // Validate stock code format
    if (!isValidStockCodeFormat(stockCode)) {
        showError('Format kode saham tidak valid. Gunakan format seperti IDX:BBCA atau NASDAQ:AAPL');
        return;
    }
    
    showLoading();
    
    try {
        let data;
        
        // Check if demo mode is enabled
        if (STOCK_API_CONFIG.demoMode) {
            data = getDemoStockData(stockCode);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        } else {
            // Try real API first, with automatic fallback to demo
            try {
                data = await fetchRealStockPrice(stockCode);
                // Add success flag if not present
                if (data.success === undefined) {
                    data.success = true;
                }
            } catch (apiError) {
                console.warn('Real API failed, falling back to demo data:', apiError);
                
                // Check if we have demo data for this stock
                if (shouldUseDemoData(stockCode)) {
                    data = getDemoStockData(stockCode);
                    // Show warning that we're using demo data
                    setTimeout(() => {
                        showNotification(`Server tidak tersedia. Menggunakan data demo untuk ${stockCode}`, 'warning');
                    }, 100);
                } else {
                    // No demo data available for this stock
                    throw new Error(`Data tidak tersedia untuk ${stockCode}. Stock code tidak didukung. Coba gunakan stock seperti IDX:BBCA, NASDAQ:AAPL, atau aktifkan mode demo.`);
                }
            }
        }
        
        if (data.success) {
            showStockResult(data);
            addToRecentSearches(data);
            updatePriceInCalculator(data.harga);
            
            // Store current stock for auto-refresh (only if not in demo mode)
            if (!STOCK_API_CONFIG.demoMode && !data.source) {
                currentStockCode = stockCode;
                startAutoRefresh();
            }
        } else {
            showError(data.error || 'Gagal mengambil data saham');
        }
        
    } catch (error) {
        console.error('Error fetching stock price:', error);
        
        if (error.name === 'AbortError') {
            showError('Timeout: Permintaan memakan waktu terlalu lama. Coba lagi.');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            showError('Tidak dapat terhubung ke server. Aktifkan mode demo atau periksa koneksi internet.');
        } else {
            showError(error.message || 'Terjadi kesalahan saat mengambil data saham');
        }
    } finally {
        hideLoading();
    }
}

/**
 * Fetch real stock price from Google Apps Script
 */
async function fetchRealStockPrice(stockCode) {
    // Check if Google Apps Script is properly configured
    if (!STOCK_API_CONFIG.baseUrl || 
        STOCK_API_CONFIG.baseUrl.includes('AKfycbzXXXXXXXXXX') || 
        STOCK_API_CONFIG.baseUrl.includes('YOUR_SCRIPT_ID') ||
        STOCK_API_CONFIG.baseUrl.includes('/dev')) {
        throw new Error('Google Apps Script belum dikonfigurasi dengan benar. URL tidak boleh berakhiran /dev. Gunakan URL production yang berakhiran /exec.');
    }
    
    // Validate production URL format
    if (!STOCK_API_CONFIG.baseUrl.includes('/exec')) {
        throw new Error('URL Google Apps Script harus berakhiran /exec untuk akses production.');
    }
    
    const url = `${STOCK_API_CONFIG.baseUrl}?kode=${encodeURIComponent(stockCode)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STOCK_API_CONFIG.timeout);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Gagal mengambil data dari server. Periksa deployment Google Apps Script.`);
        }
        
        const data = await response.json();
        
        // Validate response data
        if (!data || typeof data !== 'object') {
            throw new Error('Format response tidak valid dari Google Apps Script');
        }
        
        // If Google Apps Script returns error
        if (data.success === false) {
            throw new Error(data.error || 'Error dari Google Apps Script');
        }
        
        // Add success flag if not present
        if (data.success === undefined) {
            data.success = true;
        }
        
        return data;
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Timeout: Koneksi ke Google Apps Script terlalu lama');
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Tidak dapat terhubung ke Google Apps Script. Periksa koneksi internet atau URL deployment.');
        }
        
        throw error;
    }
}

/**
 * Check if should use demo data for specific stock codes
 */
function shouldUseDemoData(stockCode) {
    // Expanded list of demo-supported stock codes
    const demoStocks = [
        // Indonesian stocks
        'IDX:BBCA', 'IDX:BMRI', 'IDX:TLKM', 'IDX:UNVR', 'IDX:ASII',
        'IDX:BBRI', 'IDX:ITMG', 'IDX:ICBP', 'IDX:KLBF', 'IDX:GGRM',
        'IDX:CUAN', 'IDX:ANTM', 'IDX:PTBA', 'IDX:SMGR', 'IDX:INDF',
        // US NASDAQ stocks
        'NASDAQ:AAPL', 'NASDAQ:GOOGL', 'NASDAQ:MSFT', 'NASDAQ:TSLA',
        'NASDAQ:META', 'NASDAQ:NFLX', 'NASDAQ:NVDA', 'NASDAQ:AMZN',
        // US NYSE stocks
        'NYSE:DIS', 'NYSE:NVDA', 'NYSE:JPM', 'NYSE:JNJ', 'NYSE:PG',
        'NYSE:V', 'NYSE:HD', 'NYSE:MA'
    ];
    
    return demoStocks.includes(stockCode);
}

/**
 * Get demo stock data for testing
 */
function getDemoStockData(stockCode) {
    const currentTime = new Date().toISOString();
    
    const demoData = {
        // Indonesian stocks
        'IDX:BBCA': { 
            kode: 'IDX:BBCA', 
            harga: 9775, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:BMRI': { 
            kode: 'IDX:BMRI', 
            harga: 5850, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:TLKM': { 
            kode: 'IDX:TLKM', 
            harga: 2950, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:UNVR': { 
            kode: 'IDX:UNVR', 
            harga: 2580, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:ASII': { 
            kode: 'IDX:ASII', 
            harga: 4280, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:BBRI': { 
            kode: 'IDX:BBRI', 
            harga: 4920, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:CUAN': { 
            kode: 'IDX:CUAN', 
            harga: 1250, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:ANTM': { 
            kode: 'IDX:ANTM', 
            harga: 1890, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:ITMG': { 
            kode: 'IDX:ITMG', 
            harga: 28500, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:ICBP': { 
            kode: 'IDX:ICBP', 
            harga: 8200, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:KLBF': { 
            kode: 'IDX:KLBF', 
            harga: 1465, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:GGRM': { 
            kode: 'IDX:GGRM', 
            harga: 48500, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:PTBA': { 
            kode: 'IDX:PTBA', 
            harga: 3140, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:SMGR': { 
            kode: 'IDX:SMGR', 
            harga: 3400, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'IDX:INDF': { 
            kode: 'IDX:INDF', 
            harga: 6275, 
            currency: 'IDR', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        // US NASDAQ stocks
        'NASDAQ:AAPL': { 
            kode: 'NASDAQ:AAPL', 
            harga: 195.83, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NASDAQ:GOOGL': { 
            kode: 'NASDAQ:GOOGL', 
            harga: 178.25, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NASDAQ:MSFT': { 
            kode: 'NASDAQ:MSFT', 
            harga: 415.26, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NASDAQ:TSLA': { 
            kode: 'NASDAQ:TSLA', 
            harga: 248.50, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NASDAQ:META': { 
            kode: 'NASDAQ:META', 
            harga: 521.12, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NASDAQ:NFLX': { 
            kode: 'NASDAQ:NFLX', 
            harga: 692.45, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NASDAQ:NVDA': { 
            kode: 'NASDAQ:NVDA', 
            harga: 124.72, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NASDAQ:AMZN': { 
            kode: 'NASDAQ:AMZN', 
            harga: 186.43, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        // US NYSE stocks
        'NYSE:DIS': { 
            kode: 'NYSE:DIS', 
            harga: 113.89, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NYSE:JPM': { 
            kode: 'NYSE:JPM', 
            harga: 248.90, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NYSE:JNJ': { 
            kode: 'NYSE:JNJ', 
            harga: 152.67, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NYSE:PG': { 
            kode: 'NYSE:PG', 
            harga: 169.23, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NYSE:V': { 
            kode: 'NYSE:V', 
            harga: 289.14, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NYSE:HD': { 
            kode: 'NYSE:HD', 
            harga: 402.78, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        },
        'NYSE:MA': { 
            kode: 'NYSE:MA', 
            harga: 485.32, 
            currency: 'USD', 
            timestamp: currentTime,
            source: 'demo',
            success: true
        }
    };
    
    const stockData = demoData[stockCode];
    
    if (stockData) {
        // Add small random variation for demo purposes
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        stockData.harga = Math.round(stockData.harga * (1 + variation) * 100) / 100;
        return stockData;
    }
    
    // If stock not found in demo data, return error
    return {
        success: false,
        error: `Data demo tidak tersedia untuk ${stockCode}. Coba stock yang didukung seperti IDX:BBCA, NASDAQ:AAPL, dll.`
    };
}

/**
 * Validate stock code format
 */
function isValidStockCodeFormat(code) {
    // Format: EXCHANGE:SYMBOL (e.g., IDX:BBCA, NASDAQ:AAPL)
    const pattern = /^[A-Z]+:[A-Z0-9]+$/;
    return pattern.test(code);
}

/**
 * Show loading state
 */
function showLoading() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('stock-result').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
    
    const btn = document.getElementById('search-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Loading...';
}

/**
 * Hide loading state
 */
function hideLoading() {
    document.getElementById('loading-state').classList.add('hidden');
    
    const btn = document.getElementById('search-btn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search mr-1"></i>Cari';
}

/**
 * Show stock result
 */
function showStockResult(data) {
    document.getElementById('stock-result').classList.remove('hidden');
    document.getElementById('error-state').classList.add('hidden');
    
    document.getElementById('stock-symbol').textContent = data.kode;
    
    // Format price based on currency
    let formattedPrice;
    if (data.currency === 'IDR') {
        formattedPrice = `Rp ${data.harga.toLocaleString('id-ID')}`;
    } else {
        formattedPrice = `$${data.harga.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    document.getElementById('stock-price').textContent = formattedPrice;
    
    // Show data source indicator
    let timestampText = new Date(data.timestamp).toLocaleString('id-ID');
    if (data.source === 'demo') {
        timestampText += ' (Data Demo)';
    } else {
        timestampText += ' (Real-time dari Google Finance)';
    }
    document.getElementById('last-updated').textContent = timestampText;
}

/**
 * Show error message
 */
function showError(message) {
    document.getElementById('error-state').classList.remove('hidden');
    document.getElementById('stock-result').classList.add('hidden');
    document.getElementById('error-message').textContent = message;
}

/**
 * Add to recent searches
 */
function addToRecentSearches(data) {
    // Remove if already exists
    recentStockSearches = recentStockSearches.filter(item => item.kode !== data.kode);
    
    // Add to beginning
    recentStockSearches.unshift({
        kode: data.kode,
        harga: data.harga,
        currency: data.currency,
        timestamp: data.timestamp
    });
    
    // Keep only last 5 searches
    recentStockSearches = recentStockSearches.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem('recentStockSearches', JSON.stringify(recentStockSearches));
    
    // Update UI
    updateRecentSearchesUI();
}

/**
 * Update recent searches UI
 */
function updateRecentSearchesUI() {
    const container = document.getElementById('recent-searches');
    
    if (recentStockSearches.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <i class="fas fa-history text-2xl mb-2"></i>
                <p class="text-sm">Belum ada pencarian</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentStockSearches.map(item => {
        let formattedPrice;
        if (item.currency === 'IDR') {
            formattedPrice = `Rp ${item.harga.toLocaleString('id-ID')}`;
        } else {
            formattedPrice = `$${item.harga.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
        return `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition duration-200" onclick="quickSearch('${item.kode}')">
                <div>
                    <div class="font-medium">${item.kode}</div>
                    <div class="text-xs text-gray-500">${new Date(item.timestamp).toLocaleString('id-ID')}</div>
                </div>
                <div class="text-right">
                    <div class="font-medium text-green-600">${formattedPrice}</div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Quick search for popular stocks
 */
function quickSearch(stockCode) {
    document.getElementById('stock-code').value = stockCode;
    getStockPrice();
}

/**
 * Calculate investment
 */
function calculateInvestment() {
    const shares = parseInt(document.getElementById('shares-count').value) || 0;
    const pricePerShare = parseFloat(document.getElementById('price-per-share').value) || 0;
    
    if (shares <= 0 || pricePerShare <= 0) {
        showNotification('Masukkan jumlah lembar dan harga per lembar yang valid', 'warning');
        return;
    }
    
    const totalInvestment = shares * pricePerShare;
    const brokerFee = totalInvestment * 0.0015; // 0.15% broker fee
    const totalWithFee = totalInvestment + brokerFee;
    
    document.getElementById('total-investment').textContent = formatCurrency(totalInvestment);
    document.getElementById('broker-fee').textContent = formatCurrency(brokerFee);
    document.getElementById('total-with-fee').textContent = formatCurrency(totalWithFee);
}

/**
 * Start auto-refresh for real-time data
 */
function startAutoRefresh() {
    // Clear existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    // Only start auto-refresh if not in demo mode and we have a current stock
    if (!STOCK_API_CONFIG.demoMode && currentStockCode) {
        autoRefreshInterval = setInterval(async () => {
            try {
                // Silent refresh without showing loading state
                const data = await fetchRealStockPrice(currentStockCode);
                if (data.success) {
                    // Update display silently
                    document.getElementById('stock-symbol').textContent = data.kode;
                    
                    let formattedPrice;
                    if (data.currency === 'IDR') {
                        formattedPrice = `Rp ${data.harga.toLocaleString('id-ID')}`;
                    } else {
                        formattedPrice = `$${data.harga.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    }
                    
                    document.getElementById('stock-price').textContent = formattedPrice;
                    document.getElementById('last-updated').textContent = 
                        new Date(data.timestamp).toLocaleString('id-ID') + ' (Real-time dari Google Finance)';
                    
                    // Update calculator if price changed
                    updatePriceInCalculator(data.harga);
                    
                    // Show subtle update indicator
                    showUpdateIndicator();
                }
            } catch (error) {
                console.log('Auto-refresh failed:', error);
                // Don't show error for auto-refresh failures
            }
        }, 30000); // Refresh every 30 seconds
        
        // Show auto-refresh indicator
        showAutoRefreshStatus(true);
    }
}

/**
 * Stop auto-refresh
 */
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        currentStockCode = null;
        showAutoRefreshStatus(false);
    }
}

/**
 * Show auto-refresh status indicator
 */
function showAutoRefreshStatus(isActive) {
    const resultDiv = document.getElementById('stock-result');
    const stopBtn = document.getElementById('stop-refresh-btn');
    
    if (resultDiv && !resultDiv.classList.contains('hidden')) {
        const existingIndicator = resultDiv.querySelector('.auto-refresh-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (isActive) {
            const indicator = document.createElement('div');
            indicator.className = 'auto-refresh-indicator mt-2 text-xs text-blue-600 flex items-center';
            indicator.innerHTML = `
                <div class="animate-pulse w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Auto-refresh aktif (setiap 30 detik)
            `;
            resultDiv.appendChild(indicator);
            
            // Show stop button
            if (stopBtn) {
                stopBtn.style.display = 'inline-block';
            }
        } else {
            // Hide stop button
            if (stopBtn) {
                stopBtn.style.display = 'none';
            }
        }
    }
}

/**
 * Show subtle update indicator
 */
function showUpdateIndicator() {
    const priceElement = document.getElementById('stock-price');
    if (priceElement) {
        priceElement.classList.add('animate-pulse');
        setTimeout(() => {
            priceElement.classList.remove('animate-pulse');
        }, 1000);
    }
}
/**
 * Update price in calculator when stock price is fetched
 */
function updatePriceInCalculator(price) {
    document.getElementById('price-per-share').value = price;
    
    // Auto calculate if shares count is already filled
    const shares = document.getElementById('shares-count').value;
    if (shares && shares > 0) {
        calculateInvestment();
    }
}

/**
 * Calculate investment
 */
function calculateInvestment() {
    const shares = parseInt(document.getElementById('shares-count').value) || 0;
    const pricePerShare = parseFloat(document.getElementById('price-per-share').value) || 0;
    
    if (shares <= 0 || pricePerShare <= 0) {
        showNotification('Masukkan jumlah lembar dan harga per lembar yang valid', 'warning');
        return;
    }
    
    const totalInvestment = shares * pricePerShare;
    const brokerFee = totalInvestment * 0.0015; // 0.15% broker fee
    const totalWithFee = totalInvestment + brokerFee;
    
    document.getElementById('total-investment').textContent = formatCurrency(totalInvestment);
    document.getElementById('broker-fee').textContent = formatCurrency(brokerFee);
    document.getElementById('total-with-fee').textContent = formatCurrency(totalWithFee);
}

/**
 * Initialize investment section
 */
function initializeInvestmentSection() {
    // Load recent searches
    updateRecentSearchesUI();
    
    // Setup demo mode toggle
    const demoToggle = document.getElementById('demo-mode-toggle');
    if (demoToggle) {
        demoToggle.checked = STOCK_API_CONFIG.demoMode;
        demoToggle.addEventListener('change', function() {
            STOCK_API_CONFIG.demoMode = this.checked;
            
            // Stop auto-refresh when switching to demo mode
            if (this.checked) {
                stopAutoRefresh();
            }
            
            // Update demo banner visibility
            const demoBanner = document.getElementById('demo-info-banner');
            if (demoBanner) {
                if (this.checked) {
                    demoBanner.classList.remove('hidden');
                    showNotification('Mode Demo diaktifkan - menggunakan data sample', 'info');
                } else {
                    demoBanner.classList.add('hidden');
                    showNotification('Mode Real diaktifkan - akan menggunakan data live dari Google Finance', 'info');
                    
                    // Show success for production URL
                    if (STOCK_API_CONFIG.baseUrl.includes('/exec') && 
                        !STOCK_API_CONFIG.baseUrl.includes('AKfycbzXXXXXXXXXX')) {
                        setTimeout(() => {
                            showNotification('✅ Google Apps Script terkonfigurasi dengan benar', 'success');
                        }, 1500);
                    }
                }
            }
        });
        
        // Initial banner state and setup
        const demoBanner = document.getElementById('demo-info-banner');
        if (demoBanner) {
            if (STOCK_API_CONFIG.demoMode) {
                demoBanner.classList.remove('hidden');
            } else {
                demoBanner.classList.add('hidden');
                // Show real-time mode confirmation
                setTimeout(() => {
                    showNotification('🚀 Mode Real-time aktif - data dari Google Finance', 'success');
                }, 1000);
            }
        }
    }
    
    // Add event listeners
    document.getElementById('stock-code').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getStockPrice();
        }
    });
    
    document.getElementById('shares-count').addEventListener('input', function() {
        if (this.value && document.getElementById('price-per-share').value) {
            calculateInvestment();
        }
    });
    
    document.getElementById('price-per-share').addEventListener('input', function() {
        if (this.value && document.getElementById('shares-count').value) {
            calculateInvestment();
        }
    });
    
    // Add button to stop auto-refresh manually
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn && searchBtn.parentNode) {
        const stopBtn = document.createElement('button');
        stopBtn.type = 'button';
        stopBtn.className = 'ml-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200 text-sm';
        stopBtn.innerHTML = '<i class="fas fa-stop mr-1"></i>Stop';
        stopBtn.onclick = stopAutoRefresh;
        stopBtn.style.display = 'none';
        stopBtn.id = 'stop-refresh-btn';
        searchBtn.parentNode.appendChild(stopBtn);
    }
}
