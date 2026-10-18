/* Campus Event & Workshop Registration System
 * Author: Parth Vishnu | PRN: 24070521279
 * Stack: jQuery (DOM + events + AJAX), localStorage persistence
 */
$(function () {
  'use strict';

  /* ---------- Constants & state ---------- */
  var KEY_REGS = 'cews_registrations';
  var KEY_EXT  = 'cews_external_seats';   // seats taken by "other students" (seed + simulation)
  var KEY_SET  = 'cews_settings';
  var KEY_SEEDED = 'cews_seeded';         // sample data is loaded only once
  var DATA_URL = 'data/workshops.json';
  var STORAGE_LIMIT = 5 * 1024 * 1024;    // ~5 MB typical localStorage quota

  // Used when the JSON file cannot be fetched (e.g. page opened via file://)
  var FALLBACK = [
    { id: 'ws1', title: 'Intro to Machine Learning with Python', type: 'Workshop', date: '2026-11-03', time: '10:00', venue: 'Seminar Hall A', capacity: 30, seatsTaken: 12 },
    { id: 'ws2', title: 'Web Development Bootcamp: HTML, CSS & JS', type: 'Workshop', date: '2026-11-05', time: '14:00', venue: 'Computer Lab 3', capacity: 24, seatsTaken: 18 },
    { id: 'ws3', title: 'Hackathon 2026: Build for Campus', type: 'Event', date: '2026-11-12', time: '09:00', venue: 'Innovation Centre', capacity: 40, seatsTaken: 22 },
    { id: 'ws4', title: 'Resume & Interview Skills', type: 'Workshop', date: '2026-11-15', time: '11:30', venue: 'Auditorium B', capacity: 20, seatsTaken: 17 },
    { id: 'ws5', title: 'Cybersecurity Capture-the-Flag', type: 'Event', date: '2026-11-20', time: '16:00', venue: 'Network Lab', capacity: 16, seatsTaken: 6 },
    { id: 'ws6', title: 'Cloud Computing Essentials', type: 'Workshop', date: '2026-11-24', time: '10:30', venue: 'Seminar Hall B', capacity: 28, seatsTaken: 9 }
  ];

  // Sample registrations (demo data). Times are staggered back from "now".
  var SAMPLE_ROWS = [
    ['Parth Vishnu',   '24070521279', 'parth.vishnu@college.edu',  '9876543210', 'Computer Engineering',  'Second year', 'ws1'],
    ['Aarav Sharma',   '24070521301', 'aarav.sharma@college.edu',  '9823456781', 'Information Technology','Second year', 'ws1'],
    ['Isha Kulkarni',  '24070521318', 'isha.kulkarni@college.edu', '9890123456', 'Computer Engineering',  'Third year',  'ws1'],
    ['Rohan Patil',    '23070421142', 'rohan.patil@college.edu',   '9765432109', 'Electronics & Telecom', 'Third year',  'ws2'],
    ['Sneha Deshmukh', '24070521335', 'sneha.deshmukh@college.edu','9922334455', 'Information Technology','Second year', 'ws2'],
    ['Vikram Joshi',   '22070321087', 'vikram.joshi@college.edu',  '9811223344', 'Mechanical',            'Final year',  'ws3'],
    ['Ananya Iyer',    '24070521350', 'ananya.iyer@college.edu',   '9867123450', 'Computer Engineering',  'Second year', 'ws3'],
    ['Karan Mehta',    '23070421166', 'karan.mehta@college.edu',   '9988776655', 'MBA',                   'First year',  'ws3'],
    ['Priya Nair',     '22070321099', 'priya.nair@college.edu',    '9345678901', 'Civil',                 'Final year',  'ws4'],
    ['Aditya Rao',     '23070421180', 'aditya.rao@college.edu',    '9712345678', 'Information Technology','Third year',  'ws4'],
    ['Meera Pawar',    '24070521377', 'meera.pawar@college.edu',   '9654321870', 'Electronics & Telecom', 'Second year', 'ws5'],
    ['Siddharth Jain', '22070321120', 'siddharth.jain@college.edu','9870012345', 'Computer Engineering',  'Final year',  'ws5'],
    ['Neha Gokhale',   '23070421195', 'neha.gokhale@college.edu',  '9423456123', 'Information Technology','Third year',  'ws6'],
    ['Yash Thakur',    '24070521392', 'yash.thakur@college.edu',   '9588123467', 'Mechanical',            'Second year', 'ws6']
  ];
  function makeSample() {
    var now = Date.now();
    return SAMPLE_ROWS.map(function (r, i) {
      return { id: uid() + i, name: r[0], prn: r[1], email: r[2], phone: r[3], dept: r[4], year: r[5],
               workshop: r[6], time: now - (i + 1) * 47 * 60 * 1000 };
    });
  }

  var state = {
    workshops: [],
    regs: [],
    ext: {},                 // { workshopId: extraSeatsTaken }
    prevSeats: {},           // for highlighting changes
    sort: { key: 'time', dir: 'desc' },
    timer: null, tick: null, remaining: 0,
    settings: { interval: 0, simulate: false }
  };

  /* ---------- Helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { toast('Could not save data: browser storage is full or blocked.', true); return false; }
  }
  function uid() { return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function fmtDate(d, t) {
    var dt = new Date(d + 'T' + (t || '00:00'));
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) +
           (t ? ', ' + t : '');
  }
  function fmtStamp(ts) {
    return new Date(ts).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  function wsById(id) { return state.workshops.filter(function (w) { return w.id === id; })[0]; }
  function regCount(id) { return state.regs.filter(function (r) { return r.workshop === id; }).length; }
  function taken(w) { return Math.min(w.capacity, (state.ext[w.id] || 0) + regCount(w.id)); }
  function left(w) { return Math.max(0, w.capacity - taken(w)); }

  function toast(msg, bad) {
    var $t = $('<div class="toast" role="status"></div>').text(msg).toggleClass('bad', !!bad);
    $('#toasts').append($t);
    setTimeout(function () { $t.fadeOut(300, function () { $t.remove(); }); }, 3200);
  }

  /* ---------- AJAX: fetch workshop data (the "server" view) ---------- */
  function fetchWorkshops() {
    var dfd = $.Deferred();
    setSync('busy', 'Syncing…');
    $.ajax({ url: DATA_URL, dataType: 'json', cache: false, timeout: 6000 })
      .done(function (data) {
        dfd.resolve(data.workshops || [], false);
      })
      .fail(function () {
        // file:// pages or missing file: use embedded copy so the app still works
        dfd.resolve(FALLBACK, true);
      });
    return dfd.promise();
  }

  function sync(manual) {
    return fetchWorkshops().then(function (list, offline) {
      // remember seat counts to highlight changes
      state.prevSeats = {};
      state.workshops.forEach(function (w) { state.prevSeats[w.id] = left(w); });

      state.workshops = list;
      state.regs = load(KEY_REGS, []);
      if (!load(KEY_SEEDED, false)) {          // first visit: fill with sample data
        if (!state.regs.length) { state.regs = makeSample(); save(KEY_REGS, state.regs); }
        save(KEY_SEEDED, true);
      }
      state.ext = load(KEY_EXT, null);
      if (!state.ext) {               // first run: seed from JSON seatsTaken
        state.ext = {};
        list.forEach(function (w) { state.ext[w.id] = w.seatsTaken || 0; });
        save(KEY_EXT, state.ext);
      }
      if (state.settings.simulate) simulateOthers();

      renderAll();
      var now = new Date().toLocaleTimeString();
      setSync(offline ? 'err' : 'ok',
        offline ? 'Offline data (open via a local server for live AJAX) · ' + now : 'Synced at ' + now);
      if (manual) toast('Seat availability refreshed');
      resetCountdown();
    });
  }

  function simulateOthers() {
    var open = state.workshops.filter(function (w) { return left(w) > 0; });
    if (!open.length || Math.random() < 0.3) return;
    var w = open[Math.floor(Math.random() * open.length)];
    state.ext[w.id] = (state.ext[w.id] || 0) + 1;
    save(KEY_EXT, state.ext);
  }

  function setSync(cls, text) {
    $('#syncDot').attr('class', 'dot ' + cls);
    $('#syncText').text(text);
  }

  /* ---------- Rendering ---------- */
  function renderAll() {
    renderWorkshops();
    renderWorkshopSelects();
    renderDeptFilter();
    renderRoster();
    renderStats();
  }

  function renderWorkshops() {
    var html = state.workshops.map(function (w) {
      var t = taken(w), l = left(w), mine = regCount(w.id);
      var cls = 'card ' + (w.type === 'Event' ? 'event ' : '') + (l === 0 ? 'full' : l <= Math.ceil(w.capacity * 0.15) ? 'low' : '');
      var seats = '';
      for (var i = 0; i < w.capacity; i++) {
        var c = i < t ? 't' : '';
        seats += '<span class="seat ' + c + '"></span>';
      }
      var status = l === 0 ? '<span class="full-t">Full</span>' :
                   cls.indexOf('low') > -1 ? '<span class="low-t">Filling fast</span>' : '<span>Open</span>';
      var changed = state.prevSeats[w.id] != null && state.prevSeats[w.id] !== l ? ' flash' : '';
      return '<article class="' + cls + changed + '" data-id="' + esc(w.id) + '">' +
        '<div><span class="tag">' + esc(w.type) + '</span><h3>' + esc(w.title) + '</h3></div>' +
        '<p class="meta">' + esc(fmtDate(w.date, w.time)) + '<br>' + esc(w.venue) + '</p>' +
        '<div class="seats" aria-hidden="true">' + seats + '</div>' +
        '<div class="avail"><span><strong>' + l + '</strong> of ' + w.capacity + ' seats left</span>' + status + '</div>' +
        '<button type="button" class="btn primary js-pick"' + (l === 0 ? ' disabled' : '') + '>' +
        (l === 0 ? 'Session full' : 'Register for this session') + '</button>' +
        (mine ? '<span class="meta">' + mine + ' registered on this device</span>' : '') +
        '</article>';
    }).join('');
    $('#workshopList').html(html || '<p class="empty">No sessions available.</p>');
  }

  function renderWorkshopSelects() {
    var $f = $('#fWorkshop'), $r = $('#rWorkshop');
    var fv = $f.val(), rv = $r.val() || '';
    var fOpts = '<option value="">Select a session</option>', rOpts = '<option value="">All sessions</option>';
    state.workshops.forEach(function (w) {
      var l = left(w);
      fOpts += '<option value="' + esc(w.id) + '"' + (l === 0 ? ' disabled' : '') + '>' +
               esc(w.title) + ' (' + (l === 0 ? 'full' : l + ' left') + ')</option>';
      rOpts += '<option value="' + esc(w.id) + '">' + esc(w.title) + '</option>';
    });
    $f.html(fOpts).val(fv);
    $r.html(rOpts).val(rv);
  }

  function renderDeptFilter() {
    var $d = $('#rDept'), cur = $d.val() || '';
    var opts = '<option value="">All departments</option>';
    $('#fDept option').each(function () {
      if (this.value || $(this).text() !== 'Select department') {
        var v = $(this).text();
        if (v !== 'Select department') opts += '<option>' + esc(v) + '</option>';
      }
    });
    $d.html(opts).val(cur);
  }

  function getVisibleRegs() {
    var q = $.trim($('#rSearch').val()).toLowerCase();
    var ws = $('#rWorkshop').val(), dept = $('#rDept').val();
    var list = state.regs.filter(function (r) {
      if (ws && r.workshop !== ws) return false;
      if (dept && r.dept !== dept) return false;
      if (q) {
        var w = wsById(r.workshop);
        var hay = [r.name, r.prn, r.email, r.phone, r.dept, r.year, w ? w.title : ''].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var k = state.sort.key, d = state.sort.dir === 'asc' ? 1 : -1;
    list.sort(function (a, b) {
      var x = sortVal(a, k), y = sortVal(b, k);
      return (x < y ? -1 : x > y ? 1 : 0) * d;
    });
    return list;
  }
  function sortVal(r, k) {
    if (k === 'workshop') { var w = wsById(r.workshop); return (w ? w.title : '').toLowerCase(); }
    if (k === 'time') return r.time;
    return String(r[k] || '').toLowerCase();
  }

  function renderRoster() {
    var list = getVisibleRegs();
    var rows = list.map(function (r) {
      var w = wsById(r.workshop);
      return '<tr data-id="' + esc(r.id) + '">' +
        '<td data-label="Name">' + esc(r.name) + '</td>' +
        '<td data-label="PRN">' + esc(r.prn) + '</td>' +
        '<td data-label="Email">' + esc(r.email) + '</td>' +
        '<td data-label="Department">' + esc(r.dept) + '</td>' +
        '<td data-label="Year">' + esc(r.year) + '</td>' +
        '<td data-label="Session">' + esc(w ? w.title : r.workshop) + '</td>' +
        '<td data-label="Registered">' + esc(fmtStamp(r.time)) + '</td>' +
        '<td><button type="button" class="btn danger sm js-cancel" aria-label="Cancel registration for ' + esc(r.name) + '">Cancel</button></td>' +
        '</tr>';
    }).join('');
    $('#rosterBody').html(rows);
    $('#rosterEmpty').prop('hidden', list.length > 0);
    $('#rosterTable').prop('hidden', list.length === 0);
    $('#rosterCount').text('(' + list.length + ' of ' + state.regs.length + ')');
    $('#exportCsv').prop('disabled', list.length === 0);
    $('#clearAll').prop('disabled', state.regs.length === 0);
    $('#rosterTable th[data-sort]').removeClass('asc desc')
      .filter('[data-sort="' + state.sort.key + '"]').addClass(state.sort.dir);
    $('#rSort').val(state.sort.key + ':' + state.sort.dir);
    if (!$('#rSort').val()) $('#rSort').prop('selectedIndex', -1);
  }

  function storageBytes() {
    var bytes = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        bytes += (k.length + (localStorage.getItem(k) || '').length) * 2; // UTF-16
      }
    } catch (e) {}
    return bytes;
  }
  function fmtBytes(b) {
    return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
  }

  function renderStats() {
    var cap = 0, tk = 0;
    state.workshops.forEach(function (w) { cap += w.capacity; tk += taken(w); });
    $('#stWorkshops').text(state.workshops.length);
    $('#stRegistered').text(state.regs.length);
    $('#stSeatsLeft').text(cap - tk);
    $('#stFill').text(cap ? Math.round(tk / cap * 100) + '%' : '0%');
    var b = storageBytes();
    $('#stStorage').text(fmtBytes(b) + ' of 5 MB');
    $('#stStorageBar').css('width', Math.min(100, b / STORAGE_LIMIT * 100) + '%');
  }

  /* ---------- Validation & registration ---------- */
  function validate(data) {
    var e = {};
    if (!/^[A-Za-z][A-Za-z .'-]{1,59}$/.test(data.name)) e.name = 'Enter your full name (letters only, 2–60 characters).';
    if (!/^\d{11}$/.test(data.prn)) e.prn = 'PRN must be exactly 11 digits.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) e.email = 'Enter a valid email such as name@college.edu.';
    if (!/^[6-9]\d{9}$/.test(data.phone)) e.phone = 'Enter a 10-digit mobile number starting with 6–9.';
    if (!data.dept) e.dept = 'Choose your department.';
    if (!data.year) e.year = 'Choose your year.';
    if (!data.workshop) e.workshop = 'Choose a session.';
    else {
      var w = wsById(data.workshop);
      if (!w) e.workshop = 'That session no longer exists. Refresh and try again.';
      else if (left(w) === 0) e.workshop = 'This session is full. Pick another one.';
      else if (state.regs.some(function (r) { return r.workshop === data.workshop && r.prn === data.prn; }))
        e.prn = 'This PRN is already registered for the selected session.';
    }
    return e;
  }

  function showErrors(errs) {
    $('.field').removeClass('bad');
    $('.err').text('');
    $.each(errs, function (k, msg) {
      var $p = $('.err[data-for="' + k + '"]').text(msg);
      $p.closest('.field').addClass('bad');
    });
    var first = Object.keys(errs)[0];
    if (first) $('#regForm [name="' + first + '"]').trigger('focus');
  }

  $('#regForm').on('submit', function (ev) {
    ev.preventDefault();
    // Re-read latest storage first so two tabs cannot oversell a session
    state.regs = load(KEY_REGS, []);
    state.ext = load(KEY_EXT, state.ext);

    var data = {};
    $.each($(this).serializeArray(), function (_, f) { data[f.name] = $.trim(f.value); });
    var errs = validate(data);
    showErrors(errs);
    if ($.isEmptyObject(errs)) {
      state.regs.push({
        id: uid(), name: data.name, prn: data.prn, email: data.email.toLowerCase(), phone: data.phone,
        dept: data.dept, year: data.year, workshop: data.workshop, time: Date.now()
      });
      if (save(KEY_REGS, state.regs)) {
        var w = wsById(data.workshop);
        toast('Registered ' + data.name + ' for ' + w.title);
        this.reset();
        $('.field').removeClass('bad'); $('.err').text('');
        sync(false);
      }
    } else {
      toast('Please fix the highlighted fields', true);
    }
  });

  // live-clear an error as the user edits that field
  $('#regForm').on('input change', 'input, select', function () {
    $(this).closest('.field').removeClass('bad').find('.err').text('');
  });
  // digits only for PRN and phone
  $('#fPrn, #fPhone').on('input', function () { this.value = this.value.replace(/\D/g, ''); });
  $('#resetForm').on('click', function () { setTimeout(function () { $('.field').removeClass('bad'); $('.err').text(''); }, 0); });

  /* ---------- Events: cards, roster ---------- */
  $('#workshopList').on('click', '.js-pick', function () {
    var id = $(this).closest('.card').data('id');
    $('#fWorkshop').val(id);
    $('html, body').animate({ scrollTop: $('#registerSection').offset().top - 10 }, 350);
    $('#fName').trigger('focus');
  });

  $('#rosterBody').on('click', '.js-cancel', function () {
    var id = $(this).closest('tr').data('id');
    var r = state.regs.filter(function (x) { return x.id === id; })[0];
    if (!r || !window.confirm('Cancel registration for ' + r.name + '?')) return;
    state.regs = load(KEY_REGS, []).filter(function (x) { return x.id !== id; });
    save(KEY_REGS, state.regs);
    toast('Registration cancelled. Seat released.');
    sync(false);
  });

  $('#loadSample').on('click', function () {
    if (state.regs.length && !window.confirm('Replace the current roster with sample data?')) return;
    state.regs = makeSample(); save(KEY_REGS, state.regs);
    toast('Sample data loaded');
    sync(false);
  });

  $('#clearAll').on('click', function () {
    if (!window.confirm('Delete ALL registrations? This cannot be undone.')) return;
    state.regs = []; save(KEY_REGS, state.regs);
    toast('All registrations deleted');
    sync(false);
  });

  // search / filter / sort
  var searchDebounce;
  $('#rSearch').on('input', function () {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(renderRoster, 150);
  });
  $('#rWorkshop, #rDept').on('change', renderRoster);
  $('#rSort').on('change', function () {
    var p = this.value.split(':');
    state.sort = { key: p[0], dir: p[1] };
    renderRoster();
  });
  function headerSort() {
    var k = $(this).data('sort');
    state.sort = { key: k, dir: (state.sort.key === k && state.sort.dir === 'asc') ? 'desc' : 'asc' };
    renderRoster();
  }
  $('#rosterTable').on('click', 'th[data-sort]', headerSort)
    .on('keydown', 'th[data-sort]', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); headerSort.call(this); }
    });

  /* ---------- CSV export (current filtered + sorted view) ---------- */
  function csvCell(v) {
    v = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;           // block spreadsheet formula injection
    return '"' + v.replace(/"/g, '""') + '"';
  }
  $('#exportCsv').on('click', function () {
    var list = getVisibleRegs();
    if (!list.length) return;
    var head = ['Name', 'PRN', 'Email', 'Mobile', 'Department', 'Year', 'Session', 'Session date', 'Registered at'];
    var lines = [head.map(csvCell).join(',')];
    list.forEach(function (r) {
      var w = wsById(r.workshop);
      lines.push([r.name, r.prn, r.email, r.phone, r.dept, r.year,
        w ? w.title : r.workshop, w ? w.date + ' ' + w.time : '', new Date(r.time).toLocaleString()
      ].map(csvCell).join(','));
    });
    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = $('<a>').attr({ href: url, download: 'roster-' + new Date().toISOString().slice(0, 10) + '.csv' }).appendTo('body');
    a[0].click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
    toast('Exported ' + list.length + ' row' + (list.length > 1 ? 's' : '') + ' to CSV');
  });

  /* ---------- Auto-refresh timer ---------- */
  function resetCountdown() {
    clearInterval(state.tick);
    var s = state.settings.interval;
    if (!s) { $('#countdown').text(''); return; }
    state.remaining = s;
    $('#countdown').text(state.remaining + 's');
    state.tick = setInterval(function () {
      state.remaining--;
      if (state.remaining <= 0) { clearInterval(state.tick); sync(false); }
      else $('#countdown').text(state.remaining + 's');
    }, 1000);
  }

  $('#refreshInterval').on('change', function () {
    state.settings.interval = parseInt(this.value, 10) || 0;
    save(KEY_SET, state.settings);
    resetCountdown();
    toast(state.settings.interval ? 'Auto-refresh every ' + state.settings.interval + ' seconds' : 'Auto-refresh turned off');
  });
  $('#simulate').on('change', function () {
    state.settings.simulate = this.checked;
    save(KEY_SET, state.settings);
    toast(this.checked ? 'Simulating other students (enable auto-refresh to watch seats change)' : 'Simulation off');
  });
  $('#refreshNow').on('click', function () { sync(true); });

  // keep tabs in sync: another tab changed localStorage
  $(window).on('storage', function (e) {
    var k = e.originalEvent.key;
    if (k === KEY_REGS || k === KEY_EXT || k === null) sync(false);
  });
  // pause the timer visually when tab hidden, refresh on return
  document.addEventListener('visibilitychange', function () { if (!document.hidden) sync(false); });

  /* ---------- Init ---------- */
  var saved = load(KEY_SET, null);
  if (saved) $.extend(state.settings, saved);
  $('#refreshInterval').val(String(state.settings.interval));
  $('#simulate').prop('checked', !!state.settings.simulate);
  sync(false);
});
