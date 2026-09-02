import { buildLoginCookie, buildLogoutCookie, verifyGroupPassword } from "@/lib/auth";

function redirect(request: Request, path: string, cookie?: string) {
  const headers = new Headers({ Location: new URL(path, request.url).toString() });

  if (cookie) {
    headers.set("Set-Cookie", cookie);
  }

  return new Response(null, { status: 303, headers });
}

export async function POST(request: Request) {
  if (request.headers.get("Origin") !== new URL(request.url).origin) {
    return new Response("Forbidden", { status: 403 });
  }

  const form = await request.formData();
  const intent = form.get("intent");

  if (intent === "logout") {
    return redirect(request, "/login", buildLogoutCookie(request));
  }

  if (intent !== "login") {
    return new Response("Invalid intent", { status: 400 });
  }

  const group = form.get("group");
  const password = form.get("password");

  if (typeof group !== "string" || typeof password !== "string") {
    return redirect(request, "/login?error=invalid");
  }

  const groupId = await verifyGroupPassword(group, password);
  if (groupId === null) {
    return redirect(request, "/login?error=invalid");
  }

  return redirect(request, "/", await buildLoginCookie(groupId, request));
}
