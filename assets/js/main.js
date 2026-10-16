(function () {
  // Store hours in minutes after midnight, Baltimore time. Index = day of week (0 = Sunday).
  // Keep in sync with the hours sign in index.html and the Google data in its <head>.
  var HOURS = [null, [600, 1440], [600, 1440], [600, 1440], [600, 1440], [600, 1440], [600, 1440]];
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function fmt(m) {
    if (m >= 1440) return "midnight";
    var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return h + (mm ? ":" + String(mm).padStart(2, "0") : "") + ap;
  }

  // Current date and time in Baltimore, whatever the visitor's own time zone is.
  function nowInBaltimore() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
      weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
    }).formatToParts(new Date());
    var get = function (t) { return parts.find(function (p) { return p.type === t; }).value; };
    return {
      day: DAY_SHORT.indexOf(get("weekday")),
      min: (+get("hour")) * 60 + (+get("minute")),
      date: get("year") + "-" + get("month") + "-" + get("day")
    };
  }

  function updateStatus() {
    var n = nowInBaltimore(), el = document.getElementById("status"), txt = document.getElementById("status-text");
    document.querySelectorAll(".hours tr").forEach(function (tr) {
      tr.classList.toggle("today", tr.dataset.days.split(",").map(Number).indexOf(n.day) > -1);
    });
    var h = HOURS[n.day];
    if (h && n.min >= h[0] && n.min < h[1]) {
      el.dataset.open = "true";
      txt.textContent = "Open · till " + fmt(h[1]);
      return;
    }
    el.dataset.open = "false";
    if (h && n.min < h[0]) { txt.textContent = "Closed · open at " + fmt(h[0]); return; }
    for (var i = 1; i <= 7; i++) {
      var d = (n.day + i) % 7;
      if (HOURS[d]) {
        txt.textContent = "Closed · open " + (i === 1 ? "tomorrow" : DAY_NAMES[d]) + " " + fmt(HOURS[d][0]);
        return;
      }
    }
  }

  // ---- Tastings ----
  function toMin(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function dayOfWeek(iso) { var p = iso.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).getUTCDay(); }
  function shortDate(iso) { var p = iso.split("-"); return MONTHS[+p[1] - 1] + " " + (+p[2]); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function renderTastings(list) {
    var n = nowInBaltimore();
    // A tasting is upcoming until its end time on its own day.
    var isUpcoming = function (t) {
      return t.date > n.date || (t.date === n.date && n.min < toMin(t.end || "19:00"));
    };
    var upcoming = list.filter(isUpcoming).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var past = list.filter(function (t) { return !isUpcoming(t); }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });

    var next = upcoming[0];
    if (next) {
      var flyer = document.getElementById("flyer");
      var today = next.date === n.date;
      var span = fmt(toMin(next.start || "16:00")).replace(/(am|pm)$/, "") + "–" + fmt(toMin(next.end || "19:00"));
      flyer.replaceChildren(
        el("span", "k", (today ? "Tasting today" : "Next tasting") + " with"),
        el("span", "who", next.with),
        el("span", "when", (today ? "Today" : DAY_SHORT[dayOfWeek(next.date)] + " " + shortDate(next.date)) + " · " + span)
      );
      if (next.pouring) flyer.appendChild(el("p", "pour", next.pouring));
      flyer.appendChild(el("span", "addr", "4924 Harford Rd · (443) 869-3968"));
    }

    var shown = past.slice(0, 6);
    if (shown.length) {
      var ul = document.getElementById("past-list");
      shown.forEach(function (t) {
        var li = el("li");
        li.appendChild(el("span", "d", shortDate(t.date)));
        li.appendChild(el("span", null, t.with + (t.kind ? " · " + t.kind : "")));
        ul.appendChild(li);
      });
      document.getElementById("past-block").hidden = false;
    }
  }

  function loadTastings() {
    fetch("assets/data/tastings.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) { renderTastings(data.tastings || []); })
      .catch(function () { /* keep the fallback flyer */ });
  }

  try { updateStatus(); setInterval(updateStatus, 60000); } catch (e) {}
  loadTastings();
  document.getElementById("yr").textContent = new Date().getFullYear();
})();
