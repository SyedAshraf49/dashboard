// Authentication JavaScript - Frontend Only Version

// Mock user database
const USERS = {
    admin1: { password: 'Admin@123', role: 'admin', name: 'Admin One' },
    admin2: { password: 'Admin@456', role: 'admin', name: 'Admin Two' },
    user1: { password: 'User@123', role: 'user', name: 'User One' },
    user2: { password: 'User@456', role: 'user', name: 'User Two' },
    user3: { password: 'User@789', role: 'user', name: 'User Three' },
    user4: { password: 'User@012', role: 'user', name: 'User Four' }
};

// Check if user is already logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const isLoginPage = window.location.pathname.includes('login.html') || 
                       window.location.pathname === '/' ||
                       window.location.pathname === '/index.html' && !currentUser;
    
    if (currentUser && isLoginPage) {
        window.location.href = 'index.html';
        return true;
    } else if (!currentUser && !isLoginPage && window.location.pathname !== '/') {
        window.location.href = 'login.html';
        return false;
    }
    
    return !!currentUser;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    
    // Check authentication status
    checkAuth();
    
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
    }
    
    // Remember me functionality
    const rememberMe = document.getElementById('rememberMe');
    const usernameInput = document.getElementById('username');
    
    if (rememberMe && usernameInput) {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            usernameInput.value = savedUsername;
            rememberMe.checked = true;
        }
    }
    
    // Credential click handlers
    const credentialItems = document.querySelectorAll('.credential-item');
    credentialItems.forEach(item => {
        item.addEventListener('click', function() {
            const username = this.dataset.username;
            const password = this.dataset.password;
            
            document.getElementById('username').value = username;
            document.getElementById('password').value = password;
            
            // Show visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
});

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginButton = document.getElementById('loginButton');
    const buttonLoader = loginButton.querySelector('.button-loader');
    
    if (!username || !password) {
        showAlert('Please enter both username and password', 'error');
        return;
    }
    
    // Show loading state
    loginButton.classList.add('loading');
    buttonLoader.style.display = 'block';
    
    // Simulate authentication delay
    setTimeout(() => {
        const user = USERS[username];
        
        if (!user || user.password !== password) {
            showAlert('Invalid username or password', 'error');
            loginButton.classList.remove('loading');
            buttonLoader.style.display = 'none';
            return;
        }
        
        // Save username if remember me is checked
        if (rememberMe) {
            localStorage.setItem('rememberedUsername', username);
        } else {
            localStorage.removeItem('rememberedUsername');
        }
        
        // Create session
        const session = {
            username: username,
            role: user.role,
            name: user.name,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(session));
        
        // Show success message
        showAlert('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }, 800);
}

// Show alert message
function showAlert(message, type = 'error') {
    const alertMessage = document.getElementById('alertMessage');
    const alertText = document.getElementById('alertText');
    
    if (!alertMessage || !alertText) return;
    
    alertText.textContent = message;
    alertMessage.className = 'alert-message';
    
    if (type === 'success') {
        alertMessage.classList.add('success');
    }
    
    alertMessage.style.display = 'flex';
    
    if (type === 'error') {
        setTimeout(() => {
            alertMessage.style.display = 'none';
        }, 5000);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Dark Mode Functions
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}