import { notFound } from "next/navigation";
import { HouseholdFields } from "@/app/components/forms";
import { positiveId, requireGroupContext } from "@/app/components/session";
import { listHouseholds } from "@/lib/db";

type EditHouseholdPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditHouseholdPage({
  params,
}: EditHouseholdPageProps) {
  const { db, groupId } = await requireGroupContext();
  const householdId = positiveId((await params).id);
  if (householdId === null) {
    notFound();
  }

  const household = (await listHouseholds(db, groupId)).find(
    (row) => row.id === householdId,
  );
  if (!household) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section aria-labelledby="edit-household-heading">
        <p className="eyebrow">Group roster</p>
        <h1 className="page-title" id="edit-household-heading">
          Edit {household.name}
        </h1>

        <form action="/api/mutations" className="form-card mt-6" method="post">
          <input name="intent" type="hidden" value="update-household" />
          <input name="household_id" type="hidden" value={household.id} />
          <HouseholdFields household={household} />
          <div className="form-actions">
            <a className="button-secondary" href="/households">
              Cancel
            </a>
            <button className="button-primary" type="submit">
              Save household
            </button>
          </div>
        </form>
      </section>

      <section
        aria-labelledby="delete-household-heading"
        className="danger-card"
      >
        <h2
          className="text-lg font-bold text-red-950"
          id="delete-household-heading"
        >
          Delete household
        </h2>
        <p className="mt-2 text-sm leading-6 text-red-900/80">
          This also removes all responses from this household. Meetings remain,
          but this household will no longer be listed as their host
        </p>
        <form action="/api/mutations" className="mt-5" method="post">
          <input name="intent" type="hidden" value="delete-household" />
          <input name="household_id" type="hidden" value={household.id} />
          <label className="flex items-start gap-3 text-sm font-medium text-red-950">
            <input
              className="mt-1 size-4 accent-red-700"
              name="confirmation"
              required
              type="checkbox"
              value="delete"
            />
            I understand that this household and its responses will be removed
          </label>
          <button className="button-danger mt-5" type="submit">
            Delete household
          </button>
        </form>
      </section>
    </div>
  );
}
