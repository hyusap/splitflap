"use client";

import { useState } from "react";

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Stop search states
  const [stopSearch, setStopSearch] = useState('');
  const [stops, setStops] = useState<any[]>([]);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const searchStops = async () => {
    if (!stopSearch.trim()) return;
    
    setStopsLoading(true);
    try {
      const response = await fetch(`/api/gtfs-stops?search=${encodeURIComponent(stopSearch)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setStops(result.stops || []);
    } catch (err) {
      console.error('Error searching stops:', err);
      setStops([]);
    } finally {
      setStopsLoading(false);
    }
  };

  const fetchGTFSData = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/gtfs-rt');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Get arrivals for selected stop
  const getArrivalsForStop = () => {
    if (!data || !selectedStopId) return [];
    
    const arrivals: any[] = [];
    const now = Date.now() / 1000; // Current time in seconds
    
    data.entity?.forEach((entity: any) => {
      if (entity.tripUpdate?.stopTimeUpdate) {
        entity.tripUpdate.stopTimeUpdate.forEach((stopUpdate: any) => {
          if (stopUpdate.stopId === selectedStopId) {
            const arrivalTime = stopUpdate.arrival?.time || stopUpdate.departure?.time;
            if (arrivalTime && arrivalTime > now) {
              arrivals.push({
                routeId: entity.tripUpdate.trip?.routeId,
                tripId: entity.tripUpdate.trip?.tripId,
                directionId: entity.tripUpdate.trip?.directionId,
                arrivalTime: arrivalTime,
                arrivalDelay: stopUpdate.arrival?.delay || 0,
                departureTime: stopUpdate.departure?.time,
                departureDelay: stopUpdate.departure?.delay || 0,
                stopSequence: stopUpdate.stopSequence
              });
            }
          }
        });
      }
    });
    
    // Sort by arrival time
    arrivals.sort((a, b) => a.arrivalTime - b.arrivalTime);
    return arrivals;
  };

  const formatTimeUntil = (timestamp: number) => {
    const now = Date.now() / 1000;
    const minutes = Math.floor((timestamp - now) / 60);
    
    if (minutes < 1) return 'Arriving';
    if (minutes === 1) return '1 min';
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const arrivals = getArrivalsForStop();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">GTFS-RT Debug Page</h1>
      
      {/* Stop Search Section */}
      <div className="mb-8 bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Find Your Stop</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by stop name or ID..."
            value={stopSearch}
            onChange={(e) => setStopSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchStops()}
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchStops}
            disabled={stopsLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {stopsLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {stops.length > 0 && (
          <div className="max-h-64 overflow-y-auto bg-gray-800 rounded-lg">
            <div className="p-2 text-sm text-gray-400">
              Found {stops.length} stops:
            </div>
            {stops.map((stop) => (
              <div
                key={stop.id}
                onClick={() => setSelectedStopId(stop.id)}
                className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700 ${
                  selectedStopId === stop.id ? 'bg-blue-900/30' : ''
                }`}
              >
                <div className="font-medium">{stop.name}</div>
                <div className="text-sm text-gray-400">
                  ID: <span className="font-mono text-blue-400">{stop.id}</span>
                  {stop.latitude && stop.longitude && (
                    <span className="ml-2">
                      📍 {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedStopId && (
          <div className="mt-2 p-2 bg-blue-900/30 rounded text-sm">
            Selected Stop ID: <span className="font-mono text-blue-400">{selectedStopId}</span>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <button
          onClick={fetchGTFSData}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Fetching...' : 'Fetch AC Transit GTFS-RT Data'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
          <h2 className="text-red-400 font-semibold mb-2">Error:</h2>
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Arrivals for Selected Stop */}
      {selectedStopId && data && (
        <div className="mb-6 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Next Arrivals at Stop {selectedStopId}
          </h2>
          
          {arrivals.length === 0 ? (
            <p className="text-gray-400">No upcoming arrivals found for this stop.</p>
          ) : (
            <div className="space-y-3">
              {arrivals.slice(0, 10).map((arrival, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-blue-400">
                        {arrival.routeId}
                      </span>
                      <span className="text-gray-400">
                        Direction {arrival.directionId !== undefined ? arrival.directionId : 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Trip: {arrival.tripId}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {formatTimeUntil(arrival.arrivalTime)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(arrival.arrivalTime * 1000).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {arrival.arrivalDelay !== 0 && (
                        <span className={arrival.arrivalDelay > 0 ? 'text-red-400' : 'text-green-400'}>
                          {' '}({arrival.arrivalDelay > 0 ? '+' : ''}{Math.round(arrival.arrivalDelay / 60)}m)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {data.header?.timestamp ? new Date(data.header.timestamp * 1000).toLocaleTimeString() : 'N/A'}
          </div>
        </div>
      )}

      {data && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">GTFS-RT Trip Updates</h2>
          
          <div className="mb-4 text-sm text-gray-400">
            <p>Feed Timestamp: {data.header?.timestamp ? new Date(data.header.timestamp * 1000).toLocaleString() : 'N/A'}</p>
            <p>Total Updates: {data.entity?.length || 0}</p>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {data.entity?.slice(0, 10).map((entity: any, index: number) => (
              <div key={entity.id || index} className="bg-gray-800 rounded-lg p-4">
                <div className="font-mono text-sm mb-2 text-blue-400">ID: {entity.id}</div>
                
                {entity.tripUpdate && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Route ID:</span> {entity.tripUpdate.trip?.routeId || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Trip ID:</span> {entity.tripUpdate.trip?.tripId || 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Direction:</span> {entity.tripUpdate.trip?.directionId !== undefined ? entity.tripUpdate.trip.directionId : 'N/A'}
                      </div>
                      <div>
                        <span className="text-gray-500">Start Time:</span> {entity.tripUpdate.trip?.startTime || 'N/A'}
                      </div>
                    </div>
                    
                    {entity.tripUpdate.stopTimeUpdate && entity.tripUpdate.stopTimeUpdate.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-400 mb-1">Stop Updates:</div>
                        <div className="space-y-1">
                          {entity.tripUpdate.stopTimeUpdate.slice(0, 3).map((stop: any, stopIndex: number) => (
                            <div key={stopIndex} className="text-xs bg-gray-700 rounded p-2">
                              <span className="text-gray-400">Stop {stop.stopSequence}:</span> {stop.stopId || 'N/A'}
                              {stop.arrival && (
                                <span className="ml-2">
                                  Arr: {stop.arrival.time ? new Date(stop.arrival.time * 1000).toLocaleTimeString() : 'N/A'}
                                  {stop.arrival.delay && ` (${stop.arrival.delay > 0 ? '+' : ''}${stop.arrival.delay}s)`}
                                </span>
                              )}
                            </div>
                          ))}
                          {entity.tripUpdate.stopTimeUpdate.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{entity.tripUpdate.stopTimeUpdate.length - 3} more stops
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {data.entity?.length > 10 && (
              <div className="text-center text-gray-500 text-sm">
                Showing first 10 of {data.entity.length} updates
              </div>
            )}
          </div>

          <details className="mt-6">
            <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
              View Raw JSON
            </summary>
            <pre className="mt-2 bg-black rounded p-4 text-xs overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}