import { env } from "cloudflare:workers";
import { getSessionGroupId } from "@/lib/auth";
import {
  createHousehold,
  createMeeting,
  deleteHousehold,
  deleteMeeting,
  deleteResponse,
  updateHousehold,
  updateMeeting,
  upsertResponse,
} from "@/lib/db";
import {
  parseDate,
  parseOptionalPositiveInteger,
  parseOptionalString,
  parseOptionalTime,
  parsePositiveInteger,
  parseRequiredString,
  parseStatus,
  parseTime,
} from "@/lib/forms";

const db = (env as unknown as { DB: D1Database }).DB;

function redirect(request: Request, path: string) {
  return new Response(null, {
    status: 303,
    headers: { Location: new URL(path, request.url).toString() },
  });
}

function notFound() {
  return new Response("Not found", { status: 404 });
}

function meetingInput(form: FormData) {
  const startTime = parseTime(form, "start_time");
  const endTime = parseOptionalTime(form, "end_time");
  if (endTime && endTime <= startTime) {
    throw new Error("end_time must be later than start_time");
  }

  return {
    meeting_date: parseDate(form, "meeting_date"),
    start_time: startTime,
    end_time: endTime,
    host_household_id: parseOptionalPositiveInteger(form, "host_household_id"),
    address: parseOptionalString(form, "address", 500),
    main_dish: parseOptionalString(form, "main_dish", 500),
    notes: parseOptionalString(form, "notes", 2000),
  };
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin === null || origin !== new URL(request.url).origin) {
    return new Response("Cross-origin POST forbidden", { status: 403 });
  }

  const groupId = await getSessionGroupId(request);
  if (groupId === null) {
    return redirect(request, "/login");
  }

  const form = await request.formData();
  const intent = parseRequiredString(form, "intent", 40);

  if (intent === "create-household") {
    await createHousehold(db, groupId, {
      name: parseRequiredString(form, "name", 200),
      notes: parseOptionalString(form, "notes", 2000),
    });
    return redirect(request, "/households");
  }

  if (intent === "update-household") {
    const householdId = parsePositiveInteger(form, "household_id");
    const household = await updateHousehold(db, groupId, householdId, {
      name: parseRequiredString(form, "name", 200),
      notes: parseOptionalString(form, "notes", 2000),
    });
    return household ? redirect(request, "/households") : notFound();
  }

  if (intent === "delete-household") {
    const householdId = parsePositiveInteger(form, "household_id");
    if (parseRequiredString(form, "confirmation", 20) !== "delete") {
      throw new Error("Deletion confirmation is required");
    }
    return (await deleteHousehold(db, groupId, householdId))
      ? redirect(request, "/households")
      : notFound();
  }

  if (intent === "create-meeting") {
    const meeting = await createMeeting(db, groupId, meetingInput(form));
    return meeting ? redirect(request, "/") : notFound();
  }

  if (intent === "update-meeting") {
    const meetingId = parsePositiveInteger(form, "meeting_id");
    const meeting = await updateMeeting(
      db,
      groupId,
      meetingId,
      meetingInput(form),
    );
    return meeting ? redirect(request, "/") : notFound();
  }

  if (intent === "delete-meeting") {
    const meetingId = parsePositiveInteger(form, "meeting_id");
    if (parseRequiredString(form, "confirmation", 20) !== "delete") {
      throw new Error("Deletion confirmation is required");
    }
    return (await deleteMeeting(db, groupId, meetingId))
      ? redirect(request, "/")
      : notFound();
  }

  if (intent === "upsert-response") {
    const meetingId = parsePositiveInteger(form, "meeting_id");
    const householdId = parsePositiveInteger(form, "household_id");
    const response = await upsertResponse(db, groupId, meetingId, householdId, {
      status: parseStatus(form),
      contribution: parseOptionalString(form, "contribution", 500),
      notes: parseOptionalString(form, "notes", 2000),
    });
    return response ? redirect(request, "/") : notFound();
  }

  if (intent === "delete-response") {
    const meetingId = parsePositiveInteger(form, "meeting_id");
    const householdId = parsePositiveInteger(form, "household_id");
    if (parseRequiredString(form, "confirmation", 20) !== "delete") {
      throw new Error("Deletion confirmation is required");
    }
    return (await deleteResponse(db, groupId, meetingId, householdId))
      ? redirect(request, "/")
      : notFound();
  }

  throw new Error("Invalid mutation intent");
}
