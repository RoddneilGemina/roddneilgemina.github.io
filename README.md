# Roddneil B. Gemina — CS Graduate Portfolio & Wireframe

An interactive, responsive portfolio wireframe created for **Roddneil B. Gemina**, B.S. Computer Science graduate from Cebu Institute of Technology - University (CIT-U).

Built using HTML5, CSS3 (Grid, Flexbox, Custom Property Themes), and Vanilla JavaScript.

---

## 📄 Candidate Overview

- **Name**: Roddneil B. Gemina
- **Email**: `roddneilgemina@gmail.com`
- **Phone**: `0956-241-3577` (`+63 956 241 3577`)
- **Location**: Cebu City, Philippines
- **Education**: 
  - B.S. Computer Science, Cebu Institute of Technology - University (2022–2026)
  - STEM Strand (With Honors), Philippine Science High School - Central Visayas Campus (2016–2022)

---

## 🏆 Key Industry Certifications & Credentials

- **PhilNITS FE (Fundamental Engineer)** — April 2025 Certification
- **TOPCIT Level 3 Expertise**
- **AWS Academy Graduate** — Cloud Foundations & Cloud Architecting
- **CodeChum Certifications** — Java & C Programming

---

## 💼 Industry & Research Experience

1. **Opswerks** (2026) — *Site Reliability Engineering (SRE) Intern*
   - Linux administration, AWS cloud infrastructure, Kubernetes, Docker containers, and telemetry stack.
2. **DXForm Technologies** (2025) — *Quality Assurance (QA) Analyst*
   - Completed 250 hours of OJT testing 4 company projects and conducting bug tracking.
3. **Research Publications & Conferences**:
   - **Scopus-Indexed Conference Paper**: *Fusion Rush: Enhancing Proficiency in Boolean Logic Algebra through Gamification* (Accepted at ICETT 2026).
   - **National Congress Presentation**: *Bridging the Gap Between Synthetic and Real Handwriting: Using Visual AI to Accurately Parse Structured Logic Proofs* (Presented at PCSC 2026, Davao).

---

## 🛠️ Portfolio Projects

1. **Fusion Rush** — Gamified Boolean logic software & AI tutoring (Scopus ICETT 2026).
2. **Visual AI Logic Proof Parser** — Visual AI for handwritten logic evaluation (PCSC 2026 Davao).
3. **TakeIt** — Event management and digital ticketing platform.
4. **DishCover** — Smart pantry management & food waste reduction app.
5. **CropConnect** — Direct farmer-to-consumer fresh produce e-commerce platform.
6. **Bomberman BattleRoyale** — Java PvP multiplayer game using multi-threaded sockets.
7. **E-Tanom** — Academic concept AgriTech startup platform.
8. **Nexchef** — Culinary web platform with live synchronized cooking timers.

---

## 🌟 Interactive Wireframe Features

- **3 Color Themes**: 🔵 **Blueprint Navy**, 🌙 **Dark Slate**, ☀️ **Light Wireframe**.
- 📐 **Blueprint Grid Toggle (`Grid: ON/OFF`)**: Graph paper blueprint overlay toggle.
- 🏷️ **Spec Labels Toggle (`Labels: ON/OFF`)**: Architectural component spec tags overlay toggle.
- 📄 **Resume Download Link**: Direct link to download [`GeminaResume.pdf`](file:///C:/Users/Admin/Documents/Projects/Portfolio/GeminaResume.pdf).
- 📋 **Copy Email Button**: 1-click clipboard copy for `roddneilgemina@gmail.com`.
- 🔍 **Interactive Project Spec Dialog**: Click **"View Specs & Demo"** on any project to view architectural schematics and technical breakdowns.

---

## 🌐 Live Deployment

- **Production Domain**: [https://roddneil-gemina.pages.dev](https://roddneil-gemina.pages.dev)
- **Hosted On**: Cloudflare Pages

---

## 🚀 How to View Locally & Deploy

### Local Development
```powershell
# Using Cloudflare Wrangler Pages dev server
npm run dev

# Or using Python's built-in HTTP server
& "$env:LOCALAPPDATA\Python\bin\python.exe" -m http.server 8000
```
Then navigate to `http://localhost:8000` (or the port displayed by Wrangler).

### Deploying to Cloudflare Pages (`roddneil-gemina.pages.dev`)
```powershell
# 1. Authenticate (one-time setup if not logged in)
npx wrangler login

# 2. Deploy static assets to production
npm run deploy
# or: npx wrangler pages deploy . --project-name roddneil-gemina
```
