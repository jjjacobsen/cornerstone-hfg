import { requireGroupContext } from "@/app/components/session";
import { listHouseholds } from "@/lib/db";

export default async function HouseholdsPage() {
  const { db, groupId } = await requireGroupContext();
  const households = await listHouseholds(db, groupId);

  return (
    <section aria-labelledby="households-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Group roster</p>
          <h1 className="page-title" id="households-heading">
            Households
          </h1>
        </div>
        <a className="button-primary self-start" href="/households/new">
          Add household
        </a>
      </div>

      {households.length === 0 ? (
        <div className="empty-state mt-6">
          <h2 className="text-lg font-bold text-stone-900">
            No households yet
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Add the first household to start the roster
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {households.map((household) => (
            <li
              className="flex items-start justify-between gap-4 rounded-2xl border border-[#531821]/10 bg-white p-5 shadow-sm shadow-[#531821]/5"
              key={household.id}
            >
              <div className="min-w-0">
                <h2 className="font-bold text-stone-950">{household.name}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-stone-600">
                  {household.notes || "No household notes"}
                </p>
              </div>
              <a
                className="button-secondary shrink-0"
                href={`/households/${household.id}/edit`}
              >
                Edit
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
