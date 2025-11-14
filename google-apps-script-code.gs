/**
 * Google Apps Script to update Property Tax Payment Status
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet with the property tax data
 * 2. Go to Extensions > Apps Script
 * 3. Paste this code
 * 4. Replace 'YOUR_SHEET_ID' with your actual Google Sheet ID (found in the URL)
 * 5. Replace 'Sheet1' with your actual sheet name if different
 * 6. Save the script
 * 7. Deploy > New deployment > Type: Web app
 * 8. Execute as: Me
 * 9. Who has access: Anyone (IMPORTANT: Must be "Anyone" for CORS to work)
 * 10. Click Deploy
 * 11. Copy the Web App URL and update it in property-tax-lookup.html
 */

// Configuration - UPDATE THESE VALUES
const SHEET_ID = 'YOUR_SHEET_ID'; // Replace with your Google Sheet ID
const SHEET_NAME = 'Sheet1'; // Replace with your sheet name if different
const BILL_NUMBER_COLUMN = 2; // Column B (Bill Number)
const PAYMENT_STATUS_COLUMN = 11; // Column K (Payment Status)

/**
 * Main function to handle HTTP POST requests (for marking as paid and checking status)
 */
function doPost(e) {
  try {
    // Check if postData exists
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          status: 'error',
          data: { success: false, error: 'No request data received' }
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parse the request
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          status: 'error',
          data: { success: false, error: 'Invalid JSON in request: ' + parseError.toString() }
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const action = requestData.action;
    const billNumber = requestData.billNumber;
    
    if (!action || !billNumber) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          status: 'error',
          data: { success: false, error: 'Missing action or billNumber' }
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if SHEET_ID is configured
    if (SHEET_ID === 'YOUR_SHEET_ID') {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          status: 'error',
          data: { success: false, error: 'SHEET_ID not configured. Please update the script with your Google Sheet ID.' }
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle checkStatus action via POST (to avoid CORS issues with GET)
    if (action === 'checkStatus') {
      const status = getPaymentStatus(billNumber);
      return ContentService
        .createTextOutput(JSON.stringify({ 
          status: 'success',
          data: {
            success: true, 
            status: status || '',
            billNumber: billNumber 
          }
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle markPaid action
    if (action === 'markPaid') {
      // Update the sheet
      const result = updatePaymentStatus(billNumber);
      
      if (result.success) {
        return ContentService
          .createTextOutput(JSON.stringify({ 
            status: 'success',
            data: { success: true, message: 'Payment status updated' }
          }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService
          .createTextOutput(JSON.stringify({ 
            status: 'error',
            data: { success: false, error: result.error }
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'error',
        data: { success: false, error: 'Unknown action' }
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'error',
        data: { success: false, error: error.toString() }
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for checking payment status)
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const billNumber = e.parameter.billNumber;
    
    if (action === 'checkStatus' && billNumber) {
      const status = getPaymentStatus(billNumber);
      const output = ContentService
        .createTextOutput(JSON.stringify({ 
          status: 'success',
          data: {
            success: true, 
            status: status || '',
            billNumber: billNumber 
          }
        }))
        .setMimeType(ContentService.MimeType.JSON);
      
      // Note: CORS headers are handled by Google Apps Script deployment settings
      // Make sure "Who has access" is set to "Anyone" for CORS to work
      return output;
    }
    
    return ContentService
      .createTextOutput('Property Tax Payment Status API is running. Use POST method to update payment status or GET with action=checkStatus&billNumber=XXX to check status.')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Get payment status from Google Sheet
 * Returns the value in Column K for the given bill number
 */
function getPaymentStatus(billNumber) {
  try {
    // Check if SHEET_ID is configured
    if (SHEET_ID === 'YOUR_SHEET_ID') {
      Logger.log('SHEET_ID not configured');
      return null;
    }
    
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    if (!spreadsheet) {
      Logger.log('Spreadsheet not found with ID: ' + SHEET_ID);
      return null;
    }
    
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      Logger.log('Sheet not found: ' + SHEET_NAME);
      return null;
    }
    
    // Get all data
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Find the row with matching bill number
    for (let i = 1; i < values.length; i++) { // Start from row 2 (skip header)
      if (values[i][BILL_NUMBER_COLUMN - 1] === billNumber) {
        // Get the payment status from column K (index 10, since arrays are 0-indexed)
        const paymentStatus = values[i][PAYMENT_STATUS_COLUMN - 1];
        return paymentStatus || '';
      }
    }
    
    Logger.log('Bill number not found: ' + billNumber);
    return null;
  } catch (error) {
    Logger.log('Error getting payment status: ' + error.toString());
    return null;
  }
}

/**
 * Update payment status in Google Sheet
 * Sets Column K to "Paid" for the given bill number
 */
function updatePaymentStatus(billNumber) {
  try {
    // Check if SHEET_ID is configured
    if (SHEET_ID === 'YOUR_SHEET_ID') {
      return { success: false, error: 'SHEET_ID not configured. Please update the script with your Google Sheet ID.' };
    }
    
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    if (!spreadsheet) {
      return { success: false, error: 'Spreadsheet not found. Please check your SHEET_ID.' };
    }
    
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return { success: false, error: 'Sheet "' + SHEET_NAME + '" not found. Please check your SHEET_NAME.' };
    }
    
    // Get all data
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Find the row with matching bill number
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) { // Start from row 2 (skip header)
      if (values[i][BILL_NUMBER_COLUMN - 1] === billNumber) {
        rowIndex = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { success: false, error: 'Bill number not found' };
    }
    
    // Update column K with "Paid"
    sheet.getRange(rowIndex, PAYMENT_STATUS_COLUMN).setValue('Paid');
    
    // Optional: Add timestamp in column L (if you want to track when it was marked as paid)
    // Uncomment the next line if you want to track payment date
    // sheet.getRange(rowIndex, 12).setValue(new Date());
    
    Logger.log('Payment status updated for bill number: ' + billNumber + ' at row: ' + rowIndex);
    return { success: true, row: rowIndex };
  } catch (error) {
    Logger.log('Error updating payment status: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Test function - can be run manually to test updating payment status
 * Replace with a test bill number from your sheet
 */
function testUpdatePaymentStatus() {
  const testBillNumber = '14-184-29804-000';
  const result = updatePaymentStatus(testBillNumber);
  Logger.log('Update result: ' + JSON.stringify(result));
}

/**
 * Test function - can be run manually to test checking payment status
 * Replace with a test bill number from your sheet
 */
function testGetPaymentStatus() {
  const testBillNumber = '14-184-29804-000';
  const status = getPaymentStatus(testBillNumber);
  Logger.log('Payment Status for ' + testBillNumber + ': ' + status);
}
