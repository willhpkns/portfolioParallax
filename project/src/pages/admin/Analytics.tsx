import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { analyticsApi, AnalyticsData, DailyVisitors, DeviceStats, LocationData } from '../../services/analyticsApi';
import AdminLayout from '../../components/admin/AdminLayout';

// Using a more reliable source for the world map data
const geoUrl = "https://unpkg.com/world-atlas@2/countries-110m.json";

export default function Analytics() {
  const [overview, setOverview] = useState<AnalyticsData | null>(null);
  const [dailyData, setDailyData] = useState<DailyVisitors[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

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
      <div className="bg-white p-4 rounded-lg shadow overflow-hidden">
        <h3 className="text-lg font-semibold mb-4">Geographical Distribution</h3>
        <div className="h-[400px] relative">
          {mapError ? (
            <div className="text-red-500 p-4">{mapError}</div>
          ) : (
            <div className="relative">
              <ComposableMap className="absolute inset-0">
                <ZoomableGroup center={[0, 30]} zoom={1}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) => 
                      geographies?.map(geo => (
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
                    country.cities
                      .filter(city => city.coordinates && 
                        !isNaN(city.coordinates.lat) && 
                        !isNaN(city.coordinates.lng))
                      .map(city => {
                        const maxCount = Math.max(...locations.flatMap(c => c.cities.map(ci => ci.count)));
                        const intensity = city.count / maxCount;
                        const color = `rgb(${Math.round(255 * intensity)}, 0, ${Math.round(255 * (1 - intensity))})`;
                        
                        return (
                          <Marker 
                            key={`${country._id}-${city.name}`} 
                            coordinates={[city.coordinates.lng, city.coordinates.lat]}
                          >
                            <g>
                              <circle 
                                r={Math.log(city.count + 1) * 1.5} 
                                fill={color}
                                fillOpacity={0.7}
                                stroke="#FFF"
                                strokeWidth={0.5}
                              />
                              <title>{`${city.name}: ${city.count} visitor${city.count === 1 ? '' : 's'}`}</title>
                            </g>
                          </Marker>
                        );
                      })
                  )}
                </ZoomableGroup>
              </ComposableMap>
              <div className="absolute bottom-2 right-2 bg-white/80 p-2 rounded shadow text-xs">
                <div className="flex items-center space-x-2">
                  <span>Visitors:</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full" style={{background: 'linear-gradient(to right, rgb(255,0,255), rgb(255,0,0))'}}></div>
                    <span>Low → High</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
