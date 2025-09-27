import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const apiKey = process.env.TWELVE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const res = await axios.get(
      `https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${apiKey}`
    );

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error("Metal Price API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
