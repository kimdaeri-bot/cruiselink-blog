// === CruiseLink Client-Side Cruise List ===
// Handles 14,000+ cruises with pagination & filtering

(function() {
  'use strict';

  var PER_PAGE = 24;
  var allCruises = [];
  var filtered = [];
  var currentPage = 1;
  var searchTimer = null;
  var activeLineFilter = '';
  var days = ['일','월','화','수','목','금','토'];

  // Load JSON data
  function init() {
    var indicator = document.getElementById('loadingIndicator');
    if (indicator) indicator.style.display = 'inline';

    fetch('/cruiselink-blog/assets/data/cruises.json')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        allCruises = data;
        if (indicator) indicator.style.display = 'none';
        applyURLParams();
        window.applyFilters();
      })
      .catch(function(err) {
        console.error('Failed to load cruises:', err);
        if (indicator) indicator.textContent = '데이터 로딩 실패';
      });
  }

  function applyURLParams() {
    var params = new URLSearchParams(window.location.search);
    ['dest', 'line', 'month', 'nights'].forEach(function(key) {
      var el = document.getElementById('f-' + key);
      if (el && params.get(key)) el.value = params.get(key);
    });
    if (params.get('line')) {
      activeLineFilter = params.get('line');
      updateLineButtons();
    }
    if (params.get('q')) {
      var searchEl = document.getElementById('f-search');
      if (searchEl) searchEl.value = params.get('q');
    }
  }

  function getFilters() {
    return {
      dest: val('f-dest'),
      line: activeLineFilter || val('f-line'),
      month: val('f-month'),
      nights: val('f-nights'),
      price: val('f-price'),
      search: (val('f-search') || '').toLowerCase(),
      sort: val('sortSelect') || 'featured'
    };
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  function applyFilters() {
    var f = getFilters();
    currentPage = 1;

    filtered = allCruises.filter(function(c) {
      if (f.dest && c.destination !== f.dest) return false;
      if (f.line && c.cruiseLine !== f.line) return false;
      if (f.month && (!c.departureDate || c.departureDate.indexOf(f.month) !== 0)) return false;
      if (f.nights) {
        var n = c.nights || 0;
        if (f.nights === 'short' && n > 7) return false;
        if (f.nights === 'medium' && (n < 8 || n > 10)) return false;
        if (f.nights === 'long' && n < 11) return false;
      }
      if (f.price) {
        var parts = f.price.split('-').map(Number);
        var p = c.priceFrom || 0;
        if (p < parts[0] || p > parts[1]) return false;
      }
      if (f.search) {
        var hay = ((c.title || '') + ' ' + (c.ship || '') + ' ' + (c.departurePort || '') + ' ' + (c.ports || []).join(' ') + ' ' + (c.destinationName || '')).toLowerCase();
        if (hay.indexOf(f.search) === -1) return false;
      }
      return true;
    });

    // Sort: 한국출발 first, then by sort option
    filtered.sort(function(a, b) {
      var aKR = (a.tags || []).indexOf('한국출발') !== -1 ? 0 : 1;
      var bKR = (b.tags || []).indexOf('한국출발') !== -1 ? 0 : 1;
      if (aKR !== bKR) return aKR - bKR;

      if (f.sort === 'price-asc') return (a.priceFrom || 99999) - (b.priceFrom || 99999);
      if (f.sort === 'price-desc') return (b.priceFrom || 0) - (a.priceFrom || 0);
      if (f.sort === 'date') return (a.departureDate || '').localeCompare(b.departureDate || '');
      // featured
      var af = a.featured ? 0 : 1;
      var bf = b.featured ? 0 : 1;
      return af - bf;
    });

    renderPage();
  }

  function renderPage() {
    var list = document.getElementById('cruiseList');
    var countEl = document.getElementById('resultCount');
    var noResults = document.getElementById('noResults');

    var total = filtered.length;
    if (countEl) countEl.textContent = total;
    if (noResults) noResults.classList.toggle('hidden', total > 0);

    var start = (currentPage - 1) * PER_PAGE;
    var page = filtered.slice(start, start + PER_PAGE);

    var html = '';
    for (var i = 0; i < page.length; i++) {
      html += renderCard(page[i]);
    }
    list.innerHTML = html;

    renderPagination(total);

    // Format dates
    list.querySelectorAll('.cruise-date-range').forEach(function(el) {
      var d = el.dataset.depart, r = el.dataset.return;
      if (!d) return;
      function fmt(s) {
        var p = s.split('-');
        var dt = new Date(+p[0], +p[1]-1, +p[2]);
        return p[0]+'.'+p[1]+'.'+p[2]+'('+days[dt.getDay()]+')';
      }
      el.textContent = '📅 ' + fmt(d) + (r ? ' ~ ' + fmt(r) : '');
    });

    // Scroll to top of list
    if (currentPage > 1) {
      list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderCard(c) {
    var tags = (c.tags || []).map(function(t) {
      return '<span class="tag tag-' + t + '">' + t + '</span>';
    }).join('');

    var ports = (c.ports || []).join(' → ');
    var hashtags = (c.hashtags || []).map(function(h) {
      return '<span class="hashtag">' + h + '</span>';
    }).join('');

    var priceHtml = '';
    if (c.priceFrom) {
      var symbol = c.currency === 'EUR' ? '€' : '$';
      priceHtml = symbol + c.priceFrom.toLocaleString() + '~ <small>/1인</small>';
    } else {
      priceHtml = '<small>가격문의</small>';
    }

    var imgHtml;
    if (c.image && c.image !== 'default-cruise.jpg') {
      imgHtml = '<img src="/cruiselink-blog/assets/images/' + c.image + '" alt="' + (c.title || '') + '" loading="lazy">';
    } else {
      imgHtml = '<div class="placeholder">🚢</div>';
    }

    var inquiryArgs = "'" + esc(c.title) + "','" + esc(c.departureDate) + "','" + (c.priceFrom || '') + "','" + esc(c.cruiseLineName) + "','" + esc(c.ship) + "','" + esc((c.ports || []).join(', ')) + "'";

    return '<div class="cruise-item">' +
      '<div class="cruise-item-image">' + imgHtml + '</div>' +
      '<div class="cruise-item-body">' +
        '<div>' +
          '<div style="margin-bottom:6px;">' + tags + '</div>' +
          '<div class="cruise-item-meta">' + (c.cruiseLineName || '') + ' · ' + (c.ship || '') + '</div>' +
          '<div class="cruise-item-title">' + (c.title || '') + '</div>' +
          '<div class="cruise-item-ports">📍 ' + ports + '</div>' +
          (hashtags ? '<div class="cruise-item-hashtags">' + hashtags + '</div>' : '') +
        '</div>' +
        '<div class="cruise-item-footer">' +
          '<div class="cruise-item-row">' +
            '<div class="cruise-item-info">' +
              '<span class="cruise-date-range" data-depart="' + (c.departureDate || '') + '" data-return="' + (c.returnDate || '') + '"></span>' +
              '<span>🌙 ' + (c.nights || '') + '박</span>' +
            '</div>' +
            '<div class="cruise-item-price">' + priceHtml + '</div>' +
          '</div>' +
          '<div class="cruise-item-actions">' +
            '<button class="btn btn-outline btn-sm" onclick="openInquiry(' + inquiryArgs + ')">상세보기</button>' +
            '<button class="btn btn-primary btn-sm" onclick="openInquiry(' + inquiryArgs + ')">문의하기</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function esc(s) {
    return (s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  function renderPagination(total) {
    var pagEl = document.getElementById('pagination');
    if (!pagEl) return;

    var totalPages = Math.ceil(total / PER_PAGE);
    if (totalPages <= 1) { pagEl.innerHTML = ''; return; }

    var html = '';
    // Prev
    if (currentPage > 1) {
      html += '<button class="pag-btn" onclick="goPage(' + (currentPage - 1) + ')">‹ 이전</button>';
    }

    // Page numbers
    var start = Math.max(1, currentPage - 3);
    var end = Math.min(totalPages, currentPage + 3);
    if (start > 1) {
      html += '<button class="pag-btn" onclick="goPage(1)">1</button>';
      if (start > 2) html += '<span class="pag-ellipsis">…</span>';
    }
    for (var i = start; i <= end; i++) {
      html += '<button class="pag-btn' + (i === currentPage ? ' active' : '') + '" onclick="goPage(' + i + ')">' + i + '</button>';
    }
    if (end < totalPages) {
      if (end < totalPages - 1) html += '<span class="pag-ellipsis">…</span>';
      html += '<button class="pag-btn" onclick="goPage(' + totalPages + ')">' + totalPages + '</button>';
    }

    // Next
    if (currentPage < totalPages) {
      html += '<button class="pag-btn" onclick="goPage(' + (currentPage + 1) + ')">다음 ›</button>';
    }

    pagEl.innerHTML = html;
  }

  // Globals
  window.applyFilters = applyFilters;

  window.goPage = function(p) {
    currentPage = p;
    renderPage();
  };

  window.setLineFilter = function(btn) {
    activeLineFilter = btn.dataset.line || '';
    updateLineButtons();
    applyFilters();
  };

  function updateLineButtons() {
    document.querySelectorAll('.line-filter-btn').forEach(function(b) {
      b.classList.toggle('active', (b.dataset.line || '') === activeLineFilter);
    });
  }

  window.onSearchInput = function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 300);
  };

  // Init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
