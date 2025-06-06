# TutorBird Scraper

A Node.js application that automates browser interactions with TutorBird using Puppeteer and provides an HTTP API for controlling the browser and taking screenshots.

## Features

- **Browser Automation**: Uses Puppeteer to control Chromium browser
- **Authentication Management**: Automatically handles login with cookie persistence
- **HTTP API**: Simple REST API for browser control and screenshots
- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Flexible Browser Mode**: Support for both headless and visible browser modes
- **Graceful Shutdown**: Proper cleanup of resources on exit

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Starting the Application

**Default mode (visible browser):**
```bash
npm start
```

**Headless mode:**
```bash
node src/index.js --headless true
```

**Development mode (visible browser):**
```bash
npm run dev
```

### First Run Behavior

1. **If no saved cookies exist:**
   - Browser opens to TutorBird login page
   - Email and password fields are automatically filled
   - **You must manually click the "Login" button**
   - After successful login, cookies are automatically saved

2. **If saved cookies exist:**
   - Browser opens and automatically logs in using saved cookies
   - No manual interaction required

## API Endpoints

The server runs on `http://localhost:3000` by default.

### GET /api/status
Returns the current status of the browser and login state.

**Response:**
```json
{
  "browserRunning": true,
  "loggedIn": true
}
```

### POST /api/screenshot
Takes a screenshot of the current page.

**Request Body (optional):**
```json
{
  "selector": "#element-id",
  "options": {
    "type": "png",
    "fullPage": true
  }
}
```

**Response:** PNG image data

### POST /api/stop
Closes the browser and shuts down the server.

**Response:**
```json
{
  "message": "Shutting down browser and server...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Project Structure

```
/
├── src/
│   ├── browser/
│   │   ├── puppeteerLauncher.js    # Browser launch and cookie management
│   │   ├── authManager.js          # Login state detection and form filling
│   │   └── screenshotter.js        # Screenshot functionality
│   │
│   ├── api/
│   │   ├── status.js               # GET /api/status handler
│   │   ├── screenshot.js           # POST /api/screenshot handler
│   │   └── stop.js                 # POST /api/stop handler
│   │
│   ├── config.js                   # Configuration and defaults
│   └── index.js                    # Main application entry point
│
├── package.json                    # Node.js dependencies and scripts
├── cookies.json                    # Auto-generated cookie storage
└── README.md                       # This file
```

## Configuration

Edit `src/config.js` to modify:

- Login credentials
- Browser settings
- Server port
- File paths
- CSS selectors for login form

## Command Line Options

- `--headless true/false`: Run browser in headless mode (default: false)

## Troubleshooting

### Login Form Not Found
If you see an error about login form elements not being found, the CSS selectors may have changed. Update the selectors in `src/config.js`:

```javascript
login: {
  emailSelector: '#MainContent_contentBody_textboxEmail',
  passwordSelector: '#MainContent_contentBody_textboxPassword'
}
```

### Browser Not Starting
Ensure you have sufficient permissions and that no other instance is running. Try deleting `cookies.json` to start fresh.

### Screenshots Failing
Make sure the browser is running and logged in. Check the status endpoint first:
```bash
curl http://localhost:3000/api/status
```

## Security Notes

- Login credentials are stored in plain text in the config file
- Cookies are stored locally in `cookies.json`
- This tool is intended for legitimate automation purposes only
- Ensure compliance with TutorBird's terms of service

## Development

To extend functionality:

1. Add new API endpoints in `src/api/`
2. Create new browser automation modules in `src/browser/`
3. Update routes in `src/index.js`
4. Follow the existing modular pattern for maintainability

## License

MIT License - see package.json for details.