@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

:root {
  --ink: #241019;
  --paper: #FBF6EF;
  --paper-dim: #F3E7D8;
  --wine: #5C1A35;
  --wine-deep: #3A0F21;
  --wine-soft: #7E2E4C;
  --gold: #C9A15A;
  --gold-deep: #A3803F;
  --gold-soft: #EADFC2;
  --red: #A83A2E;
  --green-ok: #3F6B4E;
  --grey: #8A7A80;
  --line: #E6D8C4;
  --radius: 4px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Inter', -apple-system, sans-serif;
  min-height: 100vh;
}

.mono { font-family: 'IBM Plex Mono', monospace; }

h1, h2, h3 { font-family: 'Fraunces', serif; margin: 0; font-weight: 600; }
h1 em, h2 em, h3 em, .accent-em {
  font-style: italic;
  font-weight: 500;
  color: var(--wine);
}

a { color: inherit; }

/* Top bar */
.topbar {
  background: linear-gradient(120deg, var(--wine-deep) 0%, var(--wine) 100%);
  color: var(--paper);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 3px solid var(--gold);
}
.topbar .brand {
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 21px;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  gap: 12px;
}
.topbar .brand .mark {
  width: 30px; height: 30px;
  border: 1.5px solid var(--gold);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: var(--gold);
  font-family: 'Fraunces', serif;
  letter-spacing: 0.02em;
}
.topbar .who { font-size: 13px; opacity: 0.8; font-style: italic; font-family: 'Fraunces', serif; }
.topbar nav { display: flex; gap: 22px; align-items: center; }
.topbar nav a, .topbar nav button {
  color: var(--paper);
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  opacity: 0.82;
  letter-spacing: 0.01em;
}
.topbar nav a.active, .topbar nav a:hover, .topbar nav button:hover { opacity: 1; text-decoration: underline; text-underline-offset: 5px; text-decoration-color: var(--gold); }

.wrap {
  max-width: 980px;
  margin: 0 auto;
  padding: 40px 24px 90px;
}

/* Login page */
.login-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 15% 10%, rgba(201,161,90,0.16) 0%, transparent 45%),
    radial-gradient(circle at 85% 90%, rgba(201,161,90,0.10) 0%, transparent 50%),
    linear-gradient(160deg, var(--wine-deep) 0%, var(--wine) 55%, #4A1530 100%);
  padding: 20px;
}
.login-card {
  background: var(--paper);
  width: 100%;
  max-width: 390px;
  padding: 44px 38px;
  border-radius: 8px;
  box-shadow: 0 40px 80px rgba(0,0,0,0.4);
  position: relative;
  border-top: 4px solid var(--gold);
}
.login-card .mark {
  width: 48px; height: 48px;
  border: 1.5px solid var(--wine);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--wine);
  font-family: 'Fraunces', serif;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 20px;
}
.login-card h1 { font-size: 26px; color: var(--wine-deep); margin-bottom: 6px; }
.login-card p.sub { color: var(--grey); font-size: 13.5px; margin: 0 0 28px; font-style: italic; font-family: 'Fraunces', serif; }

.field { margin-bottom: 17px; }
.field label {
  display: block;
  font-size: 11.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--grey);
  margin-bottom: 7px;
}
.field input, .field select, .field textarea {
  width: 100%;
  padding: 10px 13px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: #fff;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: var(--ink);
}
.field input:focus, .field select:focus, .field textarea:focus {
  outline: 2px solid var(--wine);
  outline-offset: 1px;
  border-color: var(--wine);
}
.field .mono-input { font-family: 'IBM Plex Mono', monospace; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: var(--radius);
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.btn-primary { background: var(--wine); color: var(--paper); width: 100%; }
.btn-primary:hover { background: var(--wine-deep); }
.btn-gold { background: var(--gold); color: var(--wine-deep); }
.btn-gold:hover { background: var(--gold-deep); color: #fff; }
.btn-outline { background: transparent; border: 1px solid var(--wine); color: var(--wine); }
.btn-outline:hover { background: var(--wine); color: var(--paper); }
.btn-danger { background: transparent; border: 1px solid var(--red); color: var(--red); }
.btn-danger:hover { background: var(--red); color: #fff; }
.btn-sm { padding: 7px 14px; font-size: 12.5px; }

.error-box {
  background: #F7E6E2;
  border: 1px solid var(--red);
  color: var(--red);
  padding: 11px 13px;
  border-radius: var(--radius);
  font-size: 13px;
  margin-bottom: 16px;
  display: none;
}
.success-box {
  background: #EDF2ED;
  border: 1px solid var(--green-ok);
  color: #2C4E38;
  padding: 11px 13px;
  border-radius: var(--radius);
  font-size: 13px;
  margin-bottom: 16px;
  display: none;
}

/* Cards / panels */
.panel {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 26px 28px;
  margin-bottom: 26px;
  box-shadow: 0 1px 3px rgba(58,15,33,0.04);
}
.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--line);
  padding-bottom: 14px;
}
.panel-head h2 { font-size: 19px; color: var(--wine-deep); }
.eyebrow {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold-deep);
  font-weight: 700;
  margin-bottom: 5px;
}

.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }

/* Denomination till grid */
.denom-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 8px;
}
.denom-cell {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 10px 12px;
  background: var(--paper-dim);
}
.denom-cell .label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--wine-deep);
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
}
.denom-cell .label .sub { color: var(--grey); font-weight: 400; font-size: 11px; }
.denom-cell input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  text-align: right;
  background: #fff;
}

.totals-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px dashed var(--line);
  margin-top: 16px;
  padding-top: 14px;
  font-family: 'IBM Plex Mono', monospace;
}
.totals-strip .figure { font-size: 22px; font-weight: 600; color: var(--wine-deep); }

/* Entries table */
table.ledger { width: 100%; border-collapse: collapse; font-size: 13.5px; }
table.ledger th {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--grey);
  border-bottom: 2px solid var(--wine);
  padding: 9px 10px;
}
table.ledger td {
  padding: 11px 10px;
  border-bottom: 1px solid var(--line);
  vertical-align: middle;
}
table.ledger tr:hover td { background: var(--paper-dim); }
table.ledger .num { font-family: 'IBM Plex Mono', monospace; text-align: right; }
.tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.tag-balanced { background: #EAF0EB; color: #2C4E38; }
.tag-over { background: #F4EBD8; color: var(--gold-deep); }
.tag-short { background: #F7E6E2; color: var(--red); }

.empty-state {
  text-align: center;
  padding: 55px 20px;
  color: var(--grey);
}
.empty-state h3 { color: var(--wine-deep); margin-bottom: 8px; font-size: 18px; }

.filters { display: flex; gap: 10px; align-items: end; flex-wrap: wrap; margin-bottom: 4px; }
.filters .field { margin-bottom: 0; min-width: 150px; }

.actions-row { display: flex; gap: 8px; }

.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 26px; }
.stat-card {
  background: linear-gradient(135deg, var(--wine-deep) 0%, var(--wine) 100%);
  color: var(--paper);
  border-radius: 8px;
  padding: 18px 20px;
  border-bottom: 3px solid var(--gold);
}
.stat-card .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; opacity: 0.72; margin-bottom: 7px; font-family: 'Inter', sans-serif; }
.stat-card .stat-value { font-family: 'IBM Plex Mono', monospace; font-size: 22px; font-weight: 600; }

@media (max-width: 720px) {
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
  .stat-cards { grid-template-columns: repeat(2, 1fr); }
  .topbar { flex-direction: column; gap: 10px; align-items: flex-start; }
}

.hidden { display: none !important; }
table.pay-summary { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-bottom: 8px; }
table.pay-summary th {
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--grey);
  border-bottom: 2px solid var(--wine);
  padding: 8px 8px;
}
table.pay-summary td { padding: 7px 8px; border-bottom: 1px solid var(--line); vertical-align: middle; }
table.pay-summary td.method-name { font-weight: 600; color: var(--wine-deep); }
table.pay-summary input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
  text-align: right;
  background: #fff;
}
table.pay-summary td.diff-cell { font-family: 'IBM Plex Mono', monospace; text-align: right; font-weight: 600; }
table.pay-summary tfoot td { border-bottom: none; border-top: 2px solid var(--wine); font-weight: 700; color: var(--wine-deep); padding-top: 10px; }

.recon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
.recon-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px dashed var(--line);
  font-family: 'IBM Plex Mono', monospace; font-size: 13.5px;
}
.recon-row .recon-label { font-family: 'Inter', sans-serif; color: var(--grey); font-size: 13px; }
.recon-row.readonly .recon-value { color: var(--grey); }
.recon-row input {
  width: 130px; text-align: right; padding: 6px 8px;
  border: 1px solid var(--line); border-radius: var(--radius);
  font-family: 'IBM Plex Mono', monospace; font-size: 13.5px; background: #fff;
}

.short-excess-banner {
  margin-top: 18px; padding: 16px 20px; border-radius: 8px;
  display: flex; justify-content: space-between; align-items: center;
  color: var(--paper);
}
.short-excess-banner .banner-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.85; }
.short-excess-banner .banner-value { font-family: 'IBM Plex Mono', monospace; font-size: 26px; font-weight: 700; }

.auth-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.auth-card { border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px; background: var(--paper-dim); }
.auth-card .auth-role { font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--gold-deep); font-weight: 700; margin-bottom: 8px; }
