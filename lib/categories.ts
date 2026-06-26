export interface Category {
  id: string;
  title: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "marketplaces",
    title: "Маркетплейсы",
    description: "Новости Wildberries, Ozon, Яндекс Маркета и других площадок",
  },
  {
    id: "logistics",
    title: "Логистика",
    description: "Доставка, складские операции, последняя миля",
  },
  {
    id: "payments",
    title: "Платёжные системы",
    description: "Финансовые технологии, новые способы оплаты",
  },
  {
    id: "startups",
    title: "Стартапы и инвестиции",
    description: "Инвестиционные раунды, новые проекты в e-commerce",
  },
  {
    id: "regulation",
    title: "Регулирование и право",
    description: "Законодательные изменения, регулирование онлайн-торговли",
  },
  {
    id: "tech",
    title: "Технологии",
    description: "AI, ML, новые технологии в электронной коммерции",
  },
];

export const ALL_CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function getCategoryTitle(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.title ?? id;
}
