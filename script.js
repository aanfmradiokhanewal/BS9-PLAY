// Game Database
const gamesData = [
    { id: 'crash', name: 'Crash', desc: 'Multiplier-style demo', icon: 'fa-rocket', category: 'popular' },
    { id: 'dice', name: 'Dice', desc: 'Roll the virtual dice', icon: 'fa-dice', category: 'popular' },
    { id: 'mines', name: 'Mines', desc: 'Find a safe tile', icon: 'fa-bomb', category: 'new' },
    { id: 'color', name: 'Color Game', desc: 'Choose a color', icon: 'fa-palette', category: 'popular' },
    { id: 'slots', name: 'Slots', desc: 'Slot-style demo', icon: 'fa-slot-machine', category: 'new' },
    { id: 'cards', name: 'Cards', desc: 'Card-style demo', icon: 'fa-clone', category: 'all' }
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

    // Notification click event
    document.getElementById('notification-btn').addEventListener('click', () => {
        notify("No new system notifications.");
    });
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
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update bottom nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-target') === pageId) {
            item.classList.add('active');
        }
    });

    // Scroll main content to top
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
    games.forEach(game => {
        container.innerHTML += createGameCardHTML(game);
    });
}

function createGameCardHTML(game) {
    return `
        <div class="game-card">
            <div class="game-card-top">
                <div class="game-icon-box"><i class="fa-solid ${game.icon}"></i></div>
                <span class="demo-badge">DEMO</span>
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

    if (category === 'all') {
        renderGamesLobby(gamesData);
    } else {
        const filtered = gamesData.filter(g => g.category === category);
        renderGamesLobby(filtered);
    }
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
        <i class="fa-solid fa-play-circle fa-2x"></i>
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

    // Deduct stake
    currentBalance -= stake;
    updateBalanceDisplay();

    // Simulate random outcome (Win or Loss)
    const isWin = Math.random() > 0.45; // ~55% win chance for fun demo
    let resultText = "";
    let winAmount = 0;

    const screenDisplay = document.getElementById('demo-screen-display');
    screenDisplay.innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-2x"></i><p>Rolling demo result...</p>`;

    setTimeout(() => {
        if (isWin) {
            const multipliers = [1.5, 1.8, 2.0, 2.35, 3.0, 5.0];
            const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
            winAmount = Math.floor(stake * multiplier);
            currentBalance += winAmount;

            resultText = `🎉 Demo win — ${multiplier}× | +${winAmount} coins`;
            screenDisplay.innerHTML = `<i class="fa-solid fa-circle-check fa-2x" style="color: var(--accent-green);"></i><p style="color: var(--accent-green); font-weight:700;">${resultText}</p>`;
        } else {
            winAmount = -stake;
            resultText = `Demo result — ${stake} coins used`;
            screenDisplay.innerHTML = `<i class="fa-solid fa-circle-xmark fa-2x" style="color: var(--accent-red);"></i><p style="color: var(--accent-red); font-weight:700;">${resultText}</p>`;
        }

        updateBalanceDisplay();
        recordHistory(currentGame.name, currentGame.icon, isWin ? winAmount : -stake);
        saveToLocalStorage();
    }, 600);
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

// History Management
function recordHistory(gameName, gameIcon, netAmount) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const record = {
        name: gameName,
        icon: gameIcon,
        datetime: `${dateStr}, ${timeStr}`,
        amount: netAmount
    };

    gameHistory.unshift(record);
    if (gameHistory.length > 50) gameHistory.pop(); // limit history length
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
        const isPositive = item.amount >= 0;
        const amountFormatted = (isPositive ? `+${item.amount}` : `${item.amount}`);
        const amountClass = isPositive ? 'win' : 'loss';

        container.innerHTML += `
            <div class="history-item">
                <div class="hi-left">
                    <div class="hi-icon"><i class="fa-solid ${item.icon}"></i></div>
                    <div class="hi-details">
                        <h4>${item.name}</h4>
                        <span>${item.datetime}</span>
                    </div>
                </div>
                <div class="hi-amount ${amountClass}">${amountFormatted}</div>
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

// Notice Helper
function showDemoNotice(actionType) {
    notify(`${actionType} is disabled in demo mode.`);
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
