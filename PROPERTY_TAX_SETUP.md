# Property Tax Lookup Setup Guide

This guide will help you set up the Property Tax Lookup system that allows residents to search for their property tax details and mark payments as paid.

## Features

- Residents can search for property tax details by entering Block (A, B, C, D) and Door Number
- Displays all property tax information from the CSV file
- Provides a link to the Chennai Corporation payment website
- Automatically checks if property is already paid:
  - Checks if Balance Amount is 0 (from CSV)
  - Checks if payment status is "Paid" in Google Sheet (Column K)
- Disables "Mark as Paid" button and shows "Already Paid" if either condition is true
- Allows residents to mark their payment as "Paid" which updates a Google Sheet

## Files Created

1. **property-tax-lookup.html** - The main web page for property tax lookup
2. **google-apps-script-code.gs** - Google Apps Script to update Google Sheet when payment is marked as paid

## Setup Instructions

### Step 1: Prepare Your Google Sheet

1. Open your Google Sheet containing the property tax data
2. Ensure the sheet has the following columns:
   - Column A: S NO
   - Column B: Bill Number
   - Column C: Owner Name
   - Column D: Property Address
   - Column E: Mobile No.
   - Column F: Property Type
   - Column G: Property Usage
   - Column H: Current Tax
   - Column I: Arrear Tax Due
   - Column J: Balance Amount
   - **Column K: Payment Status** (this will be updated when residents mark as paid)

3. Note your Google Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the `SHEET_ID_HERE` part

### Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Copy the entire contents of `google-apps-script-code.gs`
4. Paste it into the Apps Script editor
5. Update the configuration at the top of the script:
   ```javascript
   const SHEET_ID = 'YOUR_SHEET_ID'; // Replace with your actual Google Sheet ID
   const SHEET_NAME = 'Sheet1'; // Replace with your sheet name if different
   ```
6. Click **Save** (Ctrl+S or Cmd+S)
7. Click **Deploy > New deployment**
8. Click the gear icon (⚙️) next to "Select type" and choose **Web app**
9. Configure the deployment:
   - **Description**: Property Tax Payment Status Updater
   - **Execute as**: Me
   - **Who has access**: **Anyone** (IMPORTANT: Must be "Anyone", not "Anyone with Google account" - this is required for CORS to work)
10. Click **Deploy**
11. **Copy the Web App URL** that appears (you'll need this in the next step)
12. Click **Authorize access** and follow the prompts to grant permissions

**IMPORTANT - CORS Configuration:**
- The "Who has access" setting MUST be set to "Anyone" (not "Anyone with Google account")
- This is required for CORS (Cross-Origin Resource Sharing) to work properly
- If you see CORS errors in the browser console, redeploy the script with "Anyone" access
- After redeploying, you may need to create a new deployment version

### Step 3: Update the HTML File

1. Open `property-tax-lookup.html` in a text editor
2. Find this line (around line 494):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'` with the Web App URL you copied in Step 2
4. Save the file

### Step 4: Test the System

1. Open `property-tax-lookup.html` in a web browser
2. Try searching for a property:
   - Select Block: A
   - Enter Door Number: 102
   - Click "Search Property Tax"
3. Verify that the property details are displayed correctly
4. Test the "Mark as Paid" button:
   - Click "Mark as Paid"
   - Check your Google Sheet - Column K should be updated to "Paid" for that bill number

## CSV File Location

The system reads property tax data from:
```
./public/temp_docs/ACE_PROPERTY_TAX_Q3_2025.csv
```

Make sure this file is accessible and contains the property tax data with the correct column headers.

## How It Works

1. **Search**: When a resident enters Block and Door Number, the system searches the CSV file using case-insensitive matching on the Property Address column
2. **Display**: All property tax details are displayed in a formatted view
3. **Payment Status Check**: The system automatically checks:
   - If Balance Amount is 0 (from CSV data)
   - If payment status is "Paid" in Google Sheet Column K
4. **Button State**: 
   - If already paid (Balance = 0 OR status = "Paid"), button is disabled and shows "Already Paid"
   - Otherwise, button is enabled and shows "Mark as Paid"
5. **Payment Link**: The payment link is automatically generated based on the Bill Number
6. **Mark as Paid**: When clicked, the system sends a request to Google Apps Script which updates Column K in the Google Sheet to "Paid", then re-checks the status to update the button

## Troubleshooting

### Property Not Found
- Check that the Block and Door Number are entered correctly
- Verify the CSV file contains the property data
- Check browser console for any errors

### Mark as Paid Not Working
- Verify the Google Apps Script URL is correctly set in `property-tax-lookup.html`
- Check that the Google Apps Script is deployed and accessible
- Verify the Sheet ID and Sheet Name are correct in the script
- Check that Column K exists in your Google Sheet
- Look at the browser console for error messages

### CSV Not Loading
- Verify the CSV file path is correct
- Check that the file is accessible from the web server
- Ensure the CSV file has the correct column headers

## Security Notes

- The Google Apps Script Web App is set to "Anyone" access, which means anyone with the URL can call it
- Consider adding additional validation in the Google Apps Script if needed
- The system uses `no-cors` mode for the fetch request, so response validation is limited

## Support

If you encounter any issues, check:
1. Browser console for JavaScript errors
2. Google Apps Script execution logs (View > Executions)
3. Google Sheet permissions

