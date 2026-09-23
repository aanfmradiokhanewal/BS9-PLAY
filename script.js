/* 
  ==================================================
  BS9 PLAY - FRONT-END DEMO SCRIPT
  THIS IS DEMO ONLY
  - No real money
  - No deposits
  - No withdrawals
  - No payment gateway
  - No crypto
  - No bank integration
  - No real-money betting
  ==================================================
*/

// Game Database with Custom Thumbnails and Badges
const gamesData = [
    { id: 'crash', name: 'Crash', desc: 'Multiplier-style demo', icon: 'fa-rocket', category: 'popular', badge: 'HOT', badgeClass: 'badge-hot', thumbClass: 'thumb-crash' },
    { id: 'dice', name: 'Dice', desc: 'Roll the virtual dice', icon: 'fa-dice', category: 'popular', badge: 'POP', badgeClass: 'badge-pop', thumbClass: 'thumb-dice' },
    { id: 'mines', name: 'Mines', desc: 'Find a safe tile', icon: 'fa-bomb', category: 'new', badge: 'NEW', badgeClass: 'badge-new', thumbClass: 'thumb-mines' },
    { id: 'color', name: 'Color Game', desc: 'Choose a color', icon: 'fa-palette', category: 'popular', badge: 'HOT', badgeClass: 'badge-hot', thumbClass: 'thumb-color' },
    { id: 'slots', name: 'Slots', desc: 'Slot-style demo', icon: 'fa-slot-machine', category: 'new', badge: 'NEW', badgeClass: 'badge-new', thumbClass: 'thumb-slots' },
    { id: 'cards', name: 'Cards', desc: 'Card-style demo', icon: 'fa-clone', category: 'all', badge: 'POP', badgeClass: 'badge-pop', thumbClass: 'thumb-cards' }
];

// App State
let currentBalance = 10000;
let currentUsername = 'Guest';
let gameHistory = [];
let currentGame = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadLocalStorageData();
    renderFeaturedGames();
    renderGamesLobby(gamesData);
    renderHistory();
    updateBalanceDisplay();
    checkAuthState();
});

// LocalStorage Management
function loadLocalStorageData() {
    const savedBalance = localStorage.getItem('bs9_balance');
    if (savedBalance !== null) {
        currentBalance = parseInt(savedBalance);
    } else {
        localStorage.setItem('bs9_balance', currentBalance);
    }

    const savedUser = localStorage.getItem('bs9_username');
    if (savedUser !== null) {
        currentUsername = savedUser;
    }

    const savedHistory = localStorage.getItem('bs9_history');
    if (savedHistory !== null) {
        try {
            gameHistory = JSON.parse(savedHistory);
        } catch (e) {
            gameHistory = [];
        }
    }
}

function saveToLocalStorage() {
    localStorage.setItem('bs9_balance', currentBalance);
    localStorage.setItem('bs9_username', currentUsername);
    localStorage.setItem('bs9_history', JSON.stringify(gameHistory));
}

// Navigation System
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-target') === pageId) {
            item.classList.add('active');
        }
    });

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.scrollTop = 0;
    }
}

// Render Featured Games (Horizontal Scroll)
function renderFeaturedGames() {
    const container = document.getElementById('featured-games-container');
    if (!container) return;

    container.innerHTML = '';
    gamesData.slice(0, 4).forEach(game => {
        container.innerHTML += createGameCardHTML(game);
    });
}

// Render Games Lobby
function renderGamesLobby(games) {
    const container = document.getElementById('games-grid-container');
    if (!container) return;

    container.innerHTML = '';
    if (games.length === 0) {
        container.innerHTML = `<div class="empty-history" style="grid-column: span 2;">No games found matching your search.</div>`;
        return;
    }
    games.forEach(game => {
        container.innerHTML += createGameCardHTML(game);
    });
}

function createGameCardHTML(game) {
    return `
        <div class="game-card">
            <div class="game-thumbnail ${game.thumbClass}">
                <span class="game-badge ${game.badgeClass}">${game.badge}</span>
                <div class="thumb-graphic"><i class="fa-solid ${game.icon}"></i></div>
            </div>
            <div class="game-info">
                <h4>${game.name}</h4>
                <p>${game.desc}</p>
            </div>
            <button class="play-demo-sm-btn" onclick="openGameModal('${game.id}')">PLAY DEMO →</button>
        </div>
    `;
}

// Filter Games
function filterGames(category, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    const searchInput = document.getElementById('game-search-input');
    if (searchInput) searchInput.value = '';

    if (category === 'all') {
        renderGamesLobby(gamesData);
    } else {
        const filtered = gamesData.filter(g => g.category === category);
        renderGamesLobby(filtered);
    }
}

// Search Games
function handleSearchGames(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        renderGamesLobby(gamesData);
        return;
    }
    const filtered = gamesData.filter(g => g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q));
    renderGamesLobby(filtered);
}

// Game Modal Logic
function openGameModal(gameId) {
    const game = gamesData.find(g => g.id === gameId);
    if (!game) return;

    currentGame = game;
    document.getElementById('modal-icon').innerHTML = `<i class="fa-solid ${game.icon}"></i>`;
    document.getElementById('modal-game-name').innerText = game.name;
    document.getElementById('modal-game-desc').innerText = game.desc;
    document.getElementById('demo-stake-input').value = 100;
    
    document.getElementById('demo-screen-display').innerHTML = `
        <div class="game-screen-graphic"><i class="fa-solid ${game.icon} fa-2x"></i></div>
        <p>Ready to play ${game.name} demo</p>
    `;

    document.getElementById('game-modal').classList.add('active');
}

function closeGameModal() {
    document.getElementById('game-modal').classList.remove('active');
    currentGame = null;
}

function setStake(amount) {
    document.getElementById('demo-stake-input').value = amount;
}

// Play Demo Mechanics
function playDemo() {
    if (!currentGame) return;

    const stakeInput = document.getElementById('demo-stake-input');
    const stake = parseInt(stakeInput.value);

    if (isNaN(stake) || stake < 10) {
        notify("Minimum stake is 10 virtual coins.");
        return;
    }

    if (stake > 1000) {
        notify("Maximum stake is 1000 virtual coins.");
        return;
    }

    if (currentBalance < stake) {
        notify("Insufficient demo coins! Reset balance.");
        return;
    }

    // Deduct stake temporarily
    currentBalance -= stake;
    updateBalanceDisplay();

    const screenDisplay = document.getElementById('demo-screen-display');
    screenDisplay.innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-2x" style="color: var(--primary-purple);"></i><p>Simulating demo result...</p>`;

    setTimeout(() => {
        const isWin = Math.random() > 0.42; // ~58% win chance for exciting demo experience
        let resultText = "";
        let netProfit = 0;

        if (isWin) {
            const multipliers = [1.5, 1.8, 2.2, 2.5, 3.0, 4.0];
            const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
            const totalReturn = Math.floor(stake * multiplier);
            netProfit = totalReturn - stake; // profit earned
            currentBalance += totalReturn;

            resultText = `🎉 Won +${totalReturn} coins (${multiplier}×)`;
            screenDisplay.innerHTML = `<i class="fa-solid fa-circle-check fa-2x" style="color: var(--accent-green);"></i><p style="color: var(--accent-green); font-weight:700;">${resultText}</p>`;
            recordHistory(currentGame.name, currentGame.icon, stake, totalReturn, 'Won');
        } else {
            netProfit = -stake;
            resultText = `Try Again — Lost ${stake} coins`;
            screenDisplay.innerHTML = `<i class="fa-solid fa-circle-xmark fa-2x" style="color: var(--accent-red);"></i><p style="color: var(--accent-red); font-weight:700;">${resultText}</p>`;
            recordHistory(currentGame.name, currentGame.icon, stake, 0, 'Lost');
        }

        updateBalanceDisplay();
        saveToLocalStorage();
    }, 700);
}

// Balance Display Update
function updateBalanceDisplay() {
    const formatted = currentBalance.toLocaleString();
    
    const headerBal = document.getElementById('header-balance');
    const lobbyBal = document.getElementById('lobby-balance');
    const dashBal = document.getElementById('dashboard-wallet-balance');
    const accBal = document.getElementById('acc-wallet-balance');

    if (headerBal) headerBal.innerText = formatted;
    if (lobbyBal) lobbyBal.innerText = `🪙 ${formatted}`;
    if (dashBal) dashBal.innerText = formatted;
    if (accBal) accBal.innerText = formatted;
}

// Reset Balance
function resetDemoBalance() {
    currentBalance = 10000;
    updateBalanceDisplay();
    saveToLocalStorage();
    notify("Demo balance restored to 10,000 coins.");
}

// History Management (Max 50 records)
function recordHistory(gameName, gameIcon, stake, returnAmount, status) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const isWin = status === 'Won';
    const netResult = isWin ? `+${returnAmount - stake}` : `-${stake}`;

    const record = {
        name: gameName,
        icon: gameIcon,
        datetime: `${dateStr}, ${timeStr}`,
        stake: stake,
        amount: netResult,
        status: status
    };

    gameHistory.unshift(record);
    if (gameHistory.length > 50) gameHistory.pop();
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('history-container');
    if (!container) return;

    if (gameHistory.length === 0) {
        container.innerHTML = `<div class="empty-history">No recent game activity found. Play a demo game!</div>`;
        return;
    }

    container.innerHTML = '';
    gameHistory.forEach(item => {
        const isWin = item.status === 'Won';
        const amountClass = isWin ? 'win' : 'loss';

        container.innerHTML += `
            <div class="history-item">
                <div class="hi-left">
                    <div class="hi-icon"><i class="fa-solid ${item.icon}"></i></div>
                    <div class="hi-details">
                        <h4>${item.name}</h4>
                        <span>${item.datetime}</span>
                    </div>
                </div>
                <div class="hi-amount ${amountClass}">
                    ${item.amount}
                    <span class="hi-stake">Stake: ${item.stake}</span>
                </div>
            </div>
        `;
    });
}

// Authentication & Account
function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username').value.trim();
    if (!usernameInput) return;

    currentUsername = usernameInput;
    saveToLocalStorage();
    checkAuthState();
    notify(`Welcome back, ${currentUsername}!`);
}

function handleGuestLogin() {
    currentUsername = 'Guest';
    saveToLocalStorage();
    checkAuthState();
    notify("Logged in as Guest.");
}

function handleLogout() {
    currentUsername = 'Guest';
    saveToLocalStorage();
    checkAuthState();
    notify("Signed out successfully.");
}

function checkAuthState() {
    const authContainer = document.getElementById('auth-container');
    const userDashboard = document.getElementById('user-dashboard');
    const displayName = document.getElementById('display-username');

    if (currentUsername && currentUsername !== 'Guest') {
        if (authContainer) authContainer.style.display = 'none';
        if (userDashboard) userDashboard.style.display = 'flex';
        if (displayName) displayName.innerText = currentUsername;
    } else {
        if (authContainer) authContainer.style.display = 'flex';
        if (userDashboard) userDashboard.style.display = 'none';
    }
}

// Notifications Modal
function openNotifications() {
    const modal = document.getElementById('notification-modal');
    if (modal) modal.classList.add('active');
}

function closeNotifications() {
    const modal = document.getElementById('notification-modal');
    if (modal) modal.classList.remove('active');
}

// Notice Helper for Demo Mode
function showDemoNotice(actionType) {
    notify(`${actionType} is disabled in Demo Mode. (Virtual Coins only)`);
}

// Toast Notification Helper
function notify(message) {
    const toast = document.getElementById('toast-notification');
    const msgSpan = document.getElementById('toast-message');
    if (!toast || !msgSpan) return;

    msgSpan.innerText = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}
