import { NextResponse } from 'next/server';

const API_KEY = 'YOUR_API_KEY_HERE';
const AGENCY = 'AC';
const STOPS_API_URL = `http://api.511.org/transit/stops?api_key=${API_KEY}&operator_id=${AGENCY}&format=json`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();

    const response = await fetch(STOPS_API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    let stops = data?.Contents?.dataObjects?.ScheduledStopPoint || [];
    
    // Filter stops if search term provided
    if (search) {
      stops = stops.filter((stop: any) => {
        const name = stop.Name?.toLowerCase() || '';
        const id = stop.id?.toLowerCase() || '';
        return name.includes(search) || id.includes(search);
      });
    }
    
    // Format the stops for easier consumption
    const formattedStops = stops.map((stop: any) => ({
      id: stop.id,
      name: stop.Name,
      latitude: stop.Location?.Latitude ? parseFloat(stop.Location.Latitude) : null,
      longitude: stop.Location?.Longitude ? parseFloat(stop.Location.Longitude) : null,
    }));

    return NextResponse.json({
      total: formattedStops.length,
      stops: formattedStops
    });
  } catch (error) {
    console.error('Error fetching stops data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stops data' },
      { status: 500 }
    );
  }
}