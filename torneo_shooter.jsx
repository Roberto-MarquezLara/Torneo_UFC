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
    fire: <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 23c-4.97 0-9-3.58-9-8 0-3.19 2.13-6.01 4-8l1.24 1.21c-.98 1.47-2.24 3.39-2.24 5.29 0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.77-.63-3.4-1.73-4.73L13 12l-1-6 3.28 2.16C17.86 10.87 21 13.58 21 15c0 4.42-4.03 8-9 8z"/></svg>,
    chevron: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3"><polyline points="4 12 9 17 20 6"/></svg>,
  };
  return icons[type] || null;
};

const C = {
  bg: "#0a0a0a",
  surface: "#161616",
  card: "#111111",
  border: "#2a2a2a",
  orange: "#ff6a00",
  orangeGlow: "#ff6a0033",
  orangeBright: "#ff8c00",
  red: "#cc0000",
  redBright: "#ff2222",
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

  @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 8px ${C.orange}44; } 50% { box-shadow: 0 0 20px ${C.orange}88; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes skullShake { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
  @keyframes crownBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes eliminatedFlash { 0% { background: #ff000044; } 100% { background: transparent; } }
  @keyframes confirmPulse { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }

  .animate-in { animation: fadeSlideIn 0.4s ease-out forwards; opacity: 0; }
  .skull-shake { animation: skullShake 0.5s ease-in-out; }
  .crown-bounce { animation: crownBounce 1.5s ease-in-out infinite; }
  .glow-pulse { animation: glow 2s ease-in-out infinite; }
  .confirm-pulse { animation: confirmPulse 0.3s ease; }

  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 3px; font-size: 0.7rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; transition: all 0.3s; }
  .badge-orange { background: ${C.orangeGlow}; color: ${C.orange}; border: 1px solid ${C.orange}55; }
  .badge-red { background: ${C.redGlow}; color: ${C.redBright}; border: 1px solid ${C.redBright}44; }
  .badge-gold { background: #ffa50022; color: ${C.gold}; border: 1px solid ${C.gold}44; }
  .badge-green { background: #4caf5022; color: ${C.green}; border: 1px solid ${C.green}44; }

  input[type=text] {
    background: ${C.surface}; border: 1px solid ${C.border}; color: ${C.text};
    padding: 10px 14px; border-radius: 4px; font-size: 0.9rem; width: 100%;
    outline: none; transition: all 0.3s; font-family: 'Inter', sans-serif;
  }
  input[type=text]:focus { border-color: ${C.orange}; box-shadow: 0 0 0 3px ${C.orangeGlow}; }

  button { cursor: pointer; border: none; border-radius: 4px; font-weight: 600; transition: all 0.2s; font-family: 'Inter', sans-serif; }
  .btn-primary { background: linear-gradient(135deg, ${C.orange}, ${C.red}); color: #fff; padding: 14px 28px; font-size: 0.9rem; letter-spacing: 1px; text-transform: uppercase; position: relative; overflow: hidden; }
  .btn-primary::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transition: left 0.5s; }
  .btn-primary:hover::before { left: 100%; }
  .btn-primary:hover { filter: brightness(1.15); transform: translateY(-2px); box-shadow: 0 6px 20px ${C.orangeGlow}; }
  .btn-primary:disabled { background: #333; color: #666; cursor: not-allowed; filter: none; transform: none; box-shadow: none; }
  .btn-ghost { background: transparent; color: ${C.muted}; padding: 6px 14px; font-size: 0.82rem; border: 1px solid ${C.border}; }
  .btn-ghost:hover { border-color: ${C.orange}; color: ${C.orange}; box-shadow: 0 0 8px ${C.orangeGlow}; }
  .btn-win { background: transparent; border: 1px solid ${C.border}; color: ${C.muted}; padding: 5px 14px; font-size: 0.8rem; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
  .btn-win:hover { border-color: ${C.orange}; color: ${C.orange}; background: ${C.orangeGlow}; transform: scale(1.05); }
  .btn-confirm { background: ${C.green}22; border: 1px solid ${C.green}55; color: ${C.green}; padding: 4px 10px; font-size: 0.75rem; border-radius: 3px; }
  .btn-confirm:hover { background: ${C.green}44; transform: scale(1.1); }

  .tab { padding: 10px 22px; border-radius: 4px 4px 0 0; font-size: 0.85rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border: 1px solid transparent; border-bottom: none; cursor: pointer; background: transparent; color: ${C.muted}; transition: all 0.2s; }
  .tab.active { background: ${C.card}; color: ${C.orange}; border-color: ${C.border}; border-bottom-color: ${C.card}; }
  .tab:hover:not(.active) { color: ${C.text}; }
  .tab-panel { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 0 6px 6px 6px; padding: 24px; }

  .match-card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 6px; padding: 14px 16px; transition: all 0.3s; }
  .match-card:hover { border-color: ${C.orange}44; }
  .match-card.done { border-color: ${C.green}33; }
  .match-card.pending { border-color: ${C.orange}55; background: ${C.orangeGlow}; }
  .match-card.final-card { background: linear-gradient(135deg, #1a0a00, #0d0d0d); border: 1px solid ${C.gold}44; }

  .score-input { width: 42px; text-align: center; background: ${C.surface}; border: 1px solid ${C.border}; color: ${C.text}; padding: 6px; border-radius: 4px; font-family: 'Teko', sans-serif; font-size: 1.4rem; font-weight: 700; outline: none; transition: all 0.3s; -moz-appearance: textfield; }
  .score-input::-webkit-outer-spin-button, .score-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .score-input:focus { border-color: ${C.orange}; box-shadow: 0 0 12px ${C.orangeGlow}; transform: scale(1.1); }

  .standing-row { transition: all 0.4s ease; }
  .standing-row:hover { transform: translateX(6px); }
  .standing-row.qualified { position: relative; overflow: hidden; }
  .standing-row.qualified::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, ${C.orangeGlow}, transparent); opacity: 0; transition: opacity 0.3s; pointer-events: none; }
  .standing-row.qualified:hover::before { opacity: 1; }
  .standing-row.eliminated { opacity: 0.5; }
  .standing-row.eliminated:hover { opacity: 0.8; }

  .bracket-team { transition: all 0.3s; position: relative; }
  .bracket-team.winner { background: ${C.orangeGlow} !important; border-color: ${C.orange}88 !important; }
  .bracket-team.winner::after { content: ''; position: absolute; inset: 0; border-radius: 3px; box-shadow: inset 0 0 12px ${C.orange}33; pointer-events: none; }
  .bracket-team.loser { background: ${C.redGlow} !important; border-color: ${C.red}44 !important; animation: eliminatedFlash 0.6s ease-out; }

  .progress-bar { position: relative; overflow: hidden; }
  .progress-bar::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); background-size: 200% 100%; animation: shimmer 2s linear infinite; pointer-events: none; }

  .round-header { cursor: pointer; user-select: none; }
  .round-header:hover { opacity: 0.85; }
  .round-content { overflow: hidden; transition: max-height 0.4s ease, opacity 0.3s ease; }
  .round-content.collapsed { max-height: 0; opacity: 0; }
  .round-content.expanded { max-height: 2000px; opacity: 1; }
  .chevron { transition: transform 0.3s; display: inline-flex; }
  .chevron.open { transform: rotate(0deg); }
  .chevron.closed { transform: rotate(-90deg); }

  /* RESPONSIVE */
  @media (max-width: 640px) {
    .app { padding: 16px 12px 40px; }
    h1 { font-size: 1.8rem; letter-spacing: 1px; }
    h2 { font-size: 1.2rem; }
    .tab { padding: 8px 14px; font-size: 0.75rem; }
    .tab-panel { padding: 16px; }
    .match-card { padding: 12px; }
    .match-card:hover { transform: none; }
    .standing-row:hover { transform: none; }
    .bracket-wrap { flex-direction: column !important; gap: 20px !important; align-items: stretch !important; }
    .bracket-col { min-width: auto !important; }
    .bracket-connector-wrap { display: none !important; }
    .standing-stats { flex-wrap: wrap; gap: 8px !important; }
  }
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
  // Pending scores (before confirmation)
  const [pendingScores, setPendingScores] = useState({});
  // Collapsed rounds
  const [collapsedRounds, setCollapsedRounds] = useState({});

  useEffect(() => { if (rounds.length > 0) recalcStandings(); }, [results]);

  function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUrl(URL.createObjectURL(file));
  }

  function startTournament() {
    const valid = editTeams.map(t => t.trim()).filter(Boolean);
    if (valid.length < MIN_TEAMS) return;
    setTeams(valid);
    setRounds(generateRoundRobin(valid));
    setResults({});
    setPendingScores({});
    setCollapsedRounds({});
    setStandings(valid.map(name => ({ name, w: 0, l: 0, pts: 0, mw: 0, ml: 0 })));
    setPhase("group");
    setTab("matches");
    setPlayoffs(null);
    setPlayoffResults({});
    setChampion(null);
  }

  function setWinner(matchId, winner, loser, score) {
    setResults(prev => ({ ...prev, [matchId]: { winner, loser, score } }));
    setPendingScores(prev => { const n = { ...prev }; delete n[matchId]; return n; });
  }

  function updatePending(matchId, field, value) {
    setPendingScores(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: Math.min(Math.max(parseInt(value) || 0, 0), 3) }
    }));
  }

  function confirmScore(matchId, home, away) {
    const p = pendingScores[matchId];
    if (!p) return;
    const h = p.home || 0;
    const a = p.away || 0;
    if (h + a !== 3) return;
    if (h > a) setWinner(matchId, home, away, `${h}-${a}`);
    else setWinner(matchId, away, home, `${a}-${h}`);
  }

  function isValidPending(matchId) {
    const p = pendingScores[matchId];
    if (!p) return false;
    const h = p.home || 0;
    const a = p.away || 0;
    return h + a === 3 && h !== a;
  }

  function toggleRound(ri) {
    setCollapsedRounds(prev => ({ ...prev, [ri]: !prev[ri] }));
  }

  function recalcStandings() {
    const stats = {};
    teams.forEach(t => { stats[t] = { name: t, w: 0, l: 0, pts: 0, mw: 0, ml: 0 }; });
    Object.values(results).forEach(({ winner, loser, score }) => {
      if (!stats[winner] || !stats[loser]) return;
      const [wMaps, lMaps] = score.split("-").map(Number);
      stats[winner].w++;
      stats[winner].pts += 3;
      stats[winner].mw += wMaps;
      stats[winner].ml += lMaps;
      stats[loser].l++;
      stats[loser].pts += lMaps >= 1 ? 1 : 0;
      stats[loser].mw += lMaps;
      stats[loser].ml += wMaps;
    });
    setStandings(Object.values(stats).sort((a, b) => b.pts - a.pts || (b.mw - b.ml) - (a.mw - a.ml)));
  }

  function getPlayoffSlots() {
    const n = teams.length;
    if (n <= 2) return 2;
    if (n <= 4) return Math.min(n, 4);
    return Math.min(n, 8) >= 6 ? 8 : 4;
  }

  function buildPlayoffs() {
    recalcStandings();
    const sorted = [...standings].sort((a, b) => b.pts - a.pts || (b.mw - b.ml) - (a.mw - a.ml));
    const slots = getPlayoffSlots();
    const qualified = sorted.slice(0, slots);
    if (qualified.length <= 2) {
      setPlayoffs({ rounds: [], final: { id: "final", home: qualified[0].name, away: qualified[1]?.name || qualified[0].name, label: "Gran Final" } });
    } else if (qualified.length <= 4) {
      setPlayoffs({ rounds: [{ label: "Semifinales", matches: [
        { id: "sf1", home: qualified[0].name, away: qualified[3]?.name || qualified[qualified.length - 1].name, label: "Semi 1" },
        { id: "sf2", home: qualified[1].name, away: qualified[2].name, label: "Semi 2" },
      ] }], final: null });
    } else {
      setPlayoffs({ rounds: [{ label: "Cuartos de Final", matches: [
        { id: "qf1", home: qualified[0].name, away: qualified[7]?.name || qualified[qualified.length - 1].name, label: "QF 1" },
        { id: "qf2", home: qualified[3].name, away: qualified[4].name, label: "QF 2" },
        { id: "qf3", home: qualified[1].name, away: qualified[6]?.name || qualified[qualified.length - 2]?.name || qualified[1].name, label: "QF 3" },
        { id: "qf4", home: qualified[2].name, away: qualified[5]?.name || qualified[qualified.length - 1].name, label: "QF 4" },
      ] }], final: null });
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
        if (currentRound.matches.every(m => next[m.id])) {
          const winners = currentRound.matches.map(m => next[m.id].winner);
          if (winners.length === 2) {
            updated.final = { id: "final", home: winners[0], away: winners[1], label: "Gran Final" };
          } else {
            const nextMatches = [];
            for (let i = 0; i < winners.length; i += 2)
              nextMatches.push({ id: `sf${Math.floor(i / 2) + 1}`, home: winners[i], away: winners[i + 1], label: `Semi ${Math.floor(i / 2) + 1}` });
            if (roundIdx + 1 >= updated.rounds.length)
              updated.rounds.push({ label: "Semifinales", matches: nextMatches });
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
      <div className="animate-in" style={{ marginBottom: 36, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <Icon type="crosshair" size={36} color={C.orange} />
          <h1>COMBAT<br /><span style={{ color: C.orange }}>TOURNAMENT</span></h1>
        </div>
        <p style={{ color: C.muted, fontSize: "0.85rem" }}>
          <Icon type="knife" size={12} color={C.muted} /> Round Robin + Eliminación Directa · Bo3 · {MIN_TEAMS}–{MAX_TEAMS} Escuadrones
        </p>
      </div>

      <div className="animate-in" style={{ animationDelay: "0.1s", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: 28 }}>
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Icon type="shield" size={18} color={C.orange} />
            <h2 style={{ margin: 0 }}>Identidad del Torneo</h2>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <label style={{ width: 80, height: 80, borderRadius: 6, cursor: "pointer", background: C.surface, border: `2px dashed ${logoUrl ? C.orange : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transition: "all 0.3s" }}>
                {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  : <span style={{ color: C.dim, fontSize: "0.65rem", textAlign: "center", lineHeight: 1.3 }}>+<br/>LOGO</span>}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogo} style={{ display: "none" }} />
              </label>
              <span style={{ fontSize: "0.65rem", color: C.dim, textAlign: "center" }}>PNG sin fondo<br/>o fondo negro</span>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: "0.75rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "block" }}>Nombre del Torneo</label>
              <input type="text" value={tournamentName} placeholder="Ej: WARZONE CHAMPIONSHIP"
                onChange={e => setTournamentName(e.target.value)}
                style={{ fontFamily: "Teko", fontSize: "1.2rem", fontWeight: 600, letterSpacing: 1 }} />
              {logoUrl && <button className="btn-ghost" style={{ marginTop: 8, fontSize: "0.7rem", padding: "3px 10px" }} onClick={() => setLogoUrl(null)}>Quitar logo</button>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon type="dogtag" size={18} color={C.orange} />
            <h2 style={{ margin: 0 }}>Escuadrones ({editTeams.length})</h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {editTeams.length > MIN_TEAMS && <button className="btn-ghost" onClick={() => setEditTeams(prev => prev.slice(0, -1))}>− Quitar</button>}
            {editTeams.length < MAX_TEAMS && <button className="btn-ghost" onClick={() => setEditTeams(prev => [...prev, ""])}>+ Agregar</button>}
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
          <span style={{ color: C.orange }}>①</span> Fase Grupal — Se juegan 3 mapas · Victoria 3-0 = 3pts · Victoria 2-1 = 3pts (perdedor +1pt)<br />
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
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 4 }} />
            : <Icon type="crosshair" size={28} color={C.orange} />}
          <div>
            <h1 style={{ fontSize: "1.7rem" }}>{tournamentName || "COMBAT ZONE"}</h1>
            <p style={{ color: C.muted, fontSize: "0.78rem", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              {phase === "group" && <><Icon type="target" size={12} color={C.muted} /> Fase Grupal · {completedMatches}/{totalMatches}</>}
              {phase === "playoffs" && <><Icon type="bolt" size={12} color={C.orange} /> <span style={{ color: C.orange }}>Eliminación Directa</span></>}
              {phase === "done" && <><Icon type="trophy" size={12} color={C.gold} /> <span style={{ color: C.gold }}>Victoria: {champion}</span></>}
            </p>
          </div>
        </div>
        <button className="btn-ghost" onClick={() => setPhase("setup")}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon type="knife" size={12} color="currentColor" /> Reiniciar</span>
        </button>
      </div>

      {/* Progress bar */}
      {phase === "group" && (
        <div style={{ marginBottom: 20 }}>
          <div className="progress-bar" style={{ background: C.surface, borderRadius: 4, height: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(completedMatches / totalMatches) * 100}%`, background: `linear-gradient(90deg, ${C.red}, ${C.orange})`, transition: "width 0.5s ease", borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: "0.68rem", color: C.dim }}>
            <span>{Math.round((completedMatches / totalMatches) * 100)}% completado</span>
            <span>{totalMatches - completedMatches} restantes</span>
          </div>
        </div>
      )}

      {/* Champion banner */}
      {phase === "done" && (
        <div className="animate-in glow-pulse" style={{ background: "linear-gradient(135deg, #1a0800, #0d0d0d)", border: `2px solid ${C.gold}`, borderRadius: 6, padding: 32, textAlign: "center", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${C.orange}, transparent)` }} />
          {logoUrl && <img src={logoUrl} alt="Logo" style={{ width: 56, height: 56, objectFit: "contain", marginBottom: 12 }} />}
          <div className="crown-bounce" style={{ display: "inline-block" }}><Icon type="trophy" size={56} color={C.gold} /></div>
          <div style={{ fontFamily: "Teko", fontSize: "2.5rem", fontWeight: 700, color: C.gold, letterSpacing: 4, marginTop: 10 }}>{champion}</div>
          <div style={{ color: C.muted, fontSize: "0.8rem", letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>Campeón — {tournamentName || "COMBAT ZONE"}</div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: -1, position: "relative", zIndex: 1 }}>
        {phase === "group" && <>
          <button className={`tab ${tab === "matches" ? "active" : ""}`} onClick={() => setTab("matches")}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon type="crosshair" size={13} color="currentColor" /> Combates</span>
          </button>
          <button className={`tab ${tab === "standings" ? "active" : ""}`} onClick={() => setTab("standings")}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon type="dogtag" size={13} color="currentColor" /> Tabla</span>
          </button>
        </>}
        {(phase === "playoffs" || phase === "done") && <>
          <button className={`tab ${tab === "bracket" ? "active" : ""}`} onClick={() => setTab("bracket")}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon type="target" size={13} color="currentColor" /> Bracket</span>
          </button>
          <button className={`tab ${tab === "standings" ? "active" : ""}`} onClick={() => setTab("standings")}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon type="dogtag" size={13} color="currentColor" /> Tabla Final</span>
          </button>
        </>}
      </div>

      <div className="tab-panel">

        {/* GROUP MATCHES — with collapsible rounds */}
        {tab === "matches" && phase === "group" && (
          <div>
            {rounds.map((round, ri) => {
              const isCollapsed = collapsedRounds[ri];
              const roundDone = round.every(m => results[m.id]);
              return (
                <div key={ri} style={{ marginBottom: 16 }}>
                  <div className="round-header" onClick={() => toggleRound(ri)}
                    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isCollapsed ? 0 : 12, padding: "8px 0" }}>
                    <span className={`chevron ${isCollapsed ? "closed" : "open"}`}>
                      <Icon type="chevron" size={14} color={C.orange} />
                    </span>
                    <Icon type="bolt" size={14} color={C.orange} />
                    <h3 style={{ color: C.orange, margin: 0 }}>Jornada {ri + 1}</h3>
                    {roundDone && <span className="badge badge-green" style={{ marginLeft: 8 }}><Icon type="check" size={8} color={C.green} /> Completa</span>}
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 40, height: 3, background: C.surface, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(round.filter(m => results[m.id]).length / round.length) * 100}%`, background: roundDone ? C.green : C.orange, transition: "width 0.3s" }} />
                      </div>
                      <span style={{ fontSize: "0.68rem", color: C.dim }}>{round.filter(m => results[m.id]).length}/{round.length}</span>
                    </div>
                  </div>
                  <div className={`round-content ${isCollapsed ? "collapsed" : "expanded"}`}>
                    <div style={{ display: "grid", gap: 8 }}>
                      {round.map((match, mi) => {
                        const res = results[match.id];
                        const pending = pendingScores[match.id];
                        const valid = isValidPending(match.id);
                        return (
                          <div key={match.id} className={`match-card${res ? " done" : valid ? " pending" : ""} animate-in`} style={{ animationDelay: `${mi * 0.04}s` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                              <div style={{ flex: 1, minWidth: 140 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontFamily: "Teko", fontWeight: 600, fontSize: "1.05rem", color: res?.winner === match.home ? C.green : res?.loser === match.home ? C.red : C.text, transition: "color 0.3s" }}>{match.home}</span>
                                  <span style={{ color: C.dim, fontSize: "0.7rem", fontWeight: 700 }}>VS</span>
                                  <span style={{ fontFamily: "Teko", fontWeight: 600, fontSize: "1.05rem", color: res?.winner === match.away ? C.green : res?.loser === match.away ? C.red : C.text, transition: "color 0.3s" }}>{match.away}</span>
                                </div>
                              </div>
                              {!res ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <input className="score-input" type="number" min="0" max="3" placeholder="-"
                                    value={pending?.home ?? ""}
                                    onChange={e => updatePending(match.id, "home", e.target.value)} />
                                  <span style={{ color: C.orange, fontSize: "1.1rem", fontWeight: 700 }}>:</span>
                                  <input className="score-input" type="number" min="0" max="3" placeholder="-"
                                    value={pending?.away ?? ""}
                                    onChange={e => updatePending(match.id, "away", e.target.value)} />
                                  {valid && (
                                    <button className="btn-confirm confirm-pulse" onClick={() => confirmScore(match.id, match.home, match.away)}
                                      title="Confirmar resultado">
                                      <Icon type="check" size={14} color={C.green} />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <span className="badge badge-green">
                                    <Icon type="skull" size={10} color={C.green} /> {res.winner}
                                  </span>
                                  <span style={{ fontFamily: "Teko", fontWeight: 700, fontSize: "1.1rem", color: C.orange }}>{res.score}</span>
                                  <button className="btn-ghost" style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                                    onClick={() => setResults(p => { const n = { ...p }; delete n[match.id]; return n; })}>↺</button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            {allMatchesDone() && (
              <div className="animate-in" style={{ textAlign: "center", marginTop: 16 }}>
                <button className="btn-primary glow-pulse" onClick={buildPlayoffs}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <Icon type="fire" size={18} color="#fff" /> AVANZAR A ELIMINACIÓN
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

            {/* Empty state */}
            {completedMatches === 0 && phase === "group" ? (
              <div className="animate-in" style={{ textAlign: "center", padding: "40px 20px", color: C.dim }}>
                <Icon type="target" size={48} color={C.dim} />
                <div style={{ fontFamily: "Teko", fontSize: "1.4rem", marginTop: 12, color: C.muted }}>ESPERANDO RESULTADOS</div>
                <p style={{ fontSize: "0.8rem", marginTop: 6 }}>Registra los scores en la pestaña de Combates para ver la clasificación</p>
              </div>
            ) : (
              <>
                <div className="standing-stats" style={{ display: "flex", gap: 16, marginBottom: 14, fontSize: "0.7rem", color: C.dim, flexWrap: "wrap" }}>
                  <span>W = Victorias</span><span>L = Derrotas</span><span>Maps = G-P</span><span>PTS = Puntos</span>
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  {standings.map((s, i) => {
                    const slots = getPlayoffSlots();
                    const qualified = i < slots;
                    return (
                      <div key={s.name} className={`standing-row animate-in ${qualified ? "qualified" : "eliminated"}`}
                        style={{
                          animationDelay: `${i * 0.06}s`,
                          display: "flex", alignItems: "center", gap: 12,
                          background: i === 0 ? "linear-gradient(90deg, #ffa50011, transparent)" : C.surface,
                          borderLeft: `4px solid ${i === 0 ? C.gold : qualified ? C.orange : C.red}`,
                          border: `1px solid ${i === 0 ? C.gold + "33" : qualified ? C.orange + "22" : C.red + "22"}`,
                          borderRadius: 4, padding: "12px 16px", flexWrap: "wrap"
                        }}>
                        <span style={{ fontFamily: "Teko", fontWeight: 700, fontSize: "1.5rem", width: 32, textAlign: "center", color: i === 0 ? C.gold : qualified ? C.orange : C.dim }}>
                          {i === 0 ? <span className="crown-bounce" style={{ display: "inline-block" }}>👑</span> : String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ flex: 1, fontFamily: "Teko", fontWeight: 500, fontSize: "1.1rem", letterSpacing: 0.5, minWidth: 80 }}>{s.name}</span>
                        <div className="standing-stats" style={{ display: "flex", gap: 12, fontSize: "0.8rem", alignItems: "center" }}>
                          <span style={{ color: C.green, fontWeight: 600 }}>{s.w}W</span>
                          <span style={{ color: C.red, fontWeight: 600 }}>{s.l}L</span>
                          <span style={{ color: C.muted, fontSize: "0.72rem", fontFamily: "monospace" }}>{s.mw}-{s.ml}</span>
                          <span style={{ fontFamily: "Teko", fontWeight: 700, fontSize: "1.3rem", color: i === 0 ? C.gold : qualified ? C.orange : C.text, textShadow: i === 0 ? `0 0 8px ${C.gold}44` : "none" }}>
                            {s.pts}<span style={{ fontSize: "0.7rem", color: C.dim }}> pts</span>
                          </span>
                        </div>
                        {qualified ? (
                          <span className="badge badge-orange" style={{ minWidth: 70, justifyContent: "center" }}>
                            <Icon type="fire" size={10} color={C.orange} /> CLASIF.
                          </span>
                        ) : (
                          <span className="badge badge-red" style={{ minWidth: 70, justifyContent: "center" }}>
                            <Icon type="skull" size={10} color={C.redBright} /> KIA
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {phase === "group" && allMatchesDone() && (
              <button className="btn-primary glow-pulse" style={{ marginTop: 20, width: "100%" }} onClick={buildPlayoffs}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon type="fire" size={18} color="#fff" /> AVANZAR A ELIMINACIÓN
                </span>
              </button>
            )}
          </div>
        )}

        {/* PLAYOFFS BRACKET — with SVG connectors */}
        {tab === "bracket" && (phase === "playoffs" || phase === "done") && playoffs && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Icon type="target" size={20} color={C.orange} />
              <h2 style={{ margin: 0 }}>Bracket de Eliminación</h2>
            </div>

            <div className="bracket-wrap" style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 16, alignItems: "center" }}>
              {playoffs.rounds.map((round, ri) => (
                <div key={ri} style={{ display: "contents" }}>
                  <div className="bracket-col animate-in" style={{ animationDelay: `${ri * 0.15}s`, display: "flex", flexDirection: "column", gap: 20, minWidth: 230 }}>
                    <div style={{ textAlign: "center", marginBottom: 4 }}>
                      <span className="badge badge-orange" style={{ fontSize: "0.75rem", padding: "4px 14px" }}>{round.label}</span>
                    </div>
                    {round.matches.map(match => {
                      const res = playoffResults[match.id];
                      return (
                        <div key={match.id} className="match-card" style={{ transition: "all 0.4s" }}>
                          <div style={{ fontSize: "0.65rem", color: C.dim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 6 }}>
                            <Icon type="bolt" size={10} color={C.dim} /> {match.label}
                          </div>
                          <div className={`bracket-team ${res?.winner === match.home ? "winner" : res?.loser === match.home ? "loser" : ""}`}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", marginBottom: 6, borderRadius: 4, background: "transparent", border: `1px solid ${C.border}`, transition: "all 0.4s" }}>
                            <span style={{ fontFamily: "Teko", fontWeight: 600, fontSize: "1rem", color: res?.winner === match.home ? C.orange : res?.loser === match.home ? C.dim : C.text }}>{match.home}</span>
                            {!res && <button className="btn-win" style={{ padding: "3px 10px", fontSize: "0.72rem" }} onClick={() => setPlayoffWinner(match.id, match.home, match.away)}>WIN</button>}
                            {res?.winner === match.home && <span className="skull-shake" style={{ display: "inline-flex" }}><Icon type="fire" size={14} color={C.orange} /></span>}
                            {res?.loser === match.home && <span className="skull-shake" style={{ display: "inline-flex" }}><Icon type="skull" size={14} color={C.red} /></span>}
                          </div>
                          <div className={`bracket-team ${res?.winner === match.away ? "winner" : res?.loser === match.away ? "loser" : ""}`}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 4, background: "transparent", border: `1px solid ${C.border}`, transition: "all 0.4s" }}>
                            <span style={{ fontFamily: "Teko", fontWeight: 600, fontSize: "1rem", color: res?.winner === match.away ? C.orange : res?.loser === match.away ? C.dim : C.text }}>{match.away}</span>
                            {!res && <button className="btn-win" style={{ padding: "3px 10px", fontSize: "0.72rem" }} onClick={() => setPlayoffWinner(match.id, match.away, match.home)}>WIN</button>}
                            {res?.winner === match.away && <span className="skull-shake" style={{ display: "inline-flex" }}><Icon type="fire" size={14} color={C.orange} /></span>}
                            {res?.loser === match.away && <span className="skull-shake" style={{ display: "inline-flex" }}><Icon type="skull" size={14} color={C.red} /></span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* SVG Connector between rounds */}
                  <div className="bracket-connector-wrap" style={{ width: 48, alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="48" height="100%" style={{ overflow: "visible" }}>
                      {round.matches.length === 2 && <>
                        <line x1="0" y1="35%" x2="48" y2="50%" stroke={C.orange} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
                        <line x1="0" y1="65%" x2="48" y2="50%" stroke={C.orange} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
                        <circle cx="48" cy="50%" r="3" fill={C.orange} opacity="0.8" />
                      </>}
                      {round.matches.length === 4 && <>
                        <line x1="0" y1="15%" x2="48" y2="30%" stroke={C.orange} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
                        <line x1="0" y1="38%" x2="48" y2="30%" stroke={C.orange} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
                        <line x1="0" y1="62%" x2="48" y2="70%" stroke={C.orange} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
                        <line x1="0" y1="85%" x2="48" y2="70%" stroke={C.orange} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
                        <circle cx="48" cy="30%" r="2.5" fill={C.orange} opacity="0.7" />
                        <circle cx="48" cy="70%" r="2.5" fill={C.orange} opacity="0.7" />
                      </>}
                    </svg>
                  </div>
                </div>
              ))}

              {/* Connector to final */}
              {playoffs.rounds.length > 0 && playoffs.final && (
                <div className="bracket-connector-wrap" style={{ width: 48, alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="48" height="100%" style={{ overflow: "visible" }}>
                    <line x1="0" y1="40%" x2="48" y2="50%" stroke={C.gold} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
                    <line x1="0" y1="60%" x2="48" y2="50%" stroke={C.gold} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
                    <circle cx="48" cy="50%" r="3.5" fill={C.gold} opacity="0.9" />
                  </svg>
                </div>
              )}

              {/* Final */}
              {playoffs.final && (
                <div className="bracket-col animate-in" style={{ animationDelay: "0.3s", minWidth: 250 }}>
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <span className="badge badge-gold" style={{ fontSize: "0.8rem", padding: "5px 16px" }}>
                      <Icon type="trophy" size={12} color={C.gold} /> GRAN FINAL
                    </span>
                  </div>
                  <div className={`match-card final-card ${playoffResults.final ? "glow-pulse" : ""}`} style={{ padding: 18 }}>
                    <div className={`bracket-team ${playoffResults.final?.winner === playoffs.final.home ? "winner" : playoffResults.final?.loser === playoffs.final.home ? "loser" : ""}`}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", marginBottom: 8, borderRadius: 4, background: "transparent", border: `1px solid ${C.gold}33`, transition: "all 0.4s" }}>
                      <span style={{ fontFamily: "Teko", fontWeight: 700, fontSize: "1.1rem", color: playoffResults.final?.winner === playoffs.final.home ? C.gold : playoffResults.final ? C.dim : C.text }}>{playoffs.final.home}</span>
                      {!playoffResults.final && <button className="btn-win" style={{ padding: "3px 12px", fontSize: "0.75rem", borderColor: C.gold + "44", color: C.gold }} onClick={() => setPlayoffWinner("final", playoffs.final.home, playoffs.final.away)}>WIN</button>}
                      {playoffResults.final?.winner === playoffs.final.home && <span className="crown-bounce" style={{ display: "inline-flex" }}><Icon type="trophy" size={16} color={C.gold} /></span>}
                      {playoffResults.final?.loser === playoffs.final.home && <span className="skull-shake" style={{ display: "inline-flex" }}><Icon type="skull" size={16} color={C.red} /></span>}
                    </div>
                    <div className={`bracket-team ${playoffResults.final?.winner === playoffs.final.away ? "winner" : playoffResults.final?.loser === playoffs.final.away ? "loser" : ""}`}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 4, background: "transparent", border: `1px solid ${C.gold}33`, transition: "all 0.4s" }}>
                      <span style={{ fontFamily: "Teko", fontWeight: 700, fontSize: "1.1rem", color: playoffResults.final?.winner === playoffs.final.away ? C.gold : playoffResults.final ? C.dim : C.text }}>{playoffs.final.away}</span>
                      {!playoffResults.final && <button className="btn-win" style={{ padding: "3px 12px", fontSize: "0.75rem", borderColor: C.gold + "44", color: C.gold }} onClick={() => setPlayoffWinner("final", playoffs.final.away, playoffs.final.home)}>WIN</button>}
                      {playoffResults.final?.winner === playoffs.final.away && <span className="crown-bounce" style={{ display: "inline-flex" }}><Icon type="trophy" size={16} color={C.gold} /></span>}
                      {playoffResults.final?.loser === playoffs.final.away && <span className="skull-shake" style={{ display: "inline-flex" }}><Icon type="skull" size={16} color={C.red} /></span>}
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
