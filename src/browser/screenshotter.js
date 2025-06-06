class Screenshotter {
  constructor(puppeteerLauncher) {
    this.launcher = puppeteerLauncher;
  }

  async takeScreenshot(options = {}) {
    try {
      const page = this.launcher.getPage();
      if (!page) {
        throw new Error('No page available for screenshot');
      }

      const defaultOptions = {
        type: 'png',
        fullPage: true,
        ...options
      };

      console.log('Taking screenshot...');
      const screenshot = await page.screenshot(defaultOptions);
      console.log('Screenshot taken successfully');
      
      return screenshot;
    } catch (error) {
      console.error('Error taking screenshot:', error);
      throw error;
    }
  }

  async takeScreenshotWithSelector(selector, options = {}) {
    try {
      const page = this.launcher.getPage();
      if (!page) {
        throw new Error('No page available for screenshot');
      }

      // Wait for the element to be available
      await page.waitForSelector(selector, { timeout: 5000 });
      
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`Element with selector '${selector}' not found`);
      }

      const defaultOptions = {
        type: 'png',
        ...options
      };

      console.log(`Taking screenshot of element: ${selector}`);
      const screenshot = await element.screenshot(defaultOptions);
      console.log('Element screenshot taken successfully');
      
      return screenshot;
    } catch (error) {
      console.error('Error taking element screenshot:', error);
      throw error;
    }
  }
}

module.exports = Screenshotter;