// content.js — wiring: state, observers, boot
(function () {
  if (window.__chatgptPagerSplitV1) return;
  window.__chatgptPagerSplitV1 = true;

  const state = {
    root: null,
    items: [],
    page: 1,
    keyword: '',
    sortDesc: false
  };

  // Create UI
  const dock = CGPTPager.createDock();
  const { host, wrap } = CGPTPager.createPanel();
  state.root = wrap;

  // Dock behavior
  function minimize() { host.style.display = 'none'; dock.style.display = 'flex'; }
  function restore()  { host.style.display = 'block'; dock.style.display  = 'none'; }
  dock.addEventListener('click', restore);
  wrap.querySelector('#min').onclick   = minimize;
  wrap.querySelector('#close').onclick = () => { host.remove(); dock.remove(); };

  // Controls
  wrap.querySelector('#search').oninput = (e) => {
    state.keyword = e.target.value.trim();
    state.page = 1;
    CGPTPager.renderList(state);
  };
  const sortBtn = wrap.querySelector('#sort');
  sortBtn.onclick = () => {
    state.sortDesc = !state.sortDesc;
    sortBtn.textContent = state.sortDesc ? 'Oldest' : 'Newest';
    CGPTPager.renderList(state);
  };

  // Scrape + render
  async function refresh() {
    const msgs = CGPTPager.parseMessages();
    state.items = CGPTPager.pairQA(msgs);
    CGPTPager.renderList(state);
  }

  // Observe DOM for updates
  let timer = null;
  const ob = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(refresh, 300);
  });
  ob.observe(document.documentElement, { childList: true, subtree: true });

  // Initial render (retry a few times to catch late DOM)
  (async () => {
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 350));
      await refresh();
      if (state.items.length) break;
    }
  })();

  // Handle SPA route changes (conversation scope)
  let lastHref = location.href;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      refresh();
    }
  }, 800);
})();
