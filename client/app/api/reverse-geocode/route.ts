import { NextRequest, NextResponse } from "next/server";

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");

  if (!lat || !lng || !MAPBOX_TOKEN) {
    return NextResponse.json({ error: "Missing lat/lng or API key" }, { status: 400 });
  }

  try {
    const mapboxRes = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=place`
    );
    const data: LocationResponse = await mapboxRes.json();

    const city = data.features?.[0]?.text || "";
    const country = data.features?.[0]?.context?.find((c) => c.id.includes("country"))?.text || "";

    return NextResponse.json({ city, country });
  } catch {
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 });
  }
}
