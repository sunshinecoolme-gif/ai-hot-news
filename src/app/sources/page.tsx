import Link from "next/link";
import { listPublicSources } from "@/db/queries/public-sources";

export const dynamic = "force-dynamic";

const categoryLabels = {
  models: "产品/模型动态",
  tools: "AI 工具推荐"
};

export default async function SourcesPage() {
  const sources = await listPublicSources();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="border-b border-line pb-6">
        <Link className="text-sm font-medium text-mint hover:text-ink" href="/">
          AI Hot News
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-ink">来源</h1>
      </header>

      <section className="grid gap-3 md:grid-cols-2">
        {sources.length > 0 ? (
          sources.map((source) => (
            <article className="rounded-md border border-line bg-white p-5" key={source.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold text-ink">
                    <a className="hover:text-signal" href={source.homepageUrl} rel="noreferrer" target="_blank">
                      {source.name}
                    </a>
                  </h2>
                  <p className="mt-2 break-all text-sm text-neutral-600">{source.feedUrl}</p>
                </div>
                <span className="shrink-0 text-sm font-medium text-mint">{categoryLabels[source.category]}</span>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-md border border-line bg-white p-5 text-sm text-neutral-600 md:col-span-2">
            暂无启用来源。
          </p>
        )}
      </section>
    </main>
  );
}
