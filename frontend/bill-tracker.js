// Global variables
let rowCounter = 0;
let savedData = [];
const STORAGE_KEY = 'billTrackerData';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    updateTotalCount();
    setupMobileMenu();
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
                document.body.style.overflow = 'hidden'; // Prevent background scroll
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
            <input type="date" class="approved-date-input">
        </td>
        <td>
            <input type="text" class="approved-amount-input" placeholder="Enter Amount">
        </td>
        <td>
            <select class="bill-frequency-input">
                <option value="">Select Frequency</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half-yearly">Half Yearly</option>
                <option value="annually">Annually</option>
            </select>
        </td>
        <td>
            <input type="date" class="bill-date-input">
        </td>
        <td>
            <input type="date" class="bill-due-date-input">
        </td>
        <td>
            <input type="date" class="bill-paid-date-input">
        </td>
        <td>
            <input type="text" class="paid-amount-input" placeholder="Enter Amount">
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

// Validate file size (max 10MB)
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
            fileNameSpan.style.color = '#00d4ff';
            fileNameSpan.style.fontSize = '12px';
            return true;
        }
    }
    return false;
}

// Update contractor cell to show hyperlink when file is attached
function updateContractorHyperlink(row) {
    const contractorInput = row.querySelector('.contractor-input');
    const contractorLink = row.querySelector('.contractor-link');
    const attachmentInput = row.querySelector('.attachment-input');
    const file = attachmentInput?.files[0];
    
    if (!contractorInput || !contractorLink) return;
    
    // Get contractor name from input or link (whichever is visible/has value)
    let contractorName = '';
    if (contractorInput.style.display !== 'none' && contractorInput.value) {
        contractorName = contractorInput.value.trim();
    } else if (contractorLink.textContent) {
        contractorName = contractorLink.textContent.trim();
    }
    
    // Clean up previous object URL
    if (contractorLink.dataset.objectUrl) {
        URL.revokeObjectURL(contractorLink.dataset.objectUrl);
        delete contractorLink.dataset.objectUrl;
    }
    
    if (file && contractorName) {
        // Create object URL for the file
        const fileUrl = URL.createObjectURL(file);
        contractorLink.href = '#';
        contractorLink.textContent = contractorName;
        contractorLink.dataset.objectUrl = fileUrl;
        contractorLink.dataset.fileName = file.name;
        contractorLink.style.display = 'inline-block';
        contractorLink.style.color = '#00d4ff';
        contractorLink.style.textDecoration = 'underline';
        contractorLink.style.cursor = 'pointer';
        
        // Remove existing click listener if any
        contractorLink.replaceWith(contractorLink.cloneNode(true));
        const newLink = row.querySelector('.contractor-link');
        
        // Add click handler to open file visually
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            openFileVisually(fileUrl, file.name, file.type);
        });
        
        contractorInput.value = contractorName; // Keep input value in sync
        contractorInput.style.display = 'none';
    } else {
        contractorLink.style.display = 'none';
        contractorInput.style.display = '';
        contractorLink.removeAttribute('href');
        if (contractorName && !contractorInput.value) {
            contractorInput.value = contractorName; // Restore value to input
        }
    }
}

// Convert file to base64 string
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Convert base64 string back to file
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

// Open file visually in browser (not download)
function openFileVisually(fileUrl, fileName, fileType) {
    // Check if file type can be displayed inline
    const displayableTypes = [
        'application/pdf',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'text/plain', 'text/html', 'text/css', 'text/javascript',
        'application/json', 'application/xml'
    ];
    
    const isDisplayable = displayableTypes.some(type => fileType && fileType.includes(type.split('/')[1])) || 
                          displayableTypes.includes(fileType);
    
    if (isDisplayable) {
        // Open in new window/tab for inline viewing
        const newWindow = window.open(fileUrl, '_blank');
        if (!newWindow) {
            alert('Please allow pop-ups to view the file.');
        }
    } else {
        // For other file types, try to open in new window
        const newWindow = window.open(fileUrl, '_blank');
        if (!newWindow) {
            alert('Please allow pop-ups to view the file.');
        }
    }
}

// Delete row
function deleteRow(button) {
    if (confirm('Are you sure you want to delete this row?')) {
        const row = button.closest('tr');
        row.remove();
        updateTotalCount();
        saveDataToStorage();
    }
}

// Save data
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
        
        const approvedDate = row.querySelector('.approved-date-input')?.value || '';
        const approvedAmount = row.querySelector('.approved-amount-input')?.value || '';
        const billFrequency = row.querySelector('.bill-frequency-input')?.value || '';
        const billDate = row.querySelector('.bill-date-input')?.value || '';
        const billDueDate = row.querySelector('.bill-due-date-input')?.value || '';
        const billPaidDate = row.querySelector('.bill-paid-date-input')?.value || '';
        const paidAmount = row.querySelector('.paid-amount-input')?.value || '';
        const attachmentInput = row.querySelector('.attachment-input');
        const file = attachmentInput?.files[0];
        
        // Update contractor hyperlink if needed
        updateContractorHyperlink(row);
        
        // Store data
        const rowData = {
            sno,
            efile,
            contractor,
            approvedDate,
            approvedAmount,
            billFrequency,
            billDate,
            billDueDate,
            billPaidDate,
            paidAmount,
            fileName: file ? file.name : '',
            fileSize: file ? file.size : 0
        };
        
        savedData.push(rowData);
    });
    
    // Save to localStorage
    saveDataToStorage();
    
    alert('Data saved successfully!');
}

// Save data to localStorage
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
        const approvedDate = row.querySelector('.approved-date-input')?.value || '';
        const approvedAmount = row.querySelector('.approved-amount-input')?.value || '';
        const billFrequency = row.querySelector('.bill-frequency-input')?.value || '';
        const billDate = row.querySelector('.bill-date-input')?.value || '';
        const billDueDate = row.querySelector('.bill-due-date-input')?.value || '';
        const billPaidDate = row.querySelector('.bill-paid-date-input')?.value || '';
        const paidAmount = row.querySelector('.paid-amount-input')?.value || '';
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
            sno,
            efile,
            contractor,
            approvedDate,
            approvedAmount,
            billFrequency,
            billDate,
            billDueDate,
            billPaidDate,
            paidAmount,
            fileName,
            fileBase64,
            fileType
        });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

// Load data from localStorage
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
                
                // Create contractor cell with both input and link
                const contractorValue = rowData.contractor || '';
                const hasFile = rowData.fileName && rowData.fileBase64;
                
                row.innerHTML = `
                    <td>
                        <input type="text" class="sno-input" placeholder="Enter S.No" value="${snoValue}">
                    </td>
                    <td>
                        <input type="text" class="efile-input" placeholder="Enter E-File" value="${rowData.efile || ''}">
                    </td>
                    <td>
                        <input type="text" class="contractor-input" placeholder="Enter Contractor" value="${contractorValue}" ${hasFile ? 'style="display: none;"' : ''}>
                        <a href="#" class="contractor-link" ${hasFile ? 'style="display: inline-block; color: #00d4ff; text-decoration: underline; cursor: pointer;"' : 'style="display: none;"'}">${contractorValue}</a>
                    </td>
                    <td>
                        <input type="date" class="approved-date-input" value="${rowData.approvedDate || ''}">
                    </td>
                    <td>
                        <input type="text" class="approved-amount-input" placeholder="Enter Amount" value="${rowData.approvedAmount || ''}">
                    </td>
                    <td>
                        <select class="bill-frequency-input">
                            <option value="">Select Frequency</option>
                            <option value="monthly" ${rowData.billFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                            <option value="quarterly" ${rowData.billFrequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                            <option value="half-yearly" ${rowData.billFrequency === 'half-yearly' ? 'selected' : ''}>Half Yearly</option>
                            <option value="annually" ${rowData.billFrequency === 'annually' ? 'selected' : ''}>Annually</option>
                        </select>
                    </td>
                    <td>
                        <input type="date" class="bill-date-input" value="${rowData.billDate || ''}">
                    </td>
                    <td>
                        <input type="date" class="bill-due-date-input" value="${rowData.billDueDate || ''}">
                    </td>
                    <td>
                        <input type="date" class="bill-paid-date-input" value="${rowData.billPaidDate || ''}">
                    </td>
                    <td>
                        <input type="text" class="paid-amount-input" placeholder="Enter Amount" value="${rowData.paidAmount || ''}">
                    </td>
                    <td>
                        <input type="file" class="attachment-input" accept="*/*">
                        <span class="file-name" style="color: #00d4ff; font-size: 12px;">${rowData.fileName || ''}</span>
                    </td>
                    <td>
                        <button class="delete-btn" onclick="deleteRow(this)">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                
                tbody.appendChild(row);
                
                // Restore file if it exists
                if (hasFile && rowData.fileBase64) {
                    try {
                        const file = base64ToFile(rowData.fileBase64, rowData.fileName);
                        const fileInput = row.querySelector('.attachment-input');
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        fileInput.files = dataTransfer.files;
                        
                        // Update contractor link
                        const contractorLink = row.querySelector('.contractor-link');
                        const fileUrl = URL.createObjectURL(file);
                        contractorLink.href = '#';
                        contractorLink.dataset.objectUrl = fileUrl;
                        contractorLink.dataset.fileName = file.name;
                        
                        // Remove existing click listener if any
                        contractorLink.replaceWith(contractorLink.cloneNode(true));
                        const newLink = row.querySelector('.contractor-link');
                        
                        // Add click handler to open file visually
                        newLink.addEventListener('click', function(e) {
                            e.preventDefault();
                            openFileVisually(fileUrl, file.name, file.type);
                        });
                    } catch (error) {
                        console.error('Error restoring file:', error);
                    }
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
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
}

// Refresh page (data persists due to localStorage)
function refreshPage() {
    // Clear search and reload
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    location.reload();
}

// Print table
function printTable() {
    // Create a new window with formatted table
    const printWindow = window.open('', '_blank');
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        alert('No data to print!');
        return;
    }
    
    let tableHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill Tracker - Print</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                h1 {
                    text-align: center;
                    color: #333;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #333;
                    padding: 10px;
                    text-align: left;
                    font-size: 12px;
                }
                th {
                    background-color: #7b2cbf;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
            </style>
        </head>
        <body>
            <h1>Bill Tracker</h1>
            <table>
                <thead>
                    <tr>
                        <th>S.NO</th>
                        <th>E-FILE</th>
                        <th>CONTRACTOR</th>
                        <th>APPROVED DATE</th>
                        <th>APPROVED AMOUNT</th>
                        <th>BILL FREQUENCY</th>
                        <th>BILL DATE</th>
                        <th>BILL DUE DATE</th>
                        <th>BILL PAID DATE</th>
                        <th>PAID AMOUNT</th>
                        <th>ATTACHMENT</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efile = row.querySelector('.efile-input')?.value || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent : '');
        const approvedDate = row.querySelector('.approved-date-input')?.value || '';
        const approvedAmount = row.querySelector('.approved-amount-input')?.value || '';
        const billFrequency = row.querySelector('.bill-frequency-input')?.value || '';
        const billDate = row.querySelector('.bill-date-input')?.value || '';
        const billDueDate = row.querySelector('.bill-due-date-input')?.value || '';
        const billPaidDate = row.querySelector('.bill-paid-date-input')?.value || '';
        const paidAmount = row.querySelector('.paid-amount-input')?.value || '';
        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';
        
        tableHTML += `
            <tr>
                <td>${sno}</td>
                <td>${efile}</td>
                <td>${contractor}</td>
                <td>${approvedDate}</td>
                <td>${approvedAmount}</td>
                <td>${billFrequency}</td>
                <td>${billDate}</td>
                <td>${billDueDate}</td>
                <td>${billPaidDate}</td>
                <td>${paidAmount}</td>
                <td>${fileName}</td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

// Export to Excel
function exportToExcel() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        alert('No data to export!');
        return;
    }
    
    // Prepare data for export
    const exportData = [];
    
    // Add headers
    exportData.push([
        'S.NO',
        'E-File',
        'Contractor',
        'Approved Date',
        'Approved Amount',
        'Bill Frequency',
        'Bill Date',
        'Bill Due Date',
        'Bill Paid Date',
        'Paid Amount',
        'Attachment File Name'
    ]);
    
    // Add rows
    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const efile = row.querySelector('.efile-input')?.value || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent.trim() : '');
        const approvedDate = row.querySelector('.approved-date-input')?.value || '';
        const approvedAmount = row.querySelector('.approved-amount-input')?.value || '';
        const billFrequency = row.querySelector('.bill-frequency-input')?.value || '';
        const billDate = row.querySelector('.bill-date-input')?.value || '';
        const billDueDate = row.querySelector('.bill-due-date-input')?.value || '';
        const billPaidDate = row.querySelector('.bill-paid-date-input')?.value || '';
        const paidAmount = row.querySelector('.paid-amount-input')?.value || '';
        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';
        
        exportData.push([
            sno,
            efile,
            contractor,
            approvedDate,
            approvedAmount,
            billFrequency,
            billDate,
            billDueDate,
            billPaidDate,
            paidAmount,
            fileName
        ]);
    });
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 10 }, // S.NO
        { wch: 20 }, // E-File
        { wch: 25 }, // Contractor
        { wch: 15 }, // Approved Date
        { wch: 18 }, // Approved Amount
        { wch: 15 }, // Bill Frequency
        { wch: 15 }, // Bill Date
        { wch: 15 }, // Bill Due Date
        { wch: 15 }, // Bill Paid Date
        { wch: 15 }, // Paid Amount
        { wch: 30 }  // Attachment
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Bill Tracker');
    
    // Generate filename with timestamp
    const filename = `bill_tracker_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
}

// Update total count
function updateTotalCount() {
    const tbody = document.getElementById('tableBody');
    const rowCount = tbody.querySelectorAll('tr').length;
    document.getElementById('totalBadge').textContent = `Total: ${rowCount}`;
}

// Filter table based on search query
function filterTable(searchQuery) {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const query = searchQuery.toLowerCase().trim();
    let visibleCount = 0;
    
    if (query === '') {
        // Show all rows if search is empty
        rows.forEach(row => {
            row.style.display = '';
        });
        updateTotalCount();
        // Remove "no results" message if exists
        const noResultsMsg = tbody.querySelector('.no-results-row');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
        return;
    }
    
    rows.forEach(row => {
        // Skip the no-results row
        if (row.classList.contains('no-results-row')) {
            return;
        }
        
        // Get all text content from the row
        const sno = row.querySelector('.sno-input')?.value.toLowerCase() || '';
        const efile = row.querySelector('.efile-input')?.value.toLowerCase() || '';
        const contractorInput = row.querySelector('.contractor-input');
        const contractorLink = row.querySelector('.contractor-link');
        const contractor = (contractorInput ? contractorInput.value : (contractorLink ? contractorLink.textContent : '')).toLowerCase();
        const approvedDate = row.querySelector('.approved-date-input')?.value.toLowerCase() || '';
        const approvedAmount = row.querySelector('.approved-amount-input')?.value.toLowerCase() || '';
        const billFrequency = row.querySelector('.bill-frequency-input')?.value.toLowerCase() || '';
        const billDate = row.querySelector('.bill-date-input')?.value.toLowerCase() || '';
        const billDueDate = row.querySelector('.bill-due-date-input')?.value.toLowerCase() || '';
        const billPaidDate = row.querySelector('.bill-paid-date-input')?.value.toLowerCase() || '';
        const paidAmount = row.querySelector('.paid-amount-input')?.value.toLowerCase() || '';
        
        // Check if any field matches the search query
        const matches = sno.includes(query) || 
                       efile.includes(query) || 
                       contractor.includes(query) || 
                       approvedDate.includes(query) || 
                       approvedAmount.includes(query) || 
                       billFrequency.includes(query) || 
                       billDate.includes(query) || 
                       billDueDate.includes(query) || 
                       billPaidDate.includes(query) || 
                       paidAmount.includes(query);
        
        if (matches) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Remove existing "no results" message
    const existingNoResults = tbody.querySelector('.no-results-row');
    if (existingNoResults) {
        existingNoResults.remove();
    }
    
    // Show "no results" message if no rows are visible
    if (visibleCount === 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.className = 'no-results-row';
        noResultsRow.innerHTML = `
            <td colspan="12" style="text-align: center; padding: 40px; font-size: 18px; color: rgba(255, 255, 255, 0.6);">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                No results found
            </td>
        `;
        tbody.appendChild(noResultsRow);
    }
    
    // Update total count badge to show filtered count
    document.getElementById('totalBadge').textContent = `Total: ${visibleCount}`;
}

// Auto-save on input change (optional - saves to localStorage)
document.addEventListener('input', function(e) {
    if (e.target.matches('.sno-input, .efile-input, .contractor-input, .approved-date-input, .approved-amount-input, .bill-frequency-input, .bill-date-input, .bill-due-date-input, .bill-paid-date-input, .paid-amount-input')) {
        // Debounce auto-save
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            saveDataToStorage();
        }, 1000);
    }
});

// Auto-save on file change
document.addEventListener('change', function(e) {
    if (e.target.matches('.attachment-input')) {
        // Debounce auto-save
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            saveDataToStorage();
        }, 1000);
    }
});

