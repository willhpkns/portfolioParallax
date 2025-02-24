const geoip = require('geoip-lite');
const useragent = require('express-useragent');
const Visitor = require('../models/visitor');
const jwt = require('jsonwebtoken');

const analyticsMiddleware = async (req, res, next) => {
  try {
    // Skip all API routes, admin routes, static files, and authenticated admin users
    if (req.path.startsWith('/api/') || 
        req.path.startsWith('/admin') || 
        req.path.includes('.')) {
      return next();
    }

    // Check for admin user from auth token
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
          // Skip tracking for authenticated admin users
          return next();
        }
      } catch (err) {
        // Token verification failed, continue with tracking
        console.log('Analytics: Invalid auth token, continuing with tracking');
      }
    }

    console.log('Analytics: Processing request -', {
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Get IP address with fallbacks
    const ip = req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // For localhost testing, use a dummy IP if the real one is not available
    const effectiveIp = ip === '::1' || ip === undefined || ip === null ? '8.8.8.8' : ip;
    
    // Get geolocation info
    const geo = geoip.lookup(effectiveIp);
    if (!geo) {
      console.log('Analytics: No geolocation data for IP:', effectiveIp);
    } else {
      console.log('Analytics: Got geolocation data -', {
        ip: effectiveIp,
        country: geo.country,
        city: geo.city
      });
    }
    
    // Parse user agent
    const ua = useragent.parse(req.headers['user-agent']);
    console.log('Analytics: User agent info -', {
      browser: ua.browser,
      os: ua.os,
      platform: ua.platform,
      isMobile: ua.isMobile
    });

    // Create visitor record
    const visitor = new Visitor({
      ip: effectiveIp,
      location: geo ? {
        country: geo.country,
        city: geo.city,
        latitude: geo.ll[0],
        longitude: geo.ll[1]
      } : null,
      userAgent: {
        browser: ua.browser,
        version: ua.version,
        os: ua.os,
        platform: ua.platform,
        isMobile: ua.isMobile
      },
      page: req.headers.referer || req.path,
      referrer: req.headers.referer || req.headers.referrer
    });

    try {
      // Save visitor data and wait for confirmation
      await visitor.save();
      console.log('Analytics: Successfully saved visitor data -', {
        id: visitor._id,
        page: visitor.page,
        timestamp: visitor.timestamp
      });
    } catch (saveError) {
      console.error('Analytics: Error saving visitor data -', {
        error: saveError.message,
        stack: saveError.stack,
        visitorData: {
          ip: effectiveIp,
          page: req.path,
          timestamp: new Date().toISOString()
        }
      });
    }

    next();
  } catch (error) {
    console.error('Analytics: Middleware error -', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      timestamp: new Date().toISOString()
    });
    next(); // Continue even if analytics fails
  }
};

module.exports = analyticsMiddleware;
