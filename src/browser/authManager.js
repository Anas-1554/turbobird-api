const config = require('../config');

class AuthManager {
  constructor(puppeteerLauncher) {
    this.launcher = puppeteerLauncher;
    this.loggedIn = false;
  }

  async checkLoginState() {
    try {
      const page = this.launcher.getPage();
      if (!page) {
        return false;
      }

      // Navigate to the main page to check if we're logged in
      await page.goto(config.login.url, { waitUntil: 'networkidle2' });
      
      // Check if we're on the login page or already logged in
      const isOnLoginPage = await page.$(config.login.emailSelector);
      
      if (!isOnLoginPage) {
        console.log('Already logged in');
        this.loggedIn = true;
        return true;
      } else {
        console.log('Not logged in - on login page');
        this.loggedIn = false;
        return false;
      }
    } catch (error) {
      console.error('Error checking login state:', error);
      this.loggedIn = false;
      return false;
    }
  }

  async fillLoginForm() {
    try {
      const page = this.launcher.getPage();
      if (!page) {
        throw new Error('No page available');
      }

      console.log('Navigating to login page...');
      await page.goto(config.login.url, { waitUntil: 'networkidle2' });

      // Wait for the form elements to be available
      console.log('Waiting for login form elements...');
      await page.waitForSelector(config.login.emailSelector, { timeout: 10000 });
      await page.waitForSelector(config.login.passwordSelector, { timeout: 10000 });

      // Fill in the email field
      console.log('Filling email field...');
      await page.type(config.login.emailSelector, config.login.email);

      // Fill in the password field
      console.log('Filling password field...');
      await page.type(config.login.passwordSelector, config.login.password);

      console.log('Login form filled. Please click the Login button manually.');
      
      // Set up a listener to detect when login is successful
      this.setupLoginDetection();
      
      return true;
    } catch (error) {
      if (error.name === 'TimeoutError') {
        throw new Error(`Login form elements not found. Please check if the selectors are correct:\n- Email selector: ${config.login.emailSelector}\n- Password selector: ${config.login.passwordSelector}`);
      }
      console.error('Error filling login form:', error);
      throw error;
    }
  }

  async setupLoginDetection() {
    const page = this.launcher.getPage();
    
    // Set up navigation listener to detect successful login
    page.on('framenavigated', async (frame) => {
      if (frame === page.mainFrame()) {
        const url = page.url();
        console.log('Page navigated to:', url);
        
        // If we're no longer on the login page, assume login was successful
        if (!url.includes('login') && url.includes('tutorbird.com')) {
          console.log('Login appears successful, saving cookies...');
          await this.launcher.saveCookies();
          this.loggedIn = true;
        }
      }
    });
  }

  async initializeAuth() {
    try {
      const page = this.launcher.getPage();
      if (!page) {
        throw new Error('Browser not initialized');
      }

      // Try to load existing cookies
      const cookiesLoaded = await this.launcher.loadCookies();
      
      if (cookiesLoaded) {
        // Check if we're already logged in with the loaded cookies
        const isLoggedIn = await this.checkLoginState();
        if (isLoggedIn) {
          console.log('Successfully authenticated with saved cookies');
          return true;
        }
      }

      // If no cookies or cookies are invalid, fill the login form
      console.log('No valid authentication found, filling login form...');
      await this.fillLoginForm();
      return false; // Manual login required
      
    } catch (error) {
      console.error('Error during authentication initialization:', error);
      throw error;
    }
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  setLoggedIn(status) {
    this.loggedIn = status;
  }
}

module.exports = AuthManager;