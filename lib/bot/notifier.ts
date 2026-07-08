import type { ParsedNewsItem } from "@/lib/news/types";
import { getBotClient } from "./client";
import { getBotConfig } from "./types";
import { formatNewsMessage } from "./messages";
import { getAllBotSubscribers } from "@/lib/models";

export interface NotifierResult {
  sent: number;
  skipped: number;
  errors: string[];
}

export async function notifyUsersAboutNewNews(
  newsItems: ParsedNewsItem[]
): Promise<NotifierResult> {
  const result: NotifierResult = { sent: 0, skipped: 0, errors: [] };

  if (newsItems.length === 0) {
    return result;
  }

  let users: { userId: string; chatId: string }[];

  try {
    const subscribers = await getAllBotSubscribers();
    users = subscribers.map((s) => ({
      userId: s.userId,
      chatId: s.chatId,
    }));
  } catch {
    result.errors.push("failed to fetch subscribers from database");
    return result;
  }

  if (users.length === 0) {
    return result;
  }

  const config = getBotConfig();
  const client = getBotClient(config);

  for (const news of newsItems) {
    for (const user of users) {
      try {
        const text = formatNewsMessage({
          id: "",
          title: news.title,
          annotation: news.annotation,
          source: news.source,
          sourceUrl: news.sourceUrl,
          publishedAt: news.publishedAt,
        });

        const response = await client.sendMessage({
          chatId: user.chatId,
          text,
        });

        if (response.ok) {
          result.sent++;
        } else {
          result.errors.push(
            `send to ${user.userId}: ${response.error ?? "unknown error"}`
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        result.errors.push(`send to ${user.userId}: ${message}`);
      }
    }
  }

  return result;
}
