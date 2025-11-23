// Master data storage
let masterData = [];

// Fetch and decode master data at runtime
async function loadMasterData() {
  try {
    const response = await fetch('../assets/documents/master-data');
    if (!response.ok) {
throw new Error('Failed to fetch master data');
    }
    
    let base64Data = await response.text();
    
    // Remove HTML script tag if present (from VS Code Live Preview)
    const scriptTagEnd = base64Data.indexOf('</' + 'script>');
    if (scriptTagEnd !== -1) {
base64Data = base64Data.substring(scriptTagEnd + 9).trim();
    }
    
    // Decode base64 twice (double encoded)
    const decodedData = atob(atob(base64Data));
    
    // Parse CSV
    const lines = decodedData.split('\n').filter(line => line.trim());
    
    // Skip header/metadata rows - start from first actual data row
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
// Find the header row that contains "Sl. No" or similar
if (lines[i].includes('Sl. No') || lines[i].includes('Flat No')) {
  startIndex = i + 1;
  break;
}
    }
    
    // Parse data rows
    for (let i = startIndex; i < lines.length; i++) {
const line = lines[i];
if (!line.trim()) continue;

// Handle CSV parsing with quoted fields
const values = [];
let current = '';
let inQuotes = false;

for (let j = 0; j < line.length; j++) {
  const char = line[j];
  
  if (char === '"') {
    inQuotes = !inQuotes;
    // Don't add quote to current if it's the opening/closing quote
  } else if (char === ',' && !inQuotes) {
    // Remove quotes from value if present
    let cleaned = current.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }
    values.push(cleaned);
    current = '';
  } else {
    current += char;
  }
}
// Add last value
let cleaned = current.trim();
if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
  cleaned = cleaned.slice(1, -1);
}
values.push(cleaned);

if (values.length > 0) {
  // Map according to Google Sheets VLOOKUP range C:J
  // C = Flat No (values[2]), D = Handover (values[3]), E = Maintenance start (values[4]),
  // F = New charge start (values[5]), G = Days (values[6]), H = Months (values[7]),
  // I = Maintenance charge (values[8]), J = Sq. Ft (values[9])
  masterData.push({
    slNo: values[0] || '',
    appNo: values[1] || '',
    flatNo: values[2] || '',      // Column C - lookup key
    handover: values[3] || '',    // Column D - VLOOKUP index 2
    maintenanceStart: values[4] || '',
    newChargeStart: values[5] || '',
    daysUntilMonthEnd: values[6] || '',  // Column G - VLOOKUP index 5
    monthsUntil0104: values[7] || '',    // Column H - VLOOKUP index 6
    maintenanceCharge: values[8] || '',  // Column I - VLOOKUP index 7
    sqFt: values[9] || '',        // Column J - VLOOKUP index 8
    model: values[10] || '',
    raw: values
  });
}
    }
    
    console.log(`Loaded ${masterData.length} records from master data`);
    return masterData;
  } catch (error) {
    console.error('Error loading master data:', error);
    return [];
  }
}

// Find flat data by block and door number
function findFlatData(block, doorNumber) {
  const flatKey = `${block}-${doorNumber}`.toUpperCase();
  return masterData.find(record => {
    const recordFlatNo = (record.flatNo || '').toUpperCase();
    return recordFlatNo === flatKey || recordFlatNo.includes(flatKey);
  });
}

// Initialize master data on page load
loadMasterData().then(() => {
  console.log('Master data loaded successfully');
});

const blockInput = document.getElementById('block');
const doorNumberInput = document.getElementById('doorNumber');
const flatDisplay = document.getElementById('flatDisplay');

// Store handover date and sqft for later use
let storedHandoverDate = '';
let storedHandoverDateDisplay = ''; // Store original format for display
let storedSqft = '';

// Auto-update flat display when block or door number changes
function updateFlatDisplay() {
  const block = blockInput.value.trim().toUpperCase();
  const doorNumber = doorNumberInput.value.trim();
  
  // Clear stored values if block or door number is empty
  if (!block || !doorNumber) {
    flatDisplay.style.display = 'none';
    storedHandoverDate = '';
    storedHandoverDateDisplay = '';
    storedSqft = '';
    return;
  }
  
  flatDisplay.textContent = `Flat: ${block}-${doorNumber}`;
  flatDisplay.style.display = 'block';
  
  // Try to get data from master data and store it
  const flatData = findFlatData(block, doorNumber);
  if (flatData) {
    // Store handover date from CSV
    if (flatData.handover && flatData.handover !== 'No handover' && flatData.handover.trim() !== '') {
const dateParts = flatData.handover.split('/');
if (dateParts.length === 3) {
  const day = dateParts[0].padStart(2, '0');
  const month = dateParts[1].padStart(2, '0');
  let year = dateParts[2].trim();
  
  // Handle 2-digit year (assume 20xx if < 100)
  if (year.length === 2) {
    year = '20' + year;
  }
  
  // Store in YYYY-MM-DD format for calculations
  storedHandoverDate = `${year}-${month}-${day}`;
  
  // Store in DD-MM-YYYY format for display
  storedHandoverDateDisplay = `${day}-${month}-${year}`;
} else {
  storedHandoverDate = flatData.handover;
  storedHandoverDateDisplay = flatData.handover;
}
    } else {
storedHandoverDate = '';
storedHandoverDateDisplay = '';
    }
    
    // Store square footage from CSV (remove commas for calculation)
    if (flatData.sqFt && flatData.sqFt.trim() !== '') {
storedSqft = flatData.sqFt.replace(/,/g, '').replace(/"/g, '').trim();
    } else {
storedSqft = '';
    }
  } else {
    // Clear stored values if flat not found
    storedHandoverDate = '';
    storedHandoverDateDisplay = '';
    storedSqft = '';
  }
}

blockInput.addEventListener('input', updateFlatDisplay);
doorNumberInput.addEventListener('input', updateFlatDisplay);

// Calculate maintenance using data from CSV
document.getElementById('calculatorForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const block = blockInput.value.trim().toUpperCase();
  const doorNumber = document.getElementById('doorNumber').value.trim();
  
  // Get flat data from master data
  const flatData = findFlatData(block, doorNumber);
  
  if (!flatData) {
    alert('Flat data not found. Please check your block and door number.');
    return;
  }
  
  // Get values from CSV (matching Google Sheets VLOOKUP formulas)
  const days = flatData.daysUntilMonthEnd || '0';  // Column G - VLOOKUP index 5
  const months = flatData.monthsUntil0104 || '0';  // Column H - VLOOKUP index 6
  const maintenanceCharge = flatData.maintenanceCharge || '0';  // Column I - VLOOKUP index 7
  
  // Debug logging - check raw values
  console.log('Raw flatData:', flatData);
  console.log('Raw days value:', days);
  console.log('Raw months value:', months);
  
  // Parse values (handle comma-separated numbers and empty strings)
  let daysNum = 0;
  let monthsNum = 0;
  
  if (days && days.toString().trim() !== '') {
    const cleanedDays = days.toString().replace(/,/g, '').replace(/"/g, '').trim();
    daysNum = parseInt(cleanedDays, 10);
    if (isNaN(daysNum)) daysNum = 0;
  }
  
  if (months && months.toString().trim() !== '') {
    const cleanedMonths = months.toString().replace(/,/g, '').replace(/"/g, '').trim();
    monthsNum = parseInt(cleanedMonths, 10);
    if (isNaN(monthsNum)) monthsNum = 0;
  }
  
  const totalMaintenanceNum = parseFloat(maintenanceCharge.toString().replace(/,/g, '').replace(/"/g, '').trim()) || 0;
  
  // Debug logging after parsing
  console.log('Parsed daysNum:', daysNum);
  console.log('Parsed monthsNum:', monthsNum);
  
  // CRITICAL: Update labels IMMEDIATELY after parsing to replace "Days" and "Months" with actual values
  // This replaces the static text "Maintenance for Days" with "Maintenance for 24 days" (example)
  const maintenanceDaysLabelEl = document.getElementById('maintenanceDaysLabel');
  const maintenanceMonthsLabelEl = document.getElementById('maintenanceMonthsLabel');
  
  // Ensure we have valid values to display
  const displayDaysNum = (isNaN(daysNum) || daysNum === undefined || daysNum === null) ? 0 : daysNum;
  const displayMonthsNum = (isNaN(monthsNum) || monthsNum === undefined || monthsNum === null) ? 0 : monthsNum;
  
  console.log('=== UPDATING LABELS ===');
  console.log('Display Days:', displayDaysNum, 'Display Months:', displayMonthsNum);
  
  // Update the Days label - replace static "Days" with actual number
  if (maintenanceDaysLabelEl) {
    const newLabelText = `Maintenance for ${displayDaysNum} days (Rs. 4 × SqFt × Days × 12/365):`;
    maintenanceDaysLabelEl.innerHTML = newLabelText;
    console.log('✓ Days label updated:', maintenanceDaysLabelEl.textContent);
  } else {
    console.error('✗ maintenanceDaysLabelEl element NOT found in DOM!');
  }
  
  // Update the Months label - replace static "Months" with actual number
  if (maintenanceMonthsLabelEl) {
    const newLabelText = `Maintenance for ${displayMonthsNum} Months (Rs. 4 × SqFt × Months):`;
    maintenanceMonthsLabelEl.innerHTML = newLabelText;
    console.log('✓ Months label updated:', maintenanceMonthsLabelEl.textContent);
  } else {
    console.error('✗ maintenanceMonthsLabelEl element NOT found in DOM!');
  }
  
  // Calculate maintenance for days and months separately
  // Maintenance for days uses the days value from CSV
  // Maintenance for months uses the months value from CSV
  const totalDays = daysNum + (monthsNum * 30); // Total days from handover to month end
  
  // Format numbers with commas and 2 decimal places
  function formatCurrency(num) {
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  function formatNumber(num) {
    return num.toLocaleString('en-IN');
  }
  
  // Display handover date and sqft in results
  // Use storedHandoverDateDisplay which is already in DD-MM-YYYY format
  document.getElementById('handoverDateResult').textContent = storedHandoverDateDisplay || '-';
  document.getElementById('sqftResult').textContent = storedSqft ? formatNumber(parseFloat(storedSqft)) : '-';
  
  // Display results from CSV data
  document.getElementById('daysResult').textContent = totalDays + ' days';
  document.getElementById('monthsResult').textContent = monthsNum + ' months';
  document.getElementById('remainingDaysResult').textContent = daysNum + ' days';
  
  // Calculate maintenance for days and months using the formula
  const sqft = parseFloat(storedSqft) || 0;
  let maintenanceForDays = 0;
  let maintenanceForMonths = 0;
  
  if (sqft > 0 && daysNum > 0 && monthsNum >= 0) {
    // Maintenance for days: 4 × SqFt × number of days × 12/365
    maintenanceForDays = 4 * sqft * daysNum * (12 / 365);
    
    // Maintenance for months: 4 × SqFt × number of months
    maintenanceForMonths = 4 * sqft * monthsNum;
  }
  
  // Use total maintenance from CSV if calculated total doesn't match
  const calculatedTotal = maintenanceForDays + maintenanceForMonths;
  const finalTotal = totalMaintenanceNum > 0 ? totalMaintenanceNum : calculatedTotal;
  
  // Display formatted results
  document.getElementById('maintenanceDaysResult').textContent = formatCurrency(maintenanceForDays);
  document.getElementById('maintenanceMonthsResult').textContent = formatCurrency(maintenanceForMonths);
  document.getElementById('totalResult').textContent = formatCurrency(finalTotal);
  
  // Show results first
  document.getElementById('results').style.display = 'block';
  
  // Force update labels AFTER results div is visible (most reliable timing)
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    const finalMaintenanceDaysLabelEl = document.querySelector('#maintenanceDaysLabel');
    const finalMaintenanceMonthsLabelEl = document.querySelector('#maintenanceMonthsLabel');
    
    const finalDaysValue = (isNaN(daysNum) || daysNum === undefined || daysNum === null) ? 0 : daysNum;
    const finalMonthsValue = (isNaN(monthsNum) || monthsNum === undefined || monthsNum === null) ? 0 : monthsNum;
    
    console.log('Final update - Values:', { finalDaysValue, finalMonthsValue, daysNum, monthsNum });
    
    if (finalMaintenanceDaysLabelEl) {
const labelText = `Maintenance for ${finalDaysValue} days (Rs. 4 × SqFt × Days × 12/365):`;
finalMaintenanceDaysLabelEl.textContent = labelText;
finalMaintenanceDaysLabelEl.innerHTML = labelText.replace(String(finalDaysValue), `<strong>${finalDaysValue}</strong>`);
console.log('Final update - Days label set to:', finalMaintenanceDaysLabelEl.textContent);
    } else {
console.error('finalMaintenanceDaysLabelEl not found in final update!');
    }
    
    if (finalMaintenanceMonthsLabelEl) {
const labelText = `Maintenance for ${finalMonthsValue} Months (Rs. 4 × SqFt × Months):`;
finalMaintenanceMonthsLabelEl.textContent = labelText;
finalMaintenanceMonthsLabelEl.innerHTML = labelText.replace(String(finalMonthsValue), `<strong>${finalMonthsValue}</strong>`);
console.log('Final update - Months label set to:', finalMaintenanceMonthsLabelEl.textContent);
    } else {
console.error('finalMaintenanceMonthsLabelEl not found in final update!');
    }
  });
  
  // Scroll to results
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
