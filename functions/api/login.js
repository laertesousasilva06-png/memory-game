import { json, body, normalizeEmail, passwordHash, createSession, sessionCookie, sameOrigin } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "Origem inválida." }, 403);
  const data = await body(request);
  if (!data) return json({ error: "Dados inválidos." }, 400);
  const email = normalizeEmail(data.email);
  const password = String(data.password || "");
  const user = await env.DB.prepare("SELECT id, username, email, password_hash, password_salt FROM users WHERE email = ?").bind(email).first();
  if (!user || password.length > 128 || await passwordHash(password, user.password_salt) !== user.password_hash) {
    return json({ error: "E-mail ou senha incorretos." }, 401);
  }
  const token = await createSession(user.id, env);
  return json({ user: { id: user.id, username: user.username, email: user.email } }, 200, { "set-cookie": sessionCookie(token) });
}
