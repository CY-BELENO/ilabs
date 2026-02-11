// Admin Schedule Management Functions

// Load all schedules
function loadAllSchedules() {
    const facultySchedule = JSON.parse(localStorage.getItem('facultySchedule') || '[]');
    displayAllSchedules(facultySchedule);
}

// Display all schedules
function displayAllSchedules(schedules) {
    const tbody = document.getElementById('schedulesTableBody');
    
    if (schedules.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-calendar-alt fa-2x mb-3 text-muted"></i>
                    <h5>No Schedule Data</h5>
                    <p class="mb-0">Add semester schedules using the "Add Schedule" button</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    schedules.forEach(schedule => {
        html += `
            <tr>
                <td><strong>${schedule.day_of_week}</strong></td>
                <td>${schedule.start_time} - ${schedule.end_time}</td>
                <td><span class="badge bg-secondary">Lab ${schedule.lab_id}</span></td>
                <td>
                    <strong>${schedule.course_code}</strong><br>
                    <small>${schedule.course_name}</small>
                </td>
                <td>${schedule.faculty_name}</td>
                <td><span class="badge bg-info">${schedule.section}</span></td>
                <td>
                    <button class="btn btn-action btn-edit me-2" onclick="editSchedule('${schedule.day_of_week}', ${schedule.lab_id}, '${schedule.start_time}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-action btn-delete" onclick="deleteSchedule('${schedule.day_of_week}', ${schedule.lab_id}, '${schedule.start_time}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Open add schedule modal
function openAddScheduleModal() {
    const modalHtml = `
        <div class="modal fade" id="addScheduleModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header card-header-admin">
                        <h5 class="modal-title">
                            <i class="fas fa-plus-circle"></i> Add Semester Schedule
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addScheduleForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Day of Week</label>
                                    <select class="form-select" id="newScheduleDay" required>
                                        <option value="">Select Day</option>
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Laboratory</label>
                                    <select class="form-select" id="newScheduleLab" required>
                                        <option value="">Select Lab</option>
                                        <option value="1">Lab 104</option>
                                        <option value="2">Lab 203</option>
                                        <option value="3">Lab 204</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Start Time</label>
                                    <input type="time" class="form-control" id="newScheduleStart" value="08:00" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">End Time</label>
                                    <input type="time" class="form-control" id="newScheduleEnd" value="10:00" required>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Course Code</label>
                                    <input type="text" class="form-control" id="newScheduleCourseCode" 
                                           placeholder="e.g., CS101, IT201" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Course Name</label>
                                    <input type="text" class="form-control" id="newScheduleCourseName" 
                                           placeholder="e.g., Intro to Programming" required>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Faculty Name</label>
                                    <input type="text" class="form-control" id="newScheduleFaculty" 
                                           placeholder="e.g., Dr. Juan Dela Cruz" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Section</label>
                                    <input type="text" class="form-control" id="newScheduleSection" 
                                           placeholder="e.g., A, B, C" required>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-admin w-100 btn-lg">
                                <i class="fas fa-save"></i> Save Schedule
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body if not exists
    if (!document.getElementById('addScheduleModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addScheduleModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('addScheduleForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNewSchedule();
    });
}

// Save new schedule
function saveNewSchedule() {
    const scheduleData = {
        day_of_week: document.getElementById('newScheduleDay').value,
        lab_id: parseInt(document.getElementById('newScheduleLab').value),
        start_time: document.getElementById('newScheduleStart').value,
        end_time: document.getElementById('newScheduleEnd').value,
        course_code: document.getElementById('newScheduleCourseCode').value,
        course_name: document.getElementById('newScheduleCourseName').value,
        faculty_name: document.getElementById('newScheduleFaculty').value,
        section: document.getElementById('newScheduleSection').value,
        created_at: new Date().toISOString()
    };
    
    // Get existing schedules
    const existingSchedules = JSON.parse(localStorage.getItem('facultySchedule') || '[]');
    
    // Check for schedule conflict
    const conflict = existingSchedules.find(schedule => 
        schedule.day_of_week === scheduleData.day_of_week &&
        schedule.lab_id === scheduleData.lab_id &&
        schedule.start_time === scheduleData.start_time
    );
    
    if (conflict) {
        alert('Schedule conflict! A schedule already exists for this lab at this time.');
        return;
    }
    
    // Add new schedule
    existingSchedules.push(scheduleData);
    localStorage.setItem('facultySchedule', JSON.stringify(existingSchedules));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addScheduleModal'));
    modal.hide();
    
    // Show success message
    showAdminSuccessMessage('Schedule added successfully!');
    
    // Refresh schedule list
    loadAllSchedules();
}

// Edit schedule
function editSchedule(day, labId, startTime) {
    alert(`Edit schedule for ${day}, Lab ${labId} at ${startTime}\nThis would open an edit modal.`);
    // Implementation would be similar to openAddScheduleModal with pre-filled data
}

// Delete schedule
function deleteSchedule(day, labId, startTime) {
    if (!confirm('Are you sure you want to delete this schedule?')) {
        return;
    }
    
    const existingSchedules = JSON.parse(localStorage.getItem('facultySchedule') || '[]');
    const updatedSchedules = existingSchedules.filter(schedule => 
        !(schedule.day_of_week === day && 
          schedule.lab_id == labId && 
          schedule.start_time === startTime)
    );
    
    localStorage.setItem('facultySchedule', JSON.stringify(updatedSchedules));
    
    showAdminSuccessMessage('Schedule deleted successfully!');
    loadAllSchedules();
}