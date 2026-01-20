// Global variables
let rowCounter = 0;
let savedData = [];
const STORAGE_KEY = 'epbgData';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeDarkMode(); // Dark mode first
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

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            filterTable(e.target.value);
        });
    }
}

// Mobile menu functionality
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');

    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);

    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('mobile-open');
            mobileMenuToggle.classList.toggle('active');
            overlay.classList.toggle('active');

            const icon = mobileMenuToggle.querySelector('i');
            if (sidebar.classList.contains('mobile-open')) {
                icon.className = 'fas fa-times';
                document.body.style.overflow = 'hidden';
            } else {
                icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            }
        });

        overlay.addEventListener('click', function () {
            sidebar.classList.remove('mobile-open');
            mobileMenuToggle.classList.remove('active');
            overlay.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            icon.className = 'fas fa-bars';
            document.body.style.overflow = '';
        });

        const navItems = sidebar.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function () {
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

        window.addEventListener('resize', function () {
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
            <input type="text" class="contractor-input" placeholder="Enter Contractor Name">
        </td>
        <td>
            <input type="text" class="po-no-input" placeholder="Enter P.O No">
        </td>
        <td>
            <input type="text" class="bg-no-input" placeholder="Enter BG No">
            <a href="#" class="bg-link" style="display: none;" target="_blank"></a>
        </td>
        <td>
            <input type="date" class="bg-date-input">
        </td>
        <td>
            <input type="text" class="bg-amount-input" placeholder="Enter BG Amount">
        </td>
        <td>
            <input type="text" class="bg-validity-input" placeholder="Enter BG Validity">
        </td>
        <td>
            <input type="text" class="gem-bid-input" placeholder="Enter GeM Bid No">
        </td>
        <td>
            <input type="text" class="ref-efile-input" placeholder="Enter Ref Efile No">
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

    const fileInput = row.querySelector('.attachment-input');
    fileInput.addEventListener('change', function (e) {
        validateFileSize(e.target);
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
            fileNameSpan.style.color = 'var(--accent-primary)';
            fileNameSpan.style.fontSize = '12px';
            return true;
        }
    }
    return false;
}

// Update BG No hyperlink based on BG No and attachment (called on Save)
function updateBgHyperlink(row) {
    const bgInput = row.querySelector('.bg-no-input');
    const bgLink = row.querySelector('.bg-link');
    const attachmentInput = row.querySelector('.attachment-input');
    const file = attachmentInput?.files[0];

    if (!bgInput || !bgLink) return;

    const bgNo = bgInput.value.trim();

    if (bgLink.dataset.objectUrl) {
        URL.revokeObjectURL(bgLink.dataset.objectUrl);
        delete bgLink.dataset.objectUrl;
    }

    if (file && bgNo) {
        const fileUrl = URL.createObjectURL(file);
        bgLink.href = '#';
        bgLink.textContent = bgNo;
        bgLink.dataset.objectUrl = fileUrl;
        bgLink.dataset.fileName = file.name;
        bgLink.style.display = 'inline-block';
        bgLink.style.color = 'var(--accent-primary)';
        bgLink.style.textDecoration = 'underline';
        bgLink.style.cursor = 'pointer';
        
        bgLink.replaceWith(bgLink.cloneNode(true));
        const newLink = row.querySelector('.bg-link');
        
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            openFileVisually(fileUrl, file.name, file.type);
        });
        
        bgInput.style.display = 'none';
    } else {
        bgLink.style.display = 'none';
        bgInput.style.display = '';
        bgLink.removeAttribute('href');
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

// Convert base64 string back to File
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

// Open file visually in browser
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

// Delete row
function deleteRow(button) {
    if (confirm('Are you sure you want to delete this row?')) {
        const row = button.closest('tr');
        row.remove();
        updateTotalCount();
        saveDataToStorage();
    }
}

// Save data (and update BG link after Save button click)
function saveData() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    savedData = [];

    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const contractor = row.querySelector('.contractor-input')?.value || '';
        const poNo = row.querySelector('.po-no-input')?.value || '';
        const bgInput = row.querySelector('.bg-no-input');
        const bgLink = row.querySelector('.bg-link');
        let bgNo = '';
        if (bgInput && bgInput.style.display !== 'none') {
            bgNo = bgInput.value || '';
        } else if (bgLink) {
            bgNo = bgLink.textContent || '';
        }
        const bgDate = row.querySelector('.bg-date-input')?.value || '';
        const bgAmount = row.querySelector('.bg-amount-input')?.value || '';
        const bgValidity = row.querySelector('.bg-validity-input')?.value || '';
        const gemBid = row.querySelector('.gem-bid-input')?.value || '';
        const refEfile = row.querySelector('.ref-efile-input')?.value || '';
        const attachmentInput = row.querySelector('.attachment-input');
        const file = attachmentInput?.files[0];

        updateBgHyperlink(row);

        const rowData = {
            sno, contractor, poNo, bgNo, bgDate, bgAmount, bgValidity, gemBid, refEfile,
            fileName: file ? file.name : '',
            fileSize: file ? file.size : 0
        };

        savedData.push(rowData);
    });

    saveDataToStorage();
    alert('Data saved successfully!');
}
// Save data to localStorage (with file as base64)
async function saveDataToStorage() {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const dataToSave = [];

    for (const row of rows) {
        const sno = row.querySelector('.sno-input')?.value || '';
        const contractor = row.querySelector('.contractor-input')?.value || '';
        const poNo = row.querySelector('.po-no-input')?.value || '';
        const bgInput = row.querySelector('.bg-no-input');
        const bgLink = row.querySelector('.bg-link');
        const bgNo = bgInput && bgInput.style.display !== 'none'
            ? bgInput.value
            : (bgLink?.textContent || '');
        const bgDate = row.querySelector('.bg-date-input')?.value || '';
        const bgAmount = row.querySelector('.bg-amount-input')?.value || '';
        const bgValidity = row.querySelector('.bg-validity-input')?.value || '';
        const gemBid = row.querySelector('.gem-bid-input')?.value || '';
        const refEfile = row.querySelector('.ref-efile-input')?.value || '';
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
            sno, contractor, poNo, bgNo, bgDate, bgAmount, bgValidity, gemBid, refEfile,
            fileName, fileBase64, fileType
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

                const hasFile = rowData.fileName && rowData.fileBase64;
                const bgValue = rowData.bgNo || '';

                row.innerHTML = `
                    <td>
                        <input type="text" class="sno-input" placeholder="Enter S.No" value="${snoValue}">
                    </td>
                    <td>
                        <input type="text" class="contractor-input" placeholder="Enter Contractor Name" value="${rowData.contractor || ''}">
                    </td>
                    <td>
                        <input type="text" class="po-no-input" placeholder="Enter P.O No" value="${rowData.poNo || ''}">
                    </td>
                    <td>
                        <input type="text" class="bg-no-input" placeholder="Enter BG No" value="${bgValue}" ${hasFile ? 'style="display: none;"' : ''}>
                        <a href="#" class="bg-link" ${hasFile ? 'style="display: inline-block; color: var(--accent-primary); text-decoration: underline; cursor: pointer;"' : 'style="display: none;"'}">${bgValue}</a>
                    </td>
                    <td>
                        <input type="date" class="bg-date-input" value="${rowData.bgDate || ''}">
                    </td>
                    <td>
                        <input type="text" class="bg-amount-input" placeholder="Enter BG Amount" value="${rowData.bgAmount || ''}">
                    </td>
                    <td>
                        <input type="text" class="bg-validity-input" placeholder="Enter BG Validity" value="${rowData.bgValidity || ''}">
                    </td>
                    <td>
                        <input type="text" class="gem-bid-input" placeholder="Enter GeM Bid No" value="${rowData.gemBid || ''}">
                    </td>
                    <td>
                        <input type="text" class="ref-efile-input" placeholder="Enter Ref Efile No" value="${rowData.refEfile || ''}">
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

                        const bgLink = row.querySelector('.bg-link');
                        const fileUrl = URL.createObjectURL(file);
                        bgLink.href = '#';
                        bgLink.dataset.objectUrl = fileUrl;
                        bgLink.dataset.fileName = file.name;
                        
                        bgLink.replaceWith(bgLink.cloneNode(true));
                        const newLink = row.querySelector('.bg-link');
                        
                        newLink.addEventListener('click', function(e) {
                            e.preventDefault();
                            openFileVisually(fileUrl, file.name, file.type);
                        });
                    } catch (error) {
                        console.error('Error restoring file:', error);
                    }
                }

                const fileInput = row.querySelector('.attachment-input');
                if (fileInput) {
                    fileInput.addEventListener('change', function (e) {
                        validateFileSize(e.target);
                    });
                }
            });

            updateTotalCount();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
}

// Refresh page
function refreshPage() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    location.reload();
}

// Print table
function printTable() {
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
            <title>EPBG's - Print</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #333; padding: 10px; text-align: left; font-size: 12px; }
                th { background-color: #42a5f5; color: white; font-weight: bold; }
                tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>EPBG's</h1>
            <table>
                <thead>
                    <tr>
                        <th>S.NO</th>
                        <th>CONTRACTOR NAME</th>
                        <th>P.O NO</th>
                        <th>BG NO</th>
                        <th>BG DATE</th>
                        <th>BG AMOUNT</th>
                        <th>BG VALIDITY</th>
                        <th>GeM BID NO</th>
                        <th>REF EFILE NO</th>
                        <th>ATTACHMENT</th>
                    </tr>
                </thead>
                <tbody>
    `;

    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const contractor = row.querySelector('.contractor-input')?.value || '';
        const poNo = row.querySelector('.po-no-input')?.value || '';
        const bgInput = row.querySelector('.bg-no-input');
        const bgLink = row.querySelector('.bg-link');
        const bgNo = bgInput && bgInput.style.display !== 'none'
            ? bgInput.value
            : (bgLink?.textContent || '');
        const bgDate = row.querySelector('.bg-date-input')?.value || '';
        const bgAmount = row.querySelector('.bg-amount-input')?.value || '';
        const bgValidity = row.querySelector('.bg-validity-input')?.value || '';
        const gemBid = row.querySelector('.gem-bid-input')?.value || '';
        const refEfile = row.querySelector('.ref-efile-input')?.value || '';
        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';

        tableHTML += `
            <tr>
                <td>${sno}</td>
                <td>${contractor}</td>
                <td>${poNo}</td>
                <td>${bgNo}</td>
                <td>${bgDate}</td>
                <td>${bgAmount}</td>
                <td>${bgValidity}</td>
                <td>${gemBid}</td>
                <td>${refEfile}</td>
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

    const exportData = [];

    exportData.push([
        'S.NO', 'Contractor Name', 'P.O No', 'BG No', 'BG Date',
        'BG Amount', 'BG Validity', 'GeM Bid No', 'Ref Efile No',
        'Attachment File Name'
    ]);

    rows.forEach(row => {
        const sno = row.querySelector('.sno-input')?.value || '';
        const contractor = row.querySelector('.contractor-input')?.value || '';
        const poNo = row.querySelector('.po-no-input')?.value || '';
        const bgInput = row.querySelector('.bg-no-input');
        const bgLink = row.querySelector('.bg-link');
        const bgNo = bgInput && bgInput.style.display !== 'none'
            ? bgInput.value
            : (bgLink?.textContent.trim() || '');
        const bgDate = row.querySelector('.bg-date-input')?.value || '';
        const bgAmount = row.querySelector('.bg-amount-input')?.value || '';
        const bgValidity = row.querySelector('.bg-validity-input')?.value || '';
        const gemBid = row.querySelector('.gem-bid-input')?.value || '';
        const refEfile = row.querySelector('.ref-efile-input')?.value || '';
        const fileName = row.querySelector('.file-name')?.textContent.trim() || '';

        exportData.push([
            sno, contractor, poNo, bgNo, bgDate, bgAmount,
            bgValidity, gemBid, refEfile, fileName
        ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    ws['!cols'] = [
        { wch: 10 }, { wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 15 },
        { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 30 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'EPBGs');

    const filename = `epbg_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
}

// Update total count
function updateTotalCount() {
    const tbody = document.getElementById('tableBody');
    const rowCount = tbody.querySelectorAll('tr').length;
    document.getElementById('totalBadge').textContent = `Total: ${rowCount}`;
}

// Filter table
function filterTable(searchQuery) {
    const tbody = document.getElementById('tableBody');
    const rows = tbody.querySelectorAll('tr');
    const query = searchQuery.toLowerCase().trim();
    let visibleCount = 0;

    if (query === '') {
        rows.forEach(row => {
            row.style.display = '';
        });
        updateTotalCount();
        const noResultsMsg = tbody.querySelector('.no-results-row');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
        return;
    }

    rows.forEach(row => {
        if (row.classList.contains('no-results-row')) {
            return;
        }

        const sno = row.querySelector('.sno-input')?.value.toLowerCase() || '';
        const contractor = row.querySelector('.contractor-input')?.value.toLowerCase() || '';
        const poNo = row.querySelector('.po-no-input')?.value.toLowerCase() || '';
        const bgNo = (row.querySelector('.bg-no-input')?.value || row.querySelector('.bg-link')?.textContent || '').toLowerCase();
        const bgDate = row.querySelector('.bg-date-input')?.value.toLowerCase() || '';
        const bgAmount = row.querySelector('.bg-amount-input')?.value.toLowerCase() || '';
        const bgValidity = row.querySelector('.bg-validity-input')?.value.toLowerCase() || '';
        const gemBid = row.querySelector('.gem-bid-input')?.value.toLowerCase() || '';
        const refEfile = row.querySelector('.ref-efile-input')?.value.toLowerCase() || '';

        const matches =
            sno.includes(query) ||
            contractor.includes(query) ||
            poNo.includes(query) ||
            bgNo.includes(query) ||
            bgDate.includes(query) ||
            bgAmount.includes(query) ||
            bgValidity.includes(query) ||
            gemBid.includes(query) ||
            refEfile.includes(query);

        if (matches) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    const existingNoResults = tbody.querySelector('.no-results-row');
    if (existingNoResults) {
        existingNoResults.remove();
    }

    if (visibleCount === 0) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.className = 'no-results-row';
        noResultsRow.innerHTML = `
            <td colspan="11" style="text-align: center; padding: 40px; font-size: 18px; color: var(--text-tertiary);">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                No results found
            </td>
        `;
        tbody.appendChild(noResultsRow);
    }

    document.getElementById('totalBadge').textContent = `Total: ${visibleCount}`;
}

// Auto-save on input and file change
document.addEventListener('input', function (e) {
    if (e.target.matches('.sno-input, .contractor-input, .po-no-input, .bg-no-input, .bg-date-input, .bg-amount-input, .bg-validity-input, .gem-bid-input, .ref-efile-input')) {
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            saveDataToStorage();
        }, 1000);
    }
});

document.addEventListener('change', function (e) {
    if (e.target.matches('.attachment-input')) {
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            saveDataToStorage();
        }, 1000);
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