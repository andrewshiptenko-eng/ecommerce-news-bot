import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getAllFingerprints, saveNewsRecord } from "@/lib/models";
import { collectFromSources } from "@/lib/news";
import { getMockCollectionResult } from "@/lib/mock-data";
import { notifyUsersAboutNewNews } from "@/lib/bot/notifier";

export async function POST() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    const mockResult = getMockCollectionResult();
    return NextResponse.json({
      ok: true,
      mode: "static",
      ...mockResult,
    });
  }

  try {
    const existingFingerprints = await getAllFingerprints();
    const result = await collectFromSources(existingFingerprints);

    for (const item of result.items) {
      await saveNewsRecord({
        id: crypto.randomUUID(),
        title: item.title,
        annotation: item.annotation,
        source: item.source,
        sourceUrl: item.sourceUrl,
        publishedAt: item.publishedAt,
        fingerprint: item.fingerprint,
      });
    }

    const notificationResult = await notifyUsersAboutNewNews(result.items);

    return NextResponse.json({
      ok: true,
      mode: "fullstack",
      collected: result.collected,
      newItems: result.newItems,
      duplicates: result.duplicates,
      errors: result.errors,
      notification: notificationResult,
    });
  } catch (error) {
    console.error("News collection error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
