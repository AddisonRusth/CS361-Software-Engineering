# 🩺 Medic Logger – Milestone #1
### CS361: Software Engineering – Sprint 1 (Milestone #1 Implementation)
**Author:** Addison Rusth  
**GitHub Repository:** `https://github.com/CS361-F25/medic-logger`  
**Release Tag:** `v1.0.0-m1`

---

## 📘 Project Overview
**Medic Logger** is a lightweight, offline-capable web application designed for **field medics** to quickly log critical patient data under stressful conditions. It allows users to start new operations, capture vitals, and record treatments efficiently — even without continuous network access.

This milestone implements the **first three user stories** from the backlog:

1. **Quick Log Start** – instant operation initialization  
2. **Vitals Capture** – structured recording of HR, RR, temperature, mental status, and pain  
3. **Treatment Recorder** – logging interventions with timestamps and notes  

All stories are complete and demonstrable, fulfilling the **CS361 Milestone #1 rubric**: three working user stories, reflection of Inclusivity Heuristics, and three verified Quality Attributes.  

---

## 🧩 User Stories Implemented

### **User Story 1 – Quick Log Start**
> “As a field medic, I want to start a new operation with one tap so that I can capture critical info without delay.”

- **Given** the system is running and no operation is currently active,  
- **When** the user clicks the **Start New Operation** button or presses the **N** key,  
- **Then** a new operation is created instantly with a unique ID and timestamp, and the information displays immediately in the interface.

---

### **User Story 2 – Vitals Capture**
> “As a field medic, I want to record HR, RR, temperature, mental status, and pain so that I can track patient trends over time.”

- **Given** an operation is active and the vitals form is displayed,  
- **When** the user enters data into the fields for HR, RR, temperature, AVPU, and pain,  
- **Then** the values are validated in real-time, autosaved locally, and remain persistent even after a page refresh.

---

### **User Story 3 – Treatment Recorder**
> “As a field medic, I want to log interventions (IV, bandage, TXA) so that there is a clear record of care.”

- **Given** an operation is active and the treatments section is visible,  
- **When** the user adds a treatment type and optional notes and presses **Enter** or clicks **Add**,  
- **Then** the treatment is saved with a timestamp, displayed in the treatment list, and removable if needed.

---

## ♿ Inclusivity Heuristics Demonstrated

- **IH#1 – Make purpose clear / why this feature:**  
  On the first screen and section headers, the app describes what each area does — *Start a New Operation*, *Vitals Capture*, and *Treatment Recorder* — so users immediately know why they’re there.  

- **IH#2 – Communicate costs/time:**  
  Starting an operation is instant and one tap; no sign-in or multi-step setup. The UI shows that data entry is quick and focused.  

- **IH#3 – Let users hide or remove what they don’t need:**  
  Users can remove a treatment they no longer want to see, reducing clutter and keeping the log focused.  

- **IH#4 – Leverage familiarity:**  
  Uses standard form controls — text fields, a dropdown for AVPU, a pain slider, and a familiar **Add** button — for predictable interaction.  

- **IH#5 – Backtrack / undo path:**  
  Users can **Abandon** the current operation and start a new one, providing a clear way to backtrack.  

- **IH#6 – Clear next step:**  
  Each section has a primary action — **Start**, **Fill Fields**, **Add Treatment** — making the next step obvious.  

- **IH#7 – Redundant input methods:**  
  Users can click buttons or use keyboard shortcuts: **N** to start, **Enter** to add treatment — multiple ways for the same task.  

- **IH#8 – Safety nets / guardrails:**  
  When a user clicks **Abandon**, a confirmation prompt appears to prevent accidental data loss.  

---

## ⚙️ Quality Attributes Demonstrated

- **Reliability:**  
  Data **autosaves and restores** so users don’t lose progress if a tab reloads or crashes — ensuring trustworthy operation in field conditions.  

- **Usability:**  
  The workflow uses **minimal taps**, features **clear labels** and **inline validation**, and uses **large readable controls** optimized for low-light or high-stress environments.  

- **Robustness:**  
  The app **validates vital-sign ranges**, provides **safe defaults**, and requires **confirmation** for destructive actions; it handles unexpected input without crashing or losing data.  

---

## 🧪 Demonstration Checklist (for Video)

1. Run `npm run dev` → open `http://localhost:5173/`.  
2. **User Story 1:** Press **N** or click Start → show operation ID/time.  
3. **User Story 2:** Enter vitals → show validation → refresh page to prove autosave.  
4. **User Story 3:** Add and remove treatments; confirm timestamp and notes.  
5. Demonstrate each Inclusivity Heuristic (visible labels, keyboard shortcuts, error prevention).  
6. Demonstrate Quality Attributes (reload autosave, clean layout, robust validation).  
7. Show GitHub Release `v1.0.0-m1` with description and source archive.  

---

## 🏗️ Installation and Setup

```bash
npm install
npm run dev
```
If your Node.js version is below 20, either upgrade to Node 22 (recommended) or run:
```bash
npm i -D vite@4.5.3 @vitejs/plugin-react@3.1.0
```

---

## 🗂️ Repository Structure

```
medic-logger/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── .gitignore
└── src/
    ├── App.jsx
    └── main.jsx
```

---

## 🧱 How This Meets the CS361 Rubric

✅ Three completed user stories (Quick Log Start, Vitals Capture, Treatment Recorder)  
✅ Each story’s functional acceptance criteria demonstrated using Given/When/Then format  
✅ Interactive buttons, forms, and keyboard shortcuts  
✅ Inclusivity Heuristics IH#1–IH#8 clearly reflected  
✅ Quality Attributes (Reliability, Usability, Robustness) implemented and verifiable  
✅ Fully working Milestone #1 build with GitHub Release `v1.0.0-m1`  
✅ No partial features or placeholders  

---

## 🌟 Next Steps
Upcoming Milestones will add: Offline Access, Secure Sync, Role-Based Access, GPS Breadcrumbs, Photo Attachments, and PDF Export.

---

**In summary:**  
The **Medic Logger v1.0.0-m1** release fulfills CS361 Milestone #1 by implementing three complete user stories with fully functional UI interactions, clear Inclusivity Heuristics, and demonstrated Quality Attributes of Reliability, Usability, and Robustness. It forms a solid foundation for future development and meets all rubric requirements for a working, inclusive, and well-documented software artifact.