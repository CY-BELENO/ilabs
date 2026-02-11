// Admin User Management Functions

// Load all users
function loadAllUsers() {
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    
    // Extract unique faculty from bookings
    const facultyMap = {};
    facultyBookings.forEach(booking => {
        if (booking.faculty_name && !facultyMap[booking.faculty_id]) {
            facultyMap[booking.faculty_id] = {
                id: booking.faculty_id,
                name: booking.faculty_name,
                department: booking.faculty_dept || 'DCpET',
                role: 'faculty',
                status: 'active',
                email: `${booking.faculty_id}@pup.edu.ph`
            };
        }
    });
    
    const facultyUsers = Object.values(facultyMap);
    const allUsers = [...adminUsers, ...facultyUsers];
    
    displayUsers(allUsers);
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-users fa-2x mb-3 text-muted"></i>
                    <h5>No Users Found</h5>
                    <p class="mb-0">Add users using the "Add New User" button</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    users.forEach(user => {
        const roleBadge = user.role === 'superadmin' ? 'danger' : 
                         user.role === 'admin' ? 'warning' : 'primary';
        const roleText = user.role === 'superadmin' ? 'Super Admin' : 
                        user.role === 'admin' ? 'Admin' : 'Faculty';
        
        html += `
            <tr>
                <td>${user.id}</td>
                <td><strong>${user.name}</strong></td>
                <td><span class="badge bg-${roleBadge}">${roleText}</span></td>
                <td>${user.department || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>
                    <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                        ${user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-action btn-edit me-2" onclick="editUser(${user.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-action btn-delete" onclick="deleteUser(${user.id})" 
                            ${user.role === 'superadmin' ? 'disabled' : ''} title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase();
    const userType = document.getElementById('userTypeFilter').value;
    
    // Get all users
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    
    // Extract unique faculty from bookings
    const facultyMap = {};
    facultyBookings.forEach(booking => {
        if (booking.faculty_name && !facultyMap[booking.faculty_id]) {
            facultyMap[booking.faculty_id] = {
                id: booking.faculty_id,
                name: booking.faculty_name,
                department: booking.faculty_dept || 'DCpET',
                role: 'faculty',
                status: 'active',
                email: `${booking.faculty_id}@pup.edu.ph`
            };
        }
    });
    
    const facultyUsers = Object.values(facultyMap);
    let allUsers = [...adminUsers, ...facultyUsers];
    
    // Filter by search term
    if (searchTerm) {
        allUsers = allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.id.toString().includes(searchTerm) ||
            (user.department && user.department.toLowerCase().includes(searchTerm)) ||
            (user.email && user.email.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filter by user type
    if (userType !== 'all') {
        allUsers = allUsers.filter(user => user.role === userType);
    }
    
    displayUsers(allUsers);
}

// Open add user modal
function openAddUserModal() {
    // Create modal HTML
    const modalHtml = `
        <div class="modal fade" id="addUserModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header card-header-admin">
                        <h5 class="modal-title">
                            <i class="fas fa-user-plus"></i> Add New User
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addUserForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Full Name</label>
                                    <input type="text" class="form-control" id="newUserName" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">User Role</label>
                                    <select class="form-select" id="newUserRole" required>
                                        <option value="faculty">Faculty</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Super Admin</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Username</label>
                                    <input type="text" class="form-control" id="newUserUsername" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Password</label>
                                    <input type="password" class="form-control" id="newUserPassword" required>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Email Address</label>
                                    <input type="email" class="form-control" id="newUserEmail" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Department</label>
                                    <input type="text" class="form-control" id="newUserDepartment" value="DCpET">
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">User ID</label>
                                    <input type="text" class="form-control" id="newUserId" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Status</label>
                                    <select class="form-select" id="newUserStatus">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-admin w-100 btn-lg">
                                <i class="fas fa-save"></i> Save User
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body if not exists
    if (!document.getElementById('addUserModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('addUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNewUser();
    });
}

// Save new user
function saveNewUser() {
    const userData = {
        id: document.getElementById('newUserId').value,
        name: document.getElementById('newUserName').value,
        username: document.getElementById('newUserUsername').value,
        password: document.getElementById('newUserPassword').value,
        email: document.getElementById('newUserEmail').value,
        department: document.getElementById('newUserDepartment').value,
        role: document.getElementById('newUserRole').value,
        status: document.getElementById('newUserStatus').value,
        created_at: new Date().toISOString(),
        last_login: null
    };
    
    // Validate user ID uniqueness
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const existingUser = adminUsers.find(user => user.id === userData.id || user.username === userData.username);
    
    if (existingUser) {
        alert('User ID or Username already exists!');
        return;
    }
    
    // Add to admin users
    adminUsers.push(userData);
    localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
    
    // If faculty, also add to faculty data structure
    if (userData.role === 'faculty') {
        // Store faculty data for student portal
        localStorage.setItem('facultyName', userData.name);
        localStorage.setItem('facultyId', userData.id);
        localStorage.setItem('facultyDept', userData.department);
    }
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
    modal.hide();
    
    // Show success message
    showAdminSuccessMessage(`User "${userData.name}" added successfully!`);
    
    // Refresh user list
    loadAllUsers();
}

// Edit user
function editUser(userId) {
    alert('Edit user functionality would open a modal to edit user details.');
    // Implementation would be similar to openAddUserModal but with pre-filled data
}

// Delete user
function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const updatedUsers = adminUsers.filter(user => user.id !== userId);
    
    localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
    
    showAdminSuccessMessage('User deleted successfully!');
    loadAllUsers();
}