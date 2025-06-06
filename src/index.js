const express = require('express');
const minimist = require('minimist');
const config = require('./config');

// Import modules
const PuppeteerLauncher = require('./browser/puppeteerLauncher');
const AuthManager = require('./browser/authManager');
const Screenshotter = require('./browser/screenshotter');

// Import API handlers
const createStatusHandler = require('./api/status');
const createScreenshotHandler = require('./api/screenshot');
const createStopHandler = require('./api/stop');
const { createStudentHandler } = require('./api/student');

class TutorBirdScraper {
  constructor() {
    this.app = express();
    this.server = null;
    this.puppeteerLauncher = new PuppeteerLauncher();
    this.authManager = null;
    this.screenshotter = null;
    this.isInitialized = false;
  }

  parseCommandLineArgs() {
    const args = minimist(process.argv.slice(2));
    
    // Parse headless flag
    let headless = config.headless; // default from config
    if (args.headless !== undefined) {
      headless = args.headless === 'true' || args.headless === true;
    }

    return { headless };
  }

  setupMiddleware() {
    // Parse JSON bodies
    this.app.use(express.json());
    
    // Basic logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupBasicRoutes() {
    // Health check
    this.app.get('/', (req, res) => {
      res.json({
        message: 'TutorBird Scraper API',
        version: '1.0.0',
        endpoints: {
          'GET /api/status': 'Get browser and login status',
          'POST /api/screenshot': 'Take a screenshot',
          'POST /api/student/new': 'Create a new student',
          'POST /api/stop': 'Stop browser and server'
        }
      });
    });
  }

  setupAPIRoutes() {
    // API routes - called after browser initialization
    this.app.get('/api/status', createStatusHandler(this.puppeteerLauncher, this.authManager));
    this.app.post('/api/screenshot', createScreenshotHandler(this.screenshotter));
    this.app.post('/api/student/new', createStudentHandler(this.puppeteerLauncher));
    this.app.post('/api/stop', createStopHandler(this.puppeteerLauncher, this.server));
  }

  async initializeBrowser(headless) {
    try {
      console.log('Initializing browser and authentication...');
      
      // Launch browser
      await this.puppeteerLauncher.launch(headless);
      
      // Initialize auth manager and screenshotter
      this.authManager = new AuthManager(this.puppeteerLauncher);
      this.screenshotter = new Screenshotter(this.puppeteerLauncher);
      
      // Initialize authentication
      const autoLoggedIn = await this.authManager.initializeAuth();
      
      if (autoLoggedIn) {
        console.log('✅ Automatically logged in with saved cookies');
      } else {
        console.log('⚠️  Manual login required - please click the Login button in the browser');
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  startServer() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(config.port, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`🚀 Server running on http://localhost:${config.port}`);
          console.log('\nAvailable endpoints:');
          console.log(`  GET  http://localhost:${config.port}/api/status`);
          console.log(`  POST http://localhost:${config.port}/api/screenshot`);
          console.log(`  POST http://localhost:${config.port}/api/stop`);
          resolve();
        }
      });
    });
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      
      try {
        if (this.puppeteerLauncher) {
          await this.puppeteerLauncher.close();
        }
        
        if (this.server) {
          this.server.close(() => {
            console.log('Server closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }

  async start() {
    try {
      console.log('🔄 Starting TutorBird Scraper...');
      
      // Parse command line arguments
      const { headless } = this.parseCommandLineArgs();
      console.log(`Headless mode: ${headless}`);
      
      // Setup Express app
      this.setupMiddleware();
      this.setupBasicRoutes();
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
      // Initialize browser and authentication
      await this.initializeBrowser(headless);
      
      // Setup API routes after browser initialization
      this.setupAPIRoutes();
      
      // Start HTTP server
      await this.startServer();
      
      console.log('✅ TutorBird Scraper started successfully!');
      
    } catch (error) {
      console.error('❌ Failed to start TutorBird Scraper:', error);
      process.exit(1);
    }
  }
}

// Start the application
if (require.main === module) {
  const scraper = new TutorBirdScraper();
  scraper.start();
}

module.exports = TutorBirdScraper;