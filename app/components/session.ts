import { env } from "cloudflare:workers";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionGroupId } from "@/lib/auth";
import { getGroup } from "@/lib/db";

const db = (env as unknown as { DB: D1Database }).DB;

export const requireGroupContext = cache(async () => {
  const session = (await cookies()).get("hfg_session");
  const groupId = await getSessionGroupId(
    session ? `hfg_session=${session.value}` : "",
  );

  if (groupId === null) {
    redirect("/login");
  }

  const group = await getGroup(db, groupId);

  if (group === null) {
    redirect("/login");
  }

  return { db, group, groupId };
});

export function positiveId(value: string) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}
