'use server';

import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

const API_KEY = process.env.GTFS_API_KEY;
const AGENCY = 'AC';
const API_URL = `http://api.511.org/transit/tripupdates?api_key=${API_KEY}&agency=${AGENCY}`;

export async function fetchGtfsData() {
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

    return { success: true, data: feedJSON };
  } catch (error) {
    console.error('Error fetching GTFS-RT data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch GTFS-RT data'
    };
  }
}