import { useState, useEffect } from "react";

const TEAMS_DEFAULT = ["Alpha Squad", "Ghost Unit", "Iron Wolves", "Neon Strike", "Shadow Corps"];
const MIN_TEAMS = 2;
const MAX_TEAMS = 16;

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
    t.splice(1, 0, t.pop());
  }
  return rounds;
}

// --- ICONS (SVG inline, estilo militar/shooter) ---
const Icon = ({ type, size = 20, color = "currentColor" }) => {
  const icons = {
    crosshair: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="3"/></svg>,
    skull: <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 2C7.58 2 4 5.58 4 10c0 2.76 1.34 5.2 3.4 6.72V20a1 1 0 001 1h1.1v-2h1v2h2.5v-2h1v2H15.6a1 1 0 001-1v-3.28C18.66 15.2 20 12.76 20 10c0-4.42-3.58-8-8-8zm-2.5 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/></svg>,
    trophy: <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 17.5c2.5 0 4.5-1.12 4.5-2.5h1.5c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-1.5V4a1 1 0 00-1-1h-7a1 1 0 00-1 1v1H5.5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2H7c0 1.38 2 2.5 4.5 2.5zM5.5 7H7v5H5.5V7zM17 7h1.5v5H17V7zM10 20h4v1a1 1 0 01-1 1h-2a1 1 0 01-1-1v-1z"/></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z"/></svg>,
    bolt: <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></svg>,
    target: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    knife: <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M21.71 4.29l-2-2a1 1 0 00-1.42 0L6 14.59V18h3.41L21.71 5.71a1 1 0 000-1.42zM3 20h18v2H3v-2z"/></svg>,
    dogtag: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><rect x="6" y="2" width="12" height="18" rx="4" ry="4"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="14" x2="13" y2="14"/><circle cx="12" cy="3" r="1" fill={color}/></svg>,
  };
  return icons[type] || null;
};

const C = {
  bg: "#0d0d0d",
  surface: "#1a1a1a",
  card: "#141414",
  border: "#2a2a2a",
  orange: "#ff6a00",
  orangeGlow: "#ff6a0033",
  red: "#cc0000",
  redGlow: "#cc000033",
  gold: "#ffa500",
  green: "#4caf50",
  text: "#f0f0f0",
  muted: "#777",
  dim: "#444",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Inter', sans-serif; }
  .app { min-height: 100vh; max-width: 1000px; margin: 0 auto; padding: 24px 16px 60px; }
  h1 { font-family: 'Teko', sans-serif; font-size: 2.6rem; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #fff; line-height: 1; }
  h2 { font-family: 'Teko', sans-serif; font-size: 1.5rem; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: ${C.orange}; }
  h3 { font-family: 'Teko', sans-serif; font-size: 1.15rem; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; color: ${C.muted}; }
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 3px; font-size: 0.7rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
  .badge-orange { background: ${C.orangeGlow}; color: ${C.orange}; border: 1px solid ${C.orange}55; }
  .badge-red { background: ${C.redGlow}; color: #ff4444; border: 1px solid #ff444444; }
  .badge-gold { background: #ffa50022; color: ${C.gold}; border: 1px solid ${C.gold}44; }
  .badge-green { background: #4caf5022; color: ${C.green}; border: 1px solid ${C.green}44; }
  input[type=text] {
    background: ${C.surface}; border: 1px solid ${C.border}; color: ${C.text};
    padding: 10px 14px; border-radius: 4px; font-size: 0.9rem; width: 100%;
    outline: none; transition: border 0.2s;
    font-family: 'Inter', sans-serif;
  }
  input[type=text]:focus { border-color: ${C.orange}; box-shadow: 0 0 0 2px ${C.orangeGlow}; }
  button { cursor: pointer; border: none; border-radius: 4px; font-weight: 600; transition: all 0.15s; font-family: 'Inter', sans-serif; }
  .btn-primary { background: linear-gradient(135deg, ${C.orange}, ${C.red}); color: #fff; padding: 12px 24px; font-size: 0.9rem; letter-spacing: 1px; text-transform: uppercase; }
  .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
  .btn-primary:disabled { background: #333; color: #666; cursor: not-allowed; filter: none; transform: none; }
  .btn-ghost { background: transparent; color: ${C.muted}; padding: 6px 14px; font-size: 0.82rem; border: 1px solid ${C.border}; }
  .btn-ghost:hover { border-color: ${C.orange}; color: ${C.orange}; }
  .btn-win { background: transparent; border: 1px solid ${C.border}; color: ${C.muted}; padding: 5px 14px; font-size: 0.8rem; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
  .btn-win:hover { border-color: ${C.orange}; color: ${C.orange}; background: ${C.orangeGlow}; }
  .tab { padding: 10px 22px; border-radius: 4px 4px 0 0; font-size: 0.85rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border: 1px solid transparent; border-bottom: none; cursor: pointer; background: transparent; color: ${C.muted}; }
  .tab.active { background: ${C.card}; color: ${C.orange}; border-color: ${C.border}; border-bottom-color: ${C.card}; }
  .tab-panel { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 0 6px 6px 6px; padding: 24px; }
  .bracket-connector { position: relative; }
  .bracket-connector::after { content: ''; position: absolute; right: -16px; top: 50%; width: 16px; height: 1px; background: ${C.dim}; }
  .match-card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 6px; padding: 14px 16px; transition: border-color 0.2s; }
  .match-card:hover { border-color: ${C.orange}44; }
  .match-card.done { border-color: ${C.green}33; }
  .match-card.final-card { background: linear-gradient(135deg, #1a0a00, #0d0d0d); border: 1px solid ${C.gold}44; }
`;

export default function App() {
  const [tournamentName, setTournamentName] = useState("COMBAT ZONE");
  const [logoUrl, setLogoUrl] = useState(null);
  const [teams, setTeams] = useState(TEAMS_DEFAULT);
  const [editTeams, setEditTeams] = useState([...TEAMS_DEFAULT]);
  const [phase, setPhase] = useState("setup");
  const [tab, setTab] = useState("matches");
  const [rounds, setRounds] = useState([]);
  const [results, setResults] = useState({});
  const [standings, setStandings] = useState([]);
  const [playoffs, setPlayoffs] = useState(null);
  const [playoffResults, setPlayoffResults] = useState({});
  const [champion, setChampion] = useState(null);

  useEffect(() => { if (rounds.length > 0) recalcStandings(); }, [results]);

  function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
  }

  function startTournament() {
    const valid = editTeams.map(t => t.trim()).filter(Boolean);
    if (valid.length < MIN_TEAMS) return;
    setTeams(valid);
    const r = generateRoundRobin(valid);
    setRounds(r);
    setResults({});
    setStandings(valid.map(name => ({ name, w: 0, l: 0, pts: 0 })));
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
    teams.forEach(t => { stats[t] = { name: t, w: 0, l: 0, pts: 0 }; });
    Object.values(results).forEach(({ winner, loser }) => {
      if (!stats[winner] || !stats[loser]) return;
      stats[winner].w++;
      stats[winner].pts += 3;
      stats[loser].l++;
    });
    setStandings(Object.values(stats).sort((a, b) => b.pts - a.pts || b.w - a.w));
  }

  function getPlayoffSlots() {
    const n = teams.length;
    if (n <= 2) return 2;
    if (n <= 4) return Math.min(n, 4);
    return Math.min(n, 8) >= 6 ? 8 : 4;
  }

  function buildPlayoffs() {
    recalcStandings();
    const sorted = [...standings].sort((a, b) => b.pts - a.pts || b.w - a.w);
    const slots = getPlayoffSlots();
    const qualified = sorted.slice(0, slots);
    if (qualified.length <= 2) {
      setPlayoffs({ rounds: [], final: { id: "final", home: qualified[0].name, away: qualified[1]?.name || qualified[0].name, label: "Gran Final" } });
    } else if (qualified.length <= 4) {
      const sf1 = { id: "sf1", home: qualified[0].name, away: qualified[3]?.name || qualified[qualified.length - 1].name, label: "Semi 1" };
      const sf2 = { id: "sf2", home: qualified[1].name, away: qualified[2].name, label: "Semi 2" };
      setPlayoffs({ rounds: [{ label: "Semifinales", matches: [sf1, sf2] }], final: null });
    } else {
      const qf1 = { id: "qf1", home: qualified[0].name, away: qualified[7]?.name || qualified[qualified.length - 1].name, label: "QF 1" };
      const qf2 = { id: "qf2", home: qualified[3].name, away: qualified[4].name, label: "QF 2" };
      const qf3 = { id: "qf3", home: qualified[1].name, away: qualified[6]?.name || qualified[qualified.length - 2]?.name || qualified[1].name, label: "QF 3" };
      const qf4 = { id: "qf4", home: qualified[2].name, away: qualified[5]?.name || qualified[qualified.length - 1].name, label: "QF 4" };
      setPlayoffs({ rounds: [{ label: "Cuartos de Final", matches: [qf1, qf2, qf3, qf4] }], final: null });
    }
    setPhase("playoffs");
    setTab("bracket");
  }

  function setPlayoffWinner(matchId, winner, loser) {
    setPlayoffResults(prev => {
      const next = { ...prev, [matchId]: { winner, loser } };
      setPlayoffs(p => {
        const updated = { ...p, rounds: [...p.rounds] };
        if (matchId === "final") { setChampion(winner); setPhase("done"); return updated; }
        const roundIdx = updated.rounds.findIndex(r => r.matches.some(m => m.id === matchId));
        if (roundIdx === -1) return updated;
        const currentRound = updated.rounds[roundIdx];
        const allDone = currentRound.matches.every(m => next[m.id]);
        if (allDone) {
          const winners = currentRound.matches.map(m => next[m.id].winner);
          if (winners.length === 2) {
            updated.final = { id: "final", home: winners[0], away: winners[1], label: "Gran Final" };
          } else {
            const nextMatches = [];
            for (let i = 0; i < winners.length; i += 2) {
              nextMatches.push({ id: `sf${Math.floor(i / 2) + 1}`, home: winners[i], away: winners[i + 1], label: `Semi ${Math.floor(i / 2) + 1}` });
            }
            if (roundIdx + 1 >= updated.rounds.length) {
              updated.rounds.push({ label: "Semifinales", matches: nextMatches });
            }
          }
        }
        return updated;
      });
      return next;
    });
  }

  function allMatchesDone() {
    return rounds.every(round => round.every(m => results[m.id]));
  }

  // ======== SETUP ========
  if (phase === "setup") return (
    <div className="app">
      <style>{css}</style>
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <Icon type="crosshair" size={36} color={C.orange} />
          <h1>COMBAT<br /><span style={{ color: C.orange }}>TOURNAMENT</span></h1>
        </div>
        <p style={{ color: C.muted, fontSize: "0.85rem" }}>
          <Icon type="knife" size={12} color={C.muted} /> Round Robin + Eliminación Directa · Bo3 · {MIN_TEAMS}–{MAX_TEAMS} Escuadrones
        </p>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 28 }}>
        {/* Identidad del torneo */}
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Icon type="shield" size={18} color={C.orange} />
            <h2 style={{ margin: 0 }}>Identidad del Torneo</h2>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Logo upload */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <label style={{
                width: 80, height: 80, borderRadius: 6, cursor: "pointer",
                background: C.surface, border: `2px dashed ${logoUrl ? C.orange : C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                transition: "border-color 0.2s"
              }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <span style={{ color: C.dim, fontSize: "0.65rem", textAlign: "center", lineHeight: 1.3 }}>+<br/>LOGO</span>
                )}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogo} style={{ display: "none" }} />
              </label>
              <span style={{ fontSize: "0.65rem", color: C.dim, textAlign: "center" }}>PNG sin fondo<br/>o fondo negro</span>
            </div>
            {/* Nombre del torneo */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: "0.75rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "block" }}>Nombre del Torneo</label>
              <input type="text" value={tournamentName} placeholder="Ej: WARZONE CHAMPIONSHIP"
                onChange={e => setTournamentName(e.target.value)}
                style={{ fontFamily: "Teko", fontSize: "1.2rem", fontWeight: 600, letterSpacing: 1 }} />
              {logoUrl && (
                <button className="btn-ghost" style={{ marginTop: 8, fontSize: "0.7rem", padding: "3px 10px" }}
                  onClick={() => setLogoUrl(null)}>Quitar logo</button>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon type="dogtag" size={18} color={C.orange} />
            <h2 style={{ margin: 0 }}>Escuadrones ({editTeams.length})</h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {editTeams.length > MIN_TEAMS && (
              <button className="btn-ghost" onClick={() => setEditTeams(prev => prev.slice(0, -1))}>− Quitar</button>
            )}
            {editTeams.length < MAX_TEAMS && (
              <button className="btn-ghost" onClick={() => setEditTeams(prev => [...prev, ""])}>+ Agregar</button>
            )}
          </div>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {editTeams.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: C.orange, fontFamily: "Teko", fontWeight: 600, fontSize: "1.2rem", width: 26, textAlign: "center" }}>{String(i + 1).padStart(2, "0")}</span>
              <input type="text" value={t} placeholder={`Escuadrón ${i + 1}`}
                onChange={e => { const n = [...editTeams]; n[i] = e.target.value; setEditTeams(n); }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: "14px 16px", background: C.surface, borderRadius: 4, border: `1px solid ${C.border}`, fontSize: "0.8rem", color: C.muted, lineHeight: 1.8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Icon type="shield" size={14} color={C.orange} />
            <strong style={{ color: C.orange, textTransform: "uppercase", letterSpacing: 1 }}>Briefing de Misión</strong>
          </div>
          <span style={{ color: C.orange }}>①</span> Fase Grupal — Todos contra todos, acumulan puntos<br />
          <span style={{ color: C.orange }}>②</span> Eliminación — Top clasificados en bracket directo<br />
          <span style={{ color: C.orange }}>③</span> Final — El último en pie se lleva la gloria
        </div>
        <button className="btn-primary" style={{ marginTop: 24, width: "100%", fontSize: "1rem" }} onClick={startTournament}
          disabled={editTeams.filter(t => t.trim()).length < MIN_TEAMS}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon type="crosshair" size={16} color="#fff" />
            DESPLEGAR TORNEO ({editTeams.filter(t => t.trim()).length} escuadrones)
          </span>
        </button>
      </div>
    </div>
  );

  // ======== MAIN VIEW ========
  const totalMatches = rounds.reduce((s, r) => s + r.length, 0);
  const completedMatches = Object.keys(results).length;

  return (
    <div className="app">
      <style>{css}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 4 }} />
          ) : (
            <Icon type="crosshair" size={28} color={C.orange} />
          )}
          <div>
            <h1 style={{ fontSize: "1.7rem" }}>{tournamentName || "COMBAT ZONE"}</h1>
            <p style={{ color: C.muted, fontSize: "0.78rem", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              {phase === "group" && <><Icon type="target" size={12} color={C.muted} /> Fase Grupal · {completedMatches}/{totalMatches} enfrentamientos</>}
              {phase === "playoffs" && <><Icon type="bolt" size={12} color={C.orange} /> <span style={{ color: C.orange }}>Eliminación Directa</span></>}
              {phase === "done" && <><Icon type="trophy" size={12} color={C.gold} /> <span style={{ color: C.gold }}>Victoria: {champion}</span></>}
            </p>
          </div>
        </div>
        <button className="btn-ghost" onClick={() => setPhase("setup")}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon type="knife" size={12} color="currentColor" /> Reiniciar
          </span>
        </button>
      </div>

      {/* Progress bar */}
      {phase === "group" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ background: C.surface, borderRadius: 3, height: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(completedMatches / totalMatches) * 100}%`, background: `linear-gradient(90deg, ${C.red}, ${C.orange})`, transition: "width 0.3s" }} />
          </div>
        </div>
      )}

      {/* Champion banner */}
      {phase === "done" && (
        <div style={{ background: "linear-gradient(135deg, #1a0800, #0d0d0d)", border: `2px solid ${C.gold}`, borderRadius: 6, padding: 28, textAlign: "center", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
          {logoUrl && <img src={logoUrl} alt="Logo" style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 8 }} />}
          <Icon type="trophy" size={48} color={C.gold} />
          <div style={{ fontFamily: "Teko", fontSize: "2.2rem", fontWeight: 700, color: C.gold, letterSpacing: 3, marginTop: 8 }}>{champion}</div>
          <div style={{ color: C.muted, fontSize: "0.8rem", letterSpacing: 2, textTransform: "uppercase" }}>Campeón — {tournamentName || "COMBAT ZONE"}</div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: -1, position: "relative", zIndex: 1 }}>
        {phase === "group" && (
          <>
            <button className={`tab ${tab === "matches" ? "active" : ""}`} onClick={() => setTab("matches")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon type="crosshair" size={13} color="currentColor" /> Combates</span>
            </button>
            <button className={`tab ${tab === "standings" ? "active" : ""}`} onClick={() => setTab("standings")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon type="dogtag" size={13} color="currentColor" /> Tabla</span>
            </button>
          </>
        )}
        {(phase === "playoffs" || phase === "done") && (
          <>
            <button className={`tab ${tab === "bracket" ? "active" : ""}`} onClick={() => setTab("bracket")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon type="target" size={13} color="currentColor" /> Bracket</span>
            </button>
            <button className={`tab ${tab === "standings" ? "active" : ""}`} onClick={() => setTab("standings")}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon type="dogtag" size={13} color="currentColor" /> Tabla Final</span>
            </button>
          </>
        )}
      </div>

      <div className="tab-panel">

        {/* GROUP MATCHES */}
        {tab === "matches" && phase === "group" && (
          <div>
            {rounds.map((round, ri) => (
              <div key={ri} style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Icon type="bolt" size={14} color={C.orange} />
                  <h3 style={{ color: C.orange }}>Jornada {ri + 1}</h3>
                  <span style={{ fontSize: "0.7rem", color: C.dim, marginLeft: "auto" }}>
                    {round.filter(m => results[m.id]).length}/{round.length}
                  </span>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {round.map(match => {
                    const res = results[match.id];
                    return (
                      <div key={match.id} className={`match-card${res ? " done" : ""}`}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 180 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontFamily: "Teko", fontWeight: 600, fontSize: "1.05rem", color: res?.winner === match.home ? C.green : res ? C.dim : C.text }}>{match.home}</span>
                              <span style={{ color: C.dim, fontSize: "0.75rem", fontWeight: 700 }}>VS</span>
                              <span style={{ fontFamily: "Teko", fontWeight: 600, fontSize: "1.05rem", color: res?.winner === match.away ? C.green : res ? C.dim : C.text }}>{match.away}</span>
                            </div>
                          </div>
                          {!res ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn-win" onClick={() => setWinner(match.id, match.home, match.away)}>
                                {match.home.split(" ")[0]}
                              </button>
                              <button className="btn-win" onClick={() => setWinner(match.id, match.away, match.home)}>
                                {match.away.split(" ")[0]}
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <span className="badge badge-green">
                                <Icon type="skull" size={10} color={C.green} /> {res.winner}
                              </span>
                              <button className="btn-ghost" style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                                onClick={() => setResults(p => { const n = { ...p }; delete n[match.id]; return n; })}>
                                ↺
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {allMatchesDone() && (
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button className="btn-primary" onClick={buildPlayoffs}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Icon type="bolt" size={16} color="#fff" /> AVANZAR A ELIMINACIÓN
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STANDINGS */}
        {tab === "standings" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <Icon type="dogtag" size={18} color={C.orange} />
              <h2 style={{ margin: 0 }}>Clasificación</h2>
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {standings.map((s, i) => {
                const slots = getPlayoffSlots();
                const qualified = i < slots;
                return (
                  <div key={s.name} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: C.surface,
                    borderLeft: `3px solid ${i === 0 ? C.gold : qualified ? C.orange : "transparent"}`,
                    border: `1px solid ${qualified ? C.orange + "22" : C.border}`,
                    borderRadius: 4, padding: "10px 16px"
                  }}>
                    <span style={{
                      fontFamily: "Teko", fontWeight: 700, fontSize: "1.4rem", width: 30, textAlign: "center",
                      color: i === 0 ? C.gold : qualified ? C.orange : C.dim
                    }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ flex: 1, fontFamily: "Teko", fontWeight: 500, fontSize: "1.05rem", letterSpacing: 0.5 }}>{s.name}</span>
                    <div style={{ display: "flex", gap: 14, fontSize: "0.8rem", alignItems: "center" }}>
                      <span style={{ color: C.green }}>{s.w}W</span>
                      <span style={{ color: C.red }}>{s.l}L</span>
                      <span style={{ fontFamily: "Teko", fontWeight: 700, fontSize: "1.15rem", color: C.text }}>{s.pts}</span>
                    </div>
                    {qualified && <span className="badge badge-orange"><Icon type="bolt" size={9} color={C.orange} /> CLASIF.</span>}
                    {!qualified && <span className="badge" style={{ background: "#ffffff08", color: C.dim, border: `1px solid ${C.border}` }}>KIA</span>}
                  </div>
                );
              })}
            </div>
            {phase === "group" && allMatchesDone() && (
              <button className="btn-primary" style={{ marginTop: 20, width: "100%" }} onClick={buildPlayoffs}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon type="bolt" size={16} color="#fff" /> AVANZAR A ELIMINACIÓN
                </span>
              </button>
            )}
          </div>
        )}

        {/* PLAYOFFS BRACKET */}
        {tab === "bracket" && (phase === "playoffs" || phase === "done") && playoffs && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Icon type="target" size={20} color={C.orange} />
              <h2 style={{ margin: 0 }}>Bracket de Eliminación</h2>
            </div>

            {/* Visual bracket tree */}
            <div style={{ display: "flex", gap: 32, overflowX: "auto", paddingBottom: 16, alignItems: "center" }}>
              {/* Rounds */}
              {playoffs.rounds.map((round, ri) => (
                <div key={ri} style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 220 }}>
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <span className="badge badge-orange">{round.label}</span>
                  </div>
                  {round.matches.map(match => {
                    const res = playoffResults[match.id];
                    return (
                      <div key={match.id} className="match-card" style={{ position: "relative" }}>
                        <div style={{ fontSize: "0.68rem", color: C.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{match.label}</div>
                        {/* Home */}
                        <div style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "6px 10px", marginBottom: 4, borderRadius: 3,
                          background: res?.winner === match.home ? C.orangeGlow : "transparent",
                          border: `1px solid ${res?.winner === match.home ? C.orange + "55" : C.border}`
                        }}>
                          <span style={{ fontFamily: "Teko", fontWeight: 600, fontSize: "0.95rem", color: res?.winner === match.home ? C.orange : res?.loser === match.home ? C.dim : C.text }}>{match.home}</span>
                          {!res && <button className="btn-win" style={{ padding: "2px 8px", fontSize: "0.7rem" }} onClick={() => setPlayoffWinner(match.id, match.home, match.away)}>W</button>}
                          {res?.winner === match.home && <Icon type="skull" size={12} color={C.orange} />}
                        </div>
                        {/* Away */}
                        <div style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "6px 10px", borderRadius: 3,
                          background: res?.winner === match.away ? C.orangeGlow : "transparent",
                          border: `1px solid ${res?.winner === match.away ? C.orange + "55" : C.border}`
                        }}>
                          <span style={{ fontFamily: "Teko", fontWeight: 600, fontSize: "0.95rem", color: res?.winner === match.away ? C.orange : res?.loser === match.away ? C.dim : C.text }}>{match.away}</span>
                          {!res && <button className="btn-win" style={{ padding: "2px 8px", fontSize: "0.7rem" }} onClick={() => setPlayoffWinner(match.id, match.away, match.home)}>W</button>}
                          {res?.winner === match.away && <Icon type="skull" size={12} color={C.orange} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Connector */}
              {(playoffs.rounds.length > 0 || playoffs.final) && (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                  {[...Array(3)].map((_, i) => <div key={i} style={{ width: 20, height: 1, background: C.dim }} />)}
                </div>
              )}

              {/* Final */}
              {playoffs.final && (
                <div style={{ minWidth: 240 }}>
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <span className="badge badge-gold"><Icon type="trophy" size={10} color={C.gold} /> GRAN FINAL</span>
                  </div>
                  <div className="match-card final-card">
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px", marginBottom: 6, borderRadius: 3,
                      background: playoffResults.final?.winner === playoffs.final.home ? "#ffa50022" : "transparent",
                      border: `1px solid ${playoffResults.final?.winner === playoffs.final.home ? C.gold + "55" : C.border}`
                    }}>
                      <span style={{ fontFamily: "Teko", fontWeight: 700, fontSize: "1.05rem", color: playoffResults.final?.winner === playoffs.final.home ? C.gold : playoffResults.final ? C.dim : C.text }}>{playoffs.final.home}</span>
                      {!playoffResults.final && <button className="btn-win" style={{ padding: "2px 10px", fontSize: "0.72rem", borderColor: C.gold + "44", color: C.gold }} onClick={() => setPlayoffWinner("final", playoffs.final.home, playoffs.final.away)}>W</button>}
                      {playoffResults.final?.winner === playoffs.final.home && <Icon type="trophy" size={14} color={C.gold} />}
                    </div>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px", borderRadius: 3,
                      background: playoffResults.final?.winner === playoffs.final.away ? "#ffa50022" : "transparent",
                      border: `1px solid ${playoffResults.final?.winner === playoffs.final.away ? C.gold + "55" : C.border}`
                    }}>
                      <span style={{ fontFamily: "Teko", fontWeight: 700, fontSize: "1.05rem", color: playoffResults.final?.winner === playoffs.final.away ? C.gold : playoffResults.final ? C.dim : C.text }}>{playoffs.final.away}</span>
                      {!playoffResults.final && <button className="btn-win" style={{ padding: "2px 10px", fontSize: "0.72rem", borderColor: C.gold + "44", color: C.gold }} onClick={() => setPlayoffWinner("final", playoffs.final.away, playoffs.final.home)}>W</button>}
                      {playoffResults.final?.winner === playoffs.final.away && <Icon type="trophy" size={14} color={C.gold} />}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
