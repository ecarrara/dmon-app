import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { InferenceHTTPClient } from "@roboflow/inference-sdk";

interface WebRTCOffer {
  sdp: string;
  type: string;
}

interface WebRTCParams {
  imageInputName?: string;
  streamOutputNames?: string[];
  dataOutputNames?: string[];
  workflowsParameters?: Record<string, unknown>;
}

interface InitWebRTCRequestBody {
  offer: WebRTCOffer;
  wrtcParams?: WebRTCParams;
}

interface TurnConfig {
  urls: string;
  username?: string;
  credential?: string;
}

/**
 * Fetch TURN server credentials from Roboflow API
 * TURN servers help establish WebRTC connections through NAT/firewalls
 */
async function fetchTurnConfig(apiKey: string): Promise<TurnConfig> {
  const fallbackConfig = { urls: "stun:stun.l.google.com:19302" };

  try {
    const response = await fetch(
      `https://api.roboflow.com/webrtc_turn_config?api_key=${apiKey}`,
    );
    if (!response.ok) {
      console.warn("Failed to fetch TURN config:", response.status);
      return fallbackConfig;
    }
    return await response.json();
  } catch (error) {
    console.warn("Error fetching TURN config:", error);
    return fallbackConfig;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validate session (same pattern as /api/trips)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse offer from frontend
    const body: InitWebRTCRequestBody = await request.json();
    const { offer, wrtcParams } = body;

    // 3. Validate required fields
    if (!offer?.sdp || !offer?.type) {
      return NextResponse.json({ error: "Invalid offer" }, { status: 400 });
    }

    // 4. Read ALL sensitive config from environment (never from frontend)
    const apiKey = process.env.ROBOFLOW_API_KEY;
    const workspaceName = process.env.ROBOFLOW_WORKSPACE_NAME;
    const workflowId = process.env.ROBOFLOW_WORKFLOW_ID;

    if (!apiKey || !workspaceName || !workflowId) {
      console.error("Missing Roboflow configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const client = InferenceHTTPClient.init({ apiKey });

    // 5. Fetch TURN server credentials for NAT traversal
    const turnConfig = await fetchTurnConfig(apiKey);

    // 6. Forward to Roboflow - workspace/workflow from env, optional params from frontend
    // de
    const answer = await client.initializeWebrtcWorker({
      offer,
      workspaceName,
      workflowId,
      config: {
        imageInputName: wrtcParams?.imageInputName ?? "image",
        streamOutputNames: wrtcParams?.streamOutputNames,
        dataOutputNames: wrtcParams?.dataOutputNames,
        workflowsParameters: wrtcParams?.workflowsParameters,
        iceServers: [
          {
            ...turnConfig,
            urls: [turnConfig.urls],
          },
        ],
      },
    });

    return NextResponse.json(answer);
  } catch (error) {
    console.error("Error initializing WebRTC:", error);

    const message =
      error instanceof Error ? error.message : "Failed to initialize WebRTC";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
