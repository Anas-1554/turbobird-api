const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

class PuppeteerLauncher {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isRunning = false;
  }

  async launch(headless = config.headless) {
    try {
      console.log(`Launching browser in ${headless ? 'headless' : 'visible'} mode...`);
      
      this.browser = await puppeteer.launch({
        headless: headless,
        defaultViewport: null,
        args: ['--start-maximized']
      });
      
      this.page = await this.browser.newPage();
      this.isRunning = true;
      
      console.log('Browser launched successfully');
      return this.browser;
    } catch (error) {
      console.error('Failed to launch browser:', error);
      throw error;
    }
  }

  async loadCookies() {
    try {
      const cookiesPath = path.resolve(config.cookiesFile);
      const cookiesString = await fs.readFile(cookiesPath, 'utf8');
      const cookies = JSON.parse(cookiesString);
      
      if (cookies && cookies.length > 0) {
        await this.page.setCookie(...cookies);
        console.log('Cookies loaded successfully');
        return true;
      }
    } catch (error) {
      console.log('No existing cookies found or failed to load cookies');
      return false;
    }
    return false;
  }

  async saveCookies() {
    try {
      const cookies = await this.page.cookies();
      const cookiesPath = path.resolve(config.cookiesFile);
      await fs.writeFile(cookiesPath, JSON.stringify(cookies, null, 2));
      console.log('Cookies saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save cookies:', error);
      return false;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isRunning = false;
      console.log('Browser closed');
    }
  }

  getBrowser() {
    return this.browser;
  }

  getPage() {
    return this.page;
  }

  isRunning() {
    return this.isRunning && this.browser && !this.browser.isConnected();
  }
}

module.exports = PuppeteerLauncher;