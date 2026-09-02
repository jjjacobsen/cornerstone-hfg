import { MeetingFields } from "@/app/components/forms";
import { requireGroupContext } from "@/app/components/session";
import { listHouseholds } from "@/lib/db";

export default async function NewMeetingPage() {
  const { db, groupId } = await requireGroupContext();
  const households = await listHouseholds(db, groupId);

  return (
    <section
      className="mx-auto max-w-3xl"
      aria-labelledby="new-meeting-heading"
    >
      <p className="eyebrow">Group calendar</p>
      <h1 className="page-title" id="new-meeting-heading">
        Add meeting
      </h1>
      <p className="page-description">
        Plan the schedule, host, location, and meal
      </p>

      <form action="/api/mutations" className="form-card mt-6" method="post">
        <input name="intent" type="hidden" value="create-meeting" />
        <MeetingFields households={households} />
        <div className="form-actions">
          <a className="button-secondary" href="/">
            Cancel
          </a>
          <button className="button-primary" type="submit">
            Add meeting
          </button>
        </div>
      </form>
    </section>
  );
}
