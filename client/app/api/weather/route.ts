import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(req: NextRequest) {
    const lat = req.nextUrl.searchParams.get("lat");
    const lon = req.nextUrl.searchParams.get("lon");

    if (!lat || !lon || !API_KEY) {
        return NextResponse.json({ error: "Missing lat, lon or API key" }, { status: 400 });
    }

    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();

        return NextResponse.json({
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
    }
}
