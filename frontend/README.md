# Data Dashboard - Project Documentation

A comprehensive data management dashboard with dark glossy theme featuring contractor list management and bill tracking capabilities.

## Features

### 🎨 Design
- **Dark Glossy Theme**: Purple/blue gradient background with glassmorphism effects
- **Responsive Layout**: Works seamlessly across different screen sizes
- **Modern UI**: Smooth transitions, hover effects, and professional styling

### 📊 Pages

#### 1. Contractor List (index.html)
Main dashboard for managing contractor data with the following columns:
- **S.NO**: Serial number (auto-increments)
- **E-FILE**: Text input for file reference
- **CONTRACTOR**: Text input that converts to hyperlink after saving (if file attached)
- **DESCRIPTION**: Text input for description
- **VALUE**: Text input for value/amount
- **START DATE**: Date picker
- **END DATE**: Date picker
- **DURATION (DAYS)**: Auto-calculated from dates, shows "X days left"
  - Red color warning if ≤ 60 days
- **ATTACHMENT**: File upload (max 10MB)
- **ACTION**: Delete button for each row

#### 2. Bill Tracker (bill-tracker.html)
Dedicated page for tracking bills with the following columns:
- **S.NO**: Serial number
- **E-FILE**: Text input for file reference
- **CONTRACTOR**: Text input that converts to hyperlink (if file attached)
- **APPROVED DATE**: Date picker
- **APPROVED AMOUNT**: Text input for amount
- **BILL FREQUENCY**: Dropdown with options:
  - Monthly
  - Quarterly
  - Half Yearly
  - Annually
- **BILL DATE**: Date picker
- **BILL DUE DATE**: Date picker
- **BILL PAID DATE**: Date picker
- **PAID AMOUNT**: Text input for amount
- **ATTACHMENT**: File upload (max 10MB)
- **ACTION**: Delete button for each row

### ✨ Functionality

#### Core Features
1. **Add Row**: Add new data entry rows
2. **Save**: Persist data and convert contractor text to hyperlinks (when files attached)
3. **Refresh**: Reload page while maintaining data (localStorage)
4. **Print**: Generate formatted table in new window for printing
5. **Export**: Download data as Excel (.xlsx) file
6. **Total Count**: Real-time display of record count

#### Smart Features
- **Search Functionality**: 
  - Real-time search across all fields
  - Shows "No results found" message when no matches
  - Refresh button clears search and shows all records
  - Updates total count to show filtered results

- **Auto-save**: 
  - Automatic saving to localStorage on input changes
  - Data persists across page refreshes and browser sessions

- **File Management**:
  - File size validation (max 10MB)
  - File name display after upload
  - Contractor links open attached files in new tab

- **Duration Calculation**:
  - Automatic calculation between start and end dates
  - Color-coded warnings (red if ≤ 60 days)
  - Displays "Invalid dates" if end date is before start date

### 🎯 Navigation
- **Sidebar Menu**:
  - Contractor List → index.html
  - Bill Tracker → bill-tracker.html
  - EPBG's (placeholder for future module)
- Active page highlighted in sidebar

### 💾 Data Persistence
- **localStorage** used for data persistence
- Separate storage keys:
  - `dashboardData` for Contractor List
  - `billTrackerData` for Bill Tracker
- Data survives page refresh and browser restart

## File Structure

```
project-jeeva/
├── index.html              # Contractor List page
├── bill-tracker.html       # Bill Tracker page
├── styles.css              # Shared styles for both pages
├── script.js               # JavaScript for Contractor List
├── bill-tracker.js         # JavaScript for Bill Tracker
└── README.md              # This file
```

## Dependencies

### External Libraries (via CDN)
1. **Font Awesome 6.4.0** - Icons
   ```html
   https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
   ```

2. **SheetJS (xlsx) 0.18.5** - Excel export functionality
   ```html
   https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
   ```

## How to Use

### Getting Started
1. Open `index.html` in a web browser
2. Use the sidebar to navigate between modules

### Adding Data
1. Click **"Add Row"** button
2. Fill in the required fields
3. Upload attachment (optional, max 10MB)
4. Click **"Save"** to persist data

### Searching Data
1. Type in the search bar (top right)
2. Table filters in real-time
3. Click **"Refresh"** to clear search and show all records

### Exporting Data
- **Print**: Click Print button to open print preview
- **Export**: Click Export button to download as Excel file

### Managing Records
- **Edit**: Modify any field directly in the table
- **Delete**: Click delete button in Action column
- **Auto-save**: Changes save automatically after 1 second

## Responsive Design

The dashboard is **fully responsive** and optimized for all devices:

### 📱 Mobile (576px and below)
- **Hamburger menu** - Toggle sidebar with mobile menu button
- **Overlay backdrop** - Prevents background interaction when menu is open
- **Icon-only action buttons** - Space-efficient button layout
- **Full-width inputs** - Optimized for touch input
- **Horizontal scrolling** - Tables scroll smoothly on small screens
- **Stacked header elements** - Search bar moves to separate row
- **Larger touch targets** - All buttons and inputs are touch-friendly

### 📱 Tablet (768px to 1024px)
- **Collapsible sidebar** - Sidebar slides in from left
- **Responsive table** - Horizontal scroll for data tables
- **Adjusted spacing** - Optimized padding and margins
- **Flexible header** - Search and profile adapt to screen size

### 💻 Desktop (1024px and above)
- **Fixed sidebar** - Always visible navigation
- **Full table view** - All columns visible without scrolling
- **Hover effects** - Enhanced interactions on desktop
- **Multi-column layout** - Efficient use of screen space

### 🔄 Orientation Support
- **Portrait mode** - Optimized vertical layout
- **Landscape mode** - Special adjustments for short screens
- **Auto-adjustment** - Seamless transition between orientations

### 📐 Breakpoints
- **Extra Small**: ≤ 400px
- **Small**: ≤ 576px
- **Medium**: ≤ 768px
- **Large**: ≤ 1024px
- **Extra Large**: > 1024px

### ✨ Responsive Features
- ✅ Touch-optimized inputs and buttons
- ✅ Smooth transitions and animations
- ✅ Prevents body scroll when menu is open
- ✅ Auto-close menu on navigation
- ✅ Auto-adjust on window resize
- ✅ Horizontal table scrolling with momentum
- ✅ Responsive typography scaling
- ✅ Adaptive profile display
- ✅ Mobile-friendly file upload

## Browser Compatibility
- Chrome/Edge (Recommended) ✅
- Firefox ✅
- Safari ✅
- Opera ✅
- Mobile browsers (iOS Safari, Chrome Mobile) ✅

## Color Scheme
- **Primary**: Purple gradient (#7b2cbf to #9d4edd)
- **Background**: Dark blue gradient (#1a1a2e to #0f3460)
- **Accent**: Cyan (#00d4ff)
- **Warning**: Red (#ff4444)
- **Text**: White with various opacity levels

## Technical Details

### localStorage Keys
- `dashboardData` - Contractor List data
- `billTrackerData` - Bill Tracker data

### File Size Limits
- Maximum attachment size: 10MB
- Validation with user-friendly error messages

### Date Calculations
- Duration calculated in days
- Warning threshold: 60 days or less
- Handles invalid date ranges

## Mobile Usage Guide

### Opening the Menu
1. Tap the **☰ menu icon** in the top-left corner
2. Sidebar slides in from the left
3. Background is dimmed with overlay

### Closing the Menu
- Tap the **× close icon** 
- Tap anywhere on the dark overlay
- Tap any navigation link
- Menu auto-closes after navigation

### Table Navigation
- **Swipe left/right** to scroll through table columns
- **Pinch to zoom** for detailed view (if needed)
- Use **landscape mode** for better table visibility

### Data Entry on Mobile
1. Tap **Add Row** button (full width on mobile)
2. Tap any input field to edit
3. Use native date pickers for dates
4. Tap file input to access camera/gallery
5. Tap **Save** to persist changes

## Future Enhancements
- EPBG's module implementation
- User authentication
- Database backend integration
- Advanced filtering options
- Data import functionality
- PDF export option
- Dark/Light mode toggle
- Offline mode support
- Progressive Web App (PWA) features

## Notes
⚠️ **Important**: File attachments are stored as URLs in browser session. After page refresh, files need to be re-uploaded to restore hyperlink functionality.

## Support
For issues or questions, please refer to the project documentation or contact the development team.

---
**Version**: 1.0  
**Last Updated**: January 2026  
**Developed with**: HTML5, CSS3, JavaScript (Vanilla)

