function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.name === 'ZodError' ? 400 : 500);
  
  // Safe generic fallback for non-operational or unexpected errors
  let message = 'Something went wrong';
  if (err.isOperational && err.message) {
    message = err.message;
  } else if (err.name === 'ZodError') {
    message = err.errors?.[0]?.message || 'Validation failed';
  }

  // Security rule: Never send stack traces, SQL errors, or Prisma error details to client
  res.status(statusCode).json({
    error: {
      message,
    },
  });
}

module.exports = errorHandler;
