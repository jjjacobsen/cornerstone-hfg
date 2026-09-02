import { notFound } from "next/navigation";
import { HouseholdSelect } from "@/app/components/household-select";
import { positiveId, requireGroupContext } from "@/app/components/session";
import { getMeeting, getResponse, listHouseholds } from "@/lib/db";

type ResponsePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ household?: string }>;
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
  const [hours, minutes] = value.split(":").map(Number);
  const hour = hours % 12 || 12;
  return `${hour}:${minutes.toString().padStart(2, "0")} ${hours < 12 ? "AM" : "PM"}`;
}

export default async function ResponsePage({
  params,
  searchParams,
}: ResponsePageProps) {
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

  const householdQuery = (await searchParams).household;
  const requestedHouseholdId =
    householdQuery === undefined ? null : positiveId(householdQuery);
  if (householdQuery !== undefined && requestedHouseholdId === null) {
    notFound();
  }

  const household =
    requestedHouseholdId === null
      ? null
      : (households.find((row) => row.id === requestedHouseholdId) ?? null);
  if (requestedHouseholdId !== null && household === null) {
    notFound();
  }

  const response = household
    ? await getResponse(db, groupId, meeting.id, household.id)
    : null;
  const time = meeting.end_time
    ? `${formatTime(meeting.start_time)} to ${formatTime(meeting.end_time)}`
    : formatTime(meeting.start_time);
  const hostName = households.find(
    (row) => row.id === meeting.host_household_id,
  )?.name;
  const hostAndAddress = [
    hostName && `Hosted by ${hostName}`,
    meeting.address && `at ${meeting.address}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="mx-auto max-w-2xl" aria-labelledby="response-heading">
      <p className="eyebrow">Meeting response</p>
      <h1 className="page-title" id="response-heading">
        {household === null
          ? "Add or edit response"
          : response
            ? "Edit response"
            : "Add response"}
      </h1>
      <p className="page-description">
        {formatDate(meeting.meeting_date)}, {time}
        <span className="block">
          {hostAndAddress || "Host and address are not set"}
        </span>
      </p>

      {households.length === 0 ? (
        <div className="empty-state mt-6">
          <h2 className="text-lg font-bold text-stone-900">
            Add a household first
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            A response must belong to a household in this group
          </p>
          <a className="button-primary mt-5" href="/households/new">
            Add household
          </a>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <form
            action={`/meetings/${meeting.id}/response`}
            className="rounded-2xl border border-[#531821]/10 bg-[#f6f1e8] p-5"
            method="get"
          >
            <label className="form-label" htmlFor="household">
              Household
            </label>
            <p className="mt-1 text-sm text-stone-600">
              Choose a household to add or edit its response
            </p>
            <div className="mt-3">
              <HouseholdSelect
                households={households}
                key={household?.id ?? "unselected"}
                selectedHouseholdId={household?.id ?? null}
              />
            </div>
          </form>

          {household && (
            <>
              <form action="/api/mutations" className="form-card" method="post">
                <input name="intent" type="hidden" value="upsert-response" />
                <input name="meeting_id" type="hidden" value={meeting.id} />
                <input
                  name="household_id"
                  type="hidden"
                  value={household.id}
                />

                <fieldset>
                  <legend className="form-section-title">
                    Will {household.name} attend?
                  </legend>
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      ["yes", "Yes"],
                      ["maybe", "Maybe"],
                      ["no", "No"],
                    ].map(([value, label]) => (
                      <label
                        className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-stone-300 bg-white p-3 text-center text-sm font-bold text-stone-800 has-checked:border-[#982838] has-checked:bg-[#f6f1e8] has-checked:text-[#76202c]"
                        key={value}
                      >
                        <input
                          className="mr-2 accent-[#982838]"
                          defaultChecked={response?.status === value}
                          name="status"
                          required
                          type="radio"
                          value={value}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="mt-6">
                  <label className="form-label" htmlFor="contribution">
                    What your household will bring{" "}
                    <span className="font-normal text-stone-500">
                      (optional)
                    </span>
                  </label>
                  <input
                    className="form-input"
                    defaultValue={response?.contribution}
                    id="contribution"
                    maxLength={500}
                    name="contribution"
                    placeholder="Side, dessert, drinks, or another item"
                  />
                </div>

                <div className="mt-5">
                  <label className="form-label" htmlFor="notes">
                    Notes{" "}
                    <span className="font-normal text-stone-500">
                      (optional)
                    </span>
                  </label>
                  <p className="mt-1 text-sm text-stone-600">
                    Notes are visible to everyone in the group
                  </p>
                  <textarea
                    className="form-input min-h-28 resize-y"
                    defaultValue={response?.notes}
                    id="notes"
                    maxLength={2000}
                    name="notes"
                  />
                </div>

                <div className="form-actions">
                  <a className="button-secondary" href="/">
                    Cancel
                  </a>
                  <button className="button-primary" type="submit">
                    {response ? "Update response" : "Add response"}
                  </button>
                </div>
              </form>

              {response && (
                <section
                  aria-labelledby="remove-response-heading"
                  className="danger-card"
                >
                  <h2
                    className="text-lg font-bold text-red-950"
                    id="remove-response-heading"
                  >
                    Remove response
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-red-900/80">
                    This removes {household.name}&apos;s attendance, bringing,
                    and notes
                  </p>
                  <form action="/api/mutations" className="mt-5" method="post">
                    <input
                      name="intent"
                      type="hidden"
                      value="delete-response"
                    />
                    <input
                      name="meeting_id"
                      type="hidden"
                      value={meeting.id}
                    />
                    <input
                      name="household_id"
                      type="hidden"
                      value={household.id}
                    />
                    <label className="flex items-start gap-3 text-sm font-medium text-red-950">
                      <input
                        className="mt-1 size-4 accent-red-700"
                        name="confirmation"
                        required
                        type="checkbox"
                        value="delete"
                      />
                      I understand that this response will be removed
                    </label>
                    <button className="button-danger mt-5" type="submit">
                      Remove response
                    </button>
                  </form>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
