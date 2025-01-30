const express = require('express');
const moment = require('moment');
const Visitor = require('../models/visitor');
const auth = require('../middleware/auth');

const router = express.Router();

// Get visitor overview
router.get('/overview', auth, async (req, res) => {
  try {
    console.log('Analytics: Fetching overview data');
    const today = moment().startOf('day');
    const lastMonth = moment().subtract(30, 'days').startOf('day');

    // Exclude admin paths from all queries
    const excludeAdminPaths = {
      page: { $not: /^\/admin/ }
    };

    // Get total visitors today
    const todayVisitors = await Visitor.countDocuments({
      timestamp: { $gte: today.toDate() },
      ...excludeAdminPaths
    });

    // Get total visitors this month
    const monthlyVisitors = await Visitor.countDocuments({
      timestamp: { $gte: lastMonth.toDate() },
      ...excludeAdminPaths
    });

    // Get unique visitors today
    const uniqueTodayVisitors = await Visitor.distinct('ip', {
      timestamp: { $gte: today.toDate() },
      ...excludeAdminPaths
    });

    // Get unique visitors this month
    const uniqueMonthlyVisitors = await Visitor.distinct('ip', {
      timestamp: { $gte: lastMonth.toDate() },
      ...excludeAdminPaths
    });

    // Get most visited pages
    const popularPages = await Visitor.aggregate([
      { 
        $match: { 
          timestamp: { $gte: lastMonth.toDate() },
          page: { $not: /^\/admin/ }
        } 
      },
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const response = {
      today: {
        total: todayVisitors,
        unique: uniqueTodayVisitors.length
      },
      monthly: {
        total: monthlyVisitors,
        unique: uniqueMonthlyVisitors.length
      },
      popularPages
    };

    console.log('Analytics: Overview data fetched successfully');
    res.json(response);
  } catch (error) {
    console.error('Analytics: Error fetching overview -', error);
    res.status(500).json({ message: 'Error fetching analytics overview' });
  }
});

// Get geographical data
router.get('/geography', auth, async (req, res) => {
  try {
    console.log('Analytics: Fetching geographical data');
    const lastMonth = moment().subtract(30, 'days').startOf('day');

    const geographicalData = await Visitor.aggregate([
      {
        $match: {
          'location.country': { $exists: true, $ne: null },
          timestamp: { $gte: lastMonth.toDate() },
          page: { $not: /^\/admin/ }
        }
      },
      {
        $group: {
          _id: {
            country: '$location.country',
            city: '$location.city'
          },
          count: { $sum: 1 },
          latitude: { $first: '$location.latitude' },
          longitude: { $first: '$location.longitude' }
        }
      },
      {
        $group: {
          _id: '$_id.country',
          cities: {
            $push: {
              name: '$_id.city',
              count: '$count',
              coordinates: {
                lat: '$latitude',
                lng: '$longitude'
              }
            }
          },
          totalVisits: { $sum: '$count' }
        }
      }
    ]);

    console.log('Analytics: Geographical data fetched successfully');
    res.json(geographicalData);
  } catch (error) {
    console.error('Analytics: Error fetching geographical data -', error);
    res.status(500).json({ message: 'Error fetching geographical data' });
  }
});

// Get daily visitors for the past month
router.get('/daily', auth, async (req, res) => {
  try {
    console.log('Analytics: Fetching daily visitors data');
    const lastMonth = moment().subtract(30, 'days').startOf('day');
    
    const dailyVisitors = await Visitor.aggregate([
      {
        $match: {
          timestamp: { $gte: lastMonth.toDate() },
          page: { $not: /^\/admin/ }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 },
          uniqueCount: { $addToSet: '$ip' }
        }
      },
      {
        $project: {
          date: '$_id',
          total: '$count',
          unique: { $size: '$uniqueCount' },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    console.log('Analytics: Daily visitors data fetched successfully');
    res.json(dailyVisitors);
  } catch (error) {
    console.error('Analytics: Error fetching daily visitors -', error);
    res.status(500).json({ message: 'Error fetching daily visitors' });
  }
});

// Get device statistics
router.get('/devices', auth, async (req, res) => {
  try {
    console.log('Analytics: Fetching device statistics');
    const lastMonth = moment().subtract(30, 'days').startOf('day');

    const [browsers, operatingSystems, devices] = await Promise.all([
      Visitor.aggregate([
        { 
          $match: { 
            timestamp: { $gte: lastMonth.toDate() },
            page: { $not: /^\/admin/ }
          } 
        },
        {
          $group: {
            _id: '$userAgent.browser',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Visitor.aggregate([
        { 
          $match: { 
            timestamp: { $gte: lastMonth.toDate() },
            page: { $not: /^\/admin/ }
          } 
        },
        {
          $group: {
            _id: '$userAgent.os',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Visitor.aggregate([
        { 
          $match: { 
            timestamp: { $gte: lastMonth.toDate() },
            page: { $not: /^\/admin/ }
          } 
        },
        {
          $group: {
            _id: '$userAgent.isMobile',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const response = {
      browsers,
      operatingSystems,
      devices: {
        mobile: devices.find(d => d._id === true)?.count || 0,
        desktop: devices.find(d => d._id === false)?.count || 0
      }
    };

    console.log('Analytics: Device statistics fetched successfully');
    res.json(response);
  } catch (error) {
    console.error('Analytics: Error fetching device statistics -', error);
    res.status(500).json({ message: 'Error fetching device statistics' });
  }
});

module.exports = router;
