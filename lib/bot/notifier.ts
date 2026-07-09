import type { ParsedNewsItem } from "@/lib/news/types";
import { getBotClient } from "./client";
import { getBotConfig } from "./types";
import { getAllBotSubscribers } from "@/lib/models";

const TELEGRAM_MESSAGE_LIMIT = 4096;

export interface NotifierResult {
  sent: number;
  skipped: number;
  errors: string[];
}

function buildAggregatedText(items: ParsedNewsItem[]): string {
  const blocks: string[] = [];

  for (const news of items) {
    blocks.push(
      `📰 **${news.title}**\n${news.annotation}\n🔗 [Читать источник](${news.sourceUrl})\n_Источник: ${news.source}_`
    );
  }

  return blocks.join("\n\n");
}

function splitIntoChunks(text: string): string[] {
  if (text.length <= TELEGRAM_MESSAGE_LIMIT) {
    return [text];
  }

  const chunks: string[] = [];
  const blocks = text.split(/\n\n(?=📰)/);

  let current = "";
  for (const block of blocks) {
    const separator = current === "" ? "" : "\n\n";
    if ((current + separator + block).length > TELEGRAM_MESSAGE_LIMIT) {
      if (current !== "") {
        chunks.push(current);
      }
      current = block;
    } else {
      current += separator + block;
    }
  }

  if (current !== "") {
    chunks.push(current);
  }

  return chunks;
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
  const chunks = splitIntoChunks(buildAggregatedText(newsItems));

  for (const user of users) {
    for (const chunk of chunks) {
      try {
        const response = await client.sendMessage({
          chatId: user.chatId,
          text: chunk,
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
