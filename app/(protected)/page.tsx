import { MeetingCard } from "@/app/components/meeting-card";
import { requireGroupContext } from "@/app/components/session";
import { listHouseholds, listMeetingSummaries } from "@/lib/db";

function dateInTimeZone(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((value) => value.type === type)!.value;

  return `${part("year")}-${part("month")}-${part("day")}`;
}

export default async function DashboardPage() {
  const { db, group, groupId } = await requireGroupContext();
  const [meetings, households] = await Promise.all([
    listMeetingSummaries(db, groupId),
    listHouseholds(db, groupId),
  ]);
  const today = dateInTimeZone(group.timezone);
  const upcoming = meetings.filter((meeting) => meeting.meeting_date >= today);
  const past = meetings
    .filter((meeting) => meeting.meeting_date < today)
    .reverse();

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Home fellowship</p>
          <h1 className="page-title">Group calendar</h1>
        </div>
        <a className="button-primary self-start" href="/meetings/new">
          Add meeting
        </a>
      </header>

      <section aria-labelledby="upcoming-heading">
        <h2
          className="mb-5 text-2xl font-bold tracking-tight text-stone-950"
          id="upcoming-heading"
        >
          Upcoming meetings
        </h2>

        {upcoming.length === 0 ? (
          <div className="empty-state">
            <h3 className="text-lg font-bold text-stone-900">
              No upcoming meetings
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              Add a meeting when the next date is ready
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {upcoming.map((meeting) => (
              <MeetingCard
                headingLevel="h3"
                householdCount={households.length}
                key={meeting.id}
                meeting={meeting}
              />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="past-heading">
        <details className="group rounded-2xl border border-stone-200 bg-white shadow-sm">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#982838] focus-visible:ring-offset-2 sm:px-6">
            <div>
              <p className="eyebrow">Archive</p>
              <h2
                className="mt-1 text-xl font-bold tracking-tight text-stone-950"
                id="past-heading"
              >
                Past meetings ({past.length})
              </h2>
            </div>
            <span
              aria-hidden="true"
              className="rounded-full bg-[#f6f1e8] px-3 py-1.5 text-sm font-bold text-[#982838] group-open:hidden"
            >
              Show
            </span>
            <span
              aria-hidden="true"
              className="hidden rounded-full bg-[#f6f1e8] px-3 py-1.5 text-sm font-bold text-[#982838] group-open:inline"
            >
              Hide
            </span>
          </summary>
          <div className="border-t border-stone-200 p-4 sm:p-6">
            {past.length === 0 ? (
              <p className="text-sm text-stone-600">No past meetings</p>
            ) : (
              <div className="space-y-5">
                {past.map((meeting) => (
                  <MeetingCard
                    headingLevel="h3"
                    householdCount={households.length}
                    key={meeting.id}
                    meeting={meeting}
                  />
                ))}
              </div>
            )}
          </div>
        </details>
      </section>
    </div>
  );
}
