// ════════════════════════════════════════════════════════════════
// EOT Customer Template Script v1.0
// Paste into: Customer Sheet → Extensions → Apps Script
// This is NOT deployed as a Web App. HQ handles all public serving.
// ════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// MENU
// ─────────────────────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📦 EasyOrderTracking')
    .addItem('📢 Generate Report (WhatsApp)', 'generateReport')
    .addItem('💰 Generate Billing',           'generateBilling')
    .addItem('🔄 Update Website',             'updateWebsite')
    .addSeparator()
    .addItem('🔧 Setup (Run Once)',           'setup')
    .addToUi();
}

// ─────────────────────────────────────────────────────────────────
// onEdit — AUTO-FILL
// Simple trigger: fires on any sheet edit.
// Handles:
//   • Customer Name entered → generate Order ID, set default status
//   • Tracking ID entered  → fill Shipped On date, generate Tracking Link
// ─────────────────────────────────────────────────────────────────
function onEdit(e) {
  var range = e.range;
  var sheet = range.getSheet();
  if (sheet.getName() !== 'daily_tracking') return;

  var row = range.getRow();
  var col = range.getColumn();
  if (row < 2) return; // skip header

  var lastCol  = Math.max(sheet.getLastColumn(), 10);
  var headers  = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Helper: get 0-based column index from header name
  function ci(name)  { return headers.indexOf(name); }
  // Helper: get cell object by header name, same row
  function gc(name)  { return sheet.getRange(row, ci(name) + 1); }
  // Helper: get cell value by header name
  function gv(name)  { var i = ci(name); return i >= 0 ? sheet.getRange(row, i + 1).getValue() : ''; }

  var nameCol     = ci('Customer Name') + 1;
  var trackingCol = ci('Tracking ID')   + 1;

  // ── Customer Name entered ──
  if (col === nameCol && range.getValue()) {
    // Generate Order ID if empty
    if (!gv('Order ID')) {
      gc('Order ID').setValue(generateOrderId_(sheet, row));
    }
    // Default status
    if (!gv('Delivery Status')) {
      gc('Delivery Status').setValue('Transit');
    }
  }

  // ── Tracking ID entered ──
  if (col === trackingCol) {
    var tid = String(range.getValue() || '').trim();
    if (tid) {
      // Shipped On — only fill once
      if (!gv('Shipped On')) {
        var shippedCell = gc('Shipped On');
        shippedCell.setValue(new Date());
        shippedCell.setNumberFormat('dd MMM yyyy');
      }
      // Tracking Link — always regenerate
      gc('Tracking Link').setValue(generateTrackingLink_(tid));
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// generateOrderId_ — format: PREFIX-DDMMYYYY-NNN
// e.g. JOY-20052026-004
// ─────────────────────────────────────────────────────────────────
function generateOrderId_(sheet, rowNum) {
  var config = kvRead_(ss_(), '_config');
  var prefix = String(config['brand_prefix'] || 'ORD').toUpperCase().slice(0, 3);
  var date   = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'ddMMyyyy');
  var num    = String(rowNum - 1).padStart(3, '0');
  return prefix + '-' + date + '-' + num;
}

// ─────────────────────────────────────────────────────────────────
// generateTrackingLink_ — builds tracking URL
// Contingency: if tracking_base_url is set in _config, uses that.
// Format: URL with {id} placeholder, e.g. https://track.dtdc.com/trace-tracking.asp?cnno={id}
// Default: speedposttrack.io (works for both DTDC and India Post)
// ─────────────────────────────────────────────────────────────────
function generateTrackingLink_(trackingId) {
  if (!trackingId) return '';

  var config    = kvRead_(ss_(), '_config');
  var customUrl = String(config['tracking_base_url'] || '').trim();

  // ── Contingency plan: override URL ──
  if (customUrl && customUrl.indexOf('{id}') >= 0) {
    return customUrl.replace('{id}', encodeURIComponent(trackingId));
  }

  // ── Default: speedposttrack.io ──
  var id      = String(trackingId).trim().toLowerCase();
  var carrier = id.toUpperCase().endsWith('IN') ? 'speedpost' : 'dtdc';
  var json    = '{"t":"' + id + '","c":"' + carrier + '"}';
  var encoded = Utilities.base64Encode(json);
  return 'https://speedposttrack.io/tracking-result?d=' + encoded;
}

// ─────────────────────────────────────────────────────────────────
// generateReport — builds WhatsApp message from rows marked Report=TRUE
// Stamps Reported At + clears Report cell for next cycle
// ─────────────────────────────────────────────────────────────────
function generateReport() {
  var sheet = ss_().getSheetByName('daily_tracking');
  var ui    = SpreadsheetApp.getUi();
  if (!sheet) { ui.alert('daily_tracking sheet not found.'); return; }

  var data    = sheet.getDataRange().getValues();
  var headers = data[0].map(function(h) { return String(h).trim(); });
  function ci(name) { return headers.indexOf(name); }

  var reported = [];
  var now      = new Date();

  for (var i = 1; i < data.length; i++) {
    var row    = data[i];
    var report = row[ci('Report')];
    if (!report) continue;

    var name    = String(row[ci('Customer Name')] || '').trim();
    var pincode = String(row[ci('Pincode')]        || '').trim();
    var tid     = String(row[ci('Tracking ID')]    || '').trim();
    var tlink   = String(row[ci('Tracking Link')]  || '').trim();
    var status  = String(row[ci('Delivery Status')]|| '').trim();
    if (!name) continue;

    reported.push({ row: i + 1, name: name, pincode: pincode, tid: tid, tlink: tlink, status: status });

    // ── Stamp the row ──
    var stamp = Utilities.formatDate(now, 'Asia/Kolkata', 'dd MMM yyyy, HH:mm');
    sheet.getRange(i + 1, ci('Reported At') + 1).setValue(now);
    sheet.getRange(i + 1, ci('Remarks')     + 1).setValue('Reported to business on ' + stamp);
    sheet.getRange(i + 1, ci('Report')      + 1).setValue(''); // clear for next cycle
  }

  if (reported.length === 0) {
    ui.alert('No rows marked for report.\nCheck the "Report" column in daily_tracking.');
    return;
  }

  var config  = kvRead_(ss_(), '_config');
  var bizName = String(config['brand_name'] || 'Your Store').trim();

  // ── Build WhatsApp message ──
  var lines = [];
  lines.push('📦 *EasyOrderTracking — Attention Needed*');
  lines.push('');
  lines.push('Hi! The following *' + reported.length + '* order(s) from *' + bizName + '* may need your attention:');
  lines.push('_(Possibly undelivered / at risk of Return to Origin)_');
  lines.push('');

  reported.forEach(function(o, idx) {
    lines.push((idx + 1) + '. *' + o.name + '* — PIN ' + o.pincode);
    if (o.status)  lines.push('   Status: ' + o.status);
    if (o.tid)     lines.push('   Tracking ID: ' + o.tid);
    if (o.tlink)   lines.push('   Track: ' + o.tlink);
    lines.push('');
  });

  lines.push('Please ensure the customer receives the package. We will follow up if needed. 🙏');

  var message = lines.join('\n');

  // ── Save to generate_report sheet ──
  var rSheet = ss_().getSheetByName('generate_report');
  if (rSheet) {
    rSheet.getRange('B2').setValue('Last report generated:');
    rSheet.getRange('C2').setValue(now);
    rSheet.getRange('B3').setValue(reported.length + ' orders reported');
    rSheet.getRange('A5').setValue(message);
  }

  // ── Show dialog ──
  var escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\n/g, '<br>');

  var html = HtmlService.createHtmlOutput(
    '<style>body{font-family:system-ui;padding:16px}pre{white-space:pre-wrap;background:#f5f5f5;padding:14px;border-radius:8px;font-size:13px;line-height:1.6;max-height:360px;overflow:auto}p{color:#666;font-size:12px;margin-top:10px}</style>' +
    '<pre>' + escaped + '</pre>' +
    '<p>Copy the text above and send via WhatsApp. ' + reported.length + ' order(s) stamped.</p>'
  ).setTitle('WhatsApp Report').setWidth(540).setHeight(480);

  ui.showModalDialog(html, '📋 Report Ready — Copy & Send');
}

// ─────────────────────────────────────────────────────────────────
// generateBilling — counts trackings by month, updates billing sheet
// Re-runnable: updates existing months, appends new ones
// ─────────────────────────────────────────────────────────────────
function generateBilling() {
  var track  = ss_().getSheetByName('daily_tracking');
  var bSheet = ss_().getSheetByName('billing');
  var ui     = SpreadsheetApp.getUi();
  if (!track)  { ui.alert('daily_tracking sheet not found.'); return; }
  if (!bSheet) { ui.alert('billing sheet not found.'); return; }

  var data    = track.getDataRange().getValues();
  var headers = data[0].map(function(h) { return String(h).trim(); });
  function ci(name) { return headers.indexOf(name); }

  // Count trackings per calendar month (by Shipped On date)
  var monthly = {};
  for (var i = 1; i < data.length; i++) {
    var shippedOn = data[i][ci('Shipped On')];
    if (!shippedOn) continue;
    var d = new Date(shippedOn);
    if (isNaN(d)) continue;
    var key = Utilities.formatDate(d, 'Asia/Kolkata', 'MMM yyyy'); // e.g. "May 2026"
    monthly[key] = (monthly[key] || 0) + 1;
  }

  if (Object.keys(monthly).length === 0) {
    ui.alert('No trackings with Shipped On dates found.');
    return;
  }

  // Build month → row number map from existing billing sheet
  var bData    = bSheet.getDataRange().getValues();
  var bHeaders = bData[0].map(function(h) { return String(h).trim(); });
  function bi(name) { return bHeaders.indexOf(name); }

  var monthMap = {};
  for (var j = 1; j < bData.length; j++) {
    var m = String(bData[j][bi('Month')] || '').trim();
    if (m) monthMap[m] = j + 1; // 1-indexed sheet row
  }

  var updated = 0, added = 0;

  Object.keys(monthly).forEach(function(month) {
    var count = monthly[month];
    if (monthMap[month]) {
      // Update existing row
      bSheet.getRange(monthMap[month], bi('Trackings') + 1).setValue(count);
      bSheet.getRange(monthMap[month], bi('Updated At') + 1).setValue(new Date());
      updated++;
    } else {
      // Append new row (Rate column left for CSM to fill)
      bSheet.appendRow([month, count, '', '', '', new Date()]);
      added++;
    }
  });

  ui.alert(
    '✅ Billing updated!\n\n' +
    'Months updated: ' + updated + '\n' +
    'New months added: ' + added + '\n\n' +
    'Fill in the Rate (₹) column for any new months.'
  );
}

// ─────────────────────────────────────────────────────────────────
// updateWebsite — triggers ISR revalidation on Vercel
// Clears the 5-min admin config cache so changes appear immediately
// ─────────────────────────────────────────────────────────────────
function updateWebsite() {
  var ui     = SpreadsheetApp.getUi();
  var config = kvRead_(ss_(), '_config');

  var vercelUrl = String(config['vercel_url']         || '').trim();
  var secret    = String(config['revalidate_secret']   || '').trim();
  var code      = String(config['customer_code']       || '').trim();

  if (!vercelUrl || !secret || !code) {
    ui.alert(
      'Missing config in _config sheet.\n\n' +
      'Required keys:\n' +
      '  vercel_url        → your Vercel URL\n' +
      '  revalidate_secret → same as Vercel REVALIDATE_SECRET env var\n' +
      '  customer_code     → your 6-digit code'
    );
    return;
  }

  var url = vercelUrl + '/api/revalidate?secret=' + encodeURIComponent(secret) + '&code=' + code;

  try {
    var res    = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var status = res.getResponseCode();
    var body   = res.getContentText();
    var parsed = JSON.parse(body);

    if (status === 200 && parsed.revalidated) {
      ui.alert('✅ Website updated!\n\nAdmin changes (brand name, bottom bar, etc.) are now live on the tracking page.');
    } else {
      ui.alert('⚠️ Revalidation returned status ' + status + '.\n\n' + body + '\n\nCheck Vercel logs or verify your secret.');
    }
  } catch (err) {
    ui.alert('Error calling Vercel:\n' + err.message);
  }
}

// ─────────────────────────────────────────────────────────────────
// setup — creates all sheets with correct headers
// ─────────────────────────────────────────────────────────────────
function setup() {
  var ui = SpreadsheetApp.getUi();

  function ensureSheet(name, headers, bg, hide) {
    var sh = ss_().getSheetByName(name) || ss_().insertSheet(name);
    if (headers && sh.getLastRow() === 0) {
      var r = sh.getRange(1, 1, 1, headers.length);
      r.setValues([headers]).setFontWeight('bold').setBackground(bg || '#0f172a').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
    if (hide) sh.hideSheet();
    return sh;
  }

  // ── daily_tracking ──
  ensureSheet('daily_tracking', [
    'Order ID',       // A — auto-generated
    'Customer Name',  // B — CSM enters
    'Pincode',        // C — CSM enters
    'Tracking ID',    // D — CSM enters (same or next day)
    'Shipped On',     // E — auto-filled when D is entered
    'Delivery Status',// F — default Transit, CSM marks Delivered
    'Tracking Link',  // G — auto-generated from Tracking ID
    'Report',         // H — CSM ticks when order needs attention
    'Reported At',    // I — auto-stamped
    'Remarks',        // J — auto-stamped
  ], '#0f172a');

  // ── generate_report ──
  var rsh = ensureSheet('generate_report', [], '#0f172a');
  rsh.getRange('A1').setValue('📋 Report Generator').setFontWeight('bold').setFontSize(14).setFontColor('#ffffff');
  rsh.getRange('A2').setValue('Click: 📦 EasyOrderTracking → Generate Report').setFontColor('#888888').setFontSize(11);
  rsh.getRange('A4').setValue('Last Report Message:').setFontWeight('bold').setFontColor('#ffffff');

  // ── admin ──
  ensureSheet('admin', [], '#1e3a5f');
  kvWrite_(ss_(), 'admin', {
    brand_name:       '(fill this — your business name)',
    tagline:          'Live Order Status',
    bottombar_mode:   'notification',
    bottombar_text:   '(fill this — message shown at bottom of tracking page)',
    bottombar_link:   '(fill for button mode — leave blank for notification)',
    bottombar_active: 'yes',
    show_search:      'yes',
  });
  ss_().getSheetByName('admin').getRange('A1:A8').setFontWeight('bold');

  // ── billing ──
  ensureSheet('billing', [
    'Month', 'Trackings', 'Rate (₹)', 'Total (₹)', 'Invoice Notes', 'Updated At'
  ], '#1a1a2e');

  // ── _config (hidden) ──
  ensureSheet('_config', [], '#111111', true);
  kvWrite_(ss_(), '_config', {
    customer_code:     '(set by HQ when website is created)',
    brand_name:        '(your business name)',
    brand_prefix:      '(first 3 letters, used in Order IDs)',
    created_at:        '',
    schema_version:    '1.0',
    tracking_provider: 'speedposttrack',
    tracking_base_url: '(contingency: set to https://example.com/track?id={id} to override)',
    vercel_url:        '(set to your Vercel URL)',
    revalidate_secret: '(set to your REVALIDATE_SECRET env var)',
  });

  ui.alert(
    '✅ Template setup complete!\n\n' +
    'Next steps:\n' +
    '1. Fill in admin sheet (brand name, bottom bar text)\n' +
    '2. Fill in _config sheet (unhide from sheet tabs):\n' +
    '   customer_code, brand_prefix, vercel_url, revalidate_secret\n' +
    '   (HQ script fills these when creating a website for you)\n' +
    '3. Install onEdit trigger:\n' +
    '   Extensions → Apps Script → Triggers → + Add Trigger\n' +
    '   Function: onEdit | Event: From Spreadsheet → On edit'
  );
}

// ─────────────────────────────────────────────────────────────────
// KV helpers
// ─────────────────────────────────────────────────────────────────
function kvRead_(ss, sheetName) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh) return {};
  var result = {};
  sh.getDataRange().getValues().forEach(function(row) {
    if (row[0]) result[String(row[0]).trim()] = row[1];
  });
  return result;
}

function kvWrite_(ss, sheetName, obj) {
  var sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sh.clearContents();
  var rows = Object.keys(obj).map(function(k) { return [k, obj[k]]; });
  if (rows.length) sh.getRange(1, 1, rows.length, 2).setValues(rows);
}

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
