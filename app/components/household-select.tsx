"use client";

type Household = {
  id: number;
  name: string;
};

type HouseholdSelectProps = {
  households: Household[];
  selectedHouseholdId: number | null;
};

export function HouseholdSelect({
  households,
  selectedHouseholdId,
}: HouseholdSelectProps) {
  return (
    <select
      className="form-input mt-0"
      defaultValue={selectedHouseholdId ?? ""}
      id="household"
      name="household"
      onChange={(event) => event.currentTarget.form!.requestSubmit()}
      required
    >
      <option disabled value="">
        Select a household
      </option>
      {households.map((household) => (
        <option key={household.id} value={household.id}>
          {household.name}
        </option>
      ))}
    </select>
  );
}
