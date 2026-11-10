import { json, cookieValue, sha256, sameOrigin } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "Origem inválida." }, 403);
  const token = cookieValue(request);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  return json({ ok: true }, 200, { "set-cookie": "mg_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0" });
}
