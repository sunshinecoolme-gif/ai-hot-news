import Link from "next/link";
import type { PublicArticle } from "@/db/queries/public-articles";

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

export function ArticleCard({ article }: { article: PublicArticle }) {
  return (
    <article className="rounded-md border border-line bg-white p-5 transition hover:border-mint">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500">
        <Link className="text-mint hover:text-ink" href={`/category/${article.category}`}>
          {categoryLabels[article.category]}
        </Link>
        <span aria-hidden="true">/</span>
        <span>{article.source.name}</span>
        <span aria-hidden="true">/</span>
        <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time>
      </div>

      <h2 className="mt-3 text-xl font-semibold leading-7 text-ink">
        <Link className="hover:text-signal" href={`/article/${article.slug}`}>
          {article.title}
        </Link>
      </h2>

      <p className="mt-3 text-sm leading-6 text-neutral-700">{article.summary}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <Link
          aria-label={`阅读详情：${article.title}`}
          className="font-medium text-signal hover:text-blue-800"
          href={`/article/${article.slug}`}
        >
          阅读详情
        </Link>
        <a
          aria-label={`打开原文：${article.title}`}
          className="text-neutral-600 hover:text-ink"
          href={article.url}
          rel="noreferrer"
          target="_blank"
        >
          原文链接
        </a>
      </div>
    </article>
  );
}
