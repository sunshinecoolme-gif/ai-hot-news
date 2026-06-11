import { listNewCandidates } from "@/db/queries/admin-candidates";
import { ignoreCandidateAction, publishCandidateAction } from "@/server/actions/candidates";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) {
    return "未知时间";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export default async function AdminCandidatesPage() {
  const rows = await listNewCandidates();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="border-b border-line pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-mint">Candidates</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">候选审核</h1>
      </header>

      <section className="grid gap-4">
        {rows.length > 0 ? (
          rows.map(({ candidate, source }) => (
            <article className="rounded-md border border-line bg-white p-4" key={candidate.id}>
              <div className="flex flex-col gap-3 border-b border-line pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-mint">{source.name}</p>
                    <h2 className="mt-2 text-xl font-semibold text-ink">{candidate.title}</h2>
                  </div>
                  <span className="text-sm text-neutral-500">{formatDate(candidate.fetchedAt)}</span>
                </div>
                <a className="break-all text-sm text-neutral-600 hover:text-signal" href={candidate.url}>
                  {candidate.url}
                </a>
                {candidate.summary ? (
                  <p className="text-sm leading-6 text-neutral-700">{candidate.summary}</p>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
                <form action={publishCandidateAction} className="grid gap-3 md:grid-cols-2">
                  <input name="candidateId" type="hidden" value={candidate.id} />
                  <input
                    className="rounded-md border border-line px-3 py-2 text-base text-ink outline-none focus:border-mint md:col-span-2"
                    defaultValue={candidate.title}
                    name="title"
                    required
                  />
                  <textarea
                    className="min-h-28 rounded-md border border-line px-3 py-2 text-base text-ink outline-none focus:border-mint md:col-span-2"
                    defaultValue={candidate.summary ?? ""}
                    name="summary"
                    required
                  />
                  <select
                    className="rounded-md border border-line px-3 py-2 text-base text-ink outline-none focus:border-mint"
                    defaultValue={source.category}
                    name="category"
                    required
                  >
                    <option value="models">产品/模型动态</option>
                    <option value="tools">AI 工具推荐</option>
                  </select>
                  <input
                    className="rounded-md border border-line px-3 py-2 text-base text-ink outline-none focus:border-mint"
                    name="tags"
                    placeholder="标签，用英文逗号分隔"
                  />
                  <label className="flex items-center gap-2 text-sm font-medium text-ink">
                    <input className="h-4 w-4 accent-mint" name="featured" type="checkbox" />
                    首页推荐
                  </label>
                  <button
                    className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 md:justify-self-start"
                    type="submit"
                  >
                    发布
                  </button>
                </form>

                <form action={ignoreCandidateAction}>
                  <input name="candidateId" type="hidden" value={candidate.id} />
                  <button
                    className="w-full rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-signal hover:text-signal lg:w-auto"
                    type="submit"
                  >
                    忽略
                  </button>
                </form>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-md border border-line bg-white p-4 text-sm text-neutral-600">暂无待审核候选。</p>
        )}
      </section>
    </main>
  );
}
