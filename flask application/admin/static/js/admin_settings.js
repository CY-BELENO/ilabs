// Admin System Settings Functions

// Initialize system settings
document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings when settings tab is shown
    const settingsTabBtn = document.getElementById('systemSettingsTabBtn');
    if (settingsTabBtn) {
        settingsTabBtn.addEventListener('click', loadSystemSettings);
    }
    
    // Load settings on page load if we're already in settings tab
    if (document.getElementById('systemSettingsTab')?.classList.contains('active')) {
        loadSystemSettings();
    }
    
    // Handle form submission
    const settingsForm = document.getElementById('systemSettingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveSystemSettings);
    }
});

// Load system settings from localStorage
function loadSystemSettings() {
    // Load notification settings
    const emailNotifications = localStorage.getItem('adminEmailNotifications') === 'true';
    const smsNotifications = localStorage.getItem('adminSmsNotifications') === 'true';
    
    document.getElementById('emailNotifications').checked = emailNotifications;
    document.getElementById('smsNotifications').checked = smsNotifications;
    
    // Load booking settings
    document.getElementById('maxBookingDays').value = localStorage.getItem('adminMaxBookingDays') || '30';
    document.getElementById('minBookingHours').value = localStorage.getItem('adminMinBookingHours') || '1';
    
    // Load security settings
    document.getElementById('sessionTimeout').value = localStorage.getItem('adminSessionTimeout') || '30';
    document.getElementById('maxLoginAttempts').value = localStorage.getItem('adminMaxLoginAttempts') || '3';
    
    // Load any additional saved settings
    loadAdditionalSettings();
}

// Save system settings to localStorage
function saveSystemSettings(event) {
    event.preventDefault();
    
    // Save notification settings
    localStorage.setItem('adminEmailNotifications', document.getElementById('emailNotifications').checked);
    localStorage.setItem('adminSmsNotifications', document.getElementById('smsNotifications').checked);
    
    // Save booking settings
    localStorage.setItem('adminMaxBookingDays', document.getElementById('maxBookingDays').value);
    localStorage.setItem('adminMinBookingHours', document.getElementById('minBookingHours').value);
    
    // Save security settings
    localStorage.setItem('adminSessionTimeout', document.getElementById('sessionTimeout').value);
    localStorage.setItem('adminMaxLoginAttempts', document.getElementById('maxLoginAttempts').value);
    
    // Save additional settings
    saveAdditionalSettings();
    
    // Show success message
    showAdminSuccessMessage('System settings saved successfully!');
    
    // Log settings change
    logSettingsChange();
}

// Load additional custom settings
function loadAdditionalSettings() {
    // Theme settings
    const theme = localStorage.getItem('adminTheme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Language settings
    const language = localStorage.getItem('adminLanguage') || 'en';
    
    // Time format settings
    const timeFormat = localStorage.getItem('adminTimeFormat') || '12';
    
    // Date format settings
    const dateFormat = localStorage.getItem('adminDateFormat') || 'MM/DD/YYYY';
    
    // You could add form elements for these if needed
}

// Save additional custom settings
function saveAdditionalSettings() {
    // These would be saved from additional form elements
    // For now, we'll just save some defaults
    localStorage.setItem('adminTheme', 'light');
    localStorage.setItem('adminLanguage', 'en');
    localStorage.setItem('adminTimeFormat', '12');
    localStorage.setItem('adminDateFormat', 'MM/DD/YYYY');
}

// Log settings change activity
function logSettingsChange() {
    const adminName = localStorage.getItem('adminName') || 'Administrator';
    const timestamp = new Date().toISOString();
    
    // Create activity log entry
    const activityLog = {
        action: 'settings_update',
        admin: adminName,
        timestamp: timestamp,
        details: 'System settings were updated'
    };
    
    // Save to localStorage (could be expanded to save to an array of activities)
    localStorage.setItem('lastSettingsUpdate', JSON.stringify(activityLog));
}

// Reset to default settings
function resetToDefaultSettings() {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
        // Clear all settings from localStorage
        const keysToRemove = [
            'adminEmailNotifications',
            'adminSmsNotifications',
            'adminMaxBookingDays',
            'adminMinBookingHours',
            'adminSessionTimeout',
            'adminMaxLoginAttempts',
            'adminTheme',
            'adminLanguage',
            'adminTimeFormat',
            'adminDateFormat',
            'lastSettingsUpdate'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Reload settings form
        loadSystemSettings();
        
        showAdminSuccessMessage('Settings reset to default successfully!');
    }
}

// Export settings
function exportSettings() {
    const settings = {};
    
    // Collect all settings
    settings.notifications = {
        email: localStorage.getItem('adminEmailNotifications') === 'true',
        sms: localStorage.getItem('adminSmsNotifications') === 'true'
    };
    
    settings.booking = {
        maxDays: parseInt(localStorage.getItem('adminMaxBookingDays') || '30'),
        minHours: parseFloat(localStorage.getItem('adminMinBookingHours') || '1')
    };
    
    settings.security = {
        sessionTimeout: parseInt(localStorage.getItem('adminSessionTimeout') || '30'),
        maxLoginAttempts: parseInt(localStorage.getItem('adminMaxLoginAttempts') || '3')
    };
    
    settings.theme = localStorage.getItem('adminTheme') || 'light';
    settings.language = localStorage.getItem('adminLanguage') || 'en';
    settings.timeFormat = localStorage.getItem('adminTimeFormat') || '12';
    settings.dateFormat = localStorage.getItem('adminDateFormat') || 'MM/DD/YYYY';
    
    // Create JSON file for download
    const jsonString = JSON.stringify(settings, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_settings_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Import settings from JSON file
function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const settings = JSON.parse(e.target.result);
                importSettingsFromObject(settings);
                showAdminSuccessMessage('Settings imported successfully!');
            } catch (error) {
                alert('Error importing settings: Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Import settings from object
function importSettingsFromObject(settings) {
    // Import notification settings
    if (settings.notifications) {
        localStorage.setItem('adminEmailNotifications', settings.notifications.email || false);
        localStorage.setItem('adminSmsNotifications', settings.notifications.sms || false);
    }
    
    // Import booking settings
    if (settings.booking) {
        localStorage.setItem('adminMaxBookingDays', settings.booking.maxDays || 30);
        localStorage.setItem('adminMinBookingHours', settings.booking.minHours || 1);
    }
    
    // Import security settings
    if (settings.security) {
        localStorage.setItem('adminSessionTimeout', settings.security.sessionTimeout || 30);
        localStorage.setItem('adminMaxLoginAttempts', settings.security.maxLoginAttempts || 3);
    }
    
    // Import theme and other settings
    if (settings.theme) localStorage.setItem('adminTheme', settings.theme);
    if (settings.language) localStorage.setItem('adminLanguage', settings.language);
    if (settings.timeFormat) localStorage.setItem('adminTimeFormat', settings.timeFormat);
    if (settings.dateFormat) localStorage.setItem('adminDateFormat', settings.dateFormat);
    
    // Reload form
    loadSystemSettings();
}

// System maintenance functions
function clearCache() {
    if (confirm('Clear browser cache for this application?')) {
        // Clear localStorage items except essential ones
        const essentialKeys = ['adminUsers', 'facultyBookings', 'facultySchedule', 'adminLabs'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (!essentialKeys.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        showAdminSuccessMessage('Cache cleared successfully!');
    }
}

function exportDatabase() {
    // Export all data to JSON
    const database = {
        adminUsers: JSON.parse(localStorage.getItem('adminUsers') || '[]'),
        facultyBookings: JSON.parse(localStorage.getItem('facultyBookings') || '[]'),
        facultySchedule: JSON.parse(localStorage.getItem('facultySchedule') || '[]'),
        adminLabs: JSON.parse(localStorage.getItem('adminLabs') || '[]'),
        systemSettings: getCurrentSettingsObject()
    };
    
    const jsonString = JSON.stringify(database, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ilabs_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function getCurrentSettingsObject() {
    return {
        notifications: {
            email: localStorage.getItem('adminEmailNotifications') === 'true',
            sms: localStorage.getItem('adminSmsNotifications') === 'true'
        },
        booking: {
            maxDays: parseInt(localStorage.getItem('adminMaxBookingDays') || '30'),
            minHours: parseFloat(localStorage.getItem('adminMinBookingHours') || '1')
        },
        security: {
            sessionTimeout: parseInt(localStorage.getItem('adminSessionTimeout') || '30'),
            maxLoginAttempts: parseInt(localStorage.getItem('adminMaxLoginAttempts') || '3')
        },
        theme: localStorage.getItem('adminTheme') || 'light',
        language: localStorage.getItem('adminLanguage') || 'en',
        timeFormat: localStorage.getItem('adminTimeFormat') || '12',
        dateFormat: localStorage.getItem('adminDateFormat') || 'MM/DD/YYYY'
    };
}

// Initialize settings tab with additional buttons
function initSettingsTab() {
    // Add export/import buttons dynamically
    const settingsForm = document.getElementById('systemSettingsForm');
    if (settingsForm) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'row mt-4';
        buttonContainer.innerHTML = `
            <div class="col-md-4 mb-3">
                <button type="button" class="btn btn-admin-outline w-100" onclick="resetToDefaultSettings()">
                    <i class="fas fa-undo"></i> Reset to Default
                </button>
            </div>
            <div class="col-md-4 mb-3">
                <button type="button" class="btn btn-admin-outline w-100" onclick="exportSettings()">
                    <i class="fas fa-file-export"></i> Export Settings
                </button>
            </div>
            <div class="col-md-4 mb-3">
                <button type="button" class="btn btn-admin-outline w-100" onclick="importSettings()">
                    <i class="fas fa-file-import"></i> Import Settings
                </button>
            </div>
            <div class="col-md-6 mb-3">
                <button type="button" class="btn btn-warning w-100" onclick="clearCache()">
                    <i class="fas fa-broom"></i> Clear Cache
                </button>
            </div>
            <div class="col-md-6 mb-3">
                <button type="button" class="btn btn-success w-100" onclick="exportDatabase()">
                    <i class="fas fa-database"></i> Backup Database
                </button>
            </div>
        `;
        
        settingsForm.appendChild(buttonContainer);
    }
}

// Call initialization when settings tab is shown
document.addEventListener('DOMContentLoaded', initSettingsTab);