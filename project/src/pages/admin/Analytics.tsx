import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { analyticsApi, AnalyticsData, DailyVisitors, DeviceStats, LocationData } from '../../services/analyticsApi';
import AdminLayout from '../../components/admin/AdminLayout';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

export default function Analytics() {
  const [overview, setOverview] = useState<AnalyticsData | null>(null);
  const [dailyData, setDailyData] = useState<DailyVisitors[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching analytics data...');
        const [overviewRes, dailyRes, devicesRes, geoRes] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getDailyVisitors(),
          analyticsApi.getDeviceStats(),
          analyticsApi.getGeography()
        ]);

        console.log('Analytics data received:', {
          overview: overviewRes,
          daily: dailyRes,
          devices: devicesRes,
          geo: geoRes
        });

        setOverview(overviewRes);
        setDailyData(dailyRes);
        setDeviceStats(devicesRes);
        setLocations(geoRes);
        setError(null);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const content = (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Today's Visitors</h3>
          <div className="mt-2">
            <p className="text-2xl font-bold">{overview?.today.total || 0}</p>
            <p className="text-sm text-gray-500">{overview?.today.unique || 0} unique</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Monthly Visitors</h3>
          <div className="mt-2">
            <p className="text-2xl font-bold">{overview?.monthly.total || 0}</p>
            <p className="text-sm text-gray-500">{overview?.monthly.unique || 0} unique</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Desktop vs Mobile</h3>
          <div className="mt-2">
            <p className="text-sm">
              Desktop: {deviceStats?.devices.desktop || 0} ({deviceStats?.devices.desktop ? 
                Math.round((deviceStats.devices.desktop / (deviceStats.devices.desktop + deviceStats.devices.mobile)) * 100) : 0}%)
            </p>
            <p className="text-sm">
              Mobile: {deviceStats?.devices.mobile || 0} ({deviceStats?.devices.mobile ? 
                Math.round((deviceStats.devices.mobile / (deviceStats.devices.desktop + deviceStats.devices.mobile)) * 100) : 0}%)
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Popular Pages</h3>
          <div className="mt-2 space-y-1">
            {overview?.popularPages.slice(0, 3).map(page => (
              <p key={page._id} className="text-sm">
                {page._id}: {page.count} visits
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Visitor Graph */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Visitor Trends</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Visitors" />
              <Line type="monotone" dataKey="unique" stroke="#82ca9d" name="Unique Visitors" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* World Map */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Geographical Distribution</h3>
        <div className="h-[400px]">
          <ComposableMap>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#EAEAEC"
                    stroke="#D6D6DA"
                  />
                ))
              }
            </Geographies>
            {locations.flatMap(country =>
              country.cities.map(city => (
                <Marker key={`${country._id}-${city.name}`} coordinates={[city.coordinates.lng, city.coordinates.lat]}>
                  <circle r={Math.log(city.count + 1) * 2} fill="#F00" fillOpacity={0.5} />
                </Marker>
              ))
            )}
          </ComposableMap>
        </div>
      </div>

      {/* Device Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Browsers</h3>
          <div className="space-y-2">
            {deviceStats?.browsers.map(browser => (
              <div key={browser._id} className="flex justify-between">
                <span>{browser._id}</span>
                <span>{browser.count} visits</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Operating Systems</h3>
          <div className="space-y-2">
            {deviceStats?.operatingSystems.map(os => (
              <div key={os._id} className="flex justify-between">
                <span>{os._id}</span>
                <span>{os.count} visits</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      {loading ? (
        <div className="p-4">Loading analytics...</div>
      ) : (
        content
      )}
    </AdminLayout>
  );
}
