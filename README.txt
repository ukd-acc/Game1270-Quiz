
GAME1270 Quiz App (Matching + True/False) — Auto-graded
======================================================

What this is
------------
A self-contained, static web app that:
- Shows a login screen (username + password) loaded from users.json
- Presents a Matching (word bank, drag-and-drop) section and a True/False section
- Auto-grades on submission and downloads a CSV with the student's results

Files
-----
- index.html       — landing page
- app.js           — app logic (login, quiz UI, grading, CSV download)
- styles.css       — styling
- quiz.json        — quiz content (editable)
- users.sample.json— sample user list (copy to users.json and edit for your class)

How to set usernames/passwords
------------------------------
1) Create a file named users.json (copy users.sample.json to get started).
2) Add entries like:
   [
     { "username": "student1", "password": "word-123", "fullName": "Student One" },
     { "username": "student2", "password": "word-456", "fullName": "Student Two" }
   ]

Security note: This is client-side authentication for classroom/low-stakes usage.
Anyone who can view the page source can, in principle, read the users.json. For
high-stakes testing use a proper LMS or server-based auth.

How to deploy (no downloads for students)
-----------------------------------------
Students only need a link. Host this folder on any static hosting:
- GitHub Pages: push this folder to a repo and enable Pages
- Netlify: drag-and-drop the folder
- Vercel: deploy as a static site
- AWS S3/CloudFront, Azure Static Web Apps, etc.

Place users.json alongside index.html so the app can fetch it.

How to retrieve grades
----------------------
When a student submits:
- The app auto-downloads a CSV file named: <username>-<quizId>-<timestamp>.csv
- Ask students to upload the CSV to your LMS or send via email, or
  host this app behind an LMS that captures uploads.

Editing the quiz
----------------
Open quiz.json and modify:
- Section 1 (matching):
  - "prompts": the questions
  - "word_bank": the letters and terms
  - "answer_key": map of promptIndex -> letter
- Section 2 (true_false):
  - "questions": the statements
  - "answer_key": map of index -> "T"/"F"

Grading
-------
Each correct answer = 1 point by default (configurable via points_per_question per section).

Local testing
-------------
You must serve files over HTTP(S) due to browser fetch rules. Use a simple local server:
- Python:   python -m http.server 8080
- Node:     npx http-server
- VS Code:  Live Server extension

Then open http://localhost:8080 in your browser.

Version
-------
Generated: 2025-08-20T04:37:38.665591
