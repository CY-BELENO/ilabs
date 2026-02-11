// Admin Reports & Analytics Functions

// Load reports
function loadReports() {
    // This function would load charts and analytics
    // For now, we'll display basic statistics
    displayReportStatistics();
}

// Display report statistics
function displayReportStatistics() {
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    const facultySchedule = JSON.parse(localStorage.getItem('facultySchedule') || '[]');
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    
    // Calculate statistics
    const totalBookings = facultyBookings.length;
    const approvedBookings = facultyBookings.filter(b => b.status === 'approved').length;
    const pendingBookings = facultyBookings.filter(b => b.status === 'pending').length;
    const rejectedBookings = facultyBookings.filter(b => b.status === 'rejected').length;
    
    // Get today's bookings
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = facultyBookings.filter(b => b.date === today);
    
    // Get monthly bookings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyBookings = facultyBookings.filter(b => new Date(b.date) >= thirtyDaysAgo);
    
    // Get lab usage
    const labUsage = {
        'Lab 104': facultyBookings.filter(b => b.lab_id == 1).length,
        'Lab 203': facultyBookings.filter(b => b.lab_id == 2).length,
        'Lab 204': facultyBookings.filter(b => b.lab_id == 3).length
    };
    
    // Display in charts area (simple HTML for now)
    document.getElementById('labUsageChart').innerHTML = generateLabUsageChart(labUsage);
    document.getElementById('monthlyBookingsChart').innerHTML = generateMonthlyBookingsChart(monthlyBookings);
}

// Generate lab usage chart
function generateLabUsageChart(labUsage) {
    const labs = Object.keys(labUsage);
    const bookings = Object.values(labUsage);
    
    // Simple HTML chart for now
    let html = `
        <div class="mb-3">
            <h6 class="fw-bold">Bookings per Laboratory</h6>
        </div>
    `;
    
    labs.forEach((lab, index) => {
        const percentage = bookings[index] > 0 ? (bookings[index] / Math.max(...bookings)) * 100 : 0;
        
        html += `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span>${lab}</span>
                    <span>${bookings[index]} bookings</span>
                </div>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar" role="progressbar" 
                         style="width: ${percentage}%; background-color: var(--admin-blue);" 
                         aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                    </div>
                </div>
            </div>
        `;
    });
    
    return html;
}

// Generate monthly bookings chart
function generateMonthlyBookingsChart(monthlyBookings) {
    // Group by date
    const bookingsByDate = {};
    monthlyBookings.forEach(booking => {
        if (!bookingsByDate[booking.date]) {
            bookingsByDate[booking.date] = 0;
        }
        bookingsByDate[booking.date]++;
    });
    
    // Sort dates
    const sortedDates = Object.keys(bookingsByDate).sort();
    const last7Dates = sortedDates.slice(-7); // Last 7 days
    
    let html = `
        <div class="mb-3">
            <h6 class="fw-bold">Last 7 Days Bookings</h6>
        </div>
        <div class="d-flex align-items-end" style="height: 200px;">
    `;
    
    last7Dates.forEach(date => {
        const count = bookingsByDate[date];
        const shortDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const height = (count / Math.max(...Object.values(bookingsByDate))) * 150;
        
        html += `
            <div class="text-center mx-2" style="flex: 1;">
                <div class="mb-2" style="height: ${height}px; background-color: var(--admin-blue); border-radius: 5px;"></div>
                <div><strong>${count}</strong></div>
                <small>${shortDate}</small>
            </div>
        `;
    });
    
    html += `</div>`;
    
    return html;
}

// Generate report
function generateReport(type) {
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    const facultySchedule = JSON.parse(localStorage.getItem('facultySchedule') || '[]');
    
    let reportData = [];
    let reportTitle = '';
    
    switch(type) {
        case 'daily':
            const today = new Date().toISOString().split('T')[0];
            reportData = facultyBookings.filter(b => b.date === today);
            reportTitle = `Daily Report - ${new Date().toLocaleDateString()}`;
            break;
            
        case 'monthly':
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            reportData = facultyBookings.filter(b => new Date(b.date) >= thirtyDaysAgo);
            reportTitle = `Monthly Report - Last 30 Days`;
            break;
            
        case 'users':
            // For user activity, we would track login/logout times
            // For now, use bookings as activity
            reportData = facultyBookings;
            reportTitle = `User Activity Report`;
            break;
    }
    
    // Display report in modal
    displayReportModal(reportTitle, reportData, type);
}

// Display report in modal
function displayReportModal(title, data, type) {
    const modalHtml = `
        <div class="modal fade" id="reportModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header card-header-admin">
                        <h5 class="modal-title">
                            <i class="fas fa-file-alt"></i> ${title}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="d-flex justify-content-between mb-4">
                            <div>
                                <h6>Generated: ${new Date().toLocaleString()}</h6>
                                <h6>Total Records: ${data.length}</h6>
                            </div>
                            <div>
                                <button class="btn btn-admin me-2" onclick="printReport()">
                                    <i class="fas fa-print"></i> Print
                                </button>
                                <button class="btn btn-admin-outline" onclick="exportReport()">
                                    <i class="fas fa-download"></i> Export
                                </button>
                            </div>
                        </div>
                        
                        <div class="table-responsive">
                            ${generateReportTable(data, type)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('reportModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('reportModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Generate report table
function generateReportTable(data, type) {
    if (data.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="fas fa-file-alt fa-3x mb-3 text-muted"></i>
                <h5>No Data Available</h5>
                <p class="mb-0">No records found for this report</p>
            </div>
        `;
    }
    
    let tableHeaders = '';
    let tableRows = '';
    
    switch(type) {
        case 'daily':
        case 'monthly':
            tableHeaders = `
                <tr>
                    <th>Date</th>
                    <th>Lab</th>
                    <th>Faculty</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                </tr>
            `;
            
            data.forEach(item => {
                tableRows += `
                    <tr>
                        <td>${formatDate(item.date)}</td>
                        <td>${item.lab_name}</td>
                        <td>${item.faculty_name}</td>
                        <td>${item.start_time} - ${item.end_time}</td>
                        <td>${item.purpose}</td>
                        <td><span class="badge ${item.status === 'approved' ? 'bg-success' : item.status === 'pending' ? 'bg-warning' : 'bg-danger'}">${item.status}</span></td>
                    </tr>
                `;
            });
            break;
            
        case 'users':
            tableHeaders = `
                <tr>
                    <th>Faculty</th>
                    <th>Department</th>
                    <th>Total Bookings</th>
                    <th>Approved</th>
                    <th>Pending</th>
                    <th>Last Booking</th>
                </tr>
            `;
            
            // Group by faculty
            const facultyStats = {};
            data.forEach(booking => {
                if (!facultyStats[booking.faculty_name]) {
                    facultyStats[booking.faculty_name] = {
                        name: booking.faculty_name,
                        dept: booking.faculty_dept,
                        total: 0,
                        approved: 0,
                        pending: 0,
                        lastBooking: null
                    };
                }
                
                facultyStats[booking.faculty_name].total++;
                if (booking.status === 'approved') facultyStats[booking.faculty_name].approved++;
                if (booking.status === 'pending') facultyStats[booking.faculty_name].pending++;
                
                const bookingDate = new Date(booking.date);
                if (!facultyStats[booking.faculty_name].lastBooking || 
                    bookingDate > new Date(facultyStats[booking.faculty_name].lastBooking)) {
                    facultyStats[booking.faculty_name].lastBooking = booking.date;
                }
            });
            
            Object.values(facultyStats).forEach(stat => {
                tableRows += `
                    <tr>
                        <td>${stat.name}</td>
                        <td>${stat.dept}</td>
                        <td><strong>${stat.total}</strong></td>
                        <td>${stat.approved}</td>
                        <td>${stat.pending}</td>
                        <td>${stat.lastBooking ? formatDate(stat.lastBooking) : 'N/A'}</td>
                    </tr>
                `;
            });
            break;
    }
    
    return `
        <table class="table table-admin">
            <thead>${tableHeaders}</thead>
            <tbody>${tableRows}</tbody>
        </table>
    `;
}

// Print report
function printReport() {
    window.print();
    }
    
// Export report
function exportReport() {
    const reportModal = document.querySelector('#reportModal .modal-body');
    const reportTitle = document.querySelector('#reportModal .modal-title').textContent;
    
    // Create CSV content
    let csvContent = reportTitle + "\n\n";
    
    // Get table data
    const table = reportModal.querySelector('table');
    if (table) {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const rowData = Array.from(cells).map(cell => {
                // Remove badge HTML
                const badge = cell.querySelector('.badge');
                if (badge) {
                    return badge.textContent.trim();
                }
                return cell.textContent.trim();
            });
            csvContent += rowData.join(',') + '\n';
        });
    }
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Initialize when reports tab is shown
function initReports() {
    // Load charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        createLabUsageChart();
        createMonthlyBookingsChart();
    }
}

// Create lab usage chart with Chart.js
function createLabUsageChart() {
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    
    // Group by lab
    const labCounts = {};
    facultyBookings.forEach(booking => {
        const labName = `Lab ${booking.lab_id}`;
        if (!labCounts[labName]) {
            labCounts[labName] = 0;
        }
        labCounts[labName]++;
    });
    
    const ctx = document.getElementById('labUsageChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(labCounts),
            datasets: [{
                data: Object.values(labCounts),
                backgroundColor: [
                    'rgba(13, 110, 253, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(25, 135, 84, 0.8)',
                    'rgba(220, 53, 69, 0.8)',
                    'rgba(108, 117, 125, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20
                    }
                },
                title: {
                    display: true,
                    text: 'Lab Usage Distribution',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// Create monthly bookings chart with Chart.js
function createMonthlyBookingsChart() {
    const facultyBookings = JSON.parse(localStorage.getItem('facultyBookings') || '[]');
    
    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }
    
    // Count bookings per day
    const dailyCounts = last7Days.map(date => {
        return facultyBookings.filter(booking => booking.date === date).length;
    });
    
    // Format dates for labels
    const dateLabels = last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    });
    
    const ctx = document.getElementById('monthlyBookingsChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [{
                label: 'Bookings',
                data: dailyCounts,
                borderColor: 'rgba(13, 110, 253, 1)',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Daily Bookings (Last 7 Days)',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: 'Number of Bookings'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}