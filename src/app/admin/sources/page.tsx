import { listAdminSources } from "@/db/queries/admin-sources";
import { createSourceAction, fetchSourcesAction, setSourceEnabledAction } from "@/server/actions/sources";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const sources = await listAdminSources();
  async function fetchSourcesFormAction() {
    "use server";

    await fetchSourcesAction();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-mint">Sources</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">来源管理</h1>
        </div>

        <form action={fetchSourcesFormAction}>
          <button
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
            type="submit"
          >
            手动抓取
          </button>
        </form>
      </header>

      <form
        action={createSourceAction}
        className="grid gap-4 rounded-md border border-line bg-white p-4 md:grid-cols-2"
      >
        <input
          className="rounded-md border border-line px-3 py-2 text-base text-ink outline-none focus:border-mint"
          name="name"
          placeholder="来源名称"
          required
        />
        <input
          className="rounded-md border border-line px-3 py-2 text-base text-ink outline-none focus:border-mint"
          name="homepageUrl"
          placeholder="主页 URL"
          required
          type="url"
        />
        <input
          className="rounded-md border border-line px-3 py-2 text-base text-ink outline-none focus:border-mint md:col-span-2"
          name="feedUrl"
          placeholder="RSS/Atom URL"
          required
          type="url"
        />
        <select
          className="rounded-md border border-line px-3 py-2 text-base text-ink outline-none focus:border-mint"
          name="category"
          required
        >
          <option value="models">产品/模型动态</option>
          <option value="tools">AI 工具推荐</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input className="h-4 w-4 accent-mint" defaultChecked name="enabled" type="checkbox" />
          启用
        </label>
        <button
          className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 md:col-span-2"
          type="submit"
        >
          添加来源
        </button>
      </form>

      <section className="divide-y divide-line rounded-md border border-line bg-white">
        {sources.length > 0 ? (
          sources.map((source) => (
            <article className="p-4" key={source.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold text-ink">{source.name}</h2>
                  <p className="mt-1 break-all text-sm text-neutral-600">{source.feedUrl}</p>
                  <p className="mt-1 text-sm text-neutral-500">状态：{source.lastFetchStatus}</p>
                </div>
                <form action={setSourceEnabledAction} className="flex shrink-0 items-center gap-3">
                  <input name="sourceId" type="hidden" value={source.id} />
                  <input name="enabled" type="hidden" value={source.enabled ? "false" : "true"} />
                  <span className="text-sm font-medium text-ink">{source.enabled ? "启用" : "停用"}</span>
                  <button
                    className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink transition hover:border-mint"
                    type="submit"
                  >
                    {source.enabled ? "停用" : "启用"}
                  </button>
                </form>
              </div>
            </article>
          ))
        ) : (
          <p className="p-4 text-sm text-neutral-600">暂无来源。</p>
        )}
      </section>
    </main>
  );
}
