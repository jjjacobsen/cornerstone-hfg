import { HouseholdFields } from "@/app/components/forms";
import { requireGroupContext } from "@/app/components/session";

export default async function NewHouseholdPage() {
  await requireGroupContext();

  return (
    <section
      className="mx-auto max-w-2xl"
      aria-labelledby="new-household-heading"
    >
      <p className="eyebrow">Group roster</p>
      <h1 className="page-title" id="new-household-heading">
        Add household
      </h1>
      <form action="/api/mutations" className="form-card mt-6" method="post">
        <input name="intent" type="hidden" value="create-household" />
        <HouseholdFields />
        <div className="form-actions">
          <a className="button-secondary" href="/households">
            Cancel
          </a>
          <button className="button-primary" type="submit">
            Add household
          </button>
        </div>
      </form>
    </section>
  );
}
