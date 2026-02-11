// =========================
// COMMON UTILITIES
// =========================

// Update current time
function updateTime() {
    const now = new Date();
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
        timeEl.textContent = now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }
}

// Update current year
function updateCurrentYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// =========================
// INITIALIZATION
// =========================

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update time and year
    updateTime();
    updateCurrentYear();
    
    // Start time updater
    setInterval(updateTime, 1000);
    
    // Auto-redirect for result pages after 5 seconds
    const resultBox = document.querySelector('.result-box');
    if (resultBox) {
        setTimeout(() => {
            window.location.href = 'faculty_dashboard.html';
        }, 5000);
    }
});

// =========================
// FACULTY DASHBOARD FUNCTIONS
// =========================

// Show day schedule
function showDaySchedule(day) {
    // Hide all day schedules
    document.querySelectorAll('.day-schedule').forEach(schedule => {
        schedule.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.day-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected day schedule
    const scheduleEl = document.getElementById('schedule-' + day);
    if (scheduleEl) {
        scheduleEl.classList.add('active');
    }
    
    // Activate selected tab
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Pre-select lab in booking form
function preSelectLab(labId) {
    const labSelect = document.querySelector('select[name="lab_id"]');
    if (labSelect) {
        labSelect.value = labId;
        
        // Scroll to booking form
        const bookForm = document.getElementById('bookForm');
        if (bookForm) {
            bookForm.scrollIntoView({
                behavior: 'smooth'
            });
        }
        
        // Highlight the selected lab
        labSelect.focus();
        labSelect.style.borderColor = '#800000';
        labSelect.style.boxShadow = '0 0 0 0.25rem rgba(128, 0, 0, 0.25)';
        
        // Reset after 3 seconds
        setTimeout(() => {
            labSelect.style.borderColor = '';
            labSelect.style.boxShadow = '';
        }, 3000);
    }
}

// Check availability (mock function)
function checkAvailability() {
    const labId = document.getElementById('checkLab').value;
    const date = document.getElementById('checkDate').value;
    const resultDiv = document.getElementById('availabilityResult');
    
    if (!resultDiv) return;
    
    resultDiv.innerHTML = '<div class="alert alert-info">Checking availability...</div>';
    
    // Mock API response
    setTimeout(() => {
        const labs = {
            '1': 'Lab 1',
            '2': 'Lab 2', 
            '3': 'Lab 3'
        };
        
        const labName = labs[labId] || 'Unknown Lab';
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Mock availability logic
        const isAvailable = Math.random() > 0.3;
        
        if (isAvailable) {
            resultDiv.innerHTML = `
                <div class="alert alert-success">
                    <strong><i class="fas fa-check-circle"></i> ${labName} is Available on ${date}</strong><br>
                    <strong>Available Time Slots:</strong><br>
                    • 08:00 AM - 10:00 AM<br>
                    • 10:00 AM - 12:00 PM<br>
                    • 01:00 PM - 03:00 PM<br>
                    <small class="text-muted">Day: ${dayName}</small>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="alert alert-danger">
                    <strong><i class="fas fa-times-circle"></i> ${labName} is Not Available on ${date}</strong><br>
                    <strong>Conflicts:</strong><br>
                    • Class: Data Structures (08:00 AM - 10:00 AM)<br>
                    • Booking: Project Meeting (01:00 PM - 03:00 PM)<br>
                    <small class="text-muted">Day: ${dayName}</small>
                </div>
            `;
        }
    }, 1000);
}

// Update date and time in dashboard
function updateDateTime() {
    updateTime();
    
    // Update current time every minute
    setInterval(updateTime, 60000);
}
