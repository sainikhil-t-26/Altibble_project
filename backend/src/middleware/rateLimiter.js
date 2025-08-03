const { RateLimiterMemory } = require('rate-limiter-flexible');

// Create rate limiter instance
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => {
    // Use IP address as key, or user ID if authenticated
    return req.user ? req.user.id : req.ip;
  },
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // Time window in milliseconds (15 minutes)
  blockDuration: 60 * 15, // Block for 15 minutes if limit exceeded
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.user ? req.user.id : req.ip);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: secs
    });
  }
};

module.exports = {
  rateLimiter: rateLimiterMiddleware
}; 