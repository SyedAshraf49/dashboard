// Global variables
let rowCounter = 0;
let savedData = [];
const STORAGE_KEY = 'dashboardData';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode(); // Dark mode first
    loadData();
    setupEventListeners();
    updateTotalCount();
    setupMobileMenu();
    
    // Check for duration warnings after data loads
    setTimeout(() => {
        checkAllDurations();
    }, 500);
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('addRowBtn').addEventListener('click', addRow);
    document.getElementById('saveBtn').addEventListener('click', saveData);
    document.getElementById('refreshBtn').addEventListener('click', refreshPage);
    document.getElementById('printBtn').addEventListener('click', printTable);
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterTable(e.target.value);
        });
    }
    
    // Notification bell button - open notification modal
    const notificationBellBtn = document.getElementById('notificationBellBtn');
    if (notificationBellBtn) {
        notificationBellBtn.addEventListener('click', function() {
            openNotificationModal();
        });
    }
    
    // Notification close button
    const closeNotificationBtn = document.getElementById('closeNotification');
    if (closeNotificationBtn) {
        closeNotificationBtn.addEventListener('click', closeNotification);
    }
    
    // Close notification on overlay click
    const notificationModal = document.getElementById('notificationModal');
    if (notificationModal) {
        notificationModal.addEventListener('click', function(e) {
            if (e.target === notificationModal) {
                closeNotification();
            }
        });
    }
    
    // Close notification on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeNotification();
        }
    });
}

// Mobile menu functionality
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
    
    if (mobileMenuToggle && sidebar) {
        // Toggle menu
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-open');
            mobileMenuToggle.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // Change icon
            const icon = mobileMenuToggle.querySelector('i');
            if (sidebar.classList.contains('mobile-open')) {
                icon.className = 'fas fa-times';
                document.body.style.overflow = 'hidden';
            } else {
                icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            }
        });
        
        // Close menu when clicking overlay
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('mobile-open');
            mobileMenuToggle.classList.remove('active');
            overlay.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.className = 'fas fa-bars';
            document.body.style.overflow = '';
        });
        
        // Close sidebar when clicking a nav item on mobile
        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('mobile-open');
                    mobileMenuToggle.classList.remove('active');
                    overlay.classList.remove('active');
                    const icon = mobileMenuToggle.querySelector('i');
                    icon.className = 'fas fa-bars';
                    document.body.style.overflow = '';
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('mobile-open');
                mobileMenuToggle.classList.remove('active');
                overlay.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            }
        });
    }
}

// Get the current contractor value
function getContractorValue(row) {
    const contractorLink = row.querySelector('.contractor-link');
    if (contractorLink && contractorLink.style.display !== 'none' && contractorLink.textContent) {
        return contractorLink.textContent.trim();
    }
    const contractorInput = row.querySelector('.contractor-input');
    return contractorInput ? contractorInput.value.trim() : '';
}

// Add new row to table
function addRow() {
    const tbody = document.getElementById('tableBody');
    const row = document.createElement('tr');
    rowCounter++;
    
    row.innerHTML = `
        <td>
            <input type="text" class="sno-input" placeholder="Enter S.No" value="${rowCounter}">
        </td>
        <td>
            <input type="text" class="efile-input" placeholder="Enter E-File">
        </td>
        <td>
            <input type="text" class="contractor-input" placeholder="Enter Contractor">
            <a href="#" class="contractor-link" style="display: none;" target="_blank"></a>
        </td>
        <td>
            <input type="text" class="description-input" placeholder="Enter Description">
        </td>
        <td>
            <input type="text" class="value-input" placeholder="Enter Value">
        </td>
        <td>
            <input type="date" class="start-date-input">
        </td>
        <td>
            <input type="date" class="end-date-input">
        </td>
        <td class="duration-cell">
            <span class="duration-display">-</span>
        </td>
        <td>
            <input type="file" class="attachment-input" accept="*/*">
            <span class="file-name"></span>
        </td>
        <td>
            <button class="delete-btn" onclick="deleteRow(this)">
                <i class="fas fa-trash"></i> Delete
            </button>
        </td>
    `;
    
    tbody.appendChild(row);
    
    // Add event listeners for date calculation
    const startDateInput = row.querySelector('.start-date-input');
    const endDateInput = row.querySelector('.end-date-input');
    
    startDateInput.addEventListener('change', calculateDuration);
    endDateInput.addEventListener('change', calculateDuration);
    
    // Add file size validation
    const fileInput = row.querySelector('.attachment-input');
    fileInput.addEventListener('change', function(e) {
        validateFileSize(e.target);
        updateContractorHyperlink(row);
    });
    
    // Setup contractor input listener
    const contractorInput = row.querySelector('.contractor-input');
    contractorInput.addEventListener('input', function() {
        updateContractorHyperlink(row);
    });
    
    updateTotalCount();
}

// Calculate duration between start and end date
function calculateDuration(event) {
    const row = event.target.closest('tr');
    const startDateInput = row.querySelector('.start-date-input');
    const endDateInput = row.querySelector('.end-date-input');
    const durationDisplay = row.querySelector('.duration-display');
    const durationCell = durationDisplay.parentElement;
    
    if (startDateInput.value && endDateInput.value) {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        if (endDate >= startDate) {
            const diffTime = endDate - startDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            durationDisplay.textContent = `${diffDays} days left`;
            durationCell.classList.remove('warning');
            
            // Color coding: red if <= 60 days
            if (diffDays <= 60) {
                durationCell.classList.add('warning');
                // Show notification pop-up
                showDurationNotification(row, diffDays);
            }
        } else {
            durationDisplay.textContent = 'Invalid dates';
            durationCell.classList.add('warning');
        }
    } else {
        durationDisplay.textContent = '-';
        durationCell.classList.remove('warning');
    }
    
    // Auto-save after calculation
    saveDataToStorage();
    // Update notification badge
    updateNotificationCount();
}

// Show notification pop-up for duration <= 60 days
function showDurationNotification(row, days) {
    const sno = row.querySelector('.sno-input')?.value || '';
    const efile = row.querySelector('.efile-input')?.value || '';
    const contractorInput = row.querySelector('.contractor-input');
    const contractorLink = row.querySelector('.contractor-link');
    const contractor = contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent : '');
    const description = row.querySelector('.description-input')?.value || '';
    const value = row.querySelector('.value-input')?.value || '';
    const startDate = row.querySelector('.start-date-input')?.value || '';
    const endDate = row.querySelector('.end-date-input')?.value || '';
    
    const notificationItem = `
        <div class="notification-item">
            <div class="notification-item-title">
                <i class="fas fa-exclamation-circle"></i>
                Warning: Only ${days} days remaining!
            </div>
            <div class="notification-item-details">
                <div><strong>S.NO</strong><span>${sno || 'N/A'}</span></div>
                <div><strong>E-FILE</strong><span>${efile || 'N/A'}</span></div>
                <div><strong>CONTRACTOR</strong><span>${contractor || 'N/A'}</span></div>
                <div><strong>DESCRIPTION</strong><span>${description || 'N/A'}</span></div>
                <div><strong>VALUE</strong><span>${value || 'N/A'}</span></div>
                <div><strong>START DATE</strong><span>${startDate || 'N/A'}</span></div>
                <div><strong>END DATE</strong><span>${endDate || 'N/A'}</span></div>
                <div><strong>DURATION</strong><span style="color: #f44336; font-weight: bold;">${days} days left</span></div>
            </div>
        </div>
    `;
    
    let modal = document.getElementById('notificationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'notification-modal';
        modal.id = 'notificationModal';
        modal.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Duration Warning</h3>
                    <button class="notification-close" id="closeNotification">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notification-body" id="notificationBody"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('#closeNotification');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeNotification);
        }
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeNotification();
            }
        });
    }
    
    const notificationBody = document.getElementById('notificationBody');
    if (notificationBody) {
        const existingNotifications = notificationBody.querySelectorAll('.notification-item');
        let isDuplicate = false;
        
        existingNotifications.forEach(item => {
            const details = item.querySelectorAll('.notification-item-details div');
            details.forEach(detail => {
                const strong = detail.querySelector('strong');
                if (strong && strong.textContent.trim() === 'S.NO') {
                    const snoText = detail.querySelector('span')?.textContent.trim();
                    if (snoText === sno) {
                        isDuplicate = true;
                    }
                }
            });
        });
        
        if (!isDuplicate) {
            notificationBody.insertAdjacentHTML('afterbegin', notificationItem);
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}
// Open notification modal and show all duration warnings
function openNotificationModal() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) {
        showNotificationMessage('This feature is available on the Contractor List page.');
        return;
    }
    
    checkAllDurations();
    updateNotificationCount();
    
    let modal = document.getElementById('notificationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'notification-modal';
        modal.id = 'notificationModal';
        modal.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Duration Warning</h3>
                    <button class="notification-close" id="closeNotification">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="notification-body" id="notificationBody"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('#closeNotification');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeNotification);
        }
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeNotification();
            }
        });
    }
    
    const notificationBody = document.getElementById('notificationBody');
    
    if (!notificationBody || notificationBody.children.length === 0) {
        if (notificationBody) {
            notificationBody.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-check-circle"></i>
                    <p>No duration warnings found!</p>
                    <p style="font-size: 14px; margin-top: 10px; color: var(--text-tertiary);">All contracts have more than 60 days remaining.</p>
                </div>
            `;
        }
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function showNotificationMessage(message) {
    let modal = document.getElementById('notificationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'notification-modal';
        modal.id = 'notificationModal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <h3><i class="fas fa-info-circle"></i> Information</h3>
                <button class="notification-close" id="closeNotification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-body">
                <div class="notification-empty">
                    <i class="fas fa-info-circle"></i>
                    <p>${message}</p>
                </div>
            </div>
        </div>
    `;
    
    const closeBtn = modal.querySelector('#closeNotification');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeNotification);
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeNotification();
        }
    });
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeNotification() {
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function updateNotificationCount() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    const count = getWarningCount();
    if (count > 0) {
        badge.textContent = count;
        badge.classList.add('active');
    } else {
        badge.textContent = '0';
        badge.classList.remove('active');
    }
}

function getWarningCount() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return 0;
    let count = 0;
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const startDateInput = row.querySelector('.start-date-input');
        const endDateInput = row.querySelector('.end-date-input');
        if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            if (endDate >= startDate) {
                const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                if (diffDays <= 60) {
                    count++;
                }
            }
        }
    });
    return count;
}

function checkAllDurations() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const startDateInput = row.querySelector('.start-date-input');
        const endDateInput = row.querySelector('.end-date-input');
        const durationDisplay = row.querySelector('.duration-display');
        
        if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            
            if (endDate >= startDate) {
                const diffTime = endDate - startDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays <= 60 && durationDisplay) {
                    showDurationNotification(row, diffDays);
                }
            }
        }
    });
    updateNotificationCount();
}

function validateFileSize(input) {
    const file = input.files[0];
    const fileNameSpan = input.parentElement.querySelector('.file-name');
    
    if (file) {
        const fileSizeMB = file.size / (1024 * 1024);
        
        if (fileSizeMB > 10) {
            alert('File size exceeds 10MB. Please select a smaller file.');
            input.value = '';
            fileNameSpan.textContent = '';
            return false;
        } else {
            fileNameSpan.textContent = file.name;
            fileNameSpan.style.color = 'var(--accent-primary)';
            fileNameSpan.style.fontSize = '12px';
            return true;
        }
    }
    return false;
}

function updateContractorHyperlink(row) {
    const contractorInput = row.querySelector('.contractor-input');
    const contractorLink = row.querySelector('.contractor-link');
    const attachmentInput = row.querySelector('.attachment-input');
    const file = attachmentInput?.files[0];
    
    if (!contractorInput || !contractorLink) return;
    
    let contractorName = '';
    if (contractorInput.style.display !== 'none' && contractorInput.value) {
        contractorName = contractorInput.value.trim();
    } else if (contractorLink.textContent) {
        contractorName = contractorLink.textContent.trim();
    }
    
    if (contractorLink.dataset.objectUrl) {
        URL.revokeObjectURL(contractorLink.dataset.objectUrl);
        delete contractorLink.dataset.objectUrl;
    }
    
    if (file && contractorName) {
        const fileUrl = URL.createObjectURL(file);
        contractorLink.href = '#';
        contractorLink.textContent = contractorName;
        contractorLink.dataset.objectUrl = fileUrl;
        contractorLink.dataset.fileName = file.name;
        contractorLink.style.display = 'inline-block';
        contractorLink.style.color = 'var(--accent-primary)';
        contractorLink.style.textDecoration = 'underline';
        contractorLink.style.cursor = 'pointer';
        
        contractorLink.replaceWith(contractorLink.cloneNode(true));
        const newLink = row.querySelector('.contractor-link');
        
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            openFileVisually(fileUrl, file.name, file.type);
        });
        
        contractorInput.value = contractorName;
        contractorInput.style.display = 'none';
    } else {
        contractorLink.style.display = 'none';
        contractorInput.style.display = '';
        contractorLink.removeAttribute('href');
        if (contractorName && !contractorInput.value) {
            contractorInput.value = contractorName;
        }
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function base64ToFile(base64String, fileName) {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
}

function openFileVisually(fileUrl, fileName, fileType) {
    const displayableTypes = [
        'application/pdf',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'text/plain', 'text/html', 'text/css', 'text/javascript',
        'application/json', 'application/xml'
    ];
    
    const isDisplayable = displayableTypes.some(type => fileType && fileType.includes(type.split('/')[1])) || 
                          displayableTypes.includes(fileType);
    
    if (isDisplayable) {
        const newWindow = window.open(fileUrl, '_blank');
        if (!newWindow) {
            alert('Please allow pop-ups to view the file.');
        }
    } else {
        const newWindow = window.open(fileUrl, '_blank');
        if (!newWindow) {
            alert('Please allow pop-ups to view the file.');
        }
    }
}

function deleteRow(button) {
    if (confirm('Are you sure you want to delete this row?')) {
        const row = button.closest('tr');
        row.remove();
        updateTotalCount();
        saveDataToStorage();
    }
}

function saveData() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    savedData = [];
    
    rows.forEach((row, index) => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efile = row.querySelector('.efile-input')?.value || '';
        let contractor = '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        
        if (contractorInput) {
            contractor = contractorInput.value || '';
        } else if (contractorLink) {
            contractor = contractorLink.textContent || '';
        }
        
        const description = row.querySelector('.description-input')?.value || '';
        const value = row.querySelector('.value-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const attachmentInput = row.querySelector('.attachment-input');
        const file = attachmentInput?.files[0];
        
        updateContractorHyperlink(row);
        
        const rowData = {
            sno,
            efile,
            contractor,
            description,
            value,
            startDate,
            endDate,
            duration: row.querySelector('.duration-display')?.textContent || '-',
            fileName: file ? file.name : '',
            fileSize: file ? file.size : 0
        };
        
        savedData.push(rowData);
    });
    
    saveDataToStorage();
    alert('Data saved successfully!');
}

async function saveDataToStorage() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const dataToSave = [];
    
    for (const row of rows) {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efile = row.querySelector('.efile-input')?.value || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput && contractorInput.style.display !== 'none' 
            ? contractorInput.value 
            : (contractorLink?.textContent || '');
        const description = row.querySelector('.description-input')?.value || '';
        const value = row.querySelector('.value-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-display')?.textContent || '-';
        const attachmentInput = row.querySelector('.attachment-input');
        const file = attachmentInput?.files[0];
        
        let fileBase64 = '';
        let fileName = '';
        let fileType = '';
        
        if (file) {
            fileName = file.name;
            fileType = file.type;
            try {
                fileBase64 = await fileToBase64(file);
            } catch (error) {
                console.error('Error converting file to base64:', error);
            }
        }
        
        dataToSave.push({
            sno, efile, contractor, description, value, startDate, endDate, duration,
            fileName, fileBase64, fileType
        });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = '';
            
            data.forEach((rowData, index) => {
                const row = document.createElement('tr');
                const snoValue = rowData.sno || (index + 1);
                rowCounter = Math.max(rowCounter, parseInt(snoValue) || index + 1);
                
                let isWarning = false;
                if (rowData.duration && rowData.duration.includes('days')) {
                    const daysMatch = rowData.duration.match(/(\d+)\s*days/);
                    if (daysMatch) {
                        const days = parseInt(daysMatch[1]);
                        isWarning = days <= 60;
                    }
                }
                
                const contractorValue = rowData.contractor || '';
                const hasFile = rowData.fileName && rowData.fileBase64;
                
                row.innerHTML = `
                    <td><input type="text" class="sno-input" placeholder="Enter S.No" value="${snoValue}"></td>
                    <td><input type="text" class="efile-input" placeholder="Enter E-File" value="${rowData.efile || ''}"></td>
                    <td>
                        <input type="text" class="contractor-input" placeholder="Enter Contractor" value="${contractorValue}" ${hasFile ? 'style="display: none;"' : ''}>
                        <a href="#" class="contractor-link" ${hasFile ? 'style="display: inline-block; color: var(--accent-primary); text-decoration: underline; cursor: pointer;"' : 'style="display: none;"'}">${contractorValue}</a>
                    </td>
                    <td><input type="text" class="description-input" placeholder="Enter Description" value="${rowData.description || ''}"></td>
                    <td><input type="text" class="value-input" placeholder="Enter Value" value="${rowData.value || ''}"></td>
                    <td><input type="date" class="start-date-input" value="${rowData.startDate || ''}"></td>
                    <td><input type="date" class="end-date-input" value="${rowData.endDate || ''}"></td>
                    <td class="duration-cell ${isWarning ? 'warning' : ''}">
                        <span class="duration-display">${rowData.duration || '-'}</span>
                    </td>
                    <td>
                        <input type="file" class="attachment-input" accept="*/*">
                        <span class="file-name" style="color: var(--accent-primary); font-size: 12px;">${rowData.fileName || ''}</span>
                    </td>
                    <td>
                        <button class="delete-btn" onclick="deleteRow(this)">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                
                tbody.appendChild(row);
                
                if (hasFile && rowData.fileBase64) {
                    try {
                        const file = base64ToFile(rowData.fileBase64, rowData.fileName);
                        const fileInput = row.querySelector('.attachment-input');
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        fileInput.files = dataTransfer.files;
                        
                        const contractorLink = row.querySelector('.contractor-link');
                        const fileUrl = URL.createObjectURL(file);
                        contractorLink.href = '#';
                        contractorLink.dataset.objectUrl = fileUrl;
                        contractorLink.dataset.fileName = file.name;
                        
                        contractorLink.replaceWith(contractorLink.cloneNode(true));
                        const newLink = row.querySelector('.contractor-link');
                        
                        newLink.addEventListener('click', function(e) {
                            e.preventDefault();
                            openFileVisually(fileUrl, file.name, file.type);
                        });
                    } catch (error) {
                        console.error('Error restoring file:', error);
                    }
                }
                
                const startDateInput = row.querySelector('.start-date-input');
                const endDateInput = row.querySelector('.end-date-input');
                
                if (startDateInput && endDateInput) {
                    startDateInput.addEventListener('change', calculateDuration);
                    endDateInput.addEventListener('change', calculateDuration);
                }
                
                const fileInput = row.querySelector('.attachment-input');
                const contractorInput = row.querySelector('.contractor-input');
                
                if (fileInput) {
                    fileInput.addEventListener('change', function(e) {
                        validateFileSize(e.target);
                        updateContractorHyperlink(row);
                    });
                }
                
                if (contractorInput) {
                    contractorInput.addEventListener('input', function() {
                        updateContractorHyperlink(row);
                    });
                }
            });
            
            updateTotalCount();
            
            setTimeout(() => {
                checkAllDurations();
            }, 300);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
}

function refreshPage() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    location.reload();
}

function printTable() {
    const printWindow = window.open('', '_blank');
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        alert('No data to print!');
        return;
    }
    
    let tableHTML = `<!DOCTYPE html><html><head><title>Contractor List - Print</title><style>
        body{font-family:Arial,sans-serif;padding:20px;}h1{text-align:center;color:#333;}
        table{width:100%;border-collapse:collapse;margin-top:20px;}
        th,td{border:1px solid #333;padding:10px;text-align:left;}
        th{background-color:#42a5f5;color:white;font-weight:bold;}
        tr:nth-child(even){background-color:#f2f2f2;}.warning{color:#f00;font-weight:bold;}
    </style></head><body><h1>Contractor List</h1><table><thead><tr>
        <th>S.NO</th><th>E-FILE</th><th>CONTRACTOR</th><th>DESCRIPTION</th><th>VALUE</th>
        <th>START DATE</th><th>END DATE</th><th>DURATION (DAYS)</th><th>ATTACHMENT</th>
    </tr></thead><tbody>`;
    
    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efile = row.querySelector('.efile-input')?.value || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent : '');
        const description = row.querySelector('.description-input')?.value || '';
        const value = row.querySelector('.value-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-display')?.textContent || '-';
        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';
        const isWarning = row.querySelector('.duration-cell')?.classList.contains('warning');
        
        tableHTML += `<tr><td>${sno}</td><td>${efile}</td><td>${contractor}</td><td>${description}</td><td>${value}</td>
            <td>${startDate}</td><td>${endDate}</td><td class="${isWarning ? 'warning' : ''}">${duration}</td><td>${fileName}</td></tr>`;
    });
    
    tableHTML += `</tbody></table></body></html>`;
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
}

function exportToExcel() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        alert('No data to export!');
        return;
    }
    
    const exportData = [];
    exportData.push(['S.NO', 'E-File', 'Contractor', 'Description', 'Value', 'Start Date', 'End Date', 'Duration (Days)', 'Attachment File Name']);
    
    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efile = row.querySelector('.efile-input')?.value || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent.trim() : '');
        const description = row.querySelector('.description-input')?.value || '';
        const value = row.querySelector('.value-input')?.value || '';
        const startDate = row.querySelector('.start-date-input')?.value || '';
        const endDate = row.querySelector('.end-date-input')?.value || '';
        const duration = row.querySelector('.duration-display')?.textContent || '-';
        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';
        
        exportData.push([sno, efile, contractor, description, value, startDate, endDate, duration, fileName]);
    });
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    ws['!cols'] = [
        { wch: 10 }, { wch: 20 }, { wch: 25 }, { wch: 30 }, { wch: 15 },
        { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Data Table');
    const filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
}

function updateTotalCount() {
    const tbody = document.getElementById('tableBody');
    const rowCount = tbody.querySelectorAll('tr').length;
    document.getElementById('totalBadge').textContent = `Total: ${rowCount}`;
}

function filterTable(searchQuery) {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const query = searchQuery.toLowerCase().trim();
    let visibleCount = 0;
    
    if (query === '') {
        rows.forEach(row => { row.style.display = ''; });
        updateTotalCount();
        const noResultsMsg = tbody.querySelector('.no-results-row');
        if (noResultsMsg) { noResultsMsg.remove(); }
        return;
    }
    
    rows.forEach(row => {
        if (row.classList.contains('no-results-row')) { return; }
        
        const sno = row.querySelector('.sno-input')?.value.toLowerCase() || '';
        const efile = row.querySelector('.efile-input')?.value.toLowerCase() || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = (contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent : '')).toLowerCase();
        const description = row.querySelector('.description-input')?.value.toLowerCase() || '';
        const value = row.querySelector('.value-input')?.value.toLowerCase() || '';
        const startDate = row.querySelector('.start-date-input')?.value.toLowerCase() || '';
        const endDate = row.querySelector('.end-date-input')?.value.toLowerCase() || '';
        const duration = row.querySelector('.duration-display')?.textContent.toLowerCase() || '';
        
        const matches = sno.includes(query) || efile.includes(query) || contractor.includes(query) || 
                       description.includes(query) || value.includes(query) || startDate.includes(query) || 
                       endDate.includes(query) || duration.includes(query);
        
        if (matches) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    const existingNoResults = tbody.querySelector('.no-results-row');
    if (existingNoResults) { existingNoResults.remove(); }
    
    if (visibleCount === 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.className = 'no-results-row';
        noResultsRow.innerHTML = `
            <td colspan="10" style="text-align: center; padding: 40px; font-size: 18px; color: var(--text-tertiary);">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                No results found
            </td>
        `;
        tbody.appendChild(noResultsRow);
    }
    
    document.getElementById('totalBadge').textContent = `Total: ${visibleCount}`;
}

document.addEventListener('input', function(e) {
    if (e.target.matches('.sno-input, .efile-input, .contractor-input, .description-input, .value-input, .start-date-input, .end-date-input')) {
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => { saveDataToStorage(); }, 1000);
    }
});

document.addEventListener('change', function(e) {
    if (e.target.matches('.attachment-input')) {
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => { saveDataToStorage(); }, 1000);
    }
});

// Dark Mode Functions
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (!document.querySelector('.theme-toggle')) {
        createThemeToggle();
    }
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
    }
}

function createThemeToggle() {
    const toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle';
    toggleButton.setAttribute('aria-label', 'Toggle dark mode');
    toggleButton.innerHTML = '<i class="fas fa-moon"></i><i class="fas fa-sun"></i>';
    document.body.appendChild(toggleButton);
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.style.transition = 'background 0.3s ease, color 0.3s ease';
    if (navigator.vibrate) { navigator.vibrate(50); }
}