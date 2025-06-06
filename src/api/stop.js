function createStopHandler(puppeteerLauncher, server) {
  return async (req, res) => {
    try {
      console.log('Stop endpoint called - shutting down...');
      
      // Send response before closing
      res.json({
        message: 'Shutting down browser and server...',
        timestamp: new Date().toISOString()
      });

      // Close browser first
      if (puppeteerLauncher) {
        await puppeteerLauncher.close();
        console.log('Browser closed successfully');
      }

      // Close server after a short delay to ensure response is sent
      setTimeout(() => {
        if (server) {
          server.close(() => {
            console.log('Server closed successfully');
            process.exit(0);
          });
        } else {
          console.log('Server closed successfully');
          process.exit(0);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error in stop endpoint:', error);
      res.status(500).json({
        error: 'Failed to stop gracefully',
        message: error.message
      });
      
      // Force exit after error
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  };
}

module.exports = createStopHandler;