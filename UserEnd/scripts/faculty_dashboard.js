// Time display functions
function updateDateTime() {
    const now = new Date();
    
    // Format current time for lab status header
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

// Tab Navigation
function showDashboardTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.dashboard-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Activate selected tab button
    document.getElementById(tabName + 'TabBtn').classList.add('active');
    
    // Refresh data if needed
    if (tabName === 'labStatus') {
        loadLabStatus();
    } else if (tabName === 'semesterSchedule') {
        loadDayButtons();
    } else if (tabName === 'myBookings') {
        loadBookings();
    }
}

// Show success message
function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    const messageText = document.getElementById('successMessageText');
    
    messageText.textContent = message;
    successMessage.style.display = 'block';
    successMessage.classList.add('show');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideSuccessMessage();
    }, 5000);
}

// Hide success message
function hideSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.classList.remove('show');
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 300);
}

// Initialize dashboard data
document.addEventListener('DOMContentLoaded', function() {
    const facultyName = localStorage.getItem('facultyName') || 'Faculty';
    document.getElementById('facultyNameDisplay').textContent = facultyName;
    document.getElementById('footerFacultyName').textContent = facultyName;
    
    // Initialize time display
    updateDateTime();
    
    // Load initial data (My Schedule is default)
    loadDayButtons();
    loadLabStatus();
    loadBookings();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').value = today;
    document.getElementById('bookingDate').min = today;
    document.getElementById('availabilityDate').value = today;
    document.getElementById('modalBookingDate').value = today;
    document.getElementById('modalBookingDate').min = today;
    
    // Set current year in footer
    document.getElementById('footerYear').textContent = new Date().getFullYear();
    
    // Update time every second
    setInterval(updateDateTime, 1000);
    
    // Save faculty schedule for student portal
    saveFacultySchedule();
    
    // Initialize Bootstrap modal
    var bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    
    // Store modal instance globally
    window.bookingModalInstance = bookingModal;
    
    // Form handling for modal booking
    document.getElementById('bookingFormModal').addEventListener('submit', function(e) {
        e.preventDefault();
        submitBookingFromModal();
    });
    
    // Form handling for regular booking form
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitRegularBooking();
    });
});

// Mock data functions
function loadLabStatus() {
    const labs = [
        { id: 1, name: 'Lab 104', status: 'available', nextAvailable: 'Today 2:00 PM' },
        { id: 2, name: 'Lab 203', status: 'occupied', nextAvailable: 'Today 4:00 PM' },
        { id: 3, name: 'Lab 204', status: 'booked', nextAvailable: 'Tomorrow 9:00 AM' }
    ];
    
    let html = '';
    labs.forEach(lab => {
        const statusClass = lab.status === 'available' ? 'bg-success' : 
                        lab.status === 'occupied' ? 'bg-danger' : 'bg-warning';
        const statusText = lab.status.charAt(0).toUpperCase() + lab.status.slice(1);
        const cardClass = lab.status === 'available' ? 'available' : 
                        lab.status === 'occupied' ? 'occupied' : 'booked';
        
        html += `
            <div class="col-md-4">
                <div class="card room-status-card ${cardClass}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0 text-dark">
                                <i class="fas fa-desktop computer-icon" style="color: #800000;"></i> 
                                ${lab.name}
                            </h5>
                            <span class="badge ${statusClass} status-badge">${statusText}</span>
                        </div>
                        
                        <div class="text-center">
                            <p class="text-muted mb-2">
                                <i class="fas fa-clock"></i> Next Available: ${lab.nextAvailable}
                            </p>
                            
                            ${lab.status === 'available' ? 
                                `<button class="btn btn-sm btn-pup w-100" onclick="openBookingModal(${lab.id}, '${lab.name}')">
                                    <i class="fas fa-book"></i> Book This Lab Now
                                </button>` : 
                                `<button class="btn btn-sm btn-secondary w-100" onclick="openBookingModal(${lab.id}, '${lab.name}')">
                                    <i class="fas fa-calendar-plus"></i> Schedule Future Booking
                                </button>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('labStatusContainer').innerHTML = html;
}

// Open booking modal
function openBookingModal(labId, labName) {
    document.getElementById('modalLabId').value = labId;
    document.getElementById('modalLabName').value = labName;
    
    // Set default times
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('modalBookingDate').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('modalStartTime').value = '09:00';
    document.getElementById('modalEndTime').value = '11:00';
    document.getElementById('modalPurpose').value = '';
    
    // Show modal
    window.bookingModalInstance.show();
}

// Submit booking from modal
function submitBookingFromModal() {
    const labId = document.getElementById('modalLabId').value;
    const labName = document.getElementById('modalLabName').value;
    const date = document.getElementById('modalBookingDate').value;
    const startTime = document.getElementById('modalStartTime').value;
    const endTime = document.getElementById('modalEndTime').value;
    const purpose = document.getElementById('modalPurpose').value;
    
    if (!purpose) {
        alert('Please enter booking purpose');
        return;
    }
    
    // Get faculty data from localStorage
    const facultyName = localStorage.getItem('facultyName') || 'Professor';
    const facultyId = localStorage.getItem('facultyId') || '20041023';
    const facultyDept = localStorage.getItem('facultyDept') || 'DCpET';
    
    // Save booking to localStorage
    const bookingData = {
        lab_id: labId,
        lab_name: labName,
        faculty_name: facultyName,
        faculty_id: facultyId,
        faculty_dept: facultyDept,
        start_time: startTime,
        end_time: endTime,
        purpose: purpose,
        date: date,
        course_code: 'EXTRA',
        section: 'N/A',
        type: 'booking'
    };
    
    const existingBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    existingBookings.push({
        ...bookingData,
        id: Date.now(),
        created_at: new Date().toISOString(),
        status: 'approved'
    });
    localStorage.setItem('facultyBookings', JSON.stringify(existingBookings));
    
    // Close modal
    window.bookingModalInstance.hide();
    
    // Show success message
    showSuccessMessage(`Successfully booked ${labName} for ${date} (${startTime} - ${endTime})!`);
    
    // Switch to Lab Status tab
    setTimeout(() => {
        showDashboardTab('labStatus');
    }, 500);
    
    // Reset form
    document.getElementById('bookingFormModal').reset();
    
    // Refresh lab status and bookings
    setTimeout(() => {
        loadLabStatus();
        loadBookings();
    }, 1000);
}

// Submit regular booking form - FIXED VERSION
function submitRegularBooking() {
    const labId = document.getElementById('labSelect').value;
    const date = document.getElementById('bookingDate').value;
    const purpose = document.getElementById('purposeTextarea').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    if (!labId || !date || !purpose) {
        alert('Please fill all required fields');
        return;
    }
    
    // Get faculty data from localStorage
    const facultyName = localStorage.getItem('facultyName') || 'Professor';
    const facultyId = localStorage.getItem('facultyId') || '20041023';
    const facultyDept = localStorage.getItem('facultyDept') || 'DCpET';
    
    // Save booking to localStorage
    const bookingData = {
        lab_id: labId,
        lab_name: document.querySelector('#labSelect option:checked').textContent,
        faculty_name: facultyName,
        faculty_id: facultyId,
        faculty_dept: facultyDept,
        start_time: startTime,
        end_time: endTime,
        purpose: purpose,
        date: date,
        course_code: 'EXTRA',
        section: 'N/A',
        type: 'booking'
    };
    
    const existingBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    existingBookings.push({
        ...bookingData,
        id: Date.now(),
        created_at: new Date().toISOString(),
        status: 'approved'
    });
    localStorage.setItem('facultyBookings', JSON.stringify(existingBookings));
    
    // Show success message
    const labName = document.querySelector('#labSelect option:checked').textContent;
    showSuccessMessage(`Successfully booked ${labName} for ${date}!`);
    
    // Switch to Lab Status tab
    setTimeout(() => {
        showDashboardTab('labStatus');
    }, 500);
    
    // Reset form
    document.getElementById('bookingForm').reset();
    document.getElementById('bookingDate').value = new Date().toISOString().split('T')[0];
    
    // Refresh bookings and lab status
    setTimeout(() => {
        loadBookings();
        loadLabStatus();
    }, 1000);
}

// Refresh functions
function refreshLabStatus() {
    // Show loading
    const container = document.getElementById('labStatusContainer');
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-maroon" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Refreshing lab status...</p>
        </div>
    `;
    
    // Simulate API call
    setTimeout(() => {
        loadLabStatus();
    }, 1000);
}

function refreshBookings() {
    const loadingDiv = document.getElementById('bookingsLoading');
    const contentDiv = document.getElementById('bookingsContent');
    
    // Show loading
    loadingDiv.style.display = 'block';
    contentDiv.style.display = 'none';
    
    setTimeout(() => {
        loadBookings();
    }, 800);
}

// Load day buttons
function loadDayButtons() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    let buttonsHtml = '';
    days.forEach(day => {
        const isToday = day === today;
        const activeClass = isToday ? 'active' : '';
        const todayBadge = isToday ? '<span class="badge bg-success ms-1">Today</span>' : '';
        
        buttonsHtml += `
            <button type="button" class="btn btn-day ${activeClass}" onclick="showDaySchedule('${day}')">
                <i class="fas fa-calendar-day me-2"></i>${day}${todayBadge}
            </button>
        `;
    });
    
    document.getElementById('dayButtons').innerHTML = buttonsHtml;
    showDaySchedule(today);
}

// Show schedule for specific day
function showDaySchedule(day) {
    document.querySelectorAll('.btn-day').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(day)) {
            btn.classList.add('active');
        }
    });
    
    const scheduleData = getScheduleForDay(day);
    let scheduleHtml = '';
    
    if (scheduleData.length > 0) {
        scheduleHtml = generateScheduleTable(scheduleData, day);
    } else {
        scheduleHtml = `
            <div class="alert alert-secondary text-center py-4">
                <i class="fas fa-calendar-times fa-2x mb-3"></i>
                <h5>No classes scheduled on ${day}</h5>
                <p class="mb-0">You're free on this day</p>
            </div>
        `;
    }
    
    document.getElementById('scheduleDisplay').innerHTML = scheduleHtml;
}

// Get schedule data for specific day
function getScheduleForDay(day) {
    const scheduleData = {
        'Monday': [
            { time: '08:00 - 10:00', subject: 'CS101', name: 'Intro to Programming', lab: 'Lab 104', section: 'A' },
            { time: '10:00 - 12:00', subject: 'CS102', name: 'Data Structures', lab: 'Lab 104', section: 'B' },
            { time: '09:00 - 11:00', subject: 'IT101', name: 'Web Development', lab: 'Lab 203', section: 'D' },
            { time: '11:00 - 13:00', subject: 'CS301', name: 'AI Fundamentals', lab: 'Lab 204', section: 'F' }
        ],
        'Wednesday': [
            { time: '13:00 - 15:00', subject: 'CS201', name: 'Algorithms', lab: 'Lab 204', section: 'C' }
        ],
        'Tuesday': [],
        'Thursday': [],
        'Friday': []
    };
    
    return scheduleData[day] || [];
}

function generateScheduleTable(classes, day) {
    return `
        <div class="schedule-day-header mb-3">
            <h6 style="color: #800000;">
                <i class="fas fa-clock"></i> ${day} Schedule
                <span class="badge bg-primary ms-2">${classes.length} classes</span>
            </h6>
        </div>
        <div class="table-responsive">
            <table class="table table-bordered table-pup">
                <thead>
                    <tr>
                        <th width="25%">Time</th>
                        <th width="20%">Lab</th>
                        <th width="35%">Subject</th>
                        <th width="20%">Section</th>
                    </tr>
                </thead>
                <tbody>
                    ${classes.map(cls => `
                        <tr>
                            <td><span class="fw-bold">${cls.time}</span></td>
                            <td><span class="badge bg-secondary"><i class="fas fa-desktop computer-icon"></i> ${cls.lab}</span></td>
                            <td><strong>${cls.subject}</strong><br><small class="text-muted">${cls.name}</small></td>
                            <td><span class="badge badge-pup"><i class="fas fa-users"></i> ${cls.section}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    const loadingDiv = document.getElementById('bookingsLoading');
    const contentDiv = document.getElementById('bookingsContent');
    const tbody = document.getElementById('bookingsTableBody');
    
    // Show loading initially
    loadingDiv.style.display = 'block';
    contentDiv.style.display = 'none';
    
    // Simulate loading delay
    setTimeout(() => {
        let html = '';
        if (bookings.length === 0) {
            html = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-calendar-times fa-2x mb-3 text-muted"></i>
                        <h5>No Bookings Yet</h5>
                        <p class="mb-0">Book a lab room to see your reservations here</p>
                    </td>
                </tr>
            `;
        } else {
            // Sort bookings by date (newest first)
            bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            bookings.forEach(booking => {
                const statusColor = booking.status === 'approved' ? 'success' : 
                                booking.status === 'rejected' ? 'danger' : 'warning';
                
                html += `
                    <tr>
                        <td>
                            <strong>${formatDate(booking.date)}</strong><br>
                            <small class="text-muted">${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long' })}</small>
                        </td>
                        <td><span class="badge bg-secondary"><i class="fas fa-desktop computer-icon"></i> ${booking.lab_name}</span></td>
                        <td><i class="fas fa-clock"></i> ${booking.start_time} - ${booking.end_time}</td>
                        <td>${booking.purpose}</td>
                        <td><span class="badge bg-${statusColor}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-danger" onclick="cancelBooking(${booking.id})" ${booking.status === 'approved' ? '' : 'disabled'}>
                                <i class="fas fa-times"></i> Cancel
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
        
        tbody.innerHTML = html;
        loadingDiv.style.display = 'none';
        contentDiv.style.display = 'block';
    }, 500);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Cancel booking
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const bookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
        const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
        localStorage.setItem('facultyBookings', JSON.stringify(updatedBookings));
        loadBookings();
        showSuccessMessage('Booking cancelled successfully!');
    }
}

// Check availability for current form
function checkAvailabilityForCurrentForm() {
    const labId = document.getElementById('labSelect').value;
    const date = document.getElementById('bookingDate').value;
    
    if (!labId || !date) {
        alert('Please select a lab and date first');
        return;
    }
    
    const labName = document.getElementById('labSelect').options[document.getElementById('labSelect').selectedIndex].text;
    const result = checkAvailabilityInternal(labId, labName, date);
    
    alert(result.message);
    if (result.available) {
        // Auto-fill suggested times
        if (result.suggestedTimes && result.suggestedTimes.length > 0) {
            document.getElementById('startTime').value = result.suggestedTimes[0].start;
            document.getElementById('endTime').value = result.suggestedTimes[0].end;
        }
    }
}

// Perform availability check from availability tab
function performAvailabilityCheck() {
    const labId = document.getElementById('availabilityLab').value;
    const date = document.getElementById('availabilityDate').value;
    const timeSlot = document.getElementById('availabilityTime').value;
    
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    const resultsDiv = document.getElementById('availabilityResults');
    resultsDiv.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-maroon" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Checking availability...</p>
        </div>
    `;
    
    setTimeout(() => {
        displayAvailabilityResults(labId, date, timeSlot);
    }, 1500);
}

// Display availability results
function displayAvailabilityResults(labId, date, timeSlot) {
    const resultsDiv = document.getElementById('availabilityResults');
    const labs = [
        { id: 1, name: 'Lab 104' },
        { id: 2, name: 'Lab 203' },
        { id: 3, name: 'Lab 204' }
    ];
    
    let resultsHtml = '<h5 class="mb-3" style="color: #800000;"><i class="fas fa-clipboard-list"></i> Availability Results</h5>';
    
    if (labId === 'all') {
        // Check all labs
        labs.forEach(lab => {
            const result = checkAvailabilityInternal(lab.id, lab.name, date, timeSlot);
            resultsHtml += generateAvailabilityCard(lab, result, date);
        });
    } else {
        // Check specific lab
        const lab = labs.find(l => l.id == labId);
        if (lab) {
            const result = checkAvailabilityInternal(lab.id, lab.name, date, timeSlot);
            resultsHtml += generateAvailabilityCard(lab, result, date);
        }
    }
    
    resultsDiv.innerHTML = resultsHtml;
}

// Generate availability card
function generateAvailabilityCard(lab, result, date) {
    return `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="mb-0">
                        <i class="fas fa-desktop computer-icon" style="color: #800000;"></i> 
                        ${lab.name}
                    </h5>
                    <span class="badge ${result.available ? 'bg-success' : 'bg-warning'}">
                        ${result.available ? 'Available' : 'Limited Availability'}
                    </span>
                </div>
                
                <p class="mb-2"><strong>Date:</strong> ${date}</p>
                <p class="mb-3"><strong>Status:</strong> ${result.message}</p>
                
                ${result.suggestedTimes && result.suggestedTimes.length > 0 ? `
                    <div class="mb-3">
                        <strong>Suggested Time Slots:</strong>
                        <div class="row mt-2">
                            ${result.suggestedTimes.map(slot => `
                                <div class="col-md-6 mb-2">
                                    <div class="card bg-light">
                                        <div class="card-body py-2">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span><i class="fas fa-clock"></i> ${slot.start} - ${slot.end}</span>
                                                <button class="btn btn-sm btn-pup" onclick="quickBook('${lab.id}', '${lab.name}', '${date}', '${slot.start}', '${slot.end}')">
                                                    <i class="fas fa-book"></i> Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <button class="btn btn-pup-outline w-100" onclick="openBookingModal(${lab.id}, '${lab.name}')">
                    <i class="fas fa-calendar-plus"></i> Custom Booking
                </button>
            </div>
        </div>
    `;
}

// Quick book function
function quickBook(labId, labName, date, startTime, endTime) {
    if (confirm(`Book ${labName} on ${date} from ${startTime} to ${endTime}?`)) {
        // Get faculty data
        const facultyName = localStorage.getItem('facultyName') || 'Professor';
        const facultyId = localStorage.getItem('facultyId') || '20041023';
        const facultyDept = localStorage.getItem('facultyDept') || 'DCpET';
        
        // Save booking
        const bookingData = {
            lab_id: labId,
            lab_name: labName,
            faculty_name: facultyName,
            faculty_id: facultyId,
            faculty_dept: facultyDept,
            start_time: startTime,
            end_time: endTime,
            purpose: 'Quick Booking from Availability Check',
            date: date,
            course_code: 'EXTRA',
            section: 'N/A',
            type: 'booking',
            id: Date.now(),
            created_at: new Date().toISOString(),
            status: 'approved'
        };
        
        const existingBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
        existingBookings.push(bookingData);
        localStorage.setItem('facultyBookings', JSON.stringify(existingBookings));
        
        // Show success message
        showSuccessMessage(`Successfully booked ${labName} for ${date} (${startTime} - ${endTime})!`);
        
        // Switch to Lab Status tab
        setTimeout(() => {
            showDashboardTab('labStatus');
        }, 500);
        
        // Refresh data
        setTimeout(() => {
            loadLabStatus();
            loadBookings();
        }, 1000);
    }
}

// Internal availability check function
function checkAvailabilityInternal(labId, labName, date, timeSlot = 'all') {
    // Mock availability logic
    const isAvailable = Math.random() > 0.3;
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (isAvailable) {
        return {
            available: true,
            message: `${labName} is available on ${date} (${dayName})`,
            suggestedTimes: [
                { start: '09:00', end: '11:00' },
                { start: '14:00', end: '16:00' }
            ]
        };
    } else {
        return {
            available: false,
            message: `${labName} has limited availability on ${date} (${dayName})`,
            suggestedTimes: [
                { start: '08:00', end: '09:00' },
                { start: '16:00', end: '17:00' }
            ]
        };
    }
}

// Save faculty schedule for student portal
function saveFacultySchedule() {
    const facultySchedule = [
        // Lab 104 schedule
        { lab_id: 1, day_of_week: 'Monday', start_time: '08:00', end_time: '10:00', 
        course_code: 'CS101', course_name: 'Intro to Programming', faculty_name: 'Dr. Smith', section: 'A' },
        { lab_id: 1, day_of_week: 'Monday', start_time: '10:00', end_time: '12:00', 
        course_code: 'CS102', course_name: 'Data Structures', faculty_name: 'Prof. Johnson', section: 'B' },
        
        // Lab 203 schedule  
        { lab_id: 2, day_of_week: 'Monday', start_time: '09:00', end_time: '11:00', 
        course_code: 'IT101', course_name: 'Web Development', faculty_name: 'Prof. Davis', section: 'D' },
        
        // Lab 204 schedule
        { lab_id: 3, day_of_week: 'Monday', start_time: '11:00', end_time: '13:00', 
        course_code: 'CS301', course_name: 'AI Fundamentals', faculty_name: 'Dr. Wilson', section: 'F' },
        { lab_id: 3, day_of_week: 'Wednesday', start_time: '13:00', end_time: '15:00', 
        course_code: 'CS201', course_name: 'Algorithms', faculty_name: 'Dr. Williams', section: 'C' }
    ];
    
    localStorage.setItem('facultySchedule', JSON.stringify(facultySchedule));
}