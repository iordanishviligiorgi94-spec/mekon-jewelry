import {initPendantHero} from './pendant-hero.js';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escape = (text) => String(text).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const instagram = 'https://www.instagram.com/mekon.jewelry';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let products = [], category = 'all', expanded = false, saved = new Set(), toastTimer, menuTimer;
try { const values = JSON.parse(localStorage.getItem('mekon-favorites') || '[]'); if (Array.isArray(values)) saved = new Set(values.filter(value => typeof value === 'string')); } catch { /* Storage may be unavailable in private browsing. */ }

function toast(message) {
  const node = $('.toast');
  node.textContent = message; node.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('visible'), 2800);
}
function syncSaved() {
  const count = saved.size;
  $('.bag-count').textContent = count; $('.bag-count').hidden = !count;
  $('#saved-open').setAttribute('aria-label', `რჩეული სამკაულები${count ? ', ' + count + ' მოდელი' : ''}`);
  $$('[data-save]').forEach(button => {
    const selected = saved.has(button.dataset.save), product = products.find(p => p.id === button.dataset.save);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${product?.name || 'სამკაული'} — ${selected ? 'რჩეულებიდან წაშლა' : 'რჩეულებში შენახვა'}`);
    if (button.classList.contains('detail-save')) button.innerHTML = `${selected ? 'შენახულია რჩეულებში' : 'შეინახე რჩეულებში'} ${icon('heart')}`;
  });
  try { localStorage.setItem('mekon-favorites', JSON.stringify([...saved])); } catch { /* Selections still work for this visit. */ }
}
function toggleSaved(id) {
  if (!products.some(p => p.id === id)) return;
  const existed = saved.has(id);
  existed ? saved.delete(id) : saved.add(id);
  syncSaved(); if ($('#saved-dialog').open) renderSaved();
  toast(existed ? 'სამკაული წაიშალა რჩეულებიდან' : 'სამკაული შენახულია რჩეულებში');
}
function renderProducts() {
  const filtered = products.filter(p => category === 'all' || p.category === category);
  const visible = expanded ? filtered : filtered.slice(0, 8);
  $('#product-grid').innerHTML = visible.map((p, i) => `<article class="product-card">
    <div class="product-image"><button class="product-open" data-product="${escape(p.id)}" aria-label="${escape(p.name)} — დეტალების ნახვა"><img src="${escape(p.photo)}" alt="${escape(p.name)} — ${escape(p.category)}" loading="lazy" width="900" height="900"><span class="quick-view">უფრო ახლოს ${icon('plus')}</span></button>${i < 2 && category === 'all' ? '<span class="product-tag">THE MEKON EDIT</span>' : ''}<button class="icon-button save-button" data-save="${escape(p.id)}" aria-pressed="${saved.has(p.id)}" aria-label="${escape(p.name)} — რჩეულებში შენახვა">${icon('heart')}</button></div>
    <div class="product-info"><span class="product-category">${escape(p.category)}</span><h3><button class="product-name" data-product="${escape(p.id)}">${escape(p.name)}</button></h3><div class="product-bottom"><a href="${instagram}" target="_blank" rel="noopener noreferrer" aria-label="${escape(p.name)} — ფასის გაგება Instagram-ზე">ფასი პირადში ↗</a><span title="ოქროსფერი" aria-label="ოქროსფერი"></span></div></div></article>`).join('');
  $('#product-count').textContent = `${visible.length} / ${filtered.length} მოდელი`;
  $('#show-more').hidden = filtered.length <= 8;
  $('#show-more').innerHTML = `${expanded ? 'ნაკლები მოდელი' : `ყველა მოდელის ნახვა (${filtered.length})`} ${icon(expanded ? 'arrow' : 'plus')}`;
  $$('.filter').forEach(button => {
    const active = button.dataset.filter === category;
    button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
  });
  syncSaved();
}
function selectCategory(value) { category = value; expanded = false; renderProducts(); }

function closeMenus() {
  clearTimeout(menuTimer);
  $('#mega-menu').hidden = true; $('.menu-scrim').hidden = true; $('#mobile-menu').hidden = true;
  $$('.nav-menu-trigger, .mobile-menu-toggle').forEach(button => button.setAttribute('aria-expanded', 'false'));
  $('.mobile-menu-toggle').setAttribute('aria-label', 'მენიუს გახსნა');
  document.body.classList.remove('menu-open');
}
const feature = (id, label) => {
  const product = products.find(p => p.id === id);
  return product ? `<a href="#collection" data-category="${escape(product.category)}" class="menu-feature"><img src="${escape(product.photo)}" alt="${escape(product.name)}"><span>${label} ${icon('diagonal')}</span></a>` : '';
};
function openMenu(name) {
  if (window.innerWidth <= 1000) return;
  clearTimeout(menuTimer);
  const panels = {
    jewelry: `<div><h3>კატეგორიები</h3><ul><li><a href="#collection" data-category="all">ყველა სამკაული</a></li><li><a href="#collection" data-category="ყელსაბამი">ყელსაბამები</a></li><li><a href="#collection" data-category="სამაჯური">სამაჯურები</a></li><li><a href="#collection" data-category="საყურეები">საყურეები</a></li></ul></div><div><h3>აღმოაჩინე</h3><ul><li><a href="#collection" data-category="all">ახალი მოდელები</a></li><li><a href="#gifts">პატარა საჩუქრები</a></li><li><a href="#about">MEKON-ის სამყარო</a></li><li><a href="#order">როგორ შევუკვეთო</a></li></ul></div>${feature('blue-clover','ცოტა ფერი შენს დღეში')}${feature('enamel-earrings','დეტალები, რომლებიც გვიყვარს')}`,
    gifts: `<div><h3>საჩუქრის იდეები</h3><ul><li><a href="#gifts">მისთვის, ვინც გიყვარს</a></li><li><a href="#gifts">მეგობრისთვის</a></li><li><a href="#collection" data-category="all">საკუთარი თავისთვის</a></li></ul></div><div><h3>აირჩიე შენი</h3><ul><li><a href="#collection" data-category="ყელსაბამი">ყელსაბამები</a></li><li><a href="#collection" data-category="სამაჯური">სამაჯურები</a></li><li><a href="#order">შეკვეთა და მიწოდება</a></li></ul></div>${feature('bow-necklace','სიყვარულით, შენგან')}${feature('teddy-pink','ერთი პატარა ღიმილი')}`,
    world: `<div><h3>MEKON WORLD</h3><ul><li><a href="#about">ჩვენი სამყარო</a></li><li><a href="#contact">იყავი ჩვენთან ახლოს</a></li><li><a href="#order">როგორ შევუკვეთო</a></li></ul></div><div><h3>შემოგვიერთდი</h3><ul><li><a href="${instagram}" target="_blank" rel="noopener noreferrer">Instagram ↗</a></li><li><a href="https://www.facebook.com/share/1EYkemG7tF/" target="_blank" rel="noopener noreferrer">Facebook ↗</a></li><li><a href="https://www.tiktok.com/@mekon.jewelry" target="_blank" rel="noopener noreferrer">TikTok ↗</a></li></ul></div>${feature('butterfly-rainbow','შენი ყოველდღიური ბრწყინვალება')}${feature('flower-pearl','პატარა დეტალები. დიდი ემოციები.')}`
  };
  $('#mega-menu').innerHTML = panels[name]; $('#mega-menu').hidden = false; $('.menu-scrim').hidden = false;
  $$('.nav-menu-trigger').forEach(button => button.setAttribute('aria-expanded', String(button.dataset.menu === name)));
}
$$('.nav-menu-trigger').forEach(button => {
  button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') openMenu(button.dataset.menu); });
  button.addEventListener('click', () => openMenu(button.dataset.menu));
  button.addEventListener('keydown', event => { if (event.key === 'ArrowDown') { event.preventDefault(); openMenu(button.dataset.menu); $('#mega-menu a')?.focus(); } });
});
$('#site-header').addEventListener('pointerleave', () => { menuTimer = setTimeout(closeMenus, 170); });
$('#site-header').addEventListener('pointerenter', () => clearTimeout(menuTimer));
$('#site-header').addEventListener('focusout', event => { if (!$('#site-header').contains(event.relatedTarget)) closeMenus(); });
$('.menu-scrim').addEventListener('click', closeMenus);
$('.mobile-menu-toggle').addEventListener('click', () => {
  const willOpen = $('#mobile-menu').hidden;
  closeMenus();
  $('#mobile-menu').hidden = !willOpen;
  $('.mobile-menu-toggle').setAttribute('aria-expanded', String(willOpen));
  $('.mobile-menu-toggle').setAttribute('aria-label', willOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა');
  document.body.classList.toggle('menu-open', willOpen);
});
window.addEventListener('resize', closeMenus, {passive:true});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    const activeTrigger = $('.nav-menu-trigger[aria-expanded="true"]');
    const mobileOpen = !$('#mobile-menu').hidden;
    closeMenus();
    if (activeTrigger) activeTrigger.focus();
    if (mobileOpen) $('.mobile-menu-toggle').focus();
  }
});

function openDialog(id) {
  closeMenus();
  $$('dialog[open]').forEach(dialog => dialog.close());
  const dialog = $(id); dialog.showModal(); document.body.style.overflow = 'hidden';
}
$$('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { if (!$('dialog[open]')) document.body.style.overflow = ''; });
});
function openProduct(id) {
  const p = products.find(item => item.id === id); if (!p) return;
  $('#product-detail').innerHTML = `<div class="product-detail"><img src="${escape(p.photo)}" alt="${escape(p.name)}"><div class="product-detail-copy"><span class="eyebrow">MEKON / ${escape(p.category)}</span><h2>${escape(p.name)}</h2><p>ერთი პატარა დეტალი შენი ყოველდღიური ბრწყინვალებისთვის.</p><p class="product-inquiry">ფასი და მარაგი — პირად შეტყობინებაში.<br>მოგვწერე მოდელის სახელი: „${escape(p.name)}“.</p><a class="button button-dark" href="${instagram}" target="_blank" rel="noopener noreferrer">შეკვეთა Instagram-ზე ${icon('diagonal')}</a><button class="text-link detail-save" data-save="${escape(p.id)}" aria-pressed="${saved.has(p.id)}">შეინახე რჩეულებში ${icon('heart')}</button></div></div>`;
  syncSaved(); openDialog('#product-dialog');
}
function renderSearch() {
  const term = $('#search-input').value.toLocaleLowerCase().trim();
  const result = products.filter(p => `${p.name} ${p.category}`.toLocaleLowerCase().includes(term));
  $('#search-results').innerHTML = result.length ? result.map(p => `<button class="search-result" data-product="${escape(p.id)}"><img src="${escape(p.photo)}" alt="" loading="lazy">${escape(p.name)}<small>${escape(p.category)}</small></button>`).join('') : '<p class="empty-state">ამ სახელით სამკაული ვერ მოიძებნა.<br>სცადე სხვა სახელი ან კატეგორია.</p>';
}
function renderSaved() {
  const selected = products.filter(p => saved.has(p.id));
  $('#saved-products').innerHTML = selected.length ? selected.map(p => `<div class="saved-item"><button data-product="${escape(p.id)}" aria-label="${escape(p.name)} — დეტალები"><img src="${escape(p.photo)}" alt=""></button><div class="saved-info"><button data-product="${escape(p.id)}">${escape(p.name)}</button><small>${escape(p.category)}</small></div><button class="icon-button" data-save="${escape(p.id)}" aria-label="${escape(p.name)} — რჩეულებიდან წაშლა" aria-pressed="true">${icon('close')}</button></div>`).join('') : `<div class="empty-state">${icon('heart')}აქ შენი საყვარელი სამკაულები შეინახება.<br>კოლექციაში დააჭირე გულის ნიშნულს.<br><button class="button button-outline" data-browse>აღმოაჩინე კოლექცია ${icon('arrow')}</button></div>`;
  $('.saved-footer').hidden = !selected.length;
}
$('#search-open').addEventListener('click', () => { renderSearch(); openDialog('#search-dialog'); $('#search-input').focus(); });
$('#search-input').addEventListener('input', renderSearch);
$('#saved-open').addEventListener('click', () => { renderSaved(); openDialog('#saved-dialog'); });
$('#payment-open').addEventListener('click', () => openDialog('#payment-dialog'));
$('#show-more').addEventListener('click', () => { expanded = !expanded; renderProducts(); if (!expanded) $('#collection').scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth'}); });
document.addEventListener('click', async event => {
  const target = event.target.closest('button, a'); if (!target) return;
  if (target.dataset.save) { toggleSaved(target.dataset.save); return; }
  if (target.dataset.product) { openProduct(target.dataset.product); return; }
  if (target.hasAttribute('data-close')) { target.closest('dialog').close(); return; }
  if (target.hasAttribute('data-browse')) { target.closest('dialog').close(); $('#collection').scrollIntoView({behavior:reducedMotion.matches ? 'instant' : 'smooth'}); return; }
  if (target.dataset.filter) selectCategory(target.dataset.filter);
  if (target.dataset.category) selectCategory(target.dataset.category);
  if (target.closest('.mega-menu, .mobile-menu') && target.tagName === 'A') closeMenus();
  if (target.dataset.copy) {
    try { await navigator.clipboard.writeText(target.dataset.copy); toast('ანგარიშის ნომერი დაკოპირებულია'); }
    catch { toast('დააკოპირე ანგარიშის ნომერი ტექსტის მონიშვნით'); }
  }
});

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), {threshold:0.08});
if (!reducedMotion.matches) { document.documentElement.classList.add('js-reveal'); $$('.reveal').forEach(node => observer.observe(node)); }

initPendantHero(reducedMotion);
fetch('assets/products.json').then(response => {
  if (!response.ok) throw new Error('Collection unavailable'); return response.json();
}).then(data => {
  products = data;
  saved = new Set([...saved].filter(id => products.some(p => p.id === id)));
  renderProducts();
}).catch(() => {
  $('#product-grid').innerHTML = `<p class="empty-state">კოლექცია ამჯერად ვერ ჩაიტვირთა. <a href="https://mekon-jewelry.vercel.app/#collection">იხილე ყველა მოდელი ჩვენს საიტზე ↗</a></p>`;
  $('#show-more').hidden = true;
});
