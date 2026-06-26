import type { IncomingMessage } from "./types";
import { getBotClient } from "./client";
import { getBotConfig } from "./types";
import {
  formatWelcomeMessage,
  formatHelpMessage,
  formatUnknownCommand,
  formatCategoriesMessage,
  formatCategoriesUpdated,
  formatNewsList,
} from "./messages";
import { mockNews, mockUserPreferences } from "@/lib/mock-data";
import { CATEGORIES, ALL_CATEGORY_IDS } from "@/lib/categories";
import { isDatabaseAvailable } from "@/lib/db";
import { getUserPreferences, setUserPreferences } from "@/lib/models";

export interface HandlerResult {
  replied: boolean;
  message?: string;
}

async function getUserSelectedCategories(userId: string): Promise<string[]> {
  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    const prefs = await getUserPreferences(userId);
    if (prefs) return prefs.selectedCategories;
  } else {
    const mockPref = mockUserPreferences.find((p) => p.userId === userId);
    if (mockPref) return mockPref.selectedCategories;
    const defaultPref = mockUserPreferences.find((p) => p.userId === "default");
    if (defaultPref) return defaultPref.selectedCategories;
  }
  return ALL_CATEGORY_IDS;
}

async function saveUserSelectedCategories(
  userId: string,
  categories: string[],
  chatId?: string
): Promise<boolean> {
  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    await setUserPreferences(userId, categories, chatId);
    return true;
  }
  return false;
}

function parseCategorySelection(
  text: string,
  currentSelected: string[]
): string[] | null {
  const normalized = text.toLowerCase().trim();

  if (normalized === "all") {
    return [...ALL_CATEGORY_IDS];
  }

  if (normalized === "none") {
    return [];
  }

  const parts = normalized
    .split(/[,.\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  const indices = new Set<number>();
  for (const part of parts) {
    const num = parseInt(part, 10);
    if (Number.isNaN(num) || num < 1 || num > CATEGORIES.length) {
      return null;
    }
    indices.add(num - 1);
  }

  const toggled = new Set(currentSelected);
  for (const idx of indices) {
    const catId = CATEGORIES[idx].id;
    if (toggled.has(catId)) {
      toggled.delete(catId);
    } else {
      toggled.add(catId);
    }
  }

  return [...toggled];
}

export async function handleIncomingMessage(
  message: IncomingMessage
): Promise<HandlerResult> {
  const text = message.text?.trim() ?? "";
  const chatId = message.chat.id;
  const userId = message.from.id;
  const firstName = message.from.firstName;

  if (!text) {
    return { replied: false };
  }

  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    const prefs = await getUserPreferences(userId);
    if (!prefs || prefs.chatId !== chatId) {
      await setUserPreferences(
        userId,
        prefs?.selectedCategories ?? ALL_CATEGORY_IDS,
        chatId
      );
    }
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
    const selectedCategories = await getUserSelectedCategories(userId);
    const filteredNews = mockNews.filter((n) =>
      selectedCategories.includes(n.categoryId)
    );
    const newsToShow = filteredNews.slice(0, 5);
    const response = await client.sendMessage({
      chatId,
      text: formatNewsList(newsToShow),
    });
    return { replied: response.ok };
  }

  if (text === "/categories") {
    const selectedCategories = await getUserSelectedCategories(userId);
    const response = await client.sendMessage({
      chatId,
      text: formatCategoriesMessage(selectedCategories),
    });
    return { replied: response.ok };
  }

  if (text.startsWith("/categories ")) {
    const selectedCategories = await getUserSelectedCategories(userId);
    const arg = text.slice("/categories ".length).trim();
    const newSelection = parseCategorySelection(arg, selectedCategories);

    if (newSelection === null) {
      const response = await client.sendMessage({
        chatId,
        text:
          `❌ Неверный формат. Отправь номера категорий через запятую.\n\n` +
          `Пример: \`/categories 1,3,5\`\n` +
          `Или: \`/categories all\` (все) или \`/categories none\` (ни одной).`,
      });
      return { replied: response.ok };
    }

    await saveUserSelectedCategories(userId, newSelection, chatId);
    const response = await client.sendMessage({
      chatId,
      text: formatCategoriesUpdated(newSelection),
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
      `Привет! Я понял твоё сообщение: "${text.slice(0, 200)}".\n\n` +
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
