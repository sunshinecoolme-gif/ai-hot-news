import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/public/article-card";
import { listPublishedArticlesByCategory } from "@/db/queries/public-articles";

export const dynamic = "force-dynamic";

const categoryLabels = {
  models: "产品/模型动态",
  tools: "AI 工具推荐"
};

function isCategory(category: string): category is keyof typeof categoryLabels {
  return category === "models" || category === "tools";
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  if (!isCategory(category)) {
    notFound();
  }

  const articles = await listPublishedArticlesByCategory(category);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="border-b border-line pb-6">
        <Link className="text-sm font-medium text-mint hover:text-ink" href="/">
          AI Hot News
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-ink">{categoryLabels[category]}</h1>
      </header>

      <section className="grid gap-4">
        {articles.length > 0 ? (
          articles.map((article) => <ArticleCard article={article} key={article.id} />)
        ) : (
          <p className="rounded-md border border-line bg-white p-5 text-sm text-neutral-600">暂无该分类文章。</p>
        )}
      </section>
    </main>
  );
}
