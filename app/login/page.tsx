type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Cornerstone Presbyterian Church
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Home Fellowship Groups</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Sign in with your group&apos;s shared credentials
          </p>
        </div>

        <section
          aria-labelledby="login-heading"
          className="rounded-2xl bg-white p-6 shadow-2xl shadow-black/30 sm:p-8"
        >
          <h2 id="login-heading" className="text-xl font-semibold text-slate-950">
            Group sign in
          </h2>

          {error === "invalid" && (
            <div
              className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              The group or password is incorrect. Try again
            </div>
          )}

          <form action="/api/auth" className="mt-6 space-y-5" method="post">
            <input name="intent" type="hidden" value="login" />

            <div>
              <label className="block text-sm font-medium text-slate-800" htmlFor="group">
                Group code
              </label>
              <input
                autoCapitalize="none"
                autoComplete="username"
                autoFocus
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                id="group"
                name="group"
                placeholder="Your group code"
                required
                spellCheck={false}
                type="text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-800" htmlFor="password">
                Password
              </label>
              <input
                autoComplete="current-password"
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-950 shadow-sm outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                id="password"
                name="password"
                required
                type="password"
              />
            </div>

            <button
              className="flex w-full items-center justify-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 active:bg-amber-800"
              type="submit"
            >
              Sign in
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
