import Link from "next/link";

const adminLinks = [
  { href: "/admin/sources", label: "来源管理", description: "添加 RSS/Atom 来源并触发抓取。" },
  { href: "/admin/candidates", label: "候选审核", description: "审核抓取到的候选新闻。" },
  { href: "/admin/articles", label: "文章管理", description: "管理已发布和草稿文章。" }
];

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-8">
      <header className="border-b border-line pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-mint">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">管理后台</h1>
      </header>

      <nav className="grid gap-3 md:grid-cols-3">
        {adminLinks.map((link) => (
          <Link
            className="rounded-md border border-line bg-white p-4 transition hover:border-mint"
            href={link.href}
            key={link.href}
          >
            <span className="block text-base font-semibold text-ink">{link.label}</span>
            <span className="mt-2 block text-sm leading-6 text-neutral-600">{link.description}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
