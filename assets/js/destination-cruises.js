/**
 * Client-side cruise loader for destination pages
 */
function loadDestinationCruises(config) {
  const {
    containerId = 'cruise-container',
    destinations = [],
    filterFn = null,
    linePriority = {},
    perPage = 24
  } = config;

  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<p style="text-align:center;padding:40px;">크루즈 상품을 불러오는 중... ⏳</p>';

  fetch('/cruiselink-blog/assets/data/cruises.json')
    .then(r => r.json())
    .then(cruises => {
      // Filter
      let filtered;
      if (filterFn) {
        filtered = cruises.filter(filterFn);
      } else {
        filtered = cruises.filter(c => destinations.includes(c.destination));
      }

      // Sort: departureDate asc, then linePriority
      filtered.sort((a, b) => {
        const da = a.departureDate || '';
        const db = b.departureDate || '';
        if (da < db) return -1;
        if (da > db) return 1;
        const pa = linePriority[a.cruiseLine] ?? 99;
        const pb = linePriority[b.cruiseLine] ?? 99;
        return pa - pb;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;">해당 크루즈 상품이 없습니다.</p>';
        return;
      }

      // Render with pagination
      let shown = 0;
      const listEl = document.createElement('div');
      listEl.className = 'cruise-list';
      container.innerHTML = '';
      container.appendChild(listEl);

      function renderBatch() {
        const end = Math.min(shown + perPage, filtered.length);
        for (let i = shown; i < end; i++) {
          listEl.insertAdjacentHTML('beforeend', renderCard(filtered[i]));
        }
        shown = end;
        updateBtn();
      }

      const btnWrap = document.createElement('div');
      btnWrap.style.cssText = 'text-align:center;margin:32px 0;';
      const moreBtn = document.createElement('button');
      moreBtn.className = 'btn btn-outline';
      moreBtn.textContent = '더 보기';
      moreBtn.onclick = renderBatch;
      btnWrap.appendChild(moreBtn);
      container.appendChild(btnWrap);

      // Count display
      const countEl = document.createElement('p');
      countEl.style.cssText = 'text-align:center;color:#666;margin-bottom:16px;';
      container.insertBefore(countEl, listEl);

      function updateBtn() {
        countEl.textContent = '총 ' + filtered.length + '개 상품 중 ' + shown + '개 표시';
        btnWrap.style.display = shown >= filtered.length ? 'none' : '';
      }

      renderBatch();
    })
    .catch(() => {
      container.innerHTML = '<p style="text-align:center;padding:40px;color:red;">데이터를 불러오지 못했습니다.</p>';
    });
}

function renderCard(c) {
  const baseurl = '/cruiselink-blog';
  // Image
  let imgHtml;
  if (c.image && c.image !== 'default-cruise.jpg') {
    const src = c.image.startsWith('http') ? c.image : baseurl + '/assets/images/' + c.image;
    imgHtml = '<img src="' + escHtml(src) + '" alt="' + escHtml(c.title) + '" loading="lazy">';
  } else {
    imgHtml = '<div class="placeholder">🚢</div>';
  }

  // Tags
  let tagsHtml = '';
  if (c.tags && c.tags.length) {
    tagsHtml = c.tags.map(t => '<span class="tag tag-' + escHtml(t) + '">' + escHtml(t) + '</span>').join('');
  }

  // Hashtags
  let hashtagsHtml = '';
  if (c.hashtags && c.hashtags.length) {
    hashtagsHtml = '<div class="cruise-item-hashtags">' + c.hashtags.map(h => '<span class="hashtag">' + escHtml(h) + '</span>').join('') + '</div>';
  }

  // Price
  let priceHtml;
  if (c.priceFrom) {
    const sym = c.currency === 'EUR' ? '€' : '$';
    priceHtml = sym + c.priceFrom + '~ <small>/1인</small>';
  } else {
    priceHtml = '문의';
  }

  // Detail link
  const detailUrl = c.detail_page ? c.detail_page : baseurl + '/cruise-view/?id=' + c.id;

  // Korea badge
  const koreaBadge = (c.tags && c.tags.includes('한국출발')) ? ' 🇰🇷' : '';

  // Ports
  const portsStr = c.ports ? c.ports.join(' → ') : '';

  // cruiseLineName fallback
  const lineName = c.cruiseLineName || c.cruiseLine || '';

  // Inquiry params
  const inqParams = [c.title, c.departureDate, c.priceFrom, lineName, c.ship, portsStr].map(v => escAttr(v || '')).join("','");

  return '<div class="cruise-item">' +
    '<div class="cruise-item-image">' + imgHtml + '</div>' +
    '<div class="cruise-item-body"><div>' +
    '<div style="margin-bottom:6px;">' + tagsHtml + koreaBadge + '</div>' +
    '<div class="cruise-item-meta">' + escHtml(lineName) + ' · ' + escHtml(c.ship || '') + '</div>' +
    '<div class="cruise-item-title"><a href="' + escAttr(detailUrl) + '">' + escHtml(c.title) + '</a></div>' +
    '<div class="cruise-item-ports">📍 ' + escHtml(portsStr) + '</div>' +
    hashtagsHtml +
    '</div>' +
    '<div class="cruise-item-footer">' +
    '<div class="cruise-item-row">' +
    '<div class="cruise-item-info">' +
    '<span class="cruise-date-range" data-depart="' + escAttr(c.departureDate) + '" data-return="' + escAttr(c.returnDate) + '">📅 ' + escHtml(c.departureDate || '') + ' ~ ' + escHtml(c.returnDate || '') + '</span>' +
    '<span>🌙 ' + (c.nights || '?') + '박</span>' +
    '</div>' +
    '<div class="cruise-item-price">' + priceHtml + '</div>' +
    '</div>' +
    '<div class="cruise-item-actions">' +
    '<a href="' + escAttr(detailUrl) + '" class="btn btn-outline btn-sm">상세보기</a>' +
    '<button class="btn btn-primary btn-sm" onclick="openInquiry(\'' + inqParams + '\')">문의하기</button>' +
    '</div></div></div></div>';
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escAttr(s) { return String(s).replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
