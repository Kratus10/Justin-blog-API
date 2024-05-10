// config/logger.js

// Import the Winston module for logging
const { createLogger, transports, format } = require('winston');

// Create a logger instance
const logger = createLogger({
    // Set the logging level to 'info' for production
    level: 'info',
    // Define the log format with timestamp and JSON format
    format: format.combine(format.timestamp(), format.json()),
    // Define the transports for logging to console and files
    transports: [
        new transports.Console(), // Log to console
        new transports.File({ filename: 'error.log', level: 'error' }), // Log errors to error.log file
        new transports.File({ filename: 'combined.log' }) // Log all messages to combined.log file
    ]
});

// Export the logger instance to be used elsewhere in the application
module.exports = logger;
