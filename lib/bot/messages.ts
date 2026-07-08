import type { NewsItem } from "@/lib/mock-data";

export function formatWelcomeMessage(firstName?: string): string {
  const safeFirstName = firstName ? firstName : undefined;
  const name = safeFirstName ? `${safeFirstName}, ` : "";
  return (
    `👋 ${name}привет! Я — EcomNewsBot.\n\n` +
    `Я собираю свежие новости из мира e-commerce и доставляю их тебе ` +
    `без дублирования.\n\n` +
    `Доступные команды:\n` +
    `/start — показать это приветствие\n` +
    `/news — последние новости\n` +
    `/help — справка\n\n` +
    `_Бот работает в Мессенджере Макс_`
  );
}

export function formatHelpMessage(): string {
  return (
    `ℹ️ **Справка по командам**\n\n` +
    `/start — приветствие и список команд\n` +
    `/news — показать последние новости\n` +
    `/help — эта справка\n\n` +
    `Новости собираются из ключевых источников ` +
    `и дедуплицируются — каждая новость приходит только один раз.\n`
  );
}

export function formatNewsMessage(news: NewsItem): string {
  const lines: string[] = [];

  lines.push(`📰 **${news.title}**`);
  lines.push("");
  lines.push(news.annotation);
  lines.push("");
  lines.push(`🔗 [Читать источник](${news.sourceUrl})`);
  lines.push(`_Источник: ${news.source}_`);

  return lines.join("\n");
}

export function formatNewsError(): string {
  return (
    "❌ Не удалось загрузить новости.\n\n" +
    "База данных временно недоступна. Попробуй позже."
  );
}

export function formatNewsList(newsItems: NewsItem[]): string {
  if (newsItems.length === 0) {
    return "Новостей пока нет. Попробуй позже!";
  }

  const lines: string[] = ["📰 **Последние новости e-commerce:**\n"];

  for (const item of newsItems.slice(0, 5)) {
    lines.push(`• **${item.title}**`);
    lines.push(`  ${item.annotation.slice(0, 100)}...`);
    lines.push(`  🔗 ${item.sourceUrl}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function formatUnknownCommand(command: string): string {
  return (
    `❌ Неизвестная команда: \`${command}\`\n\n` +
    `Отправь /help, чтобы увидеть список доступных команд.`
  );
}
