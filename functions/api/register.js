import { json, body, normalizeEmail, normalizeUsername, validEmail, validUsername, passwordHash, randomToken, createSession, sessionCookie, sameOrigin } from "../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "Origem inválida." }, 403);
  const data = await body(request);
  if (!data) return json({ error: "Dados inválidos." }, 400);
  const username = normalizeUsername(data.username);
  const email = normalizeEmail(data.email);
  const password = String(data.password || "");
  if (!validUsername(username)) return json({ error: "O usuário deve ter de 3 a 20 caracteres: letras, números ou _." }, 400);
  if (!validEmail(email)) return json({ error: "Informe um e-mail válido." }, 400);
  if (password.length < 8 || password.length > 128) return json({ error: "A senha deve ter entre 8 e 128 caracteres." }, 400);
  const exists = await env.DB.prepare("SELECT id FROM users WHERE lower(username) = lower(?) OR email = ?").bind(username, email).first();
  if (exists) return json({ error: "Esse usuário ou e-mail já está cadastrado." }, 409);
  const id = crypto.randomUUID();
  const salt = randomToken();
  const hash = await passwordHash(password, salt);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare("INSERT INTO users (id, username, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, username, email, hash, salt, now).run();
  const token = await createSession(id, env);
  return json({ user: { id, username, email } }, 201, { "set-cookie": sessionCookie(token) });
}
