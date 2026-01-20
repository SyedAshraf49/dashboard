// Authentication JavaScript
const API_BASE_URL = 'http://localhost:5000';

// Check if user is already logged in
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/check-auth`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
            // User is logged in, redirect to dashboard
            if (window.location.pathname === '/login.html' || window.location.pathname === '/') {
                window.location.href = '/index.html';
            }
            return data.user;
        } else {
            // User is not logged in
            if (window.location.pathname !== '/login.html' && window.location.pathname !== '/') {
                window.location.href = '/login.html';
            }
            return null;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
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
        // Load saved username
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            usernameInput.value = savedUsername;
            rememberMe.checked = true;
        }
    }
});

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginButton = document.getElementById('loginButton');
    const buttonLoader = loginButton.querySelector('.button-loader');
    
    // Validation
    if (!username || !password) {
        showAlert('Please enter both username and password', 'error');
        return;
    }
    
    // Show loading state
    loginButton.classList.add('loading');
    buttonLoader.style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Save username if remember me is checked
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }
            
            // Show success message
            showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        } else {
            // Show error message
            showAlert(data.message || 'Login failed. Please try again.', 'error');
            loginButton.classList.remove('loading');
            buttonLoader.style.display = 'none';
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please check your connection.', 'error');
        loginButton.classList.remove('loading');
        buttonLoader.style.display = 'none';
    }
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
    
    // Auto-hide after 5 seconds for error messages
    if (type === 'error') {
        setTimeout(() => {
            alertMessage.style.display = 'none';
        }, 5000);
    }
}

// Logout function (to be used in dashboard pages)
async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        // Force redirect anyway
        window.location.href = '/login.html';
    }
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

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkAuth, logout };
}