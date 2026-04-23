# Autonomous Micro‑Agency – Weekly Brief MVP  
**Product Design Spec (CapsLock)**  
Author: Filip Bunkens  

---

## 1. Problem

Account managers spend a lot of time pulling performance reports, scanning rows of numbers to understand week‑over‑week changes, and writing updates and next‑step plans. Dashboards help visualise data but often do not clearly answer:

- “What actually changed this week?”  
- “What should I look at first?”  
- “What are a few sensible tests to run?”

---

## 2. Goal

Create a small internal tool that:

- Takes a standard performance CSV export for a single client  
- Produces a short, readable weekly brief that highlights:
  - The most important changes in performance  
  - Where attention is needed  
  - A few practical checks and test ideas  

The tool should feel like a junior performance marketer who has already done a first pass on the data. In future iterations, it can evolve into a service that monitors ad accounts automatically and sends such briefs on a weekly basis, without manual uploads.

---

## 3. Users and Use Cases

**Primary user**

- CapsLock account manager / performance marketer working on B2C client campaigns  

**Key use cases (MVP)**

1. Weekly account review or pre‑meeting prep: upload the latest CSV and use the brief to guide priorities and discussion.  
2. Onboarding / handover: a new team member quickly understands what changed recently for a client.

**Future use case**

- Automatic weekly monitoring and delivery of briefs for selected clients, based on connected ad accounts or a central data source.

---

## 4. Functional Overview

**Input (MVP)**

- A single CSV file for one client, exported from Meta, Google Ads, or similar, containing at least:
  - Date  
  - Campaign name  
  - Core metrics such as impressions, clicks, cost, conversions  
  - Optionally pre‑computed metrics such as CTR, CPC, CPA  
- Optional text field for the client name.

**Output (MVP)**

- A weekly brief that:
  - Summarises how the account performed this week vs last week  
  - Points out a small number of key changes (e.g. CPA spike on a main campaign)  
  - Suggests a few practical checks and simple tests the account manager can consider  

---

## 5. User Flow (MVP)

1. Open a simple internal web page.  
2. Upload a CSV export for a single client and optionally enter the client name.  
3. Click “Generate weekly brief”.  
4. The page shows:
   - A small metrics snapshot (e.g. this week vs last week for spend, conversions, CPA)  
   - A short text brief on what changed and where to focus  
   - A bullet list of suggested checks or tests  
5. User reads the brief, copies it into notes or emails if needed, and uses it as a starting point for deeper analysis in their usual dashboards.

---

## 6. Key Behaviours and Non‑Goals

**Key behaviours**

- Focus on clarity over completeness: only show what is needed to explain the main changes.  
- Always produce a brief, even if changes are small (then emphasise stability).  
- Never make automatic changes to campaigns; only surface insights and suggestions.  
- Work with real exports with minimal friction when they follow typical Meta/Google naming.

**Out of scope for MVP**

- Live connections to ad platforms or automated refresh  
- Automatic or scheduled delivery of briefs  
- Multi‑client dashboards, history, or permissions  
- Complex visual analytics  

These can be explored once the concept proves useful.

---

## 7. Future Opportunities

If the MVP is valuable, future versions could:

- Use CapsLock’s own best‑practice playbooks so suggestions follow internal standards.  
- Support multiple clients with saved configurations and shared links per account.  
- Add automatic monitoring and weekly brief generation from connected data sources.  
- Move toward a fuller “micro‑agency” behaviour, where the tool not only highlights issues but also drafts concrete experiments to be reviewed and approved by the team.