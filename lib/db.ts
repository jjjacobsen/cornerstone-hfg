export type ResponseStatus = "yes" | "no" | "maybe";

export interface GroupRow {
  id: number;
  slug: string;
  name: string;
  description: string;
  password_salt: string;
  password_hash: string;
  password_iterations: number;
  timezone: string;
}

export interface HouseholdRow {
  id: number;
  group_id: number;
  name: string;
  notes: string;
}

export interface MeetingRow {
  id: number;
  group_id: number;
  meeting_date: string;
  start_time: string;
  end_time: string;
  host_household_id: number | null;
  address: string;
  main_dish: string;
  notes: string;
}

export interface ResponseRow {
  meeting_id: number;
  household_id: number;
  status: ResponseStatus;
  contribution: string;
  notes: string;
  updated_at: string;
}

export interface HouseholdInput {
  name: string;
  notes: string;
}

export interface MeetingInput {
  meeting_date: string;
  start_time: string;
  end_time: string;
  host_household_id: number | null;
  address: string;
  main_dish: string;
  notes: string;
}

export interface ResponseInput {
  status: ResponseStatus;
  contribution: string;
  notes: string;
}

export interface MeetingSummary extends MeetingRow {
  host_household_name: string | null;
  responses: MeetingSummaryResponse[];
}

export interface MeetingSummaryResponse extends ResponseRow {
  household_name: string;
}

interface MeetingSummaryQueryRow extends MeetingRow {
  host_household_name: string | null;
  response_meeting_id: number | null;
  response_household_id: number | null;
  response_status: ResponseStatus | null;
  response_contribution: string | null;
  response_notes: string | null;
  response_updated_at: string | null;
  response_household_name: string | null;
}

export function getGroup(db: D1Database, groupId: number) {
  return db.prepare("SELECT * FROM groups WHERE id = ?").bind(groupId).first<GroupRow>();
}

export async function listHouseholds(db: D1Database, groupId: number) {
  const result = await db
    .prepare("SELECT * FROM households WHERE group_id = ? ORDER BY name COLLATE NOCASE, id")
    .bind(groupId)
    .all<HouseholdRow>();

  return result.results;
}

export function createHousehold(db: D1Database, groupId: number, input: HouseholdInput) {
  return db
    .prepare(
      `INSERT INTO households (group_id, name, notes)
       VALUES (?, ?, ?)
       RETURNING *`,
    )
    .bind(groupId, input.name, input.notes)
    .first<HouseholdRow>();
}

export function updateHousehold(
  db: D1Database,
  groupId: number,
  householdId: number,
  input: HouseholdInput,
) {
  return db
    .prepare(
      `UPDATE households
       SET name = ?, notes = ?
       WHERE id = ? AND group_id = ?
       RETURNING *`,
    )
    .bind(input.name, input.notes, householdId, groupId)
    .first<HouseholdRow>();
}

export async function deleteHousehold(db: D1Database, groupId: number, householdId: number) {
  const row = await db
    .prepare("DELETE FROM households WHERE id = ? AND group_id = ? RETURNING id")
    .bind(householdId, groupId)
    .first<{ id: number }>();

  return row !== null;
}

export async function listMeetings(db: D1Database, groupId: number) {
  const result = await db
    .prepare(
      `SELECT * FROM meetings
       WHERE group_id = ?
       ORDER BY meeting_date, start_time, id`,
    )
    .bind(groupId)
    .all<MeetingRow>();

  return result.results;
}

export function getMeeting(db: D1Database, groupId: number, meetingId: number) {
  return db
    .prepare("SELECT * FROM meetings WHERE id = ? AND group_id = ?")
    .bind(meetingId, groupId)
    .first<MeetingRow>();
}

export function createMeeting(db: D1Database, groupId: number, input: MeetingInput) {
  return db
    .prepare(
      `INSERT INTO meetings (
         group_id,
         meeting_date,
         start_time,
         end_time,
         host_household_id,
         address,
         main_dish,
         notes
       )
       SELECT ?, ?, ?, ?, host.id, ?, ?, ?
       FROM (SELECT ? AS id) AS requested_host
       LEFT JOIN households AS host
         ON host.id = requested_host.id AND host.group_id = ?
       WHERE requested_host.id IS NULL OR host.id IS NOT NULL
       RETURNING *`,
    )
    .bind(
      groupId,
      input.meeting_date,
      input.start_time,
      input.end_time,
      input.address,
      input.main_dish,
      input.notes,
      input.host_household_id,
      groupId,
    )
    .first<MeetingRow>();
}

export function updateMeeting(
  db: D1Database,
  groupId: number,
  meetingId: number,
  input: MeetingInput,
) {
  return db
    .prepare(
      `UPDATE meetings
       SET meeting_date = ?,
           start_time = ?,
           end_time = ?,
           host_household_id = ?,
           address = ?,
           main_dish = ?,
           notes = ?
       WHERE id = ?
         AND group_id = ?
         AND (
           ? IS NULL OR EXISTS (
             SELECT 1 FROM households WHERE id = ? AND group_id = ?
           )
         )
       RETURNING *`,
    )
    .bind(
      input.meeting_date,
      input.start_time,
      input.end_time,
      input.host_household_id,
      input.address,
      input.main_dish,
      input.notes,
      meetingId,
      groupId,
      input.host_household_id,
      input.host_household_id,
      groupId,
    )
    .first<MeetingRow>();
}

export async function deleteMeeting(db: D1Database, groupId: number, meetingId: number) {
  const row = await db
    .prepare("DELETE FROM meetings WHERE id = ? AND group_id = ? RETURNING id")
    .bind(meetingId, groupId)
    .first<{ id: number }>();

  return row !== null;
}

export async function listMeetingSummaries(
  db: D1Database,
  groupId: number,
): Promise<MeetingSummary[]> {
  const result = await db
    .prepare(
      `SELECT
         m.*,
         host.name AS host_household_name,
         response.meeting_id AS response_meeting_id,
         response.household_id AS response_household_id,
         response.status AS response_status,
         response.contribution AS response_contribution,
         response.notes AS response_notes,
         response.updated_at AS response_updated_at,
         response_household.name AS response_household_name
       FROM meetings AS m
       LEFT JOIN households AS host
         ON host.id = m.host_household_id AND host.group_id = m.group_id
       LEFT JOIN responses AS response
         ON response.meeting_id = m.id
         AND EXISTS (
           SELECT 1
           FROM households AS scoped_response_household
           WHERE scoped_response_household.id = response.household_id
             AND scoped_response_household.group_id = m.group_id
         )
       LEFT JOIN households AS response_household
         ON response_household.id = response.household_id
         AND response_household.group_id = m.group_id
       WHERE m.group_id = ?
       ORDER BY m.meeting_date, m.start_time, m.id, response_household.name COLLATE NOCASE`,
    )
    .bind(groupId)
    .all<MeetingSummaryQueryRow>();

  const summaries = new Map<number, MeetingSummary>();

  for (const row of result.results) {
    if (!summaries.has(row.id)) {
      summaries.set(row.id, {
        id: row.id,
        group_id: row.group_id,
        meeting_date: row.meeting_date,
        start_time: row.start_time,
        end_time: row.end_time,
        host_household_id: row.host_household_id,
        address: row.address,
        main_dish: row.main_dish,
        notes: row.notes,
        host_household_name: row.host_household_name,
        responses: [],
      });
    }

    if (row.response_household_id !== null) {
      summaries.get(row.id)!.responses.push({
        meeting_id: row.response_meeting_id!,
        household_id: row.response_household_id,
        status: row.response_status!,
        contribution: row.response_contribution!,
        notes: row.response_notes!,
        updated_at: row.response_updated_at!,
        household_name: row.response_household_name!,
      });
    }
  }

  return [...summaries.values()];
}

export function getResponse(
  db: D1Database,
  groupId: number,
  meetingId: number,
  householdId: number,
) {
  return db
    .prepare(
      `SELECT response.*
       FROM responses AS response
       JOIN meetings AS meeting ON meeting.id = response.meeting_id
       JOIN households AS household ON household.id = response.household_id
       WHERE response.meeting_id = ?
         AND response.household_id = ?
         AND meeting.group_id = ?
         AND household.group_id = ?`,
    )
    .bind(meetingId, householdId, groupId, groupId)
    .first<ResponseRow>();
}

export function upsertResponse(
  db: D1Database,
  groupId: number,
  meetingId: number,
  householdId: number,
  input: ResponseInput,
) {
  return db
    .prepare(
      `INSERT INTO responses (
         meeting_id,
         household_id,
         status,
         contribution,
         notes,
         updated_at
       )
       SELECT meeting.id, household.id, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       FROM meetings AS meeting
       JOIN households AS household
         ON household.id = ? AND household.group_id = meeting.group_id
       WHERE meeting.id = ? AND meeting.group_id = ?
       ON CONFLICT (meeting_id, household_id) DO UPDATE SET
         status = excluded.status,
         contribution = excluded.contribution,
         notes = excluded.notes,
         updated_at = excluded.updated_at
       RETURNING *`,
    )
    .bind(input.status, input.contribution, input.notes, householdId, meetingId, groupId)
    .first<ResponseRow>();
}

export async function deleteResponse(
  db: D1Database,
  groupId: number,
  meetingId: number,
  householdId: number,
) {
  const row = await db
    .prepare(
      `DELETE FROM responses
       WHERE meeting_id = ?
         AND household_id = ?
         AND EXISTS (
           SELECT 1
           FROM meetings AS meeting
           JOIN households AS household ON household.id = ?
           WHERE meeting.id = ?
             AND meeting.group_id = ?
             AND household.group_id = ?
         )
       RETURNING meeting_id`,
    )
    .bind(meetingId, householdId, householdId, meetingId, groupId, groupId)
    .first<{ meeting_id: number }>();

  return row !== null;
}
