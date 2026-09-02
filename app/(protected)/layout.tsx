import { requireGroupContext } from "@/app/components/session";

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { group } = await requireGroupContext();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-orange-950/10 bg-[#fffaf1]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <a className="min-w-0 no-underline" href="/">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                Cornerstone HFG
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight text-stone-950 sm:text-2xl">
                {group.name}
              </p>
            </a>
            <form action="/api/auth" method="post">
              <input name="intent" type="hidden" value="logout" />
              <button
                className="button-secondary whitespace-nowrap"
                type="submit"
              >
                Log out
              </button>
            </form>
          </div>
          {group.description && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              {group.description}
            </p>
          )}
          <nav
            aria-label="Main navigation"
            className="mt-5 flex flex-wrap gap-2"
          >
            <a className="nav-link" href="/">
              Meetings
            </a>
            <a className="nav-link" href="/households">
              Households
            </a>
            <a className="nav-link" href="/meetings/new">
              Add meeting
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {children}
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-xs text-stone-500 sm:px-6">
        Cornerstone Presbyterian Church Home Fellowship Groups
      </footer>
    </div>
  );
}
