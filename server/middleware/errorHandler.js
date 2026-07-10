const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Server error',
    errors: err.errors || undefined,
  });
};

module.exports = errorHandler;
