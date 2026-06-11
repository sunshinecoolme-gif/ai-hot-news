import { listAdminArticles } from "@/db/queries/admin-articles";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function AdminArticlesPage() {
  const articles = await listAdminArticles();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="border-b border-line pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-mint">Articles</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">文章管理</h1>
      </header>

      <section className="divide-y divide-line rounded-md border border-line bg-white">
        {articles.length > 0 ? (
          articles.map((article) => (
            <article className="p-4" key={article.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{article.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">{article.summary}</p>
                  <a className="mt-2 block break-all text-sm text-neutral-600 hover:text-signal" href={article.url}>
                    {article.url}
                  </a>
                </div>
                <div className="flex shrink-0 flex-col gap-1 text-sm text-neutral-500 sm:text-right">
                  <span>{article.category === "models" ? "产品/模型动态" : "AI 工具推荐"}</span>
                  <span>{article.status}</span>
                  <span>{formatDate(article.publishedAt)}</span>
                  {article.featured ? <span className="font-medium text-signal">首页推荐</span> : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="p-4 text-sm text-neutral-600">暂无文章。</p>
        )}
      </section>
    </main>
  );
}
