// Admin Login Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is already logged in
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isAdminLoggedIn && window.location.pathname.includes('admin_login.html')) {
        window.location.href = 'admin_dashboard.html';
    }
    
    // Handle admin login form submission
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        adminLogin();
    });
    
    // Set default admin credentials if not exists
    initializeAdminCredentials();
});

// Initialize default admin credentials
function initializeAdminCredentials() {
    if (!localStorage.getItem('adminUsers')) {
        const defaultAdmin = [{
            id: 1,
            username: 'admin',
            password: 'admin123', // In real system, this should be hashed
            name: 'System Administrator',
            email: 'admin@ilabs.pup.edu.ph',
            role: 'superadmin',
            department: 'IT Department',
            created_at: new Date().toISOString(),
            last_login: null,
            status: 'active'
        }];
        localStorage.setItem('adminUsers', JSON.stringify(defaultAdmin));
    }
}

// Admin login function
function adminLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
        showAdminLoginError('Please enter both username and password');
        return;
    }
    
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const admin = adminUsers.find(user => 
        user.username === username && user.password === password && user.status === 'active'
    );
    
    if (admin) {
        // Update last login
        admin.last_login = new Date().toISOString();
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        
        // Store admin session
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminName', admin.name);
        localStorage.setItem('adminRole', admin.role);
        localStorage.setItem('adminId', admin.id);
        
        // If remember me is checked, store for longer duration
        if (rememberMe) {
            localStorage.setItem('adminRememberMe', 'true');
            localStorage.setItem('adminUsername', username);
        } else {
            localStorage.removeItem('adminRememberMe');
            localStorage.removeItem('adminUsername');
        }
        
        // Show success and redirect
        showAdminLoginSuccess('Login successful! Redirecting to admin dashboard...');
        
        setTimeout(() => {
            window.location.href = 'admin_dashboard.html';
        }, 1500);
        
    } else {
        showAdminLoginError('Invalid username or password. Please try again.');
    }
}

// Show admin login error
function showAdminLoginError(message) {
    // You can implement a nice error display here
    alert(message); // For now, using alert. You can replace with modal/toast
}

// Show admin login success
function showAdminLoginSuccess(message) {
    // Create success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success alert-dismissible fade show';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert after form
    const form = document.getElementById('adminLoginForm');
    form.parentNode.insertBefore(successDiv, form.nextSibling);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Admin logout function (to be called from dashboard)
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminId');
    
    // Only remove remember me if not checked
    if (localStorage.getItem('adminRememberMe') !== 'true') {
        localStorage.removeItem('adminUsername');
    }
    
    window.location.href = 'admin_login.html';
}

// Check admin session (to be called on dashboard pages)
function checkAdminSession() {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isAdminLoggedIn && window.location.pathname.includes('admin_dashboard.html')) {
        window.location.href = 'admin_login.html';
    }
    
    return isAdminLoggedIn;
}