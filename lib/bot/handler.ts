import type { IncomingMessage } from "./types";
import { getBotClient } from "./client";
import { getBotConfig } from "./types";
import { escapeMarkdown } from "./escape";
import {
  formatWelcomeMessage,
  formatHelpMessage,
  formatUnknownCommand,
  formatNewsList,
  formatNewsError,
} from "./messages";
import { isDatabaseAvailable } from "@/lib/db";
import { getRecentNews } from "@/lib/models";

export interface HandlerResult {
  replied: boolean;
  message?: string;
}

export async function handleIncomingMessage(
  message: IncomingMessage
): Promise<HandlerResult> {
  const text = message.text?.trim() ?? "";
  const chatId = message.chat.id;
  const firstName = message.from.firstName;

  if (!text) {
    return { replied: false };
  }

  const config = getBotConfig();
  const client = getBotClient(config);

  if (text === "/start") {
    const response = await client.sendMessage({
      chatId,
      text: formatWelcomeMessage(firstName),
    });
    return { replied: response.ok };
  }

  if (text === "/help") {
    const response = await client.sendMessage({
      chatId,
      text: formatHelpMessage(),
    });
    return { replied: response.ok };
  }

  if (text === "/news") {
    let newsText: string;

    try {
      const dbAvailable = await isDatabaseAvailable();

      if (!dbAvailable) {
        newsText = formatNewsError();
      } else {
        const records = await getRecentNews(5);

        if (records.length === 0) {
          newsText = formatNewsList([]);
        } else {
          const newsItems = records.map((r) => ({
            id: r.id,
            title: r.title,
            annotation: r.annotation,
            source: r.source,
            sourceUrl: r.sourceUrl,
            publishedAt: r.publishedAt,
          }));

          newsText = formatNewsList(newsItems);
        }
      }
    } catch {
      newsText = formatNewsError();
    }

    const response = await client.sendMessage({
      chatId,
      text: newsText,
    });
    return { replied: response.ok };
  }

  if (text.startsWith("/")) {
    const response = await client.sendMessage({
      chatId,
      text: formatUnknownCommand(text),
    });
    return { replied: response.ok };
  }

  const response = await client.sendMessage({
    chatId,
    text:
      `Привет! Я понял твоё сообщение: "${escapeMarkdown(text.slice(0, 200))}".\n\n` +
      `Используй /help, чтобы узнать, что я умею.`,
  });
  return { replied: response.ok };
}

export function parseWebhookBody(body: unknown): IncomingMessage | null {
  if (typeof body !== "object" || body === null) return null;

  const data = body as Record<string, unknown>;
  if (!data.message || typeof data.message !== "object") return null;

  const msg = data.message as Record<string, unknown>;
  if (!msg.from || typeof msg.from !== "object") return null;
  if (!msg.chat || typeof msg.chat !== "object") return null;

  const from = msg.from as Record<string, unknown>;
  const chat = msg.chat as Record<string, unknown>;

  return {
    messageId: String(msg.message_id ?? ""),
    from: {
      id: String(from.id ?? ""),
      firstName: from.first_name ? String(from.first_name) : undefined,
      lastName: from.last_name ? String(from.last_name) : undefined,
      username: from.username ? String(from.username) : undefined,
    },
    chat: {
      id: String(chat.id ?? ""),
      type: (chat.type as "private") ?? "private",
    },
    text: msg.text ? String(msg.text) : undefined,
    timestamp: new Date().toISOString(),
  };
}
