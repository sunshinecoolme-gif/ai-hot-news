export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="border-b border-line pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-mint">AI Hot News</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">AI 热点新闻</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-700">
          聚合全球 AI 产品、模型动态和实用工具推荐。
        </p>
      </header>
    </main>
  );
}
