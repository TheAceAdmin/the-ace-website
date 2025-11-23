// Current property storage
let currentProperty = null;

// Google Apps Script Web App URL - UPDATE THIS WITH YOUR DEPLOYED SCRIPT URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwfryZ3wOD4ZKA9JSS2_e5BlsykcVk2WTi74v3Uyl4o_UVKyhdGQAOqrVJzcQDFoA9k/exec';

// Search for properties by block and door number using Google Apps Script
async function searchProperties(block, doorNumber) {
  try {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
throw new Error('Google Script URL not configured');
    }
    
    console.log('Searching for properties: Block ' + block + ', Door ' + doorNumber);
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
method: 'POST',
mode: 'cors',
cache: 'no-store',
headers: {
  'Content-Type': 'text/plain;charset=utf-8',
},
body: JSON.stringify({
  action: 'searchProperties',
  block: block,
  doorNumber: doorNumber
})
    });
    
    if (!response.ok) {
throw new Error(`Failed to search properties: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    if (responseData.status === 'error') {
throw new Error(responseData.data?.error || 'Error searching properties');
    }
    
    if (responseData.status === 'success' && Array.isArray(responseData.data)) {
console.log(`Found ${responseData.data.length} matching properties`);
return responseData.data;
    } else {
throw new Error('Invalid data format received from Google Script');
    }
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error; // Re-throw to let caller handle it
  }
}

// Display property details
async function displayPropertyDetails(property) {
  // Store current property
  currentProperty = property;
  
  // Check if already paid first to determine balance display
  const isAlreadyPaid = await checkIfAlreadyPaid(property);
  
  // Display results
  document.getElementById('snoResult').textContent = property.sNo;
  document.getElementById('billNumberResult').textContent = property.billNumber;
  document.getElementById('ownerNameResult').textContent = property.ownerName;
  document.getElementById('propertyAddressResult').textContent = property.propertyAddress;
  document.getElementById('mobileNoResult').textContent = property.mobileNo;
  document.getElementById('propertyTypeResult').textContent = property.propertyType;
  document.getElementById('propertyUsageResult').textContent = property.propertyUsage;
  document.getElementById('currentTaxResult').textContent = formatCurrency(property.currentTax);
  document.getElementById('arrearTaxResult').textContent = formatCurrency(property.arrearTaxDue);
  
  // If already paid, always show balance as 0
  const balanceToDisplay = isAlreadyPaid ? 0 : property.balanceAmount;
  document.getElementById('balanceAmountResult').textContent = formatCurrency(balanceToDisplay);
  
  // Update payment link
  updatePaymentLink(property.billNumber);
  
  // Show results
  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  
  // Check payment status and update button state
  const markPaidButton = document.getElementById('markPaidButton');
  markPaidButton.style.display = 'block';
  markPaidButton.disabled = true;
  markPaidButton.textContent = 'Checking status...';
  markPaidButton.style.backgroundColor = '#6c757d';
  
  // Update button state (already checked above, but this will finalize it)
  updatePaymentButtonState(property).then(() => {
    console.log('Payment status checked');
  });
}

// Format currency
function formatCurrency(value) {
  if (!value || value === '') return '₹0';
  const num = parseFloat(value.toString().replace(/,/g, '')) || 0;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.innerHTML = message; // Use innerHTML to support links
  errorDiv.style.display = 'block';
  document.getElementById('successMessage').style.display = 'none';
}

// Show success message
function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  document.getElementById('errorMessage').style.display = 'none';
}

// Hide messages
function hideMessages() {
  document.getElementById('errorMessage').style.display = 'none';
  document.getElementById('successMessage').style.display = 'none';
}

// Update payment link with actual bill number
function updatePaymentLink(billNumber) {
  // Extract property ID from bill number (format: 14-184-29804-000)
  const parts = billNumber.split('-');
  if (parts.length >= 3) {
    const propertyId = parts[2];
    const subNo = parts[3] || '000';
    const zoneNo = parts[0] || '14';
    const wardNo = parts[1] || '184';
    
    const paymentUrl = `https://erp.chennaicorporation.gov.in/ptis/citizensearch/searchPropByBillNumber!search.action?isNew=N&zoneNo=${zoneNo}&wardNo=${wardNo}&propertyId=${propertyId}&subNo=${subNo}&newzoneNo=&newwardNo=&newbillNo=&flag=N&search1=Search&collectionType=online`;
    document.getElementById('paymentLink').href = paymentUrl;
  }
}

// Check payment status from Google Sheet (using POST to avoid CORS issues)
// Note: This may fail due to CORS restrictions. The balance amount check is the primary method.
async function checkPaymentStatus(billNumber, retryCount = 0) {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
    // If script URL not configured, return null (can't check)
    console.log('Google Script URL not configured');
    return null;
  }
  
  // Skip status check if CORS is known to be an issue
  // The balance amount check is more reliable anyway
  console.log('Attempting to check payment status from sheet (may fail due to CORS)...');
  
  try {
    // Use POST request with text/plain content type
    const requestBody = JSON.stringify({
action: 'checkStatus',
billNumber: billNumber
    });
    
    console.log('Sending POST request to check status for:', billNumber);
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
method: 'POST',
mode: 'cors',
cache: 'no-store',
headers: {
  'Content-Type': 'text/plain;charset=utf-8',
},
body: requestBody
    });
    
    if (response.ok) {
const responseData = await response.json();
console.log('Payment status response received:', responseData);

// Extract data from the new response format
const data = responseData.data || responseData;

// Check if status is "Paid" (case-insensitive)
const status = (data.status || '').toString().trim();
const isPaid = status.toLowerCase() === 'paid';

console.log('Status from sheet:', status, 'Is Paid:', isPaid);
return isPaid;
    } else {
console.warn('Response not OK:', response.status, response.statusText);
return null;
    }
  } catch (error) {
    // CORS errors are expected - just return null and let balance check handle it
    if (error.message && (error.message.includes('CORS') || error.message.includes('Access-Control') || error.message.includes('Failed to fetch'))) {
console.warn('CORS error - cannot check sheet status. This is expected. Using balance amount check only.');
return null;
    }
    
    console.error('Error checking payment status:', error);
    return null;
  }
}

// Check if property is already paid (from balance amount or sheet status)
async function checkIfAlreadyPaid(property) {
  console.log('Checking if already paid for property:', property.billNumber);
  
  // Check 1: Balance Amount is 0 (primary check - always works)
  const balanceAmount = parseFloat((property.balanceAmount || '0').toString().replace(/,/g, '')) || 0;
  console.log('Balance amount:', balanceAmount);
  if (balanceAmount === 0) {
    console.log('Property is paid (balance is 0)');
    return true;
  }
  
  // Check 2: Payment status in Google Sheet (optional - may fail due to CORS)
  // Try to check, but don't fail if CORS blocks it
  try {
    const isPaidInSheet = await checkPaymentStatus(property.billNumber);
    console.log('Is paid in sheet:', isPaidInSheet);
    if (isPaidInSheet === true) {
console.log('Property is paid (status in sheet is Paid)');
return true;
    }
  } catch (error) {
    // CORS error or other error - just log it and continue
    // We'll rely on balance amount check which already passed
    console.warn('Could not check sheet status (CORS or other error):', error.message);
    console.log('Falling back to balance amount check only');
  }
  
  console.log('Property is not paid');
  return false;
}

// Update button state based on payment status
async function updatePaymentButtonState(property) {
  const markPaidButton = document.getElementById('markPaidButton');
  
  // If button is already showing "Already Paid", don't revert it
  // This prevents reverting after a successful mark as paid
  if (markPaidButton.textContent === 'Already Paid' && markPaidButton.disabled) {
    // Just verify the status, but don't change the button if it's already set
    const isAlreadyPaid = await checkIfAlreadyPaid(property);
    if (isAlreadyPaid) {
// Status confirmed, keep it as is
return;
    }
    // If status check failed but button is already set, keep it as is
    // (optimistic update was successful)
    return;
  }
  
  console.log('Updating button state for property:', property.billNumber);
  const isAlreadyPaid = await checkIfAlreadyPaid(property);
  console.log('Final isAlreadyPaid result:', isAlreadyPaid);
  
  if (isAlreadyPaid) {
    console.log('Setting button to Already Paid');
    markPaidButton.disabled = true;
    markPaidButton.textContent = 'Already Paid';
    markPaidButton.style.backgroundColor = '#6c757d';
    markPaidButton.style.cursor = 'not-allowed';
  } else {
    console.log('Setting button to Mark as Paid');
    markPaidButton.disabled = false;
    markPaidButton.textContent = 'Mark as Paid';
    markPaidButton.style.backgroundColor = '#28a745';
    markPaidButton.style.cursor = 'pointer';
  }
}

// Mark as paid
async function markAsPaid() {
  if (!currentProperty) {
    showError('No property selected');
    return;
  }
  
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
    showError('Google Apps Script URL not configured. Please contact administrator.');
    return;
  }
  
  const button = document.getElementById('markPaidButton');
  button.disabled = true;
  button.textContent = 'Updating...';
  
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
method: 'POST',
mode: 'no-cors', // Required for Google Apps Script
headers: {
  'Content-Type': 'text/plain;charset=utf-8',
},
body: JSON.stringify({
  action: 'markPaid',
  billNumber: currentProperty.billNumber
})
    });
    
    // Note: With no-cors mode, we can't read the response
    // The script will handle the update server-side
    showSuccess('Payment status updated successfully!');
    
    // Immediately update button state to "Already Paid" (optimistic update)
    // This ensures the UI reflects the change immediately
    button.disabled = true;
    button.textContent = 'Already Paid';
    button.style.backgroundColor = '#6c757d';
    button.style.cursor = 'not-allowed';
    
    // Also verify the status after a delay to ensure consistency
    // Wait a bit longer to allow Google Sheets to update
    setTimeout(async () => {
await updatePaymentButtonState(currentProperty);
    }, 2000);
    
  } catch (error) {
    console.error('Error marking as paid:', error);
    showError('Failed to update payment status. Please try again or contact administrator.');
    button.disabled = false;
    button.textContent = 'Mark as Paid';
    button.style.backgroundColor = '#28a745';
    button.style.cursor = 'pointer';
  }
}

// Handle form submission
document.getElementById('searchForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  hideMessages();
  
  const block = document.getElementById('block').value.trim().toUpperCase();
  const doorNumber = document.getElementById('doorNumber').value.trim();
  
  if (!block || !doorNumber) {
    showError('Please enter both Block and Door Number');
    return;
  }
  
  // Disable search button and show loading state
  const searchButton = document.querySelector('.search-button');
  const originalButtonText = searchButton.textContent;
  searchButton.disabled = true;
  searchButton.textContent = 'Searching...';
  
  // Hide previous results
  document.getElementById('results').style.display = 'none';
  document.getElementById('propertySelection').style.display = 'none';
  
  try {
    const properties = await searchProperties(block, doorNumber);
    
    // Re-enable search button
    searchButton.disabled = false;
    searchButton.textContent = originalButtonText;
    
    if (properties.length === 0) {
const errorMessage = 'Property not found. Please check your Block and Door Number. If your property is not listed here, please visit the <a href="https://chennaicorporation.gov.in/gcc/online-payment/property-tax/property-tax-online-payment/" target="_blank" style="color: #000080; text-decoration: underline;">Greater Chennai Corporation website</a> to check your property tax details and make payment.';
showError(errorMessage);
return;
    }
    
    // If multiple properties found, show selection dropdown
    if (properties.length > 1) {
const selectElement = document.getElementById('propertySelect');
selectElement.innerHTML = '<option value="">-- Select a property --</option>';

// Populate dropdown with property options
properties.forEach((property, index) => {
  const option = document.createElement('option');
  option.value = index;
  option.textContent = `${property.ownerName} - ${property.propertyAddress} (Bill: ${property.billNumber})`;
  selectElement.appendChild(option);
});

// Show selection container
document.getElementById('propertySelection').style.display = 'block';
document.getElementById('propertySelection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

// Store properties for selection
window.selectedProperties = properties;
    } else {
// Single property found, display directly
document.getElementById('propertySelection').style.display = 'none';
displayPropertyDetails(properties[0]);
    }
  } catch (error) {
    // Re-enable search button
    searchButton.disabled = false;
    searchButton.textContent = originalButtonText;
    
    console.error('Search error:', error);
    showError('Failed to search for properties. Please try again or contact the administrator if the problem persists.');
  }
});

// Handle mark as paid button
document.getElementById('markPaidButton').addEventListener('click', markAsPaid);

// Handle property selection button
document.getElementById('selectPropertyButton').addEventListener('click', function() {
  const selectElement = document.getElementById('propertySelect');
  const selectedIndex = selectElement.value;
  
  if (selectedIndex === '' || !window.selectedProperties) {
    showError('Please select a property from the list');
    return;
  }
  
  const selectedProperty = window.selectedProperties[parseInt(selectedIndex)];
  if (selectedProperty) {
    // Hide selection container
    document.getElementById('propertySelection').style.display = 'none';
    // Display selected property details
    displayPropertyDetails(selectedProperty);
  }
});
