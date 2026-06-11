import { loginAction } from "@/server/actions/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasCredentialsError = params?.error === "CredentialsSignin";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="border-b border-line pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-mint">Admin</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">登录后台</h1>
      </div>

      <form action={loginAction} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Email
          <input
            className="rounded-md border border-line bg-white px-3 py-2 text-base text-ink outline-none focus:border-mint"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Password
          <input
            className="rounded-md border border-line bg-white px-3 py-2 text-base text-ink outline-none focus:border-mint"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {hasCredentialsError ? (
          <p className="text-sm font-medium text-red-700">邮箱或密码不正确。</p>
        ) : null}

        <button
          className="rounded-md bg-ink px-4 py-2.5 text-base font-semibold text-white transition hover:bg-neutral-800"
          type="submit"
        >
          登录
        </button>
      </form>
    </main>
  );
}
