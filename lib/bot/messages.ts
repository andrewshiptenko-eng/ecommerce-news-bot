import { CATEGORIES } from "@/lib/categories";
import type { NewsItem } from "@/lib/mock-data";

export function formatWelcomeMessage(firstName?: string): string {
  const name = firstName ? `${firstName}, ` : "";
  return (
    `👋 ${name}привет! Я — EcomNewsBot.\n\n` +
    `Я собираю свежие новости из мира e-commerce и доставляю их тебе ` +
    `без дублирования.\n\n` +
    `Доступные команды:\n` +
    `/start — показать это приветствие\n` +
    `/news — последние новости\n` +
    `/categories — выбрать категории новостей\n` +
    `/help — справка\n\n` +
    `_Бот работает в Мессенджере Макс_`
  );
}

export function formatHelpMessage(): string {
  return (
    `ℹ️ **Справка по командам**\n\n` +
    `/start — приветствие и список команд\n` +
    `/news — показать последние новости\n` +
    `/categories — выбрать категории новостей\n` +
    `/help — эта справка\n\n` +
    `Новости собираются из ключевых источников ` +
    `и дедуплицируются — каждая новость приходит только один раз.\n` +
    `Выбирай интересующие категории и получай только релевантные новости.`
  );
}

export function formatCategoriesMessage(selectedCategories: string[]): string {
  const lines: string[] = [
    `📂 **Категории новостей**\n`,
    `Отправь номера категорий через запятую, чтобы включить или выключить их.\n`,
    `Пример: \`1,3,5\`\n`,
    `Также можно отправить \`all\` (все) или \`none\` (ни одной).\n`,
  ];

  CATEGORIES.forEach((cat, index) => {
    const icon = selectedCategories.includes(cat.id) ? "✅" : "⬜";
    lines.push(`${icon} \`${index + 1}\` — **${cat.title}**`);
    lines.push(`   ${cat.description}`);
    lines.push("");
  });

  lines.push(
    `\n_Выбрано: ${selectedCategories.length} из ${CATEGORIES.length}_`
  );

  return lines.join("\n");
}

export function formatCategoriesUpdated(selectedCategories: string[]): string {
  const selectedNames = selectedCategories
    .map((id) => CATEGORIES.find((c) => c.id === id)?.title)
    .filter(Boolean);

  if (selectedNames.length === 0) {
    return "⚠️ Ты не выбрал ни одной категории. Новости не будут приходить. Отправь `/categories`, чтобы изменить выбор.";
  }

  return (
    `✅ **Категории сохранены!**\n\n` +
    `Теперь ты будешь получать новости по темам:\n` +
    selectedNames.map((name) => `• ${name}`).join("\n") +
    `\n\nОтправь /categories, чтобы изменить выбор.`
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

export function formatNewsList(newsItems: NewsItem[]): string {
  if (newsItems.length === 0) {
    return "Новостей по выбранным категориям пока нет. Попробуй позже!";
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
