// Admin Dashboard Main Functions

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check admin session
    if (!checkAdminSession()) {
        return;
    }
    
    // Set admin name
    const adminName = localStorage.getItem('adminName') || 'Administrator';
    document.getElementById('adminNameDisplay').textContent = adminName;
    document.getElementById('footerAdminName').textContent = adminName;
    
    // Initialize time display
    updateAdminDateTime();
    
    // Load initial data
    loadAdminOverview();
    loadAllUsers();
    loadAllLabsForAdmin();
    loadAllBookings();
    loadAllSchedules();
    
    // Set current year in footer
    document.getElementById('footerYear').textContent = new Date().getFullYear();
    
    // Update time every second
    setInterval(updateAdminDateTime, 1000);
    
    // Check for system alerts
    checkSystemAlerts();
});

// Time display functions for admin
function updateAdminDateTime() {
    const now = new Date();
    
    // Format current time for dashboard header
    const currentTimeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
    });
    
    // Format date and time for footer
    const currentDateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const footerTimeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
    });
    
    // Update all time displays
    document.getElementById('currentTime').textContent = currentTimeStr;
    document.getElementById('footerDateTime').textContent = `${currentDateStr} ${footerTimeStr}`;
}

// Tab Navigation for admin
function showAdminTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.admin-dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Activate selected tab button
    document.getElementById(tabName + 'TabBtn').classList.add('active');
    
    // Refresh data if needed
    switch(tabName) {
        case 'dashboardOverview':
            loadAdminOverview();
            break;
        case 'userManagement':
            loadAllUsers();
            break;
        case 'labManagement':
            loadAllLabsForAdmin();
            break;
        case 'bookingManagement':
            loadAllBookings();
            break;
        case 'scheduleManagement':
            loadAllSchedules();
            break;
        case 'reportsAnalytics':
            loadReports();
            break;
    }
}

// Load admin overview statistics
function loadAdminOverview() {
    // Calculate statistics
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    const facultySchedule = JSON.parse(localStorage.getItem('facultySchedule') || '[]');
    const labs = [
        { id: 1, name: 'Lab 104', status: 'available' },
        { id: 2, name: 'Lab 203', status: 'available' },
        { id: 3, name: 'Lab 204', status: 'available' }
    ];
    
    // Get faculty names from faculty bookings
    const facultyNames = [...new Set(facultyBookings.map(booking => booking.faculty_name))];
    
    // Today's date
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = facultyBookings.filter(booking => booking.date === today);
    
    // Update stats
    document.getElementById('totalUsers').textContent = adminUsers.length + facultyNames.length;
    document.getElementById('totalLabs').textContent = labs.length;
    document.getElementById('totalBookings').textContent = facultyBookings.length;
    document.getElementById('todayBookings').textContent = todayBookings.length;
    
    // Load system alerts
    loadSystemAlerts();
    
    // Load recent activities
    loadRecentActivities();
}

// Load system alerts
function loadSystemAlerts() {
    const alertsContainer = document.getElementById('systemAlerts');
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    
    // Count pending bookings
    const pendingBookings = facultyBookings.filter(booking => booking.status === 'pending');
    
    let alertsHtml = '';
    
    if (pendingBookings.length > 0) {
        alertsHtml += `
            <div class="alert alert-warning d-flex align-items-center mb-3">
                <i class="fas fa-exclamation-triangle me-3 fa-2x"></i>
                <div>
                    <strong>${pendingBookings.length} pending booking(s)</strong>
                    <p class="mb-0">Need approval in Booking Management</p>
                </div>
            </div>
        `;
    }
    
    // Check for upcoming bookings today
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = facultyBookings.filter(booking => booking.date === today && booking.status === 'approved');
    
    if (todayBookings.length > 0) {
        alertsHtml += `
            <div class="alert alert-info d-flex align-items-center mb-3">
                <i class="fas fa-calendar-check me-3 fa-2x"></i>
                <div>
                    <strong>${todayBookings.length} booking(s) today</strong>
                    <p class="mb-0">Check today's schedule</p>
                </div>
            </div>
        `;
    }
    
    // Check for any issues
    const facultySchedule = JSON.parse(localStorage.getItem('facultySchedule') || '[]');
    if (facultySchedule.length === 0) {
        alertsHtml += `
            <div class="alert alert-danger d-flex align-items-center mb-3">
                <i class="fas fa-exclamation-circle me-3 fa-2x"></i>
                <div>
                    <strong>No schedule data</strong>
                    <p class="mb-0">Add semester schedules in Schedule Management</p>
                </div>
            </div>
        `;
    }
    
    if (alertsHtml === '') {
        alertsHtml = `
            <div class="alert alert-success d-flex align-items-center">
                <i class="fas fa-check-circle me-3 fa-2x"></i>
                <div>
                    <strong>All systems operational</strong>
                    <p class="mb-0">No alerts at this time</p>
                </div>
            </div>
        `;
    }
    
    alertsContainer.innerHTML = alertsHtml;
}

// Load recent activities
function loadRecentActivities() {
    const activitiesContainer = document.getElementById('recentActivities');
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    
    // Sort bookings by creation date (newest first)
    const recentBookings = [...facultyBookings]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    let activitiesHtml = '';
    
    if (recentBookings.length > 0) {
        recentBookings.forEach(booking => {
            const timeAgo = getTimeAgo(booking.created_at);
            const statusColor = booking.status === 'approved' ? 'success' : 
                              booking.status === 'rejected' ? 'danger' : 'warning';
            
            activitiesHtml += `
                <div class="activity-item mb-3 pb-3 border-bottom">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <strong>${booking.faculty_name}</strong>
                        <span class="badge bg-${statusColor}">${booking.status}</span>
                    </div>
                    <p class="mb-1">Booked ${booking.lab_name} for ${formatDate(booking.date)}</p>
                    <small class="text-muted">
                        <i class="fas fa-clock"></i> ${timeAgo}
                    </small>
                </div>
            `;
        });
    } else {
        activitiesHtml = `
            <div class="text-center py-4">
                <i class="fas fa-calendar-times fa-3x mb-3 text-muted"></i>
                <p class="mb-0">No recent activities</p>
            </div>
        `;
    }
    
    activitiesContainer.innerHTML = activitiesHtml;
}

// Helper function to get time ago
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
    
    return "just now";
}

// Check system alerts
function checkSystemAlerts() {
    // This function can be expanded to check for various system issues
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    const pendingBookings = facultyBookings.filter(booking => booking.status === 'pending');
    
    if (pendingBookings.length > 0) {
        // You could implement desktop notifications here
        console.log(`There are ${pendingBookings.length} pending bookings that need approval.`);
    }
}

// Show admin success message
function showAdminSuccessMessage(message) {
    const successMessage = document.getElementById('adminSuccessMessage');
    const messageText = document.getElementById('adminSuccessMessageText');
    
    messageText.textContent = message;
    successMessage.style.display = 'block';
    successMessage.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideAdminSuccessMessage();
    }, 5000);
}

// Hide admin success message
function hideAdminSuccessMessage() {
    const successMessage = document.getElementById('adminSuccessMessage');
    successMessage.classList.remove('show');
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 300);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Admin logout function
function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminName');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminId');
        
        // Only remove remember me if not checked
        if (localStorage.getItem('adminRememberMe') !== 'true') {
            localStorage.removeItem('adminUsername');
        }
        
        window.location.href = 'index.html';
    }
}

// Check admin session
function checkAdminSession() {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isAdminLoggedIn && window.location.pathname.includes('admin_dashboard.html')) {
        window.location.href = 'admin_login.html';
        return false;
    }
    
    return true;
}