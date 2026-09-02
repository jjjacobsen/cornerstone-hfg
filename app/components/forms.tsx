import type { HouseholdRow, MeetingRow } from "@/lib/db";

export function HouseholdFields({ household }: { household?: HouseholdRow }) {
  return (
    <div className="space-y-5">
      <div>
        <label className="form-label" htmlFor="name">
          Household name
        </label>
        <input
          autoFocus
          className="form-input"
          defaultValue={household?.name}
          id="name"
          maxLength={200}
          name="name"
          required
        />
      </div>
      <div>
        <label className="form-label" htmlFor="notes">
          Household notes{" "}
          <span className="font-normal text-stone-500">(optional)</span>
        </label>
        <textarea
          className="form-input min-h-28 resize-y"
          defaultValue={household?.notes}
          id="notes"
          maxLength={2000}
          name="notes"
        />
      </div>
    </div>
  );
}

export function MeetingFields({
  households,
  meeting,
}: {
  households: HouseholdRow[];
  meeting?: MeetingRow;
}) {
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="form-section-title">Schedule</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="form-label" htmlFor="meeting_date">
              Date
            </label>
            <input
              autoFocus
              className="form-input"
              defaultValue={meeting?.meeting_date}
              id="meeting_date"
              name="meeting_date"
              required
              type="date"
            />
          </div>
          <div>
            <label className="form-label" htmlFor="start_time">
              Start time
            </label>
            <input
              className="form-input"
              defaultValue={meeting?.start_time}
              id="start_time"
              name="start_time"
              required
              type="time"
            />
          </div>
          <div>
            <label className="form-label" htmlFor="end_time">
              End time{" "}
              <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <input
              className="form-input"
              defaultValue={meeting?.end_time}
              id="end_time"
              name="end_time"
              type="time"
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="form-section-title">Hosting</legend>
        <div className="mt-4 space-y-4">
          <div>
            <label className="form-label" htmlFor="host_household_id">
              Host household{" "}
              <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <select
              className="form-input"
              defaultValue={meeting?.host_household_id ?? ""}
              id="host_household_id"
              name="host_household_id"
            >
              <option value="">No host selected</option>
              {households.map((household) => (
                <option key={household.id} value={household.id}>
                  {household.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="location_name">
                Location name{" "}
                <span className="font-normal text-stone-500">(optional)</span>
              </label>
              <input
                className="form-input"
                defaultValue={meeting?.location_name}
                id="location_name"
                maxLength={200}
                name="location_name"
                placeholder="The Smith home"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="address">
                Address{" "}
                <span className="font-normal text-stone-500">(optional)</span>
              </label>
              <input
                autoComplete="street-address"
                className="form-input"
                defaultValue={meeting?.address}
                id="address"
                maxLength={500}
                name="address"
              />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="form-section-title">Meal and notes</legend>
        <div className="mt-4 space-y-4">
          <div>
            <label className="form-label" htmlFor="main_dish">
              Main dish{" "}
              <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <input
              className="form-input"
              defaultValue={meeting?.main_dish}
              id="main_dish"
              maxLength={500}
              name="main_dish"
            />
          </div>
          <div>
            <label className="form-label" htmlFor="notes">
              Meeting notes{" "}
              <span className="font-normal text-stone-500">(optional)</span>
            </label>
            <textarea
              className="form-input min-h-32 resize-y"
              defaultValue={meeting?.notes}
              id="notes"
              maxLength={2000}
              name="notes"
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
}
