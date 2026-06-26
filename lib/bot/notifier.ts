import type { ParsedNewsItem } from "@/lib/news/types";
import { getBotClient } from "./client";
import { getBotConfig } from "./types";
import { formatNewsMessage } from "./messages";
import { isDatabaseAvailable } from "@/lib/db";
import { getAllUserPreferences, type UserPreferences } from "@/lib/models";
import { mockUserPreferences as mockPrefs } from "@/lib/mock-data";

export interface NotifierResult {
  sent: number;
  skipped: number;
  errors: string[];
}

function getUserPreferencesFallback(): UserPreferences[] {
  return mockPrefs.map((p) => ({
    ...p,
    chatId: p.chatId ?? p.userId,
  }));
}

async function getAllUsersWithChats(): Promise<UserPreferences[]> {
  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    const users = await getAllUserPreferences();
    return users.filter((u) => u.chatId);
  }
  return getUserPreferencesFallback().filter((u) => u.chatId);
}

export async function notifyUsersAboutNewNews(
  newsItems: ParsedNewsItem[]
): Promise<NotifierResult> {
  const result: NotifierResult = { sent: 0, skipped: 0, errors: [] };

  if (newsItems.length === 0) {
    return result;
  }

  const users = await getAllUsersWithChats();
  if (users.length === 0) {
    return result;
  }

  const config = getBotConfig();
  const client = getBotClient(config);

  for (const news of newsItems) {
    const matchingUsers = users.filter((u) =>
      u.selectedCategories.includes(news.categoryId)
    );

    if (matchingUsers.length === 0) {
      result.skipped++;
      continue;
    }

    for (const user of matchingUsers) {
      try {
        const text = formatNewsMessage({
          id: "",
          title: news.title,
          annotation: news.annotation,
          source: news.source,
          sourceUrl: news.sourceUrl,
          categoryId: news.categoryId,
          publishedAt: news.publishedAt,
        });

        const response = await client.sendMessage({
          chatId: user.chatId!,
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
