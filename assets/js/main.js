// === CruiseLink Main JS ===

// --- Inquiry Modal ---
function openInquiry(title, date, price, cruiseLine, ship, ports) {
  const modal = document.getElementById('inquiryModal');
  document.getElementById('modalProductName').textContent = title;
  document.getElementById('modalProductDetail').textContent = `출발: ${date} / $${price}~`;
  document.getElementById('f_product').value = title;
  document.getElementById('f_cruiseline').value = cruiseLine || '';
  document.getElementById('f_ship').value = ship || '';
  document.getElementById('f_date').value = date || '';
  document.getElementById('f_ports').value = ports || '';
  document.getElementById('f_price').value = price || '';
  document.getElementById('formStatus').className = 'form-status';
  document.getElementById('formStatus').textContent = '';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeInquiry() {
  document.getElementById('inquiryModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('click', function(e) {
  if (e.target.id === 'inquiryModal') closeInquiry();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeInquiry();
});

// --- EmailJS Submit ---
// EmailJS 설정 방법:
// 1. https://www.emailjs.com 무료 가입
// 2. Email Services > Add Service (Gmail 등 연결)
// 3. Email Templates > Create Template
//    - Subject: [크루즈링크] {{product_name}} 문의
//    - Body에 변수: {{product_name}}, {{cruise_line}}, {{ship}}, {{departure_date}}, {{ports}}, {{price}}, {{customer_name}}, {{customer_email}}, {{customer_phone}}, {{message}}
// 4. Account > API Keys에서 Public Key 확인
// 5. _config.yml의 emailjs 항목에 실제 값 입력

function submitInquiry(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');
  
  if (!document.getElementById('privacyAgree').checked) {
    status.className = 'form-status error';
    status.textContent = '개인정보 수집·이용에 동의해주세요.';
    return;
  }

  btn.disabled = true;
  btn.textContent = '전송 중...';

  // EmailJS가 로드되었는지 확인
  if (typeof emailjs !== 'undefined') {
    const form = document.getElementById('inquiryForm');
    emailjs.sendForm(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      form,
      EMAILJS_CONFIG.publicKey
    ).then(function() {
      status.className = 'form-status success';
      status.textContent = '문의가 성공적으로 전송되었습니다! 빠른 시일 내에 연락드리겠습니다.';
      form.reset();
      btn.disabled = false;
      btn.textContent = '문의하기 전송';
    }, function(err) {
      status.className = 'form-status error';
      status.textContent = '전송에 실패했습니다. 전화 또는 카카오톡으로 문의해주세요.';
      btn.disabled = false;
      btn.textContent = '문의하기 전송';
      console.error('EmailJS error:', err);
    });
  } else {
    // EmailJS 미설정 시 폴백
    status.className = 'form-status success';
    status.textContent = '문의가 접수되었습니다! (EmailJS 미설정 - 데모 모드)';
    btn.disabled = false;
    btn.textContent = '문의하기 전송';
  }
}

// EmailJS Config (from Jekyll config, set in default layout or here)
var EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',
  templateId: 'YOUR_TEMPLATE_ID',
  publicKey: 'YOUR_PUBLIC_KEY'
};

// --- Cruise List Filtering ---
function filterCruises() {
  const dest = (document.getElementById('f-dest') || {}).value || '';
  const port = (document.getElementById('f-port') || {}).value || '';
  const line = (document.getElementById('f-line') || {}).value || '';
  const month = (document.getElementById('f-month') || {}).value || '';
  const nights = (document.getElementById('f-nights') || {}).value || '';
  const price = (document.getElementById('f-price') || {}).value || '';
  const sort = (document.getElementById('sortSelect') || {}).value || 'featured';

  const items = document.querySelectorAll('.cruise-item');
  let visible = 0;
  const arr = Array.from(items);

  arr.forEach(item => {
    let show = true;
    if (dest && item.dataset.destination !== dest) show = false;
    if (port && !(item.dataset.port || '').includes(port)) show = false;
    if (line && item.dataset.cruiseline !== line) show = false;
    if (month && !item.dataset.month.startsWith(month)) show = false;
    if (nights) {
      const n = parseInt(item.dataset.nights);
      if (nights === 'short' && n > 7) show = false;
      if (nights === 'medium' && (n < 8 || n > 10)) show = false;
      if (nights === 'long' && n < 11) show = false;
    }
    if (price) {
      const [min, max] = price.split('-').map(Number);
      const p = parseInt(item.dataset.price);
      if (p < min || p > max) show = false;
    }
    item.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  // Sort
  const list = document.getElementById('cruiseList');
  if (list) {
    arr.sort((a, b) => {
      if (sort === 'price-asc') return parseInt(a.dataset.price) - parseInt(b.dataset.price);
      if (sort === 'price-desc') return parseInt(b.dataset.price) - parseInt(a.dataset.price);
      if (sort === 'date') return a.dataset.month.localeCompare(b.dataset.month);
      // featured: items with featured=true first
      const af = a.dataset.featured === 'true' ? 0 : 1;
      const bf = b.dataset.featured === 'true' ? 0 : 1;
      return af - bf;
    });
    arr.forEach(item => list.appendChild(item));
  }

  const counter = document.getElementById('resultCount');
  if (counter) counter.textContent = visible;
  const noResults = document.getElementById('noResults');
  if (noResults) {
    noResults.classList.toggle('hidden', visible > 0);
  }
}

// --- Multi-Select Dropdown ---
var destPorts = {
  '': ['부산','도쿄(요코하마)','나하(오키나와)','킬','로마(치비타베키아)','바르셀로나','마르세유','제노바','나폴리','베네치아','팔레르모','바리','피레우스(아테네)','시애틀','밴쿠버','앵커리지','마이애미','포트로더데일','포트카나베랄','뉴올리언스','탬파','갤버스턴','산후안','사우스햄프턴','코펜하겐','함부르크','암스테르담','킬(독일)','싱가포르','홍콩','상하이','방콕','오사카','후쿠오카','고베','호놀룰루','로스앤젤레스'],
  'korea': ['부산','도쿄(요코하마)','나하(오키나와)','킬'],
  'mediterranean': ['로마(치비타베키아)','바르셀로나','마르세유','제노바','나폴리','베네치아','팔레르모','바리','피레우스(아테네)'],
  'alaska': ['시애틀','밴쿠버','앵커리지'],
  'caribbean': ['마이애미','포트로더데일','포트카나베랄','뉴올리언스','탬파','갤버스턴','산후안'],
  'northern-europe': ['사우스햄프턴','코펜하겐','함부르크','암스테르담','킬(독일)'],
  'southeast-asia': ['싱가포르','홍콩','상하이','방콕'],
  'japan': ['도쿄(요코하마)','오사카','나하(오키나와)','후쿠오카','고베'],
  'hawaii': ['호놀룰루','로스앤젤레스','밴쿠버']
};

var portAliases = {
  '부산': ['busan','부산'],
  '도쿄(요코하마)': ['tokyo','yokohama','도쿄','요코하마'],
  '나하(오키나와)': ['naha','okinawa','나하','오키나와'],
  '킬': ['kiel','킬'],
  '로마(치비타베키아)': ['rome','civitavecchia','로마','치비타베키아'],
  '바르셀로나': ['barcelona','바르셀로나'],
  '마르세유': ['marseille','마르세유'],
  '제노바': ['genoa','제노바'],
  '나폴리': ['naples','나폴리'],
  '베네치아': ['venice','venezia','베네치아'],
  '팔레르모': ['palermo','팔레르모'],
  '바리': ['bari','바리'],
  '피레우스(아테네)': ['piraeus','athens','피레우스','아테네'],
  '시애틀': ['seattle','시애틀'],
  '밴쿠버': ['vancouver','밴쿠버'],
  '앵커리지': ['anchorage','앵커리지'],
  '마이애미': ['miami','마이애미'],
  '포트로더데일': ['lauderdale','포트로더데일','ft. lauderdale','fort lauderdale'],
  '포트카나베랄': ['canaveral','포트카나베랄'],
  '뉴올리언스': ['new orleans','뉴올리언스'],
  '탬파': ['tampa','탬파'],
  '갤버스턴': ['galveston','갤버스턴'],
  '산후안': ['san juan','산후안'],
  '사우스햄프턴': ['southampton','사우스햄프턴'],
  '코펜하겐': ['copenhagen','코펜하겐'],
  '함부르크': ['hamburg','함부르크'],
  '암스테르담': ['amsterdam','암스테르담'],
  '킬(독일)': ['kiel','킬'],
  '싱가포르': ['singapore','싱가포르'],
  '홍콩': ['hong kong','홍콩'],
  '상하이': ['shanghai','상하이'],
  '방콕': ['bangkok','방콕'],
  '오사카': ['osaka','오사카'],
  '후쿠오카': ['fukuoka','후쿠오카'],
  '고베': ['kobe','고베'],
  '호놀룰루': ['honolulu','호놀룰루'],
  '로스앤젤레스': ['los angeles','로스앤젤레스','la']
};

var lineAliases = {
  'msc': ['msc','엠에스씨'],
  'ncl': ['ncl','norwegian','노르웨이안'],
  'royal-caribbean': ['royal caribbean','로열캐리비안','로열','rci'],
  'celebrity': ['celebrity','셀레브리티'],
  'princess': ['princess','프린세스'],
  'carnival': ['carnival','카니발']
};

var lineDisplayNames = {
  'msc': 'MSC',
  'ncl': 'Norwegian (NCL)',
  'royal-caribbean': 'Royal Caribbean',
  'celebrity': 'Celebrity',
  'princess': 'Princess',
  'carnival': 'Carnival'
};

function toggleMultiSelect(id) {
  var el = document.getElementById(id);
  var dd = el.querySelector('.ms-dropdown');
  var isOpen = dd.style.display !== 'none';
  closeAllMultiSelects();
  if (!isOpen) {
    dd.style.display = '';
    var searchInput = dd.querySelector('.ms-search');
    if (searchInput) { searchInput.value = ''; filterMultiSelectOptions(id, ''); searchInput.focus(); }
  }
}

function closeAllMultiSelects() {
  document.querySelectorAll('.multi-select .ms-dropdown').forEach(function(dd) { dd.style.display = 'none'; });
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.multi-select')) closeAllMultiSelects();
});

function getMultiSelectValues(id) {
  var el = document.getElementById(id);
  var checked = el.querySelectorAll('.ms-options input[type="checkbox"]:checked');
  return Array.from(checked).map(function(cb) { return cb.value; });
}

function updateMultiSelectDisplay(id) {
  var el = document.getElementById(id);
  var selected = el.querySelector('.ms-selected');
  var vals = getMultiSelectValues(id);
  // Remove existing tags
  selected.querySelectorAll('.ms-tag').forEach(function(t) { t.remove(); });
  var placeholder = selected.querySelector('.ms-placeholder');
  if (vals.length === 0) {
    placeholder.style.display = '';
  } else {
    placeholder.style.display = 'none';
    vals.forEach(function(v) {
      var tag = document.createElement('span');
      tag.className = 'ms-tag';
      // Display name
      var displayName = v;
      if (id === 'ms-line' && lineDisplayNames[v]) displayName = lineDisplayNames[v];
      tag.innerHTML = displayName + '<span class="ms-remove" onclick="event.stopPropagation();removeMultiSelectValue(\'' + id + '\',\'' + v + '\')">×</span>';
      selected.insertBefore(tag, placeholder);
    });
  }
}

function removeMultiSelectValue(id, val) {
  var el = document.getElementById(id);
  var cb = el.querySelector('.ms-options input[value="' + val + '"]');
  if (cb) { cb.checked = false; }
  updateMultiSelectDisplay(id);
}

function filterMultiSelectOptions(id, query) {
  var el = document.getElementById(id);
  var labels = el.querySelectorAll('.ms-options label');
  var q = query.toLowerCase().trim();
  labels.forEach(function(label) {
    var val = label.querySelector('input').value;
    var text = label.textContent.toLowerCase();
    if (!q) { label.style.display = ''; return; }
    // Check label text
    if (text.indexOf(q) >= 0) { label.style.display = ''; return; }
    // Check aliases
    var aliases = (id === 'ms-port') ? (portAliases[val] || []) : (lineAliases[val] || []);
    var match = aliases.some(function(a) { return a.toLowerCase().indexOf(q) >= 0; });
    label.style.display = match ? '' : 'none';
  });
}

function populatePortOptions(dest) {
  var ports = destPorts[dest] || destPorts[''];
  var container = document.querySelector('#ms-port .ms-options');
  container.innerHTML = '';
  ports.forEach(function(p) {
    var label = document.createElement('label');
    var cb = document.createElement('input');
    cb.type = 'checkbox'; cb.value = p;
    cb.addEventListener('change', function() { updateMultiSelectDisplay('ms-port'); });
    label.appendChild(cb);
    label.appendChild(document.createTextNode(' ' + p));
    container.appendChild(label);
  });
  updateMultiSelectDisplay('ms-port');
}

function portMatchesCruise(portName, cruiseDeparturePort) {
  var dp = (cruiseDeparturePort || '').toLowerCase();
  var aliases = portAliases[portName] || [portName.toLowerCase()];
  return aliases.some(function(a) { return dp.indexOf(a.toLowerCase()) >= 0; });
}

// --- Home Search Button ---
document.addEventListener('DOMContentLoaded', function() {
  // Init port options
  populatePortOptions('');

  // Destination change → update port options
  var destSelect = document.getElementById('hf-dest');
  if (destSelect) {
    destSelect.addEventListener('change', function() { populatePortOptions(this.value); });
  }

  // Multi-select search inputs
  document.querySelectorAll('.multi-select .ms-search').forEach(function(input) {
    var msId = input.closest('.multi-select').id;
    input.addEventListener('input', function() { filterMultiSelectOptions(msId, this.value); });
  });

  // Line checkboxes change handler
  document.querySelectorAll('#ms-line .ms-options input[type="checkbox"]').forEach(function(cb) {
    cb.addEventListener('change', function() { updateMultiSelectDisplay('ms-line'); });
  });

  var homeBtn = document.getElementById('homeSearchBtn');
  var _homeData = null, _homeFiltered = [], _homePage = 0;
  if (homeBtn) {
    homeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      var dest = document.getElementById('hf-dest').value;
      var ports = getMultiSelectValues('ms-port');
      var lines = getMultiSelectValues('ms-line');
      var month = document.getElementById('hf-month').value;
      var nights = document.getElementById('hf-nights').value;
      function doFilter(data) {
        var today = new Date().toISOString().slice(0,10);
        var r = data.filter(function(c){ return (c.departureDate||'') >= today; });
        if (dest) r = r.filter(function(c){ return c.destination === dest; });
        if (ports.length > 0) {
          r = r.filter(function(c) {
            return ports.some(function(p) { return portMatchesCruise(p, c.departurePort); });
          });
        }
        if (lines.length > 0) r = r.filter(function(c){ return lines.indexOf(c.cruiseLine) >= 0; });
        if (month) r = r.filter(function(c){ return (c.departureDate||'').substring(0,7) === month; });
        if (nights === 'short') r = r.filter(function(c){ return c.nights <= 7; });
        else if (nights === 'medium') r = r.filter(function(c){ return c.nights >= 8 && c.nights <= 10; });
        else if (nights === 'long') r = r.filter(function(c){ return c.nights >= 11; });
        r.sort(function(a,b){ return (a.departureDate||'').localeCompare(b.departureDate||''); });
        return r;
      }
      function renderHome() {
        var grid = document.getElementById('homeResultGrid');
        var end = (_homePage + 1) * 24;
        var items = _homeFiltered.slice(0, end);
        var baseurl = '/cruiselink-blog';
        grid.innerHTML = items.map(function(c){
          var img = c.image && c.image !== 'default-cruise.jpg' ? (c.image.indexOf('http')===0 ? c.image : baseurl+'/assets/images/'+c.image) : '';
          var href = baseurl + '/cruise-view/?id=' + c.id;
          var cur = c.currency === 'EUR' ? '€' : '$';
          var price = c.priceFrom ? cur + c.priceFrom + '~' : '문의';
          var ports = (c.ports||[]).map(function(p){ return typeof p==='object'?p.name:p; }).filter(Boolean).slice(0,5).join(' → ');
          var tags = (c.tags||[]).map(function(t){ return '<span class="tag tag-'+t+'">'+t+'</span>'; }).join('');
          var hashtags = (c.hashtags||[]).map(function(h){ return '<span class="hashtag">'+h+'</span>'; }).join('');
          var lineName = c.cruiseLineName || c.cruiseLine || '';
          return '<div class="cruise-item">' +
            '<div class="cruise-item-image">' + (img?'<img src="'+img+'" alt="" loading="lazy">':'<div class="placeholder">🚢</div>') + '</div>' +
            '<div class="cruise-item-body"><div>' +
            '<div style="margin-bottom:6px;">'+tags+'</div>' +
            '<div class="cruise-item-meta">'+lineName+' · '+c.ship+'</div>' +
            '<div class="cruise-item-title"><a href="'+href+'">'+c.title+'</a></div>' +
            '<div class="cruise-item-ports">📍 '+ports+'</div>' +
            (hashtags?'<div class="cruise-item-hashtags">'+hashtags+'</div>':'') +
            '</div>' +
            '<div class="cruise-item-footer">' +
            '<div class="cruise-item-row">' +
            '<div class="cruise-item-info"><span>📅 '+c.departureDate+' ~ '+(c.returnDate||'')+'</span><span>🌙 '+c.nights+'박</span></div>' +
            '<div class="cruise-item-price">'+price+' <small>/1인</small></div>' +
            '</div>' +
            '<div class="cruise-item-actions">' +
            '<a href="'+href+'" class="btn btn-outline btn-sm">상세보기</a>' +
            '<button class="btn btn-primary btn-sm" onclick="openInquiry(\''+c.title+'\',\''+c.departureDate+'\',\''+(c.priceFrom||'')+'\',\''+lineName+'\',\''+c.ship+'\',\''+ports+'\')">문의하기</button>' +
            '</div></div></div></div>';
        }).join('');
        document.getElementById('homeResultCount').textContent = '(' + _homeFiltered.length + '개)';
        document.getElementById('homeResultMore').style.display = end < _homeFiltered.length ? '' : 'none';
        document.getElementById('homeSearchResults').style.display = '';
        document.getElementById('homeSearchResults').scrollIntoView({behavior:'smooth'});
      }
      function showLoading() {
        var res = document.getElementById('homeSearchResults');
        res.style.display = '';
        document.getElementById('homeResultGrid').innerHTML = '';
        document.getElementById('homeResultMore').style.display = 'none';
        document.getElementById('homeResultCount').textContent = '';
        document.getElementById('homeResultGrid').innerHTML = '<div style="text-align:center;padding:60px 0;"><div class="search-spinner"></div><p style="margin-top:16px;color:#666;font-size:14px;">크루즈 상품을 검색하고 있습니다...</p></div>';
        res.scrollIntoView({behavior:'smooth'});
      }
      function delayedRender() {
        _homePage = 0;
        showLoading();
        setTimeout(function(){ renderHome(); }, 2000);
      }
      if (_homeData) {
        _homeFiltered = doFilter(_homeData);
        delayedRender();
      } else {
        showLoading();
        fetch('/cruiselink-blog/assets/data/cruises.json').then(function(r){return r.json();}).then(function(data){
          _homeData = data;
          _homeFiltered = doFilter(data);
          homeBtn.textContent = '검색';
          setTimeout(function(){ renderHome(); }, 2000);
        });
      }
      // Load more
      var moreBtn = document.getElementById('homeLoadMore');
      if (moreBtn) moreBtn.onclick = function(){ _homePage++; renderHome(); };
    });
    // Close results
    var closeBtn = document.getElementById('homeResultClose');
    if (closeBtn) closeBtn.addEventListener('click', function(){ document.getElementById('homeSearchResults').style.display='none'; });
    // Search only on button click (no auto-trigger on select change)
  }

  // Apply URL params on cruise list page
  if (window.location.pathname.includes('/cruises')) {
    const params = new URLSearchParams(window.location.search);
    ['dest', 'line', 'month', 'nights'].forEach(key => {
      const el = document.getElementById('f-' + key);
      if (el && params.get(key)) el.value = params.get(key);
    });
    filterCruises();
  }

  // Promo slider
  initPromoSlider();
});

// --- Promo Slider ---
function initPromoSlider() {
  const slides = document.getElementById('promoSlides');
  const dotsContainer = document.getElementById('promoDots');
  if (!slides || !dotsContainer) return;

  const count = slides.children.length;
  let current = 0;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('button');
    dot.className = 'promo-dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goTo(i);
    dotsContainer.appendChild(dot);
  }

  function goTo(n) {
    current = n;
    slides.style.transform = `translateX(-${n * 100}%)`;
    dotsContainer.querySelectorAll('.promo-dot').forEach((d, i) => {
      d.classList.toggle('active', i === n);
    });
  }

  setInterval(() => goTo((current + 1) % count), 5000);
}

// --- Ship Image Slider ---
function slideMove(btn, dir) {
  const slider = btn.closest('.ship-slider-section').querySelector('.ship-slider');
  const slides = slider.querySelectorAll('.slide');
  const dots = btn.closest('.ship-slider-section').querySelectorAll('.dot');
  const counter = btn.closest('.ship-slider-section').querySelector('.current-slide');
  let current = parseInt(slider.dataset.current || 0);
  
  slides[current].classList.remove('active');
  if (dots[current]) dots[current].classList.remove('active');
  
  current = (current + dir + slides.length) % slides.length;
  
  slides[current].classList.add('active');
  if (dots[current]) dots[current].classList.add('active');
  if (counter) counter.textContent = current + 1;
  slider.dataset.current = current;
}

function goSlide(dot, idx) {
  const section = dot.closest('.ship-slider-section');
  const slider = section.querySelector('.ship-slider');
  const slides = slider.querySelectorAll('.slide');
  const dots = section.querySelectorAll('.dot');
  const counter = section.querySelector('.current-slide');
  let current = parseInt(slider.dataset.current || 0);
  
  slides[current].classList.remove('active');
  if (dots[current]) dots[current].classList.remove('active');
  
  slides[idx].classList.add('active');
  if (dots[idx]) dots[idx].classList.add('active');
  if (counter) counter.textContent = idx + 1;
  slider.dataset.current = idx;
}

// --- Facility Tabs ---
function switchFacilityTab(btn, idx) {
  const tabs = btn.closest('.facility-tabs');
  tabs.querySelectorAll('.facility-tab-btn').forEach(b => b.classList.remove('active'));
  tabs.querySelectorAll('.facility-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  tabs.querySelector('.facility-panel[data-panel="'+idx+'"]').classList.add('active');
}

// --- DAY Mini Slider ---
function initDaySliders() {
  document.querySelectorAll('.day-slider').forEach(function(slider) {
    var track = slider.querySelector('.day-slider-track');
    var imgs = track.querySelectorAll('img');
    var dots = slider.querySelector('.day-slider-dots');
    var current = 0;
    if (imgs.length <= 1) {
      var btns = slider.querySelectorAll('.day-slider-btn');
      btns.forEach(function(b){ b.style.display='none'; });
      if(dots) dots.style.display='none';
      return;
    }
    function goTo(i) {
      current = (i + imgs.length) % imgs.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      if(dots) {
        dots.querySelectorAll('.dot').forEach(function(d,idx){
          d.classList.toggle('active', idx===current);
        });
      }
    }
    slider.querySelector('.prev').addEventListener('click', function(){ goTo(current-1); });
    slider.querySelector('.next').addEventListener('click', function(){ goTo(current+1); });
    if(dots) {
      dots.querySelectorAll('.dot').forEach(function(d,idx){
        d.addEventListener('click', function(){ goTo(idx); });
      });
    }
  });
}

// --- DAY 더보기 toggle (펼치기/접기) ---
function toggleDay(btn) {
  var parent = btn.parentElement;
  var content = parent ? parent.querySelector('.day-expandable') : null;
  if (!content) {
    var prev = btn.previousElementSibling;
    while (prev) {
      if (prev.classList && prev.classList.contains('day-expandable')) { content = prev; break; }
      prev = prev.previousElementSibling;
    }
  }
  if (!content) return;
  var isOpen = content.classList.contains('open');
  content.classList.toggle('open');
  var arrow = btn.querySelector('.toggle-arrow');
  if (arrow) arrow.textContent = isOpen ? '▼' : '▲';
  btn.innerHTML = isOpen ? '📋 기항지 투어·자유여행 보기 <span class="toggle-arrow">▼</span>' : '📋 접기 <span class="toggle-arrow">▲</span>';
}

document.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    initDaySliders();
  }, 500);
});

// --- Logo Slider (duplicate for infinite loop) ---
(function() {
  var track = document.getElementById('logoTrack');
  if (!track) return;
  var items = track.innerHTML;
  track.innerHTML = items + items;
})();

// --- Destination Chip Slider ---
function destSlide(dir) {
  var slider = document.getElementById('destSlider');
  if (!slider) return;
  var card = slider.querySelector('.dest-card-slide') || slider.querySelector('.dest-chip');
  if (!card) return;
  var cardWidth = card.offsetWidth + 20;
  slider.scrollBy({ left: dir * cardWidth * 2, behavior: 'smooth' });
}

// Drag-to-scroll for dest slider
(function() {
  var slider = document.getElementById('destSlider');
  if (!slider) return;
  var isDown = false, startX, scrollLeft;
  slider.addEventListener('mousedown', function(e) {
    isDown = true; slider.style.cursor = 'grabbing';
    startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft;
    e.preventDefault();
  });
  slider.addEventListener('mouseleave', function() { isDown = false; slider.style.cursor = 'grab'; });
  slider.addEventListener('mouseup', function() { isDown = false; slider.style.cursor = 'grab'; });
  slider.addEventListener('mousemove', function(e) {
    if (!isDown) return; e.preventDefault();
    var x = e.pageX - slider.offsetLeft;
    slider.scrollLeft = scrollLeft - (x - startX);
  });
  // Touch support
  slider.addEventListener('touchstart', function(e) { startX = e.touches[0].pageX; scrollLeft = slider.scrollLeft; }, { passive: true });
  slider.addEventListener('touchmove', function(e) {
    var x = e.touches[0].pageX;
    slider.scrollLeft = scrollLeft - (x - startX);
  }, { passive: true });
  slider.style.cursor = 'grab';
})();

// Format cruise date ranges with day-of-week
(function() {
  var days = ['일','월','화','수','목','금','토'];
  document.querySelectorAll('.cruise-date-range').forEach(function(el) {
    var d = el.dataset.depart, r = el.dataset.return;
    if (!d) return;
    function fmt(s) {
      var p = s.split('-'), dt = new Date(+p[0], +p[1]-1, +p[2]);
      return p[0]+'.'+p[1]+'.'+p[2]+'('+days[dt.getDay()]+')';
    }
    el.textContent = '📅 ' + fmt(d) + (r ? ' ~ ' + fmt(r) : '');
  });
})();
