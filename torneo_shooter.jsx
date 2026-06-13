import { useState, useEffect } from "react";

const TEAMS_DEFAULT = ["Alpha Squad", "Ghost Unit", "Iron Wolves", "Neon Strike", "Shadow Corps"];

function generateRoundRobin(teams) {
  const rounds = [];
  const n = teams.length;
  const t = [...teams];
  if (n % 2 !== 0) t.push("BYE");
  const total = t.length;
  const numRounds = total - 1;
  const half = total / 2;

  for (let r = 0; r < numRounds; r++) {
    const round = [];
    for (let i = 0; i < half; i++) {
      const a = t[i];
      const b = t[total - 1 - i];
      if (a !== "BYE" && b !== "BYE") round.push({ home: a, away: b, id: `${r}-${i}` });
    }
    rounds.push(round);
    // rotate all except first
    t.splice(1, 0, t.pop());
  }
  return rounds;
}

const COLORS = {
  bg: "#0a0c14",
  surface: "#12151f",
  card: "#1a1e2e",
  border: "#252a3d",
  accent: "#ff3e5e",
  accentSoft: "#ff3e5e22",
  gold: "#ffd700",
  green: "#00e676",
  text: "#e8eaf0",
  muted: "#6b7280",
  blue: "#4fc3f7",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${COLORS.bg}; color: ${COLORS.text}; font-family: 'Inter', sans-serif; }
  .app { min-height: 100vh; max-width: 960px; margin: 0 auto; padding: 24px 16px 60px; }
  h1 { font-family: 'Rajdhani', sans-serif; font-size: 2.4rem; font-weight: 700; letter-spacing: 2px; color: #fff; }
  h2 { font-family: 'Rajdhani', sans-serif; font-size: 1.4rem; font-weight: 700; letter-spacing: 1px; color: ${COLORS.accent}; text-transform: uppercase; }
  h3 { font-family: 'Rajdhani', sans-serif; font-size: 1.1rem; font-weight: 600; letter-spacing: 1px; color: ${COLORS.blue}; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 0.72rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .badge-red { background: ${COLORS.accentSoft}; color: ${COLORS.accent}; border: 1px solid ${COLORS.accent}44; }
  .badge-gold { background: #ffd70022; color: ${COLORS.gold}; border: 1px solid ${COLORS.gold}44; }
  .badge-green { background: #00e67622; color: ${COLORS.green}; border: 1px solid ${COLORS.green}44; }
  .badge-blue { background: #4fc3f722; color: ${COLORS.blue}; border: 1px solid ${COLORS.blue}44; }
  input[type=text] {
    background: ${COLORS.surface}; border: 1px solid ${COLORS.border}; color: ${COLORS.text};
    padding: 8px 12px; border-radius: 6px; font-size: 0.9rem; width: 100%;
    outline: none; transition: border 0.2s;
  }
  input[type=text]:focus { border-color: ${COLORS.accent}; }
  button { cursor: pointer; border: none; border-radius: 6px; font-weight: 600; transition: all 0.15s; }
  .btn-primary { background: ${COLORS.accent}; color: #fff; padding: 10px 20px; font-size: 0.9rem; letter-spacing: 0.5px; }
  .btn-primary:hover { background: #ff6080; }
  .btn-primary:disabled { background: #444; color: #888; cursor: not-allowed; }
  .btn-ghost { background: transparent; color: ${COLORS.muted}; padding: 6px 14px; font-size: 0.82rem; border: 1px solid ${COLORS.border}; }
  .btn-ghost:hover { border-color: ${COLORS.accent}; color: ${COLORS.accent}; }
  .btn-win { background: transparent; border: 1px solid ${COLORS.border}; color: ${COLORS.muted}; padding: 4px 12px; font-size: 0.8rem; border-radius: 4px; }
  .btn-win.selected { background: ${COLORS.green}22; border-color: ${COLORS.green}; color: ${COLORS.green}; font-weight: 700; }
  .btn-win:hover:not(.selected) { border-color: #ffffff44; color: #fff; }
  .divider { border: none; border-top: 1px solid ${COLORS.border}; margin: 24px 0; }
  .tab { padding: 8px 20px; border-radius: 6px 6px 0 0; font-size: 0.88rem; font-weight: 600; letter-spacing: 0.5px; border: 1px solid transparent; border-bottom: none; cursor: pointer; background: transparent; color: ${COLORS.muted}; }
  .tab.active { background: ${COLORS.card}; color: #fff; border-color: ${COLORS.border}; }
  .tab-panel { background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 0 8px 8px 8px; padding: 20px; }
`;

export default function App() {
  const [teams, setTeams] = useState(TEAMS_DEFAULT);
  const [editTeams, setEditTeams] = useState([...TEAMS_DEFAULT]);
  const [phase, setPhase] = useState("setup"); // setup | group | playoffs | done
  const [tab, setTab] = useState("matches");
  const [rounds, setRounds] = useState([]);
  const [results, setResults] = useState({});
  const [standings, setStandings] = useState([]);
  const [playoffs, setPlayoffs] = useState(null);
  const [playoffResults, setPlayoffResults] = useState({});
  const [champion, setChampion] = useState(null);

  useEffect(() => { if (rounds.length > 0) recalcStandings(); }, [results]);

  function startTournament() {
    const valid = editTeams.map(t => t.trim()).filter(Boolean);
    if (valid.length < 2) return;
    const t = valid.slice(0, 5);
    setTeams(t);
    const r = generateRoundRobin(t);
    setRounds(r);
    setResults({});
    setStandings(t.map(name => ({ name, w: 0, l: 0, pts: 0, roundsW: 0, roundsL: 0 })));
    setPhase("group");
    setTab("matches");
    setPlayoffs(null);
    setPlayoffResults({});
    setChampion(null);
  }

  function setWinner(matchId, winner, loser) {
    setResults(prev => ({ ...prev, [matchId]: { winner, loser } }));
  }

  function recalcStandings() {
    const stats = {};
    teams.forEach(t => { stats[t] = { name: t, w: 0, l: 0, pts: 0, roundsW: 0, roundsL: 0 }; });
    Object.values(results).forEach(({ winner, loser }) => {
      if (!stats[winner] || !stats[loser]) return;
      stats[winner].w++;
      stats[winner].pts += 3;
      stats[loser].l++;
    });
    const sorted = Object.values(stats).sort((a, b) => b.pts - a.pts || b.w - a.w);
    setStandings(sorted);
  }

  function allGroupDone() {
    const total = rounds.reduce((s, r) => s + r.length, 0);
    return Object.keys(results).length >= total;
  }

  function buildPlayoffs() {
    recalcStandings();
    // Top 4 go to playoffs: SF1: 1vs4, SF2: 2vs3
    const sorted = [...standings].sort((a, b) => b.pts - a.pts || b.w - a.w);
    const sf1 = { id: "sf1", home: sorted[0].name, away: sorted[3]?.name || sorted[0].name, label: "Semifinal 1" };
    const sf2 = { id: "sf2", home: sorted[1].name, away: sorted[2]?.name || sorted[1].name, label: "Semifinal 2" };
    setPlayoffs({ sf1, sf2, final: null });
    setPhase("playoffs");
    setTab("bracket");
  }

  function setPlayoffWinner(matchId, winner, loser) {
    setPlayoffResults(prev => {
      const next = { ...prev, [matchId]: { winner, loser } };
      if (matchId === "sf1" || matchId === "sf2") {
        const sf1w = next.sf1?.winner;
        const sf2w = next.sf2?.winner;
        if (sf1w && sf2w) {
          setPlayoffs(p => ({ ...p, final: { id: "final", home: sf1w, away: sf2w, label: "🏆 Gran Final" } }));
        }
      }
      if (matchId === "final") {
        setChampion(winner);
        setPhase("done");
      }
      return next;
    });
  }

  function allMatchesDone() {
    return rounds.every(round => round.every(m => results[m.id]));
  }

  // -------- RENDERS --------

  if (phase === "setup") return (
    <div className="app">
      <style>{css}</style>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: "2.2rem" }}>🎯</span>
          <h1>TOURNAMENT<br /><span style={{ color: COLORS.accent }}>ORGANIZER</span></h1>
        </div>
        <p style={{ color: COLORS.muted, fontSize: "0.9rem", marginTop: 4 }}>Formato Round Robin + Playoffs · Bo3 · 5 Equipos</p>
      </div>

      <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 24 }}>
        <h2 style={{ marginBottom: 16 }}>Equipos</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {editTeams.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: COLORS.accent, fontFamily: "Rajdhani", fontWeight: 700, fontSize: "1.1rem", width: 24 }}>{i + 1}</span>
              <input type="text" value={t} placeholder={`Equipo ${i + 1}`}
                onChange={e => { const n = [...editTeams]; n[i] = e.target.value; setEditTeams(n); }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, padding: "12px 16px", background: COLORS.surface, borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: "0.82rem", color: COLORS.muted, lineHeight: 1.7 }}>
          <strong style={{ color: COLORS.blue }}>Estructura del torneo</strong><br />
          ① Round Robin — todos contra todos (10 partidas Bo3)<br />
          ② Semifinales — Top 4: #1 vs #4 · #2 vs #3<br />
          ③ Gran Final — ganadores de cada semifinal
        </div>
        <button className="btn-primary" style={{ marginTop: 20, width: "100%" }} onClick={startTournament}>
          INICIAR TORNEO →
        </button>
      </div>
    </div>
  );

  const totalMatches = rounds.reduce((s, r) => s + r.length, 0);
  const completedMatches = Object.keys(results).length;

  return (
    <div className="app">
      <style>{css}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.8rem" }}>🎯 TORNEO <span style={{ color: COLORS.accent }}>SHOOTER</span></h1>
          <p style={{ color: COLORS.muted, fontSize: "0.8rem", marginTop: 2 }}>
            {phase === "group" && `Fase Grupal · ${completedMatches}/${totalMatches} partidas`}
            {phase === "playoffs" && "⚡ Fase de Playoffs"}
            {phase === "done" && `🏆 Campeón: ${champion}`}
          </p>
        </div>
        <button className="btn-ghost" onClick={() => { setPhase("setup"); }}>Reiniciar</button>
      </div>

      {/* Champion banner */}
      {phase === "done" && (
        <div style={{ background: "#ffd70015", border: `2px solid ${COLORS.gold}`, borderRadius: 10, padding: 20, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🏆</div>
          <div style={{ fontFamily: "Rajdhani", fontSize: "2rem", fontWeight: 700, color: COLORS.gold }}>{champion}</div>
          <div style={{ color: COLORS.muted, fontSize: "0.85rem", marginTop: 4 }}>CAMPEÓN DEL TORNEO</div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: -1, position: "relative", zIndex: 1 }}>
        {phase === "group" && (
          <>
            <button className={`tab ${tab === "matches" ? "active" : ""}`} onClick={() => setTab("matches")}>Partidas</button>
            <button className={`tab ${tab === "standings" ? "active" : ""}`} onClick={() => setTab("standings")}>Tabla</button>
          </>
        )}
        {(phase === "playoffs" || phase === "done") && (
          <>
            <button className={`tab ${tab === "bracket" ? "active" : ""}`} onClick={() => setTab("bracket")}>Bracket</button>
            <button className={`tab ${tab === "standings" ? "active" : ""}`} onClick={() => setTab("standings")}>Tabla Final</button>
          </>
        )}
      </div>

      <div className="tab-panel">

        {/* GROUP MATCHES */}
        {tab === "matches" && phase === "group" && (
          <div>
            {rounds.map((round, ri) => (
              <div key={ri} style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 12 }}>Jornada {ri + 1}</h3>
                <div style={{ display: "grid", gap: 8 }}>
                  {round.map(match => {
                    const res = results[match.id];
                    return (
                      <div key={match.id} style={{
                        background: COLORS.surface, border: `1px solid ${res ? COLORS.green + "44" : COLORS.border}`,
                        borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
                      }}>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                              fontFamily: "Rajdhani", fontWeight: 700,
                              color: res?.winner === match.home ? COLORS.green : res ? COLORS.muted : COLORS.text
                            }}>{match.home}</span>
                            <span style={{ color: COLORS.muted, fontSize: "0.8rem" }}>vs</span>
                            <span style={{
                              fontFamily: "Rajdhani", fontWeight: 700,
                              color: res?.winner === match.away ? COLORS.green : res ? COLORS.muted : COLORS.text
                            }}>{match.away}</span>
                          </div>
                          <span className="badge badge-blue" style={{ marginTop: 4 }}>Bo3</span>
                        </div>
                        {!res ? (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn-win" onClick={() => setWinner(match.id, match.home, match.away)}>
                              {match.home.split(" ")[0]} Gana
                            </button>
                            <button className="btn-win" onClick={() => setWinner(match.id, match.away, match.home)}>
                              {match.away.split(" ")[0]} Gana
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span className="badge badge-green">✓ {res.winner}</span>
                            <button className="btn-ghost" style={{ fontSize: "0.75rem", padding: "3px 8px" }}
                              onClick={() => setResults(p => { const n = { ...p }; delete n[match.id]; return n; })}>
                              Editar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {allMatchesDone() && (
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <button className="btn-primary" onClick={buildPlayoffs}>
                  VER TABLA Y AVANZAR A PLAYOFFS →
                </button>
              </div>
            )}
          </div>
        )}

        {/* STANDINGS */}
        {tab === "standings" && (
          <div>
            <h2 style={{ marginBottom: 16 }}>Tabla de Posiciones</h2>
            <div style={{ display: "grid", gap: 6 }}>
              {standings.map((s, i) => (
                <div key={s.name} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: COLORS.surface, border: `1px solid ${i < 4 ? COLORS.accent + "33" : COLORS.border}`,
                  borderRadius: 8, padding: "10px 16px"
                }}>
                  <span style={{
                    fontFamily: "Rajdhani", fontWeight: 700, fontSize: "1.3rem", width: 28, textAlign: "center",
                    color: i === 0 ? COLORS.gold : i < 4 ? COLORS.accent : COLORS.muted
                  }}>{i + 1}</span>
                  <span style={{ flex: 1, fontFamily: "Rajdhani", fontWeight: 600, fontSize: "1.05rem" }}>{s.name}</span>
                  <div style={{ display: "flex", gap: 16, fontSize: "0.82rem", color: COLORS.muted }}>
                    <span><span style={{ color: COLORS.green }}>{s.w}V</span> / <span style={{ color: COLORS.accent }}>{s.l}D</span></span>
                    <span style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: "1.1rem", color: COLORS.text }}>{s.pts} <span style={{ fontSize: "0.75rem", color: COLORS.muted }}>pts</span></span>
                  </div>
                  {i < 4 && <span className="badge badge-red">Playoffs</span>}
                  {i === 4 && <span className="badge" style={{ background: "#ffffff10", color: COLORS.muted, border: `1px solid ${COLORS.border}` }}>Eliminado</span>}
                </div>
              ))}
            </div>
            {phase === "group" && allMatchesDone() && (
              <button className="btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={buildPlayoffs}>
                AVANZAR A PLAYOFFS →
              </button>
            )}
          </div>
        )}

        {/* PLAYOFFS BRACKET */}
        {tab === "bracket" && (phase === "playoffs" || phase === "done") && playoffs && (
          <div>
            <h2 style={{ marginBottom: 16 }}>Bracket de Playoffs</h2>
            {/* Semis */}
            <h3 style={{ marginBottom: 10, color: COLORS.muted }}>Semifinales</h3>
            <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
              {[playoffs.sf1, playoffs.sf2].map(match => {
                const res = playoffResults[match.id];
                return (
                  <div key={match.id} style={{
                    background: COLORS.surface, border: `1px solid ${res ? COLORS.accent + "55" : COLORS.border}`,
                    borderRadius: 8, padding: "14px 16px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <span className="badge badge-red" style={{ marginBottom: 6 }}>{match.label}</span>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
                          <span style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: "1.1rem", color: res?.winner === match.home ? COLORS.green : res ? COLORS.muted : COLORS.text }}>{match.home}</span>
                          <span style={{ color: COLORS.muted }}>vs</span>
                          <span style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: "1.1rem", color: res?.winner === match.away ? COLORS.green : res ? COLORS.muted : COLORS.text }}>{match.away}</span>
                          <span className="badge badge-blue">Bo3</span>
                        </div>
                      </div>
                      {!res ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn-win" onClick={() => setPlayoffWinner(match.id, match.home, match.away)}>
                            {match.home.split(" ")[0]} Gana
                          </button>
                          <button className="btn-win" onClick={() => setPlayoffWinner(match.id, match.away, match.home)}>
                            {match.away.split(" ")[0]} Gana
                          </button>
                        </div>
                      ) : (
                        <span className="badge badge-green">🏅 {res.winner} avanza</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Final */}
            {playoffs.final && (
              <>
                <h3 style={{ marginBottom: 10, color: COLORS.gold }}>Gran Final</h3>
                <div style={{
                  background: "#ffd70010", border: `1px solid ${COLORS.gold}55`,
                  borderRadius: 8, padding: "16px", marginBottom: 16
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: "1.2rem", color: playoffResults.final?.winner === playoffs.final.home ? COLORS.gold : COLORS.text }}>{playoffs.final.home}</span>
                        <span style={{ color: COLORS.muted }}>vs</span>
                        <span style={{ fontFamily: "Rajdhani", fontWeight: 700, fontSize: "1.2rem", color: playoffResults.final?.winner === playoffs.final.away ? COLORS.gold : COLORS.text }}>{playoffs.final.away}</span>
                        <span className="badge badge-gold">Bo3</span>
                      </div>
                    </div>
                    {!playoffResults.final ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-win" onClick={() => setPlayoffWinner("final", playoffs.final.home, playoffs.final.away)}>
                          {playoffs.final.home.split(" ")[0]} Gana
                        </button>
                        <button className="btn-win" onClick={() => setPlayoffWinner("final", playoffs.final.away, playoffs.final.home)}>
                          {playoffs.final.away.split(" ")[0]} Gana
                        </button>
                      </div>
                    ) : (
                      <span className="badge badge-gold">🏆 {playoffResults.final.winner}</span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Visual bracket */}
            <div style={{ background: COLORS.surface, borderRadius: 8, padding: 16, fontSize: "0.82rem", color: COLORS.muted, fontFamily: "monospace", lineHeight: 2 }}>
              <div style={{ color: COLORS.blue }}>BRACKET</div>
              <div>{playoffs.sf1.home} ─┐</div>
              <div style={{ paddingLeft: 16 }}>├─ SF1 → {playoffResults.sf1?.winner || "?"} ─┐</div>
              <div>{playoffs.sf1.away} ─┘</div>
              <div style={{ paddingLeft: 136 }}>├─ FINAL → {playoffResults.final?.winner || "?"}</div>
              <div>{playoffs.sf2.home} ─┐</div>
              <div style={{ paddingLeft: 16 }}>├─ SF2 → {playoffResults.sf2?.winner || "?"} ─┘</div>
              <div>{playoffs.sf2.away} ─┘</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
