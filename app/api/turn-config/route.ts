import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

interface TurnConfig {
  urls: string;
  username: string;
  credential: string;
}

interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

export async function GET() {
  try {
    // Validate session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.ROBOFLOW_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Fetch TURN credentials from Roboflow
    const response = await fetch(
      `https://api.roboflow.com/webrtc_turn_config?api_key=${apiKey}`,
    );

    if (!response.ok) {
      console.warn("Failed to fetch TURN config:", response.status);
      // Return just STUN as fallback
      return NextResponse.json({
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
      });
    }

    const turnConfig: TurnConfig = await response.json();

    // Build ICE servers list with TURN config
    const iceServers: IceServer[] = [
      {
        urls: [turnConfig.urls],
        username: turnConfig.username,
        credential: turnConfig.credential,
      },
      { urls: ["stun:stun.l.google.com:19302"] },
    ];

    return NextResponse.json({ iceServers });
  } catch (error) {
    console.error("Error fetching TURN config:", error);
    // Return STUN fallback on error
    return NextResponse.json({
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    });
  }
}
