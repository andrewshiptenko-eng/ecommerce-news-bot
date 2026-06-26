import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { newsCategories, mockNews } from "@/lib/mock-data";
import { Bot, ExternalLink, Newspaper, Rss } from "lucide-react";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getCategoryTitle(id: string) {
  return newsCategories.find((c) => c.id === id)?.title ?? id;
}

export default function HomePage() {
  const sortedNews = [...mockNews].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <div className="space-y-16 pb-16">
      <section className="gradient-hero-light relative overflow-hidden px-4 py-20">
        <div className="pattern-grid absolute inset-0 opacity-30" />
        <div className="container relative mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Новости e-commerce
            <span className="text-primary"> в один клик</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            Бот для Мессенджера Макс собирает свежие новости электронной
            коммерции из ключевых источников и доставляет их без дублирования.
            Только то, что важно для вашего бизнеса.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Rss className="h-4 w-4 text-primary" />6 категорий
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Newspaper className="h-4 w-4 text-primary" />
              Без дубликатов
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-primary" />
              Мгновенная доставка
            </span>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
            Категории новостей
          </h2>
          <p className="text-muted-foreground">
            Выберите интересующие темы и получайте только релевантные новости
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newsCategories.map((category) => (
            <Card key={category.id} size="sm">
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="container mx-auto max-w-5xl" />

      <section className="container mx-auto max-w-3xl px-4">
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
            Последние новости
          </h2>
          <p className="text-muted-foreground">
            Свежие публикации из мира электронной коммерции
          </p>
        </div>
        <div className="space-y-4">
          {sortedNews.map((news) => (
            <Card key={news.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{news.title}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {getCategoryTitle(news.categoryId)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {news.annotation}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>{news.source}</span>
                    <span>&middot;</span>
                    <span>{formatDate(news.publishedAt)}</span>
                  </div>
                  <a
                    href={news.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Читать источник
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
