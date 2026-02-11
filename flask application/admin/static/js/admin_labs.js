// Admin Lab Management Functions

// Load all labs for admin
function loadAllLabsForAdmin() {
    const labs = [
        { id: 1, name: 'Lab 104', capacity: 30, equipment: '30 PCs, Projector, Whiteboard', status: 'active' },
        { id: 2, name: 'Lab 203', capacity: 25, equipment: '25 PCs, Smart Board, 3D Printer', status: 'active' },
        { id: 3, name: 'Lab 204', capacity: 35, equipment: '35 PCs, VR Setup, Sound System', status: 'maintenance' }
    ];
    
    // Check if we have custom lab data in localStorage
    const customLabs = JSON.parse(localStorage.getItem('adminLabs') || '[]');
    const allLabs = customLabs.length > 0 ? customLabs : labs;
    
    displayLabsForAdmin(allLabs);
}

// Display labs in admin panel
function displayLabsForAdmin(labs) {
    const container = document.getElementById('adminLabsContainer');
    
    if (labs.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-desktop fa-3x mb-3 text-muted"></i>
                <h4>No Laboratories Found</h4>
                <p class="mb-0">Add laboratories using the "Add New Lab" button</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    labs.forEach(lab => {
        const statusColor = lab.status === 'active' ? 'success' : 
                          lab.status === 'maintenance' ? 'warning' : 'danger';
        const statusText = lab.status === 'active' ? 'Available' : 
                          lab.status === 'maintenance' ? 'Maintenance' : 'Closed';
        
        html += `
            <div class="col-md-4 mb-4">
                <div class="card admin-stats-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h4 class="mb-0">
                                <i class="fas fa-desktop" style="color: var(--admin-blue);"></i> 
                                ${lab.name}
                            </h4>
                            <span class="badge bg-${statusColor}">${statusText}</span>
                        </div>
                        
                        <div class="mb-3">
                            <p class="mb-2"><strong>Capacity:</strong> ${lab.capacity} students</p>
                            <p class="mb-2"><strong>Equipment:</strong> ${lab.equipment}</p>
                            <p class="mb-0"><strong>Lab ID:</strong> ${lab.id}</p>
                        </div>
                        
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-action btn-edit" onclick="editLab(${lab.id})">
                                <i class="fas fa-edit me-1"></i> Edit
                            </button>
                            <button class="btn btn-action btn-delete" onclick="deleteLab(${lab.id})">
                                <i class="fas fa-trash me-1"></i> Delete
                            </button>
                            <button class="btn btn-action btn-view" onclick="viewLabSchedule(${lab.id})">
                                <i class="fas fa-calendar me-1"></i> Schedule
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Open add lab modal
function openAddLabModal() {
    const modalHtml = `
        <div class="modal fade" id="addLabModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header card-header-admin">
                        <h5 class="modal-title">
                            <i class="fas fa-plus-circle"></i> Add New Laboratory
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addLabForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Lab Name</label>
                                    <input type="text" class="form-control" id="newLabName" 
                                           placeholder="e.g., Lab 301, Computer Lab A" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Lab ID</label>
                                    <input type="text" class="form-control" id="newLabId" 
                                           placeholder="e.g., 301, LAB-A" required>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Capacity</label>
                                    <input type="number" class="form-control" id="newLabCapacity" 
                                           min="1" max="100" value="25" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Status</label>
                                    <select class="form-select" id="newLabStatus" required>
                                        <option value="active">Active</option>
                                        <option value="maintenance">Under Maintenance</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Equipment & Facilities</label>
                                <textarea class="form-control" id="newLabEquipment" rows="3" 
                                          placeholder="List equipment and facilities (e.g., 25 PCs, Projector, Whiteboard, Air Conditioning)" 
                                          required></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Additional Notes</label>
                                <textarea class="form-control" id="newLabNotes" rows="2" 
                                          placeholder="Any special instructions or notes about this lab"></textarea>
                            </div>
                            
                            <button type="submit" class="btn btn-admin w-100 btn-lg">
                                <i class="fas fa-save"></i> Save Laboratory
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body if not exists
    if (!document.getElementById('addLabModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addLabModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('addLabForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNewLab();
    });
}

// Save new lab
function saveNewLab() {
    const labData = {
        id: document.getElementById('newLabId').value,
        name: document.getElementById('newLabName').value,
        capacity: parseInt(document.getElementById('newLabCapacity').value),
        equipment: document.getElementById('newLabEquipment').value,
        status: document.getElementById('newLabStatus').value,
        notes: document.getElementById('newLabNotes').value,
        created_at: new Date().toISOString()
    };
    
    // Get existing labs
    const existingLabs = JSON.parse(localStorage.getItem('adminLabs') || '[]');
    
    // Check if lab ID already exists
    const existingLab = existingLabs.find(lab => lab.id === labData.id);
    if (existingLab) {
        alert('Lab ID already exists! Please use a different ID.');
        return;
    }
    
    // Add new lab
    existingLabs.push(labData);
    localStorage.setItem('adminLabs', JSON.stringify(existingLabs));
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addLabModal'));
    modal.hide();
    
    // Show success message
    showAdminSuccessMessage(`Laboratory "${labData.name}" added successfully!`);
    
    // Refresh lab list
    loadAllLabsForAdmin();
}

// Edit lab
function editLab(labId) {
    const labs = JSON.parse(localStorage.getItem('adminLabs') || '[]');
    const lab = labs.find(l => l.id === labId);
    
    if (!lab) {
        alert('Lab not found!');
        return;
    }
    
    // Similar to openAddLabModal but with pre-filled data
    alert(`Edit lab: ${lab.name}\nThis would open an edit modal with pre-filled data.`);
    // Implementation would be similar to openAddLabModal
}

// Delete lab
function deleteLab(labId) {
    if (!confirm('Are you sure you want to delete this laboratory? This action cannot be undone.')) {
        return;
    }
    
    const labs = JSON.parse(localStorage.getItem('adminLabs') || '[]');
    const updatedLabs = labs.filter(lab => lab.id !== labId);
    
    localStorage.setItem('adminLabs', JSON.stringify(updatedLabs));
    
    showAdminSuccessMessage('Laboratory deleted successfully!');
    loadAllLabsForAdmin();
}

// View lab schedule
function viewLabSchedule(labId) {
    // Get all bookings for this lab
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    const labBookings = facultyBookings.filter(booking => booking.lab_id == labId);
    
    // Get lab info
    const labs = JSON.parse(localStorage.getItem('adminLabs') || '[]');
    const lab = labs.find(l => l.id === labId) || { name: `Lab ${labId}` };
    
    // Create schedule view modal
    const modalHtml = `
        <div class="modal fade" id="labScheduleModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header card-header-admin">
                        <h5 class="modal-title">
                            <i class="fas fa-calendar-alt"></i> ${lab.name} - Schedule
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${generateLabScheduleTable(labBookings, lab.name)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('labScheduleModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('labScheduleModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Generate lab schedule table
function generateLabScheduleTable(bookings, labName) {
    if (bookings.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="fas fa-calendar-times fa-3x mb-3 text-muted"></i>
                <h4>No Bookings Found</h4>
                <p class="mb-0">${labName} has no scheduled bookings</p>
            </div>
        `;
    }
    
    // Sort by date
    bookings.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let html = `
        <div class="table-responsive">
            <table class="table table-admin">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Faculty</th>
                        <th>Purpose</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    bookings.forEach(booking => {
        const date = new Date(booking.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const statusColor = booking.status === 'approved' ? 'success' : 
                          booking.status === 'pending' ? 'warning' : 'danger';
        
        html += `
            <tr>
                <td><strong>${formatDate(booking.date)}</strong></td>
                <td>${dayName}</td>
                <td>${booking.start_time} - ${booking.end_time}</td>
                <td>${booking.faculty_name}</td>
                <td>${booking.purpose}</td>
                <td><span class="badge bg-${statusColor}">${booking.status}</span></td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div class="mt-3">
            <small class="text-muted">
                <i class="fas fa-info-circle"></i> Showing ${bookings.length} booking(s) for ${labName}
            </small>
        </div>
    `;
    
    return html;
}