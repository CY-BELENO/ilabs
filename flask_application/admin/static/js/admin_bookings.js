// Admin Booking Management Functions

// Load all bookings
function loadAllBookings() {
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    displayAllBookings(facultyBookings);
}

// Display all bookings in admin table
function displayAllBookings(bookings) {
    const tbody = document.getElementById('adminBookingsTableBody');
    
    if (bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <i class="fas fa-calendar-times fa-2x mb-3 text-muted"></i>
                    <h5>No Bookings Found</h5>
                    <p class="mb-0">No booking requests have been made yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by date (newest first)
    bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let html = '';
    bookings.forEach(booking => {
        const statusColor = booking.status === 'approved' ? 'success' : 
                          booking.status === 'pending' ? 'warning' : 'danger';
        const statusText = booking.status === 'approved' ? 'Approved' : 
                          booking.status === 'pending' ? 'Pending' : 'Rejected';
        
        html += `
            <tr>
                <td><small>#${booking.id}</small></td>
                <td>
                    <strong>${formatDate(booking.date)}</strong><br>
                    <small class="text-muted">${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long' })}</small>
                </td>
                <td><span class="badge bg-secondary"><i class="fas fa-desktop"></i> ${booking.lab_name}</span></td>
                <td>${booking.faculty_name}</td>
                <td>${booking.start_time} - ${booking.end_time}</td>
                <td>${booking.purpose.substring(0, 50)}${booking.purpose.length > 50 ? '...' : ''}</td>
                <td><span class="badge bg-${statusColor}">${statusText}</span></td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        ${booking.status === 'pending' ? `
                            <button class="btn btn-outline-success" onclick="approveBooking(${booking.id})" title="Approve">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="rejectBooking(${booking.id})" title="Reject">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-outline-info" onclick="viewBookingDetails(${booking.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning" onclick="editBooking(${booking.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Filter bookings
function filterBookings() {
    const statusFilter = document.getElementById('bookingStatusFilter').value;
    const dateFilter = document.getElementById('bookingDateFilter').value;
    const labFilter = document.getElementById('bookingLabFilter').value;
    
    let facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    
    // Apply filters
    if (statusFilter !== 'all') {
        facultyBookings = facultyBookings.filter(booking => booking.status === statusFilter);
    }
    
    if (dateFilter) {
        facultyBookings = facultyBookings.filter(booking => booking.date === dateFilter);
    }
    
    if (labFilter !== 'all') {
        facultyBookings = facultyBookings.filter(booking => booking.lab_id == labFilter);
    }
    
    displayAllBookings(facultyBookings);
}

// Refresh all bookings
function refreshAllBookings() {
    loadAllBookings();
    showAdminSuccessMessage('Bookings refreshed successfully!');
}

// Approve booking
function approveBooking(bookingId) {
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    const bookingIndex = facultyBookings.findIndex(booking => booking.id === bookingId);
    
    if (bookingIndex !== -1) {
        facultyBookings[bookingIndex].status = 'approved';
        facultyBookings[bookingIndex].approved_by = localStorage.getItem('adminName') || 'Admin';
        facultyBookings[bookingIndex].approved_at = new Date().toISOString();
        
        localStorage.setItem('facultyBookings', JSON.stringify(facultyBookings));
        
        showAdminSuccessMessage('Booking approved successfully!');
        loadAllBookings();
    }
}

// Reject booking
function rejectBooking(bookingId) {
    if (!confirm('Are you sure you want to reject this booking request?')) {
        return;
    }
    
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    const bookingIndex = facultyBookings.findIndex(booking => booking.id === bookingId);
    
    if (bookingIndex !== -1) {
        facultyBookings[bookingIndex].status = 'rejected';
        facultyBookings[bookingIndex].rejected_by = localStorage.getItem('adminName') || 'Admin';
        facultyBookings[bookingIndex].rejected_at = new Date().toISOString();
        facultyBookings[bookingIndex].rejection_reason = prompt('Please enter reason for rejection:', 'Schedule conflict');
        
        localStorage.setItem('facultyBookings', JSON.stringify(facultyBookings));
        
        showAdminSuccessMessage('Booking rejected successfully!');
        loadAllBookings();
    }
}

// View booking details
function viewBookingDetails(bookingId) {
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    const booking = facultyBookings.find(b => b.id === bookingId);
    
    if (!booking) {
        alert('Booking not found!');
        return;
    }
    
    const date = new Date(booking.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const createdDate = new Date(booking.created_at);
    const statusColor = booking.status === 'approved' ? 'success' : 
                      booking.status === 'pending' ? 'warning' : 'danger';
    
    const detailsHtml = `
        <div class="modal fade" id="bookingDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header card-header-admin">
                        <h5 class="modal-title">
                            <i class="fas fa-info-circle"></i> Booking Details #${booking.id}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <h6 class="fw-bold" style="color: var(--admin-blue);">Booking Information</h6>
                                <p><strong>Lab:</strong> ${booking.lab_name}</p>
                                <p><strong>Date:</strong> ${formatDate(booking.date)} (${dayName})</p>
                                <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
                                <p><strong>Status:</strong> <span class="badge bg-${statusColor}">${booking.status}</span></p>
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold" style="color: var(--admin-blue);">Faculty Information</h6>
                                <p><strong>Name:</strong> ${booking.faculty_name}</p>
                                <p><strong>ID:</strong> ${booking.faculty_id}</p>
                                <p><strong>Department:</strong> ${booking.faculty_dept}</p>
                                <p><strong>Course:</strong> ${booking.course_code}</p>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <h6 class="fw-bold" style="color: var(--admin-blue);">Booking Purpose</h6>
                            <div class="card bg-light">
                                <div class="card-body">
                                    ${booking.purpose}
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="fw-bold" style="color: var(--admin-blue);">Timestamps</h6>
                                <p><small><strong>Created:</strong> ${createdDate.toLocaleString()}</small></p>
                                ${booking.approved_at ? `<p><small><strong>Approved:</strong> ${new Date(booking.approved_at).toLocaleString()}</small></p>` : ''}
                                ${booking.rejected_at ? `<p><small><strong>Rejected:</strong> ${new Date(booking.rejected_at).toLocaleString()}</small></p>` : ''}
                            </div>
                            <div class="col-md-6">
                                <h6 class="fw-bold" style="color: var(--admin-blue);">Admin Actions</h6>
                                ${booking.approved_by ? `<p><small><strong>Approved By:</strong> ${booking.approved_by}</small></p>` : ''}
                                ${booking.rejected_by ? `<p><small><strong>Rejected By:</strong> ${booking.rejected_by}</small></p>` : ''}
                                ${booking.rejection_reason ? `<p><small><strong>Rejection Reason:</strong> ${booking.rejection_reason}</small></p>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-admin" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', detailsHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('bookingDetailsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Edit booking
function editBooking(bookingId) {
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    const booking = facultyBookings.find(b => b.id === bookingId);
    
    if (!booking) {
        alert('Booking not found!');
        return;
    }
    
    // Create edit modal
    const modalHtml = `
        <div class="modal fade" id="editBookingModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header card-header-admin">
                        <h5 class="modal-title">
                            <i class="fas fa-edit"></i> Edit Booking #${booking.id}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editBookingForm">
                            <input type="hidden" id="editBookingId" value="${booking.id}">
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Lab</label>
                                    <select class="form-select" id="editLabId" required>
                                        <option value="1" ${booking.lab_id == 1 ? 'selected' : ''}>Lab 104</option>
                                        <option value="2" ${booking.lab_id == 2 ? 'selected' : ''}>Lab 203</option>
                                        <option value="3" ${booking.lab_id == 3 ? 'selected' : ''}>Lab 204</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Date</label>
                                    <input type="date" class="form-control" id="editBookingDate" value="${booking.date}" required>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Start Time</label>
                                    <input type="time" class="form-control" id="editStartTime" value="${booking.start_time}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">End Time</label>
                                    <input type="time" class="form-control" id="editEndTime" value="${booking.end_time}" required>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Purpose</label>
                                <textarea class="form-control" id="editPurpose" rows="3" required>${booking.purpose}</textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Status</label>
                                <select class="form-select" id="editBookingStatus">
                                    <option value="pending" ${booking.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="approved" ${booking.status === 'approved' ? 'selected' : ''}>Approved</option>
                                    <option value="rejected" ${booking.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                                </select>
                            </div>
                            
                            <button type="submit" class="btn btn-admin w-100 btn-lg">
                                <i class="fas fa-save"></i> Update Booking
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editBookingModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('editBookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateBooking();
    });
    
    // Remove modal from DOM when hidden
    document.getElementById('editBookingModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Update booking
function updateBooking() {
    const bookingId = parseInt(document.getElementById('editBookingId').value);
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    const bookingIndex = facultyBookings.findIndex(booking => booking.id === bookingId);
    
    if (bookingIndex === -1) {
        alert('Booking not found!');
        return;
    }
    
    // Update booking data
    facultyBookings[bookingIndex] = {
        ...facultyBookings[bookingIndex],
        lab_id: document.getElementById('editLabId').value,
        lab_name: document.getElementById('editLabId').options[document.getElementById('editLabId').selectedIndex].text,
        date: document.getElementById('editBookingDate').value,
        start_time: document.getElementById('editStartTime').value,
        end_time: document.getElementById('editEndTime').value,
        purpose: document.getElementById('editPurpose').value,
        status: document.getElementById('editBookingStatus').value,
        updated_at: new Date().toISOString(),
        updated_by: localStorage.getItem('adminName') || 'Admin'
    };
    
    localStorage.setItem('facultyBookings', JSON.stringify(facultyBookings));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editBookingModal'));
    modal.hide();
    
    showAdminSuccessMessage('Booking updated successfully!');
    loadAllBookings();
}