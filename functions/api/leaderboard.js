import { json } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const difficulty = url.searchParams.get("difficulty") || "medium";
  if (!["easy", "medium", "hard"].includes(difficulty)) return json({ error: "Dificuldade inválida." }, 400);
  const result = await env.DB.prepare(`
    SELECT users.username, MIN(scores.moves) AS best_moves, MIN(scores.seconds) AS best_seconds,
      COUNT(scores.id) AS games_played
    FROM scores JOIN users ON users.id = scores.user_id
    WHERE scores.difficulty = ?
    GROUP BY users.id, users.username
    ORDER BY best_moves ASC, best_seconds ASC, users.username COLLATE NOCASE ASC
    LIMIT 100
  `).bind(difficulty).all();
  return json({ difficulty, leaderboard: result.results });
}
