function createScreenshotHandler(screenshotter) {
  return async (req, res) => {
    try {
      // Get optional parameters from request body
      const { selector, options = {} } = req.body || {};
      
      let screenshot;
      
      if (selector) {
        // Take screenshot of specific element
        screenshot = await screenshotter.takeScreenshotWithSelector(selector, options);
      } else {
        // Take full page screenshot
        screenshot = await screenshotter.takeScreenshot(options);
      }

      // Set appropriate headers for image response
      res.set({
        'Content-Type': 'image/png',
        'Content-Length': screenshot.length,
        'Content-Disposition': `attachment; filename="screenshot-${Date.now()}.png"`
      });

      console.log('Screenshot sent successfully');
      res.send(screenshot);
    } catch (error) {
      console.error('Error in screenshot endpoint:', error);
      res.status(500).json({
        error: 'Failed to take screenshot',
        message: error.message
      });
    }
  };
}

module.exports = createScreenshotHandler;