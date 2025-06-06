function createStatusHandler(puppeteerLauncher, authManager) {
  return async (req, res) => {
    try {
      const browserRunning = puppeteerLauncher.isRunning && 
                           puppeteerLauncher.getBrowser() && 
                           puppeteerLauncher.getBrowser().isConnected();
      
      const loggedIn = authManager.isLoggedIn();

      const status = {
        browserRunning,
        loggedIn
      };

      console.log('Status check:', status);
      res.json(status);
    } catch (error) {
      console.error('Error in status endpoint:', error);
      res.status(500).json({
        error: 'Failed to get status',
        message: error.message
      });
    }
  };
}

module.exports = createStatusHandler;