export interface BotUser {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface BotChat {
  id: string;
  type: "private" | "group" | "channel";
}

export interface IncomingMessage {
  messageId: string;
  from: BotUser;
  chat: BotChat;
  text?: string;
  timestamp: string;
}

export interface OutgoingMessage {
  chatId: string;
  text: string;
  title?: string;
  link?: string;
}

export interface BotConfig {
  token: string;
  apiUrl: string;
  webhookUrl: string;
}

export interface WebhookVerification {
  challenge: string;
  type: "verification";
}

export type WebhookEvent =
  | { type: "message"; payload: IncomingMessage }
  | { type: "error"; payload: { message: string } };

export function getBotConfig(): BotConfig {
  return {
    token: process.env.BOT_TOKEN ?? "",
    apiUrl: process.env.BOT_API_URL ?? "https://api.messenger.max/api/v1",
    webhookUrl: process.env.BOT_WEBHOOK_URL ?? "",
  };
}

export function isBotConfigured(): boolean {
  const config = getBotConfig();
  return config.token !== "" && config.webhookUrl !== "";
}
