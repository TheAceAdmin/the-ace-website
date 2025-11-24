# The ACE Website

This is the website for The ACE Independence Day Event and includes a membership form for the apartment owners welfare association.

## Project Structure

The project has been organized into a clear directory structure:

```
the-ace-website/
├── 404.html
├── business-opportunities.html
├── index.html
├── maintenance-calculator.html
├── membership-form.html
├── property-tax-lookup.html
├── stall-terms-and-conditions.html
├── tenant-form.html
├── styles/             # CSS stylesheets
│   ├── style.css
│   ├── index.css
│   └── 404.css
├── assets/             # Static assets
│   ├── images/         # Image files (PNG, JPG, etc.)
│   ├── videos/         # Video files (MP4)
│   └── documents/      # PDFs and data files
├── scripts/            # JavaScript and script files
│   ├── membership-form.jsx
│   └── google-apps-script-code.gs
├── components/         # Reusable HTML/CSS components
├── locales/            # Localization files
│   └── en.json
├── docs/               # Documentation
│   ├── README.md
│   └── PROPERTY_TAX_SETUP.md
├── backend/            # Backend code (if any)
├── src/                # Source files (if any)
└── package.json        # Node.js dependencies
```

## Features

- **Main Website**: Independence Day event information and RSVP functionality
- **Membership Form**: Complete membership application form with signature capabilities and print functionality

## Getting Started

### Prerequisites

- Node.js (for npm commands)
- A modern web browser

### Installation

1. Clone the repository
2. Install dependencies (if any):
   ```bash
   npm install
   ```

### Running the Development Server

The project includes a development server that serves the static files:

```bash
# Start the development server
npm run dev

# Or start without auto-opening browser
npm start
```

The server will start on **http://127.0.0.1:3001**

## Accessing the Application

- **Main Website**: http://127.0.0.1:3001/index.html
- **Membership Form**: http://127.0.0.1:3001/membership-form.html

## Membership Form Features

The membership form includes:

- **Form Inputs**: Personal details, flat information, ownership details
- **Signature Input**: Draw signature on canvas or type name
- **Photo Upload**: Optional photo upload functionality
- **Live Preview**: Real-time preview of the filled form
- **Print Functionality**: Print-ready layout optimized for A4 paper
- **Association Signature Box**: Optional toggle for official signatures

## Navigation

The membership form is accessible from the main website navigation:
- Desktop: Green "Membership Form" button in the top navigation
- Mobile: "Membership Form" button in the mobile menu

## Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript with React (loaded via CDN)
- **Styling**: Tailwind CSS for responsive design
- **Server**: HTTP server for local development
- **Print**: CSS media queries for print optimization

## Development

To modify the membership form:
- Edit `membership-form.html` for the standalone form
- Edit `index.html` for the main website integration
- The form uses React components with hooks for state management

### File Paths

When referencing assets from HTML pages in the project root:
- CSS files: `./styles/filename.css`
- Images: `./assets/images/filename.png`
- Videos: `./assets/videos/filename.mp4`
- Documents: `./assets/documents/filename`
- Other pages: `./filename.html`

## Notes

- The development server runs on port 3001 to avoid conflicts with VS Code Live Preview
- All form data is stored locally in the browser (no backend required)
- The form is designed to be print-friendly and follows A4 paper dimensions 