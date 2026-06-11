import Link from "next/link";
import { ArticleCard } from "@/components/public/article-card";
import { searchPublishedArticles } from "@/db/queries/public-articles";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const articles = query ? await searchPublishedArticles(query) : [];

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="border-b border-line pb-6">
        <Link className="text-sm font-medium text-mint hover:text-ink" href="/">
          AI Hot News
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-ink">搜索</h1>
        <form action="/search" className="mt-5 flex max-w-xl gap-2">
          <input
            className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-mint"
            defaultValue={query}
            name="q"
            placeholder="搜索标题或摘要"
            type="search"
          />
          <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" type="submit">
            搜索
          </button>
        </form>
      </header>

      <section className="grid gap-4">
        {query ? (
          articles.length > 0 ? (
            articles.map((article) => <ArticleCard article={article} key={article.id} />)
          ) : (
            <p className="rounded-md border border-line bg-white p-5 text-sm text-neutral-600">没有找到相关文章。</p>
          )
        ) : (
          <p className="rounded-md border border-line bg-white p-5 text-sm text-neutral-600">请输入关键词开始搜索。</p>
        )}
      </section>
    </main>
  );
}
