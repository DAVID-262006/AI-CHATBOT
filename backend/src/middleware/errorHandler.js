// Centralized error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database error occurred';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  }

  // Never expose internal errors to client in production
  const responseMessage =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An error occurred. Please try again later.'
      : message;

  res.status(statusCode).json({
    success: false,
    error: responseMessage,
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
};

// Async wrapper to catch errors in async route handlers
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
