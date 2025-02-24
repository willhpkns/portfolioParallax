const express = require('express');
const router = express.Router();
const Visitor = require('../models/visitor');
const mongoose = require('mongoose');
const geoip = require('geoip-lite');
const useragent = require('express-useragent');

// Get overview analytics
router.get('/overview', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayStats, monthlyStats, popularPages] = await Promise.all([
      // Today's stats
      Visitor.aggregate([
        { $match: { timestamp: { $gte: today } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unique: { $addToSet: "$ip" }
          }
        }
      ]),
      // Monthly stats
      Visitor.aggregate([
        { $match: { timestamp: { $gte: monthStart } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unique: { $addToSet: "$ip" }
          }
        }
      ]),
      // Popular pages
      Visitor.aggregate([
        {
          $group: {
            _id: "$page",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      today: {
        total: todayStats[0]?.total || 0,
        unique: todayStats[0]?.unique?.length || 0
      },
      monthly: {
        total: monthlyStats[0]?.total || 0,
        unique: monthlyStats[0]?.unique?.length || 0
      },
      popularPages
    });
  } catch (error) {
    console.error('Error in /analytics/overview:', error);
    res.status(500).json({ error: 'Error fetching analytics overview' });
  }
});

// Get daily visitors stats
router.get('/daily', async (req, res) => {
  try {
    const days = 30; // Get last 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyStats = await Visitor.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" }
          },
          total: { $sum: 1 },
          unique: { $addToSet: "$ip" }
        }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day"
                }
              }
            }
          },
          total: 1,
          unique: { $size: "$unique" }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json(dailyStats);
  } catch (error) {
    console.error('Error in /analytics/daily:', error);
    res.status(500).json({ error: 'Error fetching daily visitors' });
  }
});

// Get device statistics
router.get('/devices', async (req, res) => {
  try {
    const [browsers, operatingSystems, devices] = await Promise.all([
      // Browser stats
      Visitor.aggregate([
        {
          $group: {
            _id: "$userAgent.browser",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      // OS stats
      Visitor.aggregate([
        {
          $group: {
            _id: "$userAgent.os",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      // Mobile vs Desktop
      Visitor.aggregate([
        {
          $group: {
            _id: "$userAgent.isMobile",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const deviceStats = {
      mobile: devices.find(d => d._id === true)?.count || 0,
      desktop: devices.find(d => d._id === false)?.count || 0
    };

    res.json({
      browsers,
      operatingSystems,
      devices: deviceStats
    });
  } catch (error) {
    console.error('Error in /analytics/devices:', error);
    res.status(500).json({ error: 'Error fetching device statistics' });
  }
});

// Get geography statistics
router.get('/geography', async (req, res) => {
  try {
    const geographyStats = await Visitor.aggregate([
      {
        $match: {
          "location": { $ne: null },
          "location.country": { $exists: true },
          "location.city": { $exists: true }
        }
      },
      {
        $group: {
          _id: "$location.country",
          cities: {
            $addToSet: {
              name: "$location.city",
              coordinates: {
                lat: "$location.latitude",
                lng: "$location.longitude"
              }
            }
          },
          totalVisits: { $sum: 1 }
        }
      }
    ]);

    // Process cities to get visit counts
    const processedStats = await Promise.all(geographyStats.map(async country => {
      const cityCounts = await Visitor.aggregate([
        {
          $match: {
            "location.country": country._id,
            "location.city": { $in: country.cities.map(c => c.name) }
          }
        },
        {
          $group: {
            _id: "$location.city",
            count: { $sum: 1 }
          }
        }
      ]);

      // Merge city counts with coordinates
      const cities = country.cities.map(city => ({
        ...city,
        count: cityCounts.find(c => c._id === city.name)?.count || 0
      }));

      return {
        _id: country._id,
        cities,
        totalVisits: country.totalVisits
      };
    }));

    res.json(processedStats);
  } catch (error) {
    console.error('Error in /analytics/geography:', error);
    res.status(500).json({ error: 'Error fetching geography statistics' });
  }
});

// New endpoint for page visit tracking
router.post('/track', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null);

    // For localhost testing, use a dummy IP
    const effectiveIp = ip === '::1' || ip === undefined || ip === null ? '8.8.8.8' : ip;
    
    // Get geolocation info
    const geo = geoip.lookup(effectiveIp);
    
    // Parse user agent
    const ua = useragent.parse(req.headers['user-agent']);

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
      page: req.body.page || '/',
      referrer: req.headers.referer || req.headers.referrer
    });

    await visitor.save();

    res.status(200).json({ message: 'Visit tracked successfully' });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ error: 'Error tracking visit' });
  }
});

module.exports = router;
