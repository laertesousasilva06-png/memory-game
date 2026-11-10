import { json, currentUser } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const user = await currentUser(request, env);
  if (!user) return json({ user: null });
  const scores = await env.DB.prepare(
    "SELECT difficulty, MIN(moves) AS best_moves, MIN(seconds) AS best_seconds, COUNT(*) AS games_played FROM scores WHERE user_id = ? GROUP BY difficulty"
  ).bind(user.id).all();
  const rankRows = await env.DB.prepare(`
    SELECT s.difficulty, s.user_id, MIN(s.moves) AS best_moves, MIN(s.seconds) AS best_seconds
    FROM scores s GROUP BY s.difficulty, s.user_id
  `).all();
  const ranks = {};
  for (const difficulty of ["easy", "medium", "hard"]) {
    const ordered = rankRows.results.filter(r => r.difficulty === difficulty)
      .sort((a,b) => a.best_moves - b.best_moves || a.best_seconds - b.best_seconds);
    const index = ordered.findIndex(r => r.user_id === user.id);
    ranks[difficulty] = index < 0 ? null : index + 1;
  }
  return json({ user, scores: scores.results, ranks });
}
