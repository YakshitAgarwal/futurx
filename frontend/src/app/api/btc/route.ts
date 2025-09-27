import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;

    const headers = apiKey
      ? {
          "x-cg-demo-api-key": apiKey,
        }
      : {};

    const res = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      { headers }
    );

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error("CoinGecko API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
