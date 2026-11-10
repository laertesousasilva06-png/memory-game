import { json, body, currentUser, sameOrigin } from "../_lib/auth.js";

const levels = { easy: 8, medium: 10, hard: 18 };
export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ error: "Origem inválida." }, 403);
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Faça login para salvar sua pontuação." }, 401);
  const data = await body(request);
  if (!data || !Object.hasOwn(levels, data.difficulty)) return json({ error: "Partida inválida." }, 400);
  const moves = Number(data.moves);
  const seconds = Number(data.seconds);
  const pairs = Number(data.pairs);
  if (pairs !== levels[data.difficulty] || !Number.isInteger(moves) || moves < pairs || moves > 10000 ||
      !Number.isInteger(seconds) || seconds < 1 || seconds > 7200) {
    return json({ error: "Resultado inválido." }, 400);
  }
  await env.DB.prepare("INSERT INTO scores (user_id, difficulty, moves, seconds, pairs, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(user.id, data.difficulty, moves, seconds, pairs, Math.floor(Date.now() / 1000)).run();
  return json({ ok: true });
}
