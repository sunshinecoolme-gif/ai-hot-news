import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedArticleBySlug } from "@/db/queries/public-articles";

export const dynamic = "force-dynamic";

const categoryLabels = {
  models: "产品/模型动态",
  tools: "AI 工具推荐"
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-8">
      <header className="border-b border-line pb-6">
        <Link className="text-sm font-medium text-mint hover:text-ink" href="/">
          AI Hot News
        </Link>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          <Link className="font-medium text-mint hover:text-ink" href={`/category/${article.category}`}>
            {categoryLabels[article.category]}
          </Link>
          <span aria-hidden="true">/</span>
          <span>{article.source.name}</span>
          <span aria-hidden="true">/</span>
          <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time>
        </div>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink">{article.title}</h1>
      </header>

      <article className="rounded-md border border-line bg-white p-6">
        <p className="text-lg leading-8 text-neutral-800">{article.summary}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <a
            className="rounded-md bg-signal px-4 py-2 font-semibold text-white hover:bg-blue-700"
            href={article.url}
            rel="noreferrer"
            target="_blank"
          >
            阅读原文
          </a>
          <a
            className="rounded-md border border-line px-4 py-2 font-semibold text-ink hover:border-mint"
            href={article.source.homepageUrl}
            rel="noreferrer"
            target="_blank"
          >
            查看来源
          </a>
        </div>
      </article>
    </main>
  );
}
