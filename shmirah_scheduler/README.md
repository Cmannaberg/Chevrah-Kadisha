# Kalamazoo Chevrah Kadisha — Shmirah Scheduler
## Setup & Usage Guide

---

## What This Does

The Shmirah Scheduler creates a fully formatted, live Google Sheet
for each Shmirah. Volunteers receive a link, open it on any device,
and sign up for shifts in real time. Everyone sees updates instantly.

Run the script once for each Shmirah. It takes about one minute.

---

## What the Sheet Includes

**Instructions Tab**
- What Shmirah is and why we do it
- What to bring (warm clothes, blanket, thermos, Tehillim)
- What to do and not do
- Funeral home name, address, phone, and directions
- How to sign up

**Schedule Tab**
- All 2-hour shifts automatically calculated from Taharah to funeral
- Works for single-night or multi-day Shmirah
- Open shifts shown in green
- Two volunteer columns per shift (name + phone)
- Overnight shifts flagged with a note of thanks
- Last shift marked with funeral time

---

## One-Time Setup

### Step 1 — Create your Shmirah Launcher sheet

1. Go to **drive.google.com**
2. Click **New → Google Sheets** to create a blank spreadsheet
3. Rename it **Shmirah Launcher** — this is your permanent tool
4. Click **Extensions → Apps Script**
5. Delete the default code
6. Paste in the contents of `shmirah_final_v2.js`
7. Click **Save** (the floppy disk icon)
8. Click **Run** — Google will ask you to authorize the script
9. Click **Review Permissions → Advanced → Go to Shmirah Scheduler (unsafe)**
10. Click **Allow**

You only do this once. The Shmirah Launcher sheet stays in your
Drive permanently and is reused every time.

---

## Every Time You Need a New Sheet

1. Open your **Shmirah Launcher** sheet in Google Drive
2. Click **Extensions → Apps Script**
3. Click **Run**
4. Answer the prompts one at a time:

| Prompt | Example |
|---|---|
| Name of Meit/Meitah | Goldberg, David |
| Gender (M or F) | M |
| Hebrew name (optional) | Dovid ben Avraham |
| Scheduler name & phone | Cary Mannaberg, (269) 555-1234 |
| Funeral home name | Congregation Memorial Chapel |
| Funeral home address | 123 Main Street, Kalamazoo MI |
| Funeral home phone | (269) 555-5678 |
| Directions (optional) | Take I-94 to exit 80, north on Westnedge |
| Start date | April 11, 2025 |
| Start time (when Taharah ends) | 3:00 PM |
| End date (funeral) | April 13, 2025 |
| End time (funeral) | 11:00 AM |

5. The script runs — takes about 30 seconds
6. A new tab called **--- SHARE THIS LINK ---** opens with the URL
7. Copy the link and paste it into your group email

---

## Important Date & Time Format

**Dates:** Enter as `April 11, 2025` — do NOT include the day name.
The script calculates the day name automatically.

**Times:** Enter as `3:00 PM` or `11:00 AM` — include AM or PM.

---

## How the Shift Calculation Works

The script automatically generates every 2-hour shift from the
moment Taharah ends until the funeral begins — across as many
days as needed. The last shift is labeled with the funeral time.

Example: Taharah ends Friday at 3:00 PM, funeral Sunday at 11:00 AM
- Script generates all shifts: 3-5 PM, 5-7 PM ... through 9-11 AM Sunday

---

## Workflow for the Scheduler

1. **Run the script** and fill in the details
2. **Email the link** to your Shmirah volunteer group
3. **Volunteers sign up** by typing their name and phone in any green row
4. **Monitor the sheet** — you or your assistant can watch who signs up
5. **Change green rows to blue** when a shift is confirmed
6. **Call individuals** to fill any remaining open shifts as time approaches
7. **Edit directly** on the sheet at any time — all changes are instant

---

## For Your Assistant

Your assistant only needs the link. No Google account required.
They can open it on any device and:
- See all shifts and who is signed up
- Type names and phone numbers into empty green rows
- Change row colors from green to blue when confirmed
- Add or edit notes
- Make any corrections needed

---

## Files in This Repository

| File | Purpose |
|---|---|
| `shmirah_final_v2.js` | The Google Apps Script — paste into Apps Script editor |
| `README.md` | This file |

---

## Frequently Asked Questions

**Do volunteers need a Google account?**
No. Anyone with the link can open and edit the sheet.

**Can two people edit at the same time?**
Yes. Changes appear instantly for everyone.

**What happens to old Shmirah sheets?**
They stay in your Google Drive permanently as a record.
Each Shmirah gets its own separate sheet.

**Can someone else run the script?**
Yes. Share the Apps Script project with their Gmail address
via the Share button in the Apps Script editor.
They will need to authorize it once with their Google account.

**What if I need to change something after the sheet is created?**
Just edit the sheet directly — click any cell and type.
No need to re-run the script.

---

*ברוך דיין האמת — Blessed is the True Judge*
