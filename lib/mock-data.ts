import type { Service } from "./models";

export const mockServices: Service[] = [
  {
    id: "mock-service-1",
    name: "API Gateway",
    description: "Шлюз для микросервисной архитектуры",
    status: "active",
    url: "https://api.example.com",
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "mock-service-2",
    name: "Auth Service",
    description: "Сервис аутентификации и авторизации",
    status: "active",
    url: "https://auth.example.com",
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-02-01").toISOString(),
  },
  {
    id: "mock-service-3",
    name: "ML Pipeline",
    description: "Пайплайн для обработки данных с AI",
    status: "deploying",
    url: undefined,
    createdAt: new Date("2024-03-10").toISOString(),
    updatedAt: new Date("2024-03-10").toISOString(),
  },
];

export interface NewsItem {
  id: string;
  title: string;
  annotation: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
}

export const mockNews: NewsItem[] = [
  {
    id: "news-1",
    title: "Ozon запускает доставку за 1 час в 15 новых городах",
    annotation:
      "Маркетплейс расширяет программу экспресс-доставки, охватив дополнительно 15 городов-миллионников. Время доставки сократится до одного часа по ключевым категориям товаров.",
    source: "Коммерсантъ",
    sourceUrl: "https://www.kommersant.ru/doc/8778154",
    publishedAt: new Date("2026-07-08").toISOString(),
  },
  {
    id: "news-2",
    title: "Wildberries тестирует оплату по QR-коду в пунктах выдачи",
    annotation:
      "Новый способ оплаты позволит покупателям оплачивать заказы без использования банковской карты. Пилотный проект запущен в 200 пунктах выдачи Москвы.",
    source: "РБК",
    sourceUrl: "https://www.rbc.ru/technology_and_media/08/07/2026/qr-payment",
    publishedAt: new Date("2026-07-08").toISOString(),
  },
  {
    id: "news-3",
    title: "Яндекс Маркет внедряет AI-рекомендации на основе истории покупок",
    annotation:
      "Новая модель машинного обучения анализирует историю заказов и поведение пользователя, чтобы предлагать персонализированные подборки товаров.",
    source: "VC.ru",
    sourceUrl:
      "https://vc.ru/marketplace/2996993-wildberries-vvel-platnuyu-otmenu-zakazov",
    publishedAt: new Date("2026-07-07").toISOString(),
  },
  {
    id: "news-4",
    title: "Госдума приняла закон о маркировке товаров на маркетплейсах",
    annotation:
      "Новый закон обязывает все онлайн-площадки указывать страну происхождения товара и полную информацию о продавце. Закон вступает в силу с 1 сентября 2026 года.",
    source: "ТАСС",
    sourceUrl: "https://tass.ru/ekonomika/20260707/marking-marketplace",
    publishedAt: new Date("2026-07-07").toISOString(),
  },
  {
    id: "news-5",
    title: "Стартап «Логистик Про» привлёк ₽2 млрд на автоматизацию складов",
    annotation:
      "Компания разрабатывает роботизированные решения для сортировки и упаковки заказов. Инвестиции пойдут на масштабирование производства и выход в регионы.",
    source: "Forbes Russia",
    sourceUrl:
      "https://www.forbes.ru/tekhnologii/20260706/logistika-pro-investment",
    publishedAt: new Date("2026-07-06").toISOString(),
  },
  {
    id: "news-6",
    title: "СДЭК запускает бесконтактную выдачу посылок через постаматы",
    annotation:
      "Обновлённые постаматы позволяют получить заказ без сканирования QR-кода — достаточно подтверждения через приложение. Функция уже доступна в 500 постаматах Москвы.",
    source: "Интерфакс",
    sourceUrl: "https://www.interfax.ru/business/20260706/cdek-postamat",
    publishedAt: new Date("2026-07-06").toISOString(),
  },
];

export function getMockCollectionResult() {
  return {
    collected: 6,
    newItems: 6,
    duplicates: 0,
    errors: [],
    items: mockNews.map((n) => ({
      title: n.title,
      annotation: n.annotation,
      source: n.source,
      sourceUrl: n.sourceUrl,
      publishedAt: n.publishedAt,
      fingerprint: `${n.title
        .toLowerCase()
        .replace(/[^\wа-яё\s]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(
          0,
          120
        )}::${new URL(n.sourceUrl).hostname.replace(/^www\./, "")}${new URL(n.sourceUrl).pathname.replace(/\/$/, "")}`,
    })),
  };
}
