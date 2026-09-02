"use client";

import { useEffect, useRef, useState } from "react";

type Household = {
  id: number;
  name: string;
};

type HouseholdSelectProps = {
  households: Household[];
  selectedHouseholdId: number | null;
  id?: string;
  name?: string;
  placeholder?: string;
  clearLabel?: string;
  submitOnChange?: boolean;
};

export function HouseholdSelect({
  households,
  selectedHouseholdId,
  id = "household",
  name = "household",
  placeholder = "Select a household",
  clearLabel,
  submitOnChange = false,
}: HouseholdSelectProps) {
  const [selectedId, setSelectedId] = useState(selectedHouseholdId);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedHousehold = households.find(
    (household) => household.id === selectedId,
  );

  useEffect(() => {
    function closePicker(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closePicker);
    return () => document.removeEventListener("mousedown", closePicker);
  }, []);

  function selectHousehold(householdId: number | null) {
    setSelectedId(householdId);
    setOpen(false);

    const input = inputRef.current!;
    input.value = householdId?.toString() ?? "";
    if (submitOnChange) {
      input.form!.requestSubmit();
    }
  }

  const options = clearLabel
    ? [{ id: null, name: clearLabel }, ...households]
    : households;

  return (
    <div
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      }}
      ref={containerRef}
    >
      <input
        defaultValue={selectedHouseholdId ?? ""}
        name={name}
        ref={inputRef}
        type="hidden"
      />
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-value`}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left text-base font-medium shadow-sm transition hover:border-[#982838]/50 focus:border-[#982838] focus:outline-none focus:ring-3 focus:ring-[#982838]/15 ${
          open ? "border-[#982838] ring-3 ring-[#982838]/15" : "border-stone-300"
        }`}
        id={id}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span
          className={selectedHousehold ? "text-stone-900" : "text-stone-500"}
          id={`${id}-value`}
        >
          {selectedHousehold?.name ?? clearLabel ?? placeholder}
        </span>
        <svg
          aria-hidden="true"
          className={`size-5 shrink-0 text-[#76202c] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="m7 9.5 5 5 5-5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>

      {open && (
        <div
          aria-label="Households"
          className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl shadow-stone-900/10"
          role="listbox"
        >
          {options.map((household) => {
            const selected = household.id === selectedId;
            return (
              <button
                aria-selected={selected}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base transition ${
                  selected
                    ? "bg-[#f6f1e8] font-bold text-[#76202c]"
                    : "text-stone-800 hover:bg-stone-100"
                }`}
                key={household.id ?? "clear"}
                onClick={() => selectHousehold(household.id)}
                role="option"
                type="button"
              >
                <span className="flex size-5 shrink-0 items-center justify-center">
                  {selected && (
                    <svg
                      aria-hidden="true"
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="m5 12 4 4L19 6"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                      />
                    </svg>
                  )}
                </span>
                {household.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
