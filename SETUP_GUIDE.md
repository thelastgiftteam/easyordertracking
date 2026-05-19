# EasyOrderTracking — Setup Guide

Everything you need to go from zero to a live multi-tenant tracking platform.

---

## Architecture Overview

```
Vercel (Next.js app)
  └── /[code]          → dynamic tracking page per business
  └── /api/orders      → proxies to HQ, cached 28s at CDN
  └── /api/revalidate  → clears ISR cache on demand

HQ Apps Script (one deployment)
  ├── ?action=resolve&code=xxx  → brand config (fetched by ISR getStaticProps)
  └── ?action=orders&code=xxx   → live orders (proxied via /api/orders)
       └── reads customer sheet directly via SpreadsheetApp.openById()

Customer Sheet (one per business)
  ├── daily_tracking   → CSM enters name, pincode, tracking ID
  ├── generate_report  → WhatsApp message builder
  ├── admin            → brand name, bottom bar config
  ├── billing          → monthly tracking counts
  └── _config (hidden) → code, secrets, tracking provider
```

**Key design:** HQ script opens customer sheets server-side — no CORS, no customer Web Apps to deploy, one quota pool to manage.

---

## Phase 1 — One-Time Setup

### Step 1 — Create the Customer Template Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → Create new sheet
2. Name it: `EOT Customer Template`
3. Open **Extensions → Apps Script**
4. Delete all existing code
5. Paste the entire contents of `scripts/CUSTOMER_TEMPLATE.js`
6. Save (Ctrl+S), name the project `EOT Customer Template`
7. Select `setup` from the function dropdown → ▶ Run → approve permissions
8. **Copy the Sheet ID from the URL:**
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`
9. Keep this tab open — you'll need the Sheet ID in Step 3

### Step 2 — Create the HQ Master Sheet

1. Create another new Google Sheet
2. Name it: `EasyOrderTracking HQ`
3. Open **Extensions → Apps Script**
4. Delete all existing code
5. Paste the entire contents of `scripts/HQ_MASTER.js`
6. Save, name project `EOT HQ`
7. Select `setup` → ▶ Run → approve all permissions
8. All required tabs are now created

### Step 3 — Configure HQ Script Properties

1. In HQ Apps Script: **Project Settings** → **Script Properties**
2. Add these properties:

| Property | Value |
|---|---|
| `TEMPLATE_SHEET_ID` | ID from Step 1.8 |
| `VERCEL_URL` | `https://easyordertracking.vercel.app` (update after deploy) |
| `REVALIDATE_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### Step 4 — Deploy HQ as Web App

1. In HQ Apps Script: **Deploy → New Deployment**
2. Type: **Web App**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Click **Deploy** → Copy the Web App URL
6. Save this URL — it's your `HQ_ENDPOINT`

---

## Phase 2 — Deploy the Website

### Step 5 — Push to GitHub

```bash
cd easyordertracking
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/easyordertracking.git
git push -u origin main
```

### Step 6 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your `easyordertracking` repo
3. Add **Environment Variables**:

| Name | Value |
|---|---|
| `HQ_ENDPOINT` | Web App URL from Step 4 |
| `REVALIDATE_SECRET` | Same secret from Step 3 |

4. Click **Deploy**
5. Your site is live at `https://easyordertracking.vercel.app`

### Step 7 — Update VERCEL_URL in HQ Script Properties

Go back to HQ Script Properties → update `VERCEL_URL` to your actual Vercel URL.

---

## Phase 3 — Onboarding First Customer

### Step 8 — Create a new tracking website

1. Open HQ Master Sheet
2. In **Create New Website** tab, fill in row 2:
   - Business Name, Owner Name, Owner Phone, POC Name, POC Phone, CSM Email, Notes
3. Click menu: **🚀 EasyOrderTracking HQ → 📋 Create New Website**
4. Script will:
   - Generate a unique 6-digit code (e.g. `728192`)
   - Clone the Customer Template Sheet
   - Fill in all config automatically
   - Add the business to Live Websites and Codes sheets
   - Show a dialog with the tracking URL
5. Share the tracking URL with the business: `https://easyordertracking.vercel.app/728192`
6. Share the Customer Sheet link with the assigned CSM

### Step 9 — CSM adds their first tracking

In the customer's sheet → `daily_tracking` tab:
1. Enter **Customer Name** in column B → Order ID auto-generates, status set to Transit
2. Next day (or same day if slip is available): Enter **Tracking ID** in column D → Shipped On and Tracking Link auto-fill

Customer can see their order at the tracking URL immediately.

---

## CSM Daily Workflow

### Adding a tracking
1. Open the customer's Google Sheet
2. In `daily_tracking`, enter in a new row: **Customer Name** → **Pincode** → (next day) **Tracking ID**
3. Everything else fills automatically

### Marking as Delivered
1. Find the order row
2. Change `Delivery Status` column from `Transit` to `Delivered`
3. Order stays visible for 10 days after shipping, then auto-hides

### Generating a Report (for RTO risk orders)
1. Mark `Report` column as `TRUE` (checkbox) for risky orders
2. Menu → **📢 Generate Report (WhatsApp)**
3. Dialog shows the WhatsApp message — copy and send to business owner
4. Reported At is stamped on rows, Report column is cleared automatically
5. Rows with high day counts next day → mark Report again → repeat

### Updating bottom bar / brand name
1. Go to `admin` tab in customer sheet
2. Edit the value in column B for the key you want to change
3. Menu → **🔄 Update Website**
4. Changes appear on tracking page within seconds

### Monthly billing
1. Menu → **💰 Generate Billing**
2. Billing sheet updates with tracking counts per month
3. Fill in Rate (₹) for new months
4. Use the billing sheet data in your invoicing tool (Zoho/Razorpay/etc.)

---

## Tracking Provider Contingency Plan

If `speedposttrack.io` goes down:

1. Open customer's sheet → `_config` tab (unhide from sheet tab)
2. Find the `tracking_base_url` key
3. Set value to the new provider's URL format, using `{id}` as placeholder:
   - DTDC direct: `https://www.dtdc.in/tracking/tracking_results.asp?track=I&trkCode={id}`
   - India Post: `https://www.indiapost.gov.in/VAS/Pages/Detail.aspx?ref={id}`
   - Delhivery: `https://www.delhivery.com/track/package/{id}`
4. Re-enter any new tracking IDs (existing ones already have the old link saved)

No code deployment needed — the script reads this on every tracking entry.

---

## Domain Change (Phase 5)

When you buy `easyordertracking.com`:

1. **Vercel**: Project Settings → Domains → Add `easyordertracking.com`
2. **DNS**: Add CNAME `@ → cname.vercel-dns.com`
3. **HQ Script Properties**: Update `VERCEL_URL` to `https://easyordertracking.com`
4. All new customer `_config` sheets will get the new URL automatically
5. For existing customers: HQ → run `updateAllCustomerVercelUrls()` (add this function later)
6. **WhatsApp messages** from generateReport will automatically use new URLs
7. **Vercel**: Update environment variable `NEXT_PUBLIC_BASE_URL` if you add it later

That's it. No redeployment of the website needed.

---

## Operations Checklist (run weekly)

- [ ] Check HQ → Log tab for ERROR level entries
- [ ] Check Live Websites tab — any customers showing no activity?
- [ ] Run Generate Billing for all customers at month end
- [ ] Verify nightly backups in Drive → EOT_Backups folder
- [ ] Look for transit orders > 7 days → mark Report → generate report for business

---

## Adding a New CSM

1. Share the customer sheet directly via Google Sheets sharing
2. They see the 📦 EasyOrderTracking menu automatically on open
3. No script deployment or credentials needed

---

## Schema versioning

`_config` has a `schema_version` key (currently `1.0`). When new columns are added in future updates, a migration function will find old-schema sheets (`schema_version` = old value) and upgrade them. Never delete existing columns — only append to the right.

---

## Cost

- Google Sheets / Apps Script: Free
- Vercel: Free (Hobby tier easily handles 50 businesses)
- Domain: ~$12/year when you buy it
- Total: essentially **zero** until you hit Vercel Pro limits

**Vercel free limits:** 100GB bandwidth/month, unlimited deployments. At 50 businesses × 1000 page views/day, well within free.

**Apps Script limits:** 20,000 URL fetches/day, 6 minutes/execution. With Vercel CDN caching orders for 28s, you use 1 fetch per business per 30s = 50 × 2880 = 144,000/day. This hits free limits at ~6 businesses without CDN. The CDN caching reduces this to ~1 fetch per code per 30s regardless of visitors = 50 × 2880 ÷ 50 = 2,880 fetches/day. Well within limits.
