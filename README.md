# ⚡ Evangelion SIEM Tactical Cyber Defense Dashboard

An interactive, real-time Security Information and Event Management (SIEM) dashboard styled with an **Evangelion-inspired HUD interface**. Built using Next.js, React, Tailwind CSS, and custom threat data streams, this application visualizes global cyber attacks, real-time attack telemetry, and live OSINT threat feeds.

---

## 🌐 Live Demo

Experience the tactical dashboard directly in your browser:  
👉 **[Launch Live Evangelion SIEM Dashboard](https://anti-gravity-evangelion-siem-dashbo.vercel.app)**

---

## 🛰️ Key Features

The application is structured into **5 distinct operational modules**:

1. **Earth (Global Attack Map):** A 3D global visualization mapping real-time attack vectors and traffic streams from origin to target locations.
2. **Dashboard of Current Attacks:** Real-time SIEM KPI counters, hourly attack frequency histograms, and dynamic threat severity tables.
3. **Top News & OSINT Feed:** Live security intelligence feed pulling current CVE alerts, CISA updates, and global incident news.
4. **Tactical Tools & Utilities:** Interactive security utilities including CVE Lookups, ATT&CK Framework reference library, and system diagnostic monitors.
5. **Operator Accomplishments:** Session and operator status tracking (`User ID`, `Clearance Level`, `Missions Resolved`, and `Skill Rating`).

---

## 🎨 Visual & Theme Aesthetic

* **Theme:** Inspired by NERV Command Center / MAGI System interfaces from *Neon Genesis Evangelion*.
* **Color Palette:** Tactical dark background with high-contrast geometric **Neon Orange**, **Neon Green**, **Neon Blue**, and **Emergency Red** indicators.
* **Typography & UI:** Angular borders, segmented panel headers, dot-matrix status tags, and tactical status badges (`[SYSTEM_STATUS: OK]`).

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, Three.js / Globe.gl
* **State Management:** Zustand / React Query
* **Data Streams:** Server-Sent Events (SSE) / REST API endpoints for live and simulated threat telemetry
* **Package Manager:** `pnpm` / `npm`
* **Deployment:** Vercel

---

## 🔒 Security & Sandbox Isolation

This project was built adhering to strict **Personal Security & Environment Boundary** policies inside Google Antigravity:
* **Workspace Isolation:** All runtime dependencies, Node.js binaries, and package managers are isolated strictly within the project workspace (`.bin/`).
* **Zero Host Modification:** No system files, personal directories, or environment settings outside the project folder were accessed or modified during development.

---

## 🚀 Quick Start & Local Setup

### Option 1: Live Web Access (No Installation Required)
Simply open **[https://anti-gravity-evangelion-siem-dashbo.vercel.app](https://anti-gravity-evangelion-siem-dashbo.vercel.app)** in any web browser.

---

### Option 2: Local Development

To run or customize the code on your own machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/CypherChris-007/Anti-Gravity_Evangelion-SIEM-Dashboard.git](https://github.com/CypherChris-007/Anti-Gravity_Evangelion-SIEM-Dashboard.git)
   cd Anti-Gravity_Evangelion-SIEM-Dashboard
