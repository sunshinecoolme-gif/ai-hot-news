import Link from "next/link";
import { ArticleCard } from "@/components/public/article-card";
import { listPublishedArticles } from "@/db/queries/public-articles";

export const dynamic = "force-dynamic";

const navLinks = [
  { href: "/category/models", label: "产品/模型动态" },
  { href: "/category/tools", label: "AI 工具推荐" },
  { href: "/sources", label: "来源" }
];

export default async function HomePage() {
  const articles = await listPublishedArticles();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="border-b border-line pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-mint">AI Hot News</p>
            <h1 className="mt-3 text-4xl font-semibold text-ink">AI 热点新闻</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-700">
              聚合全球 AI 产品、模型动态和实用工具推荐。
            </p>
          </div>

          <form action="/search" className="flex w-full max-w-sm gap-2">
            <input
              className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-mint"
              name="q"
              placeholder="搜索新闻"
              type="search"
            />
            <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" type="submit">
              搜索
            </button>
          </form>
        </div>

        <nav className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
          {navLinks.map((link) => (
            <Link className="rounded-md border border-line bg-white px-3 py-2 hover:border-mint" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="grid gap-4">
        {articles.length > 0 ? (
          articles.map((article) => <ArticleCard article={article} key={article.id} />)
        ) : (
          <p className="rounded-md border border-line bg-white p-5 text-sm text-neutral-600">暂无已发布文章。</p>
        )}
      </section>
    </main>
  );
}
