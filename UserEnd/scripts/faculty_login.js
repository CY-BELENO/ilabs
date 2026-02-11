// Simulate NFC card tap
function simulateCardTap() {
    const nfcCard = document.getElementById('nfcCard');
    const nfcReader = document.getElementById('nfcReader');
    const loginSpinner = document.getElementById('loginSpinner');
    const loginStatus = document.getElementById('loginStatus');
    
    // Start scanning animation
    nfcReader.classList.add('scanning');
    nfcCard.classList.add('scanned');
    
    // Simulate scanning delay
    setTimeout(() => {
        // Show loading spinner
        loginSpinner.classList.add('active');
        nfcReader.classList.remove('scanning');
        
        // Simulate authentication delay
        setTimeout(() => {
            loginSpinner.classList.remove('active');
            loginStatus.classList.add('active');
            
            // Store faculty data - MATCHING NFC CARD NAME
            localStorage.setItem('facultyName', 'Professor');
            localStorage.setItem('facultyId', '20041023');
            localStorage.setItem('facultyDept', 'DCpET');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'faculty_dashboard.html';
            }, 2000);
            
        }, 1500);
        
    }, 1000);
}

// Simulate NFC detection (optional feature)
document.addEventListener('keydown', function(e) {
    // Press 'N' key to simulate NFC card detection
    if (e.key === 'n' || e.key === 'N') {
        simulateCardTap();
    }
});