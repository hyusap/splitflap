'use client';

import { useState, useEffect } from 'react';

// Stop configurations based on your findings
const STOP_CONFIGS = {
  '58778': { name: '36 Northbound', routes: ['36'], direction: 'North' },
  '54767': { name: '36 Southbound', routes: ['36'], direction: 'South' },
  '51582': { name: 'Multi-Route Stop', routes: ['51B', '22', '27'], directions: { 0: 'South', 2: 'North' } }
};

interface Arrival {
  routeId: string;
  tripId: string;
  directionId: number;
  arrivalTime: number;
  arrivalDelay: number;
  stopId: string;
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchGTFSData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gtfs-rt');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchGTFSData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchGTFSData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getArrivalsForStop = (stopId: string): Arrival[] => {
    if (!data) return [];
    
    const arrivals: Arrival[] = [];
    const now = Date.now() / 1000;
    const stopConfig = STOP_CONFIGS[stopId as keyof typeof STOP_CONFIGS];
    
    data.entity?.forEach((entity: any) => {
      if (entity.tripUpdate?.stopTimeUpdate) {
        const routeId = entity.tripUpdate.trip?.routeId;
        
        // Check if this route is relevant for this stop
        if (stopConfig && stopConfig.routes.includes(routeId)) {
          entity.tripUpdate.stopTimeUpdate.forEach((stopUpdate: any) => {
            if (stopUpdate.stopId === stopId) {
              const arrivalTime = stopUpdate.arrival?.time || stopUpdate.departure?.time;
              if (arrivalTime && arrivalTime > now) {
                arrivals.push({
                  routeId: routeId,
                  tripId: entity.tripUpdate.trip?.tripId,
                  directionId: entity.tripUpdate.trip?.directionId,
                  arrivalTime: arrivalTime,
                  arrivalDelay: stopUpdate.arrival?.delay || 0,
                  stopId: stopId
                });
              }
            }
          });
        }
      }
    });
    
    arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
    return arrivals;
  };

  const formatTimeUntil = (timestamp: number) => {
    const now = Date.now() / 1000;
    const minutes = Math.floor((timestamp - now) / 60);
    
    if (minutes < 1) return 'Now';
    if (minutes === 1) return '1 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getDirectionLabel = (stopId: string, directionId: number): string => {
    const config = STOP_CONFIGS[stopId as keyof typeof STOP_CONFIGS];
    if (config.direction) {
      return config.direction;
    }
    if (config.directions) {
      return config.directions[directionId as keyof typeof config.directions] || `Dir ${directionId}`;
    }
    return `Direction ${directionId}`;
  };

  const getRouteDisplayName = (routeId: string): string => {
    return routeId;
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Transit Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Auto-refresh (30s)</span>
            </label>
            
            <button
              onClick={fetchGTFSData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {lastUpdate && (
          <div className="text-sm text-gray-400 mb-4">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Route 36 Northbound */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Route 36 - Northbound</h2>
              <p className="text-sm text-gray-400">Stop 58778</p>
            </div>
            
            <div className="space-y-2">
              {getArrivalsForStop('58778').slice(0, 5).map((arrival, idx) => (
                <div key={idx} className="bg-gray-800 rounded p-3 flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-blue-400">
                      {getRouteDisplayName(arrival.routeId)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {formatTimeUntil(arrival.arrivalTime)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(arrival.arrivalTime * 1000).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {getArrivalsForStop('58778').length === 0 && (
                <p className="text-gray-500 text-sm">No upcoming arrivals</p>
              )}
            </div>
          </div>

          {/* Route 36 Southbound */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Route 36 - Southbound</h2>
              <p className="text-sm text-gray-400">Stop 54767</p>
            </div>
            
            <div className="space-y-2">
              {getArrivalsForStop('54767').slice(0, 5).map((arrival, idx) => (
                <div key={idx} className="bg-gray-800 rounded p-3 flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-blue-400">
                      {getRouteDisplayName(arrival.routeId)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {formatTimeUntil(arrival.arrivalTime)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(arrival.arrivalTime * 1000).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {getArrivalsForStop('54767').length === 0 && (
                <p className="text-gray-500 text-sm">No upcoming arrivals</p>
              )}
            </div>
          </div>

          {/* Multi-Route Stop (51B, 22, 27) */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Routes 51B, 22, 27</h2>
              <p className="text-sm text-gray-400">Stop 51582</p>
            </div>
            
            <div className="space-y-2">
              {getArrivalsForStop('51582').slice(0, 8).map((arrival, idx) => (
                <div key={idx} className="bg-gray-800 rounded p-3 flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-blue-400">
                      {getRouteDisplayName(arrival.routeId)}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {getDirectionLabel('51582', arrival.directionId)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {formatTimeUntil(arrival.arrivalTime)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(arrival.arrivalTime * 1000).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {getArrivalsForStop('51582').length === 0 && (
                <p className="text-gray-500 text-sm">No upcoming arrivals</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {data && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {getArrivalsForStop('58778').length + getArrivalsForStop('54767').length}
              </div>
              <div className="text-sm text-gray-400">Route 36 Arrivals</div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {getArrivalsForStop('51582').length}
              </div>
              <div className="text-sm text-gray-400">Multi-Route Arrivals</div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {data.entity?.length || 0}
              </div>
              <div className="text-sm text-gray-400">Total Trip Updates</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}