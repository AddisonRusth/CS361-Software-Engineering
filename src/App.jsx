import React, {useEffect, useMemo, useRef, useState} from "react";

/*
  Medic Logger – Milestone #1 (User Stories 1–3)
  ------------------------------------------------
  This single-file React app demonstrates three completed user stories from the course project
  context (Quick Log Start, Vitals Capture, Treatment Recorder). It is designed to be dropped into
  any React/Vite project as App.jsx (or rendered directly in this canvas preview). No backend is
  required for Milestone #1; all data is persisted locally using localStorage. Later milestones can
  swap the DataStore for IndexedDB or a real API without changing UI components.

  Inclusivity & Accessibility heuristics reflected here (examples):
  - Perceivable: high-contrast text, large buttons, labels bound to inputs.
  - Operable: full keyboard support (Enter to add treatment, shortcut “N” to start new op), focus states.
  - Understandable: plain-language labels, input constraints and inline validation messages.
  - Robust: handles unexpected input, stores progress automatically to survive reloads/crashes.

  Quality attributes (from assignment plan): Reliability, Usability, Robustness.
  - Reliability: autosave to localStorage on every change; restore on reload.
  - Usability: single-tap/keystroke “Start New Operation”; minimal, linear forms; clear feedback.
  - Robustness: guarded parsing, schema versioning, safe defaults, validation and disabled actions.
*/

// --- Utilities --------------------------------------------------------------
const SCHEMA_VERSION = 1;
const STORAGE_KEY = "mediclogger.v1"; // bump on schema changes

function newOperation() {
  return {
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    vitals: {
      hr: "",
      rr: "",
      tempC: "",
      mental: "Alert",
      pain: 0,
    },
    treatments: [], // { id, whenISO, type, notes }
    _meta: { schema: SCHEMA_VERSION },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { current: null };
    const parsed = JSON.parse(raw);
    return parsed && parsed.current && parsed.current._meta?.schema === SCHEMA_VERSION
      ? parsed
      : { current: null };
  } catch (e) {
    console.warn("Failed to parse saved state", e);
    return { current: null };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state", e);
  }
}

function useAutosave(state) {
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => {
    const id = setInterval(() => saveState(stateRef.current), 500);
    return () => clearInterval(id);
  }, []);
}

// --- Components -------------------------------------------------------------
function Section({ title, children, subtitle }) {
  return (
    <section className="max-w-3xl mx-auto my-6 p-5 rounded-2xl shadow-lg border">
      <h2 className="text-2xl font-bold mb-1">{title}</h2>
      {subtitle && <p className="text-sm opacity-70 mb-4">{subtitle}</p>}
      {children}
    </section>
  );
}

function Labeled({ id, label, children, help }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block font-medium mb-1">{label}</label>
      {children}
      {help && <p className="text-xs opacity-70 mt-1">{help}</p>}
    </div>
  );
}

function Pill({ children }) {
  return <span className="inline-block text-xs px-2 py-1 rounded-full border ml-2">{children}</span>;
}

function StartOperation({ current, onStartNew, onAbandon }) {
  // Keyboard shortcut: N to start new operation quickly
  useEffect(() => {
    function onKey(e) {
      if (e.key.toLowerCase() === "n" && !current) onStartNew();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, onStartNew]);

  if (current) {
    return (
      <Section title="Active Operation" subtitle="User Story 1: Quick Log Start">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Operation ID: <code>{current.id}</code></p>
            <p className="text-sm">Started: {new Date(current.startedAt).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-2xl border" onClick={onAbandon} aria-label="Abandon current operation">
              Abandon
            </button>
            <button className="px-4 py-2 rounded-2xl border" onClick={onStartNew} aria-label="Start new operation (shortcut N)">
              New (N)
            </button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Start a New Operation" subtitle="User Story 1: One-tap start to capture critical info without delay">
      <button
        className="w-full text-lg px-6 py-5 rounded-2xl border shadow focus:outline-none focus:ring"
        onClick={onStartNew}
        aria-label="Start new operation"
      >
        ➕ Start New Operation
      </button>
      <p className="text-sm opacity-70 mt-3">Tip: You can also press <kbd className="px-2 py-0.5 border rounded">N</kbd> to start instantly.</p>
    </Section>
  );
}

function VitalsForm({ op, onChange }) {
  const [touched, setTouched] = useState({});
  const vitals = op?.vitals ?? {};

  function set(field, value) {
    onChange({ ...op, vitals: { ...vitals, [field]: value } });
  }

  const errors = useMemo(() => {
    const e = {};
    const hr = Number(vitals.hr);
    const rr = Number(vitals.rr);
    const t = Number(vitals.tempC);
    if (vitals.hr !== "" && (isNaN(hr) || hr <= 0 || hr > 300)) e.hr = "HR must be 1–300";
    if (vitals.rr !== "" && (isNaN(rr) || rr <= 0 || rr > 100)) e.rr = "RR must be 1–100";
    if (vitals.tempC !== "" && (isNaN(t) || t < 25 || t > 45)) e.tempC = "Temp 25–45 °C";
    if (vitals.pain < 0 || vitals.pain > 10) e.pain = "Pain 0–10";
    return e;
  }, [vitals]);

  const hasAny = op != null;

  return (
    <Section title="Vitals Capture" subtitle="User Story 2: Record HR, RR, Temp, Mental Status, Pain to track trends">
      {!hasAny && (
        <div className="p-4 rounded-xl border bg-white/50 mb-4" role="alert" aria-live="polite">
          Start an operation first to enable vitals.
        </div>
      )}
      <fieldset disabled={!hasAny} className={!hasAny ? "opacity-50" : ""}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Labeled id="hr" label={<span>Heart Rate (bpm){errors.hr && <Pill>{errors.hr}</Pill>}</span>}>
            <input id="hr" inputMode="numeric" className="w-full p-2 rounded-xl border"
              value={vitals.hr} onChange={e => set("hr", e.target.value)} onBlur={() => setTouched(t => ({...t, hr:true}))}
              aria-invalid={Boolean(errors.hr)} aria-describedby={errors.hr ? "hr-err" : undefined} />
            {touched.hr && errors.hr && <p id="hr-err" className="text-xs text-red-700 mt-1">{errors.hr}</p>}
          </Labeled>

          <Labeled id="rr" label={<span>Respiratory Rate (rpm){errors.rr && <Pill>{errors.rr}</Pill>}</span>}>
            <input id="rr" inputMode="numeric" className="w-full p-2 rounded-xl border"
              value={vitals.rr} onChange={e => set("rr", e.target.value)} onBlur={() => setTouched(t => ({...t, rr:true}))}
              aria-invalid={Boolean(errors.rr)} aria-describedby={errors.rr ? "rr-err" : undefined} />
            {touched.rr && errors.rr && <p id="rr-err" className="text-xs text-red-700 mt-1">{errors.rr}</p>}
          </Labeled>

          <Labeled id="tempC" label={<span>Temperature (°C){errors.tempC && <Pill>{errors.tempC}</Pill>}</span>}>
            <input id="tempC" inputMode="decimal" className="w-full p-2 rounded-xl border"
              value={vitals.tempC} onChange={e => set("tempC", e.target.value)} onBlur={() => setTouched(t => ({...t, tempC:true}))}
              aria-invalid={Boolean(errors.tempC)} aria-describedby={errors.tempC ? "tempC-err" : undefined} />
            {touched.tempC && errors.tempC && <p id="tempC-err" className="text-xs text-red-700 mt-1">{errors.tempC}</p>}
          </Labeled>

          <Labeled id="mental" label="Mental Status (AVPU)">
            <select id="mental" className="w-full p-2 rounded-xl border" value={vitals.mental} onChange={e => set("mental", e.target.value)}>
              <option>Alert</option>
              <option>Voice</option>
              <option>Pain</option>
              <option>Unresponsive</option>
            </select>
          </Labeled>

          <Labeled id="pain" label={<span>Pain (0–10){errors.pain && <Pill>{errors.pain}</Pill>}</span>}>
            <input id="pain" type="range" min={0} max={10} value={vitals.pain} onChange={e => set("pain", Number(e.target.value))} className="w-full" />
            <div className="text-sm mt-1">Current: <strong>{vitals.pain}</strong></div>
          </Labeled>
        </div>
      </fieldset>
    </Section>
  );
}

function Treatments({ op, onChange }) {
  const inputRef = useRef(null);
  const noteRef = useRef(null);
  const hasAny = op != null;

  function addTreatment() {
    if (!hasAny) return;
    const type = inputRef.current?.value?.trim();
    const notes = noteRef.current?.value?.trim();
    if (!type) return;
    const item = {
      id: crypto.randomUUID(),
      whenISO: new Date().toISOString(),
      type, notes: notes || "",
    };
    onChange({ ...op, treatments: [...op.treatments, item] });
    if (inputRef.current) inputRef.current.value = "";
    if (noteRef.current) noteRef.current.value = "";
  }

  // Enter key adds treatment from the primary field
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Enter" && document.activeElement === inputRef.current) {
        addTreatment();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [op]);

  function remove(id) {
    onChange({ ...op, treatments: op.treatments.filter(t => t.id !== id) });
  }

  return (
    <Section title="Treatment Recorder" subtitle="User Story 3: Log interventions for a clear record of care">
      {!hasAny && (
        <div className="p-4 rounded-xl border bg-white/50 mb-4" role="alert" aria-live="polite">
          Start an operation first to enable treatments.
        </div>
      )}
      <fieldset disabled={!hasAny} className={!hasAny ? "opacity-50" : ""}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <Labeled id="tType" label="Treatment Type" help="e.g., IV Fluids, Bandage, TXA, Splint">
            <input id="tType" ref={inputRef} className="w-full p-2 rounded-xl border" placeholder="Bandage" />
          </Labeled>
          <Labeled id="tNotes" label="Notes (optional)">
            <input id="tNotes" ref={noteRef} className="w-full p-2 rounded-xl border" placeholder="Left forearm, 10cm" />
          </Labeled>
          <button className="px-4 py-3 rounded-2xl border shadow" onClick={addTreatment} aria-label="Add treatment">Add</button>
        </div>

        <ul className="mt-4 divide-y">
          {op?.treatments?.length === 0 && <li className="py-3 text-sm opacity-70">No treatments logged yet.</li>}
          {op?.treatments?.map(t => (
            <li key={t.id} className="py-3 flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{t.type}</div>
                <div className="text-sm opacity-70">{t.notes || "—"}</div>
                <div className="text-xs opacity-70">{new Date(t.whenISO).toLocaleString()}</div>
              </div>
              <button className="text-sm px-3 py-1 rounded-xl border" onClick={() => remove(t.id)} aria-label={`Remove ${t.type}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </fieldset>
    </Section>
  );
}

function ExportPanel({ op }) {
  const [copied, setCopied] = useState(false);
  const json = useMemo(() => (op ? JSON.stringify(op, null, 2) : ""), [op]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <Section title="Data Export (Dev Aid)" subtitle="Helps demo acceptance criteria – not required for users">
      <div className="flex gap-2 mb-2">
        <button className="px-4 py-2 rounded-2xl border" onClick={copy} disabled={!op}>
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <a
          className={`px-4 py-2 rounded-2xl border ${!op ? "pointer-events-none opacity-50" : ""}`}
          href={`data:application/json;charset=utf-8,${encodeURIComponent(json)}`}
          download={`operation-${op?.id || "demo"}.json`}
        >
          Download JSON
        </a>
      </div>
      <pre className="max-h-72 overflow-auto text-xs p-3 rounded-xl border bg-black/90 text-white" aria-label="Operation JSON">
{json || "Start an operation to view JSON"}
      </pre>
    </Section>
  );
}

export default function App() {
  const [state, setState] = useState(() => loadState());
  useAutosave(state);

  function startNew() {
    setState({ current: newOperation() });
  }
  function abandon() {
    if (!state.current) return;
    if (confirm("Abandon current operation? This clears unsaved local data for this op.")) {
      setState({ current: null });
    }
  }
  function update(op) { setState({ current: op }); }

  return (
    <main className="p-6">
      <header className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold">Medic Logger – Milestone #1</h1>
        <p className="opacity-80">User Stories 1–3: Quick Log Start • Vitals Capture • Treatment Recorder</p>
      </header>

      <StartOperation current={state.current} onStartNew={startNew} onAbandon={abandon} />
      <VitalsForm op={state.current} onChange={update} />
      <Treatments op={state.current} onChange={update} />
      <ExportPanel op={state.current} />

      <footer className="max-w-3xl mx-auto my-8 text-xs opacity-70">
        <p>
          Inclusivity heuristics: perceivable (labels/contrast), operable (keyboard shortcuts, focus), understandable (plain text & validation), robust (autosave).
          Quality attributes: reliability (autosave), usability (one-tap start & linear flow), robustness (input validation & safe defaults).
        </p>
      </footer>
    </main>
  );
}