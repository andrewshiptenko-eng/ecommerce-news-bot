import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage, parseWebhookBody } from "@/lib/bot/handler";
import { getBotConfig, isBotConfigured } from "@/lib/bot/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get("hub.challenge");

  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { error: "Webhook verification failed" },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  if (!isBotConfigured()) {
    console.warn(
      "Bot not configured. Set BOT_TOKEN and BOT_WEBHOOK_URL env vars."
    );
    return NextResponse.json({ error: "Bot not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const incomingMessage = parseWebhookBody(body);

    if (!incomingMessage) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const result = await handleIncomingMessage(incomingMessage);

    return NextResponse.json({
      ok: true,
      replied: result.replied,
      message: result.message,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(_request: NextRequest) {
  try {
    const config = getBotConfig();
    const { getBotClient } = await import("@/lib/bot/client");
    const client = getBotClient(config);
    const result = await client.registerWebhook();

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Failed to register webhook" },
        { status: 500 }
      );
    }

    const commandsResult = await client.setMyCommands();

    return NextResponse.json({
      ok: true,
      message: "Webhook registered successfully",
      url: config.webhookUrl,
      commandsSet: commandsResult.ok,
    });
  } catch (error) {
    console.error("Webhook registration error:", error);
    return NextResponse.json(
      { error: "Failed to register webhook" },
      { status: 500 }
    );
  }
}
