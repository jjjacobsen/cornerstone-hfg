import type { MeetingSummary, ResponseStatus } from "@/lib/db";

const statusStyle: Record<ResponseStatus, string> = {
  yes: "bg-emerald-100 text-emerald-800",
  maybe: "bg-amber-100 text-amber-800",
  no: "bg-stone-200 text-stone-700",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

function formatTime(value: string) {
  if (!value) {
    return "Not set";
  }

  const [hours, minutes] = value.split(":").map(Number);
  const hour = hours % 12 || 12;
  return `${hour}:${minutes.toString().padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-6 text-stone-800">
        {value || "Not set"}
      </dd>
    </div>
  );
}

export function MeetingCard({
  headingLevel,
  householdCount,
  meeting,
}: {
  headingLevel: "h2" | "h3";
  householdCount: number;
  meeting: MeetingSummary;
}) {
  const MeetingHeading = headingLevel;
  const AttendanceHeading = headingLevel === "h2" ? "h3" : "h4";
  const totals = { yes: 0, no: 0, maybe: 0 };
  for (const response of meeting.responses) {
    totals[response.status] += 1;
  }
  const mapQuery = meeting.address || meeting.location_name;
  const meetingHeadingId = `meeting-${meeting.id}-heading`;
  const attendanceHeadingId = `meeting-${meeting.id}-attendance`;
  const formattedDate = formatDate(meeting.meeting_date);
  const formattedStartTime = formatTime(meeting.start_time);

  return (
    <article
      aria-labelledby={meetingHeadingId}
      className="overflow-hidden rounded-2xl border border-[#531821]/10 bg-white shadow-sm shadow-[#531821]/5"
    >
      <div className="border-b border-[#531821]/10 bg-[#f6f1e8] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <MeetingHeading
              className="text-xl font-bold tracking-tight text-stone-950 sm:text-2xl"
              id={meetingHeadingId}
            >
              {formattedDate}
            </MeetingHeading>
            <p className="mt-1 text-sm font-semibold text-[#982838]">
              {formattedStartTime}
              {meeting.end_time && ` to ${formatTime(meeting.end_time)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              className="button-secondary"
              href={`/meetings/${meeting.id}/edit`}
            >
              Edit meeting
            </a>
            <a
              className="button-primary"
              href={`/meetings/${meeting.id}/response`}
            >
              Add or edit response
            </a>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Host" value={meeting.host_household_name} />
          <Detail
            label="Location"
            value={
              mapQuery ? (
                <>
                  {meeting.location_name && (
                    <span className="block">{meeting.location_name}</span>
                  )}
                  {meeting.address && (
                    <span className="block whitespace-pre-line">
                      {meeting.address}
                    </span>
                  )}
                  <a
                    className="-mx-2 mt-1 inline-flex min-h-11 items-center px-2 font-semibold text-[#982838] underline decoration-[#982838]/30 underline-offset-2 hover:text-[#76202c]"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open map
                  </a>
                </>
              ) : undefined
            }
          />
          <Detail label="Main dish" value={meeting.main_dish} />
          <Detail
            label="Meeting notes"
            value={
              meeting.notes ? (
                <span className="whitespace-pre-line">{meeting.notes}</span>
              ) : undefined
            }
          />
        </dl>

        <section
          aria-labelledby={attendanceHeadingId}
          className="mt-5 border-t border-stone-200 pt-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AttendanceHeading className="font-bold text-stone-950" id={attendanceHeadingId}>
              Attendance
              <span className="sr-only">
                {` for ${formattedDate} at ${formattedStartTime}`}
              </span>
            </AttendanceHeading>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-800">
                Yes {totals.yes}
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-amber-800">
                Maybe {totals.maybe}
              </span>
              <span className="rounded-full bg-stone-200 px-3 py-1.5 text-stone-700">
                No {totals.no}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1.5 text-stone-600">
                Awaiting{" "}
                {Math.max(0, householdCount - meeting.responses.length)}
              </span>
            </div>
          </div>

          <details className="group/roster mt-3 rounded-xl border border-stone-200 bg-stone-50">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2 text-sm font-bold text-[#982838] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#982838] focus-visible:ring-offset-2">
              <span>Household responses ({meeting.responses.length})</span>
              <span className="group-open/roster:hidden" aria-hidden="true">
                Show
              </span>
              <span
                className="hidden group-open/roster:inline"
                aria-hidden="true"
              >
                Hide
              </span>
            </summary>
            <div className="border-t border-stone-200 bg-white">
              {meeting.responses.length === 0 ? (
                <p className="px-4 py-4 text-sm text-stone-600">
                  No households have responded yet
                </p>
              ) : (
                <ul className="divide-y divide-stone-200">
                  {meeting.responses.map((response) => (
                    <li className="p-4" key={response.household_id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-stone-950">
                            {response.household_name}
                          </p>
                          <span
                            aria-label={`${response.household_name} attendance: ${response.status}`}
                            className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyle[response.status]}`}
                          >
                            {response.status}
                          </span>
                        </div>
                        <a
                          className="-mx-2 inline-flex min-h-11 items-center px-2 text-sm font-semibold text-[#982838] underline decoration-[#982838]/30 underline-offset-2 hover:text-[#76202c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#982838] focus-visible:ring-offset-2"
                          href={`/meetings/${meeting.id}/response?household=${response.household_id}`}
                        >
                          Edit response
                        </a>
                      </div>
                      <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="font-medium text-stone-500">
                            Bringing
                          </dt>
                          <dd className="mt-0.5 whitespace-pre-line text-stone-800">
                            {response.contribution || "None"}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-stone-500">Notes</dt>
                          <dd className="mt-0.5 whitespace-pre-line text-stone-800">
                            {response.notes || "None"}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        </section>
      </div>
    </article>
  );
}
