import type { OutgoingMessage, BotConfig } from "./types";
import { getBotConfig } from "./types";
import { escapeMarkdown } from "./escape";

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
      let text = message.text;

      // Preserve MarkdownV2 formatting patterns before escaping
      const boldPairs: string[] = [];
      text = text.replace(/\*\*(.+?)\*\*/g, (_, content) => {
        const idx = boldPairs.length;
        boldPairs.push(escapeMarkdown(content));
        return `\x00B${idx}\x00B`;
      });

      const italicPairs: string[] = [];
      text = text.replace(/(?<!\*)_(.+?)_(?!\*)/g, (_, content) => {
        const idx = italicPairs.length;
        italicPairs.push(escapeMarkdown(content));
        return `\x00I${idx}\x00I`;
      });

      const codePairs: string[] = [];
      text = text.replace(/`(.+?)`/g, (_, content) => {
        const idx = codePairs.length;
        codePairs.push(content);
        return `\x00C${idx}\x00C`;
      });

      const linkPairs: { label: string; url: string }[] = [];
      text = text.replace(/\[(.+?)\]\((.+?)\)/g, (_, label, url) => {
        const idx = linkPairs.length;
        linkPairs.push({ label, url });
        return `\x00L${idx}\x00L`;
      });

      // Escape the remaining text
      text = escapeMarkdown(text);

      // Restore formatting patterns
      text = text.replace(
        /\x00B(\d+)\x00B/g,
        (_, idx) => `**${boldPairs[Number(idx)]}**`
      );
      text = text.replace(
        /\x00I(\d+)\x00I/g,
        (_, idx) => `_${italicPairs[Number(idx)]}_`
      );
      text = text.replace(
        /\x00C(\d+)\x00C/g,
        (_, idx) => `\`${codePairs[Number(idx)]}\``
      );
      text = text.replace(/\x00L(\d+)\x00L/g, (_, idx) => {
        const { label, url } = linkPairs[Number(idx)];
        return `[${label}](${url})`;
      });

      const response = await fetch(
        `${this.config.apiUrl}/bot${this.config.token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: message.chatId,
            text,
            parse_mode: "MarkdownV2",
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

  async setMyCommands(): Promise<BotApiResponse> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/bot${this.config.token}/setMyCommands`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commands: [
              {
                command: "start",
                description: "Запустить бота и получить приветствие",
              },
              {
                command: "help",
                description: "Показать список доступных команд",
              },
              { command: "news", description: "Получить последние новости" },
            ],
          }),
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
