const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  console.error('Stack:', err.stack);

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = errorHandler;