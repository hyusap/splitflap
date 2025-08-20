import { NextResponse } from 'next/server';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

const API_KEY = 'YOUR_API_KEY_HERE';
const AGENCY = 'AC';
const API_URL = `http://api.511.org/transit/tripupdates?api_key=${API_KEY}&agency=${AGENCY}`;

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Accept': 'application/x-protobuf',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
    
    const feedJSON = GtfsRealtimeBindings.transit_realtime.FeedMessage.toObject(feed, {
      enums: String,
      longs: String,
      bytes: String,
      defaults: true,
      arrays: true,
      objects: true,
      oneofs: true
    });

    return NextResponse.json(feedJSON);
  } catch (error) {
    console.error('Error fetching GTFS-RT data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch GTFS-RT data' },
      { status: 500 }
    );
  }
}