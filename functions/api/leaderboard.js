import { json } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const difficulty = url.searchParams.get("difficulty") || "medium";
  if (!["easy", "medium", "hard"].includes(difficulty)) return json({ error: "Dificuldade inválida." }, 400);
  const result = await env.DB.prepare(`
    WITH best AS (
      SELECT user_id, moves, seconds,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY moves ASC, seconds ASC) AS position
      FROM scores WHERE difficulty = ?
    )
    SELECT users.username, best.moves AS best_moves, best.seconds AS best_seconds,
      (SELECT COUNT(*) FROM scores s WHERE s.user_id = users.id AND s.difficulty = ?) AS games_played
    FROM best JOIN users ON users.id = best.user_id
    WHERE best.position = 1
    ORDER BY best.moves ASC, best.seconds ASC, users.username COLLATE NOCASE ASC
    LIMIT 100
  `).bind(difficulty, difficulty).all();
  return json({ difficulty, leaderboard: result.results });
}
