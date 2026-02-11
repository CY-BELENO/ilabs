// Function to update time displays
function updateTodayInfo() {
    const now = new Date();
    
    // Show day, date, AND time
    const dayStr = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    // Update today info with day, date, AND time
    document.getElementById('todayInfo').innerHTML = 
        `<strong>${dayStr}</strong> | ${dateStr} | <i class="fas fa-clock"></i> ${timeStr}`;
}

// Function to load schedules - REFLECTS FACULTY DASHBOARD
function loadSchedules() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    // 1. Get faculty bookings from localStorage
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    
    // 2. Get faculty schedule from localStorage (matching faculty dashboard)
    const facultySchedule = JSON.parse(localStorage.getItem('facultySchedule') || '[]');
    
    // 3. Base lab information
    const labs = [
        { id: 1, name: 'Lab 104', status: 'available' },
        { id: 2, name: 'Lab 203', status: 'available' },
        { id: 3, name: 'Lab 204', status: 'available' }
    ];

    // Process each lab
    labs.forEach(lab => {
        lab.classes = [];
        
        // A. Add REGULAR semester schedule from faculty dashboard
        // This matches what faculty sees in their "My Semester Schedule"
        facultySchedule.forEach(schedule => {
            if (schedule.lab_id == lab.id && schedule.day_of_week === dayOfWeek) {
                lab.classes.push({
                    time: `${schedule.start_time} - ${schedule.end_time}`,
                    subject: schedule.course_code || schedule.subject,
                    code: schedule.course_name || schedule.code,
                    professor: schedule.faculty_name || schedule.professor || 'Faculty',
                    section: schedule.section,
                    type: 'regular'
                });
            }
        });
        
        // B. Add TODAY'S faculty bookings
        facultyBookings.forEach(booking => {
            if (booking.lab_id == lab.id && booking.date === todayStr) {
                lab.classes.push({
                    time: `${booking.start_time} - ${booking.end_time}`,
                    subject: booking.course_code || 'EXTRA CLASS',
                    code: booking.purpose || 'Faculty Booking',
                    professor: booking.faculty_name || 'Faculty',
                    section: booking.section || 'N/A',
                    type: 'booking',
                    booking_id: booking.id
                });
            }
        });
        
        // C. If no schedule found, add demo data (for initial setup)
        if (lab.classes.length === 0) {
            // Default demo schedule that matches faculty dashboard
            if (lab.id === 1 && dayOfWeek === 'Monday') {
                lab.classes.push(
                    { time: '08:00 - 10:00', subject: 'CS101', code: 'Intro to Programming', professor: 'Dr. Smith', section: 'A', type: 'regular' },
                    { time: '10:00 - 12:00', subject: 'CS102', code: 'Data Structures', professor: 'Prof. Johnson', section: 'B', type: 'regular' }
                );
            } else if (lab.id === 2 && dayOfWeek === 'Monday') {
                lab.classes.push(
                    { time: '09:00 - 11:00', subject: 'IT101', code: 'Web Development', professor: 'Prof. Davis', section: 'D', type: 'regular' }
                );
            } else if (lab.id === 3 && (dayOfWeek === 'Monday' || dayOfWeek === 'Wednesday')) {
                lab.classes.push(
                    { time: '11:00 - 13:00', subject: 'CS301', code: 'AI Fundamentals', professor: 'Dr. Wilson', section: 'F', type: 'regular' }
                );
            }
        }
        
        // Sort classes by start time
        lab.classes.sort((a, b) => {
            const getTime = (timeStr) => parseInt(timeStr.split(' - ')[0].replace(':', ''));
            return getTime(a.time) - getTime(b.time);
        });
        
        // Update lab status based on current time
        const currentTime = new Date().toTimeString().split(' ')[0];
        const hasCurrentClass = lab.classes.some(cls => {
            const [start, end] = cls.time.split(' - ');
            return currentTime >= start && currentTime <= end;
        });
        
        lab.status = hasCurrentClass ? 'occupied' : 
                     lab.classes.length > 0 ? 'booked' : 'available';
    });
    
    displaySchedules(labs);
}

// Function to display schedules
function displaySchedules(labs) {
    const labsContainer = document.getElementById('labsContainer');
    const noDataMessage = document.getElementById('noDataMessage');
    
    if (!labs || labs.length === 0) {
        labsContainer.innerHTML = '';
        noDataMessage.style.display = 'block';
        return;
    }
    
    noDataMessage.style.display = 'none';
    labsContainer.innerHTML = '';
    
    const currentTime = new Date().toTimeString().split(' ')[0];
    
    labs.forEach(lab => {
        const labCard = document.createElement('div');
        labCard.className = 'col-md-4 mb-4';
        
        let classesHtml = '';
        
        if (lab.classes && lab.classes.length > 0) {
            lab.classes.forEach(cls => {
                const [startTime] = cls.time.split(' - ');
                const isCurrent = currentTime >= startTime && currentTime <= cls.time.split(' - ')[1];
                const currentClass = isCurrent ? 'current-class' : '';
                const bookingBadge = cls.type === 'booking' ? 
                    '<span class="badge bg-warning float-end"><i class="fas fa-book"></i> Extra Class</span>' : '';
                
                classesHtml += `
                    <div class="class-slot ${currentClass}">
                        <div class="d-flex justify-content-between mb-2">
                            <strong>${cls.time}</strong>
                            ${isCurrent ? '<span class="badge bg-success"><i class="fas fa-play-circle"></i> Now</span>' : bookingBadge}
                        </div>
                        <div>
                            <strong>${cls.subject}</strong><br>
                            <small>${cls.code}</small><br>
                            <small class="text-muted">
                                <i class="fas fa-user-tie"></i> ${cls.professor}
                            </small>
                            <div class="mt-2">
                                <small><i class="fas fa-users"></i> Section: ${cls.section}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            classesHtml = `
                <div class="alert alert-info text-center py-4">
                    <i class="fas fa-calendar-times fa-2x mb-3"></i>
                    <h6>No classes scheduled today</h6>
                    <p class="mb-0">This lab is available all day</p>
                </div>
            `;
        }
        
        labCard.innerHTML = `
            <div class="card lab-card">
                <div class="lab-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h4 class="mb-0">
                            <i class="fas fa-desktop me-2"></i> ${lab.name}
                        </h4>
                        <span class="badge ${lab.status === 'available' ? 'bg-success' : lab.status === 'occupied' ? 'bg-danger' : 'bg-warning'}">
                            ${lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
                        </span>
                    </div>
                </div>
                
                <div class="card-body">
                    <h6 class="mb-3" style="color: #800000;">
                        <i class="fas fa-clock"></i> Today's Schedule
                    </h6>
                    ${classesHtml}
                </div>
                
                <div class="card-footer text-center">
                    <small class="text-muted">
                        <i class="fas fa-info-circle"></i> 
                        Updated: <span class="update-time">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </small>
                </div>
            </div>
        `;
        
        labsContainer.appendChild(labCard);
    });
}

// Function to refresh schedules
function refreshSchedules() {
    const refreshButton = document.getElementById('refreshButton');
    const icon = refreshButton.querySelector('i');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Show loading
    loadingIndicator.style.display = 'block';
    refreshButton.disabled = true;
    const originalIcon = icon.className;
    icon.className = 'fas fa-spinner';
    
    // Refresh after short delay
    setTimeout(() => {
        loadSchedules();
        loadingIndicator.style.display = 'none';
        refreshButton.disabled = false;
        icon.className = originalIcon;
        
        // Show success briefly
        const originalText = refreshButton.innerHTML;
        refreshButton.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            refreshButton.innerHTML = originalText;
        }, 1000);
    }, 500);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize time display
    updateTodayInfo();
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Update time every minute
    setInterval(updateTodayInfo, 60000);
    
    // Load schedules
    loadSchedules();
    
    // Update lab times every minute
    setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        document.querySelectorAll('.update-time').forEach(span => {
            span.textContent = timeString;
        });
    }, 60000);
});