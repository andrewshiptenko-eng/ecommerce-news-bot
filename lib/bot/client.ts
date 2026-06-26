import type { OutgoingMessage, BotConfig } from "./types";
import { getBotConfig } from "./types";

export interface BotApiResponse {
  ok: boolean;
  messageId?: string;
  error?: string;
}

export class BotClient {
  private config: BotConfig;

  constructor(config: BotConfig) {
    this.config = config;
  }

  async sendMessage(message: OutgoingMessage): Promise<BotApiResponse> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/bot${this.config.token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: message.chatId,
            text: message.text,
            title: message.title,
            link: message.link,
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Bot API error (${response.status}): ${errorBody}`);
        return { ok: false, error: `HTTP ${response.status}: ${errorBody}` };
      }

      const data = await response.json();
      return { ok: true, messageId: data.message_id };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Bot client error:", message);
      return { ok: false, error: message };
    }
  }

  async sendNews(
    chatId: string,
    title: string,
    annotation: string,
    link: string
  ): Promise<BotApiResponse> {
    const text = `📰 **${title}**\n\n${annotation}\n\n🔗 [Читать источник](${link})`;
    return this.sendMessage({ chatId, text, title, link });
  }

  async registerWebhook(): Promise<BotApiResponse> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/bot${this.config.token}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: this.config.webhookUrl }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        return { ok: false, error: `HTTP ${response.status}: ${errorBody}` };
      }

      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, error: message };
    }
  }
}

let botClientInstance: BotClient | null = null;

export function getBotClient(config?: BotConfig): BotClient {
  if (!botClientInstance || config) {
    botClientInstance = new BotClient(config ?? getBotConfig());
  }
  return botClientInstance;
}
