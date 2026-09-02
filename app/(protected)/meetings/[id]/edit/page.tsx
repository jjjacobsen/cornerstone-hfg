import { notFound } from "next/navigation";
import { MeetingFields } from "@/app/components/forms";
import { positiveId, requireGroupContext } from "@/app/components/session";
import { getMeeting, listHouseholds } from "@/lib/db";

type EditMeetingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMeetingPage({
  params,
}: EditMeetingPageProps) {
  const { db, groupId } = await requireGroupContext();
  const meetingId = positiveId((await params).id);
  if (meetingId === null) {
    notFound();
  }

  const [meeting, households] = await Promise.all([
    getMeeting(db, groupId, meetingId),
    listHouseholds(db, groupId),
  ]);
  if (meeting === null) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section aria-labelledby="edit-meeting-heading">
        <p className="eyebrow">Group calendar</p>
        <h1 className="page-title" id="edit-meeting-heading">
          Edit meeting
        </h1>
        <p className="page-description">
          Update the meeting on {meeting.meeting_date}
        </p>

        <form action="/api/mutations" className="form-card mt-6" method="post">
          <input name="intent" type="hidden" value="update-meeting" />
          <input name="meeting_id" type="hidden" value={meeting.id} />
          <MeetingFields households={households} meeting={meeting} />
          <div className="form-actions">
            <a className="button-secondary" href="/">
              Cancel
            </a>
            <button className="button-primary" type="submit">
              Save meeting
            </button>
          </div>
        </form>
      </section>

      <section aria-labelledby="delete-meeting-heading" className="danger-card">
        <h2
          className="text-lg font-bold text-red-950"
          id="delete-meeting-heading"
        >
          Delete meeting
        </h2>
        <p className="mt-2 text-sm leading-6 text-red-900/80">
          This permanently removes the meeting and all of its household
          responses
        </p>
        <form action="/api/mutations" className="mt-5" method="post">
          <input name="intent" type="hidden" value="delete-meeting" />
          <input name="meeting_id" type="hidden" value={meeting.id} />
          <label className="flex items-start gap-3 text-sm font-medium text-red-950">
            <input
              className="mt-1 size-4 accent-red-700"
              name="confirmation"
              required
              type="checkbox"
              value="delete"
            />
            I understand that this meeting and all responses will be removed
          </label>
          <button className="button-danger mt-5" type="submit">
            Delete meeting
          </button>
        </form>
      </section>
    </div>
  );
}
