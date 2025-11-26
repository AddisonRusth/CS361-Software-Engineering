# PDF Export Service Repository Blueprint

Use this file as the authoritative checklist for what should live in the standalone **PDF-Export-Service** repository. Copy the file tree and the exact contents below into the new repo so the front end in `CS361-Software-Engineering` can call `POST /pdf-export` and receive a streamed PDF.

## Where the front-end caller lives (Medic Logger repo)

In the main `CS361-Software-Engineering` project, keep the microservice caller in **`src/services/pdfExporter.js`**. That file is the only frontend addition needed: it posts the case payload to your `PDF-Export-Service` backend and triggers the download. `src/App.jsx` already imports and uses it, so no other placement or wiring is required.

## File tree
```
PDF-Export-Service/
├── .gitignore
├── README.md
├── package.json
└── src/
    ├── index.js
    ├── renderPdf.js
    └── template.js
```

## .gitignore
```gitignore
node_modules
.DS_Store
npm-debug.log*
```

## package.json
```json
{
  "name": "pdf-export-service",
  "version": "1.0.0",
  "description": "Case summary PDF export microservice",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "pdf-lib": "^1.17.1"
  }
}
```

## README.md
```markdown
# PDF Export Service

A small Node/Express microservice that accepts a case summary payload and streams back a standardized PDF used by the Medic Logger front end.

## Endpoints
- `GET /health` → `{ status: "ok" }`
- `POST /pdf-export` → binary PDF. Body: `{ "operation": { ...case data... } }`

## Running locally
```bash
npm install
npm run dev # or: npm start
```
Service binds to `PORT` (default `4000`).

## Environment
- `PORT`: optional port override
- `CORS_ORIGIN`: optional allowed origin (default: `*`)

## Expected payload shape
```json
{
  "operation": {
    "id": "uuid",
    "startedAt": "2024-09-10T18:25:43.511Z",
    "vitals": { "hr": "78", "rr": "16", "tempC": "37.1", "mental": "Alert", "pain": 2 },
    "treatments": [
      { "id": "t1", "whenISO": "2024-09-10T18:55:00.000Z", "type": "TXA", "notes": "Given en route" }
    ]
  }
}
```
```

## src/index.js
```javascript
import cors from 'cors';
import express from 'express';
import { renderPdf } from './renderPdf.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*'}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/pdf-export', async (req, res) => {
  const operation = req.body?.operation;
  if (!operation) {
    return res.status(400).json({ message: 'Missing required "operation" payload.' });
  }

  try {
    const pdfBytes = await renderPdf(operation);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="case-summary-${operation.id || 'export'}.pdf"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('PDF export failed:', err);
    return res.status(500).json({ message: 'Export failed. Please retry.' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`PDF Export Service listening on port ${port}`);
});
```

## src/renderPdf.js
```javascript
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { buildSections, wrapLines } from './template.js';

const PAGE_WIDTH = 612; // Letter 8.5" x 11"
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const LINE_HEIGHT = 16;

export async function renderPdf(operation) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const drawLine = (text, opts = {}) => {
    if (y < MARGIN + 30) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    page.drawText(text, {
      x: MARGIN,
      y,
      size: opts.size || 12,
      font: opts.font || font,
      color: opts.color || rgb(0, 0, 0),
    });
    y -= LINE_HEIGHT;
  };

  const sections = buildSections(operation);
  sections.forEach(section => {
    drawLine(section.title, { font: fontBold, size: 14 });
    y -= 4;
    section.lines.forEach(line => {
      wrapLines(line, 92).forEach(wrapped => drawLine(`• ${wrapped}`));
    });
    y -= 6;
  });

  doc.getPages().forEach(p => {
    p.drawText('Confidential - For authorized personnel only.', {
      x: MARGIN,
      y: 25,
      size: 10,
      font,
      color: rgb(0, 0, 0),
    });
  });

  return doc.save();
}
```

## src/template.js
```javascript
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export function wrapLines(text, width = 90) {
  const safe = String(text ?? '');
  const words = safe.split(/\s+/);
  const lines = [];
  let current = '';
  words.forEach(word => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export function buildSections(operation = {}) {
  const { id, startedAt, vitals = {}, treatments = [] } = operation;
  const sections = [];

  sections.push({
    title: 'Case Summary',
    lines: [
      `Case ID: ${id || 'N/A'}`,
      `Started: ${fmtDate(startedAt)}`,
    ],
  });

  sections.push({
    title: 'Vitals',
    lines: [
      `Heart Rate: ${vitals.hr || '—'} bpm`,
      `Respiratory Rate: ${vitals.rr || '—'} rpm`,
      `Temperature: ${vitals.tempC || '—'} °C`,
      `Mental Status: ${vitals.mental || '—'}`,
      `Pain: ${vitals.pain ?? '—'} / 10`,
    ],
  });

  sections.push({
    title: 'Treatments',
    lines: treatments.length
      ? treatments.map(t => `(${fmtDate(t.whenISO)}) ${t.type || 'Treatment'} — ${t.notes || 'No notes'}`)
      : ['No treatments recorded.'],
  });

  return sections;
}
```
