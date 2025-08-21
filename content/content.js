// content.js — wiring: state, observers, boot
(function () {
  if (window.__chatgptPagerSplitV1) return;
  window.__chatgptPagerSplitV1 = true;

  // State persistence helpers
  const STORAGE_KEY = 'chatgpt-pager-state';
  
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.warn('[ChatGPT Pager] Error loading saved state:', e);
      return {};
    }
  }
  
  function saveState(updates) {
    try {
      const current = loadState();
      const newState = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.warn('[ChatGPT Pager] Error saving state:', e);
    }
  }

  // Initialize state with saved preferences
  const savedState = loadState();
  const state = {
    root: null,
    items: [],
    page: 1,
    keyword: savedState.keyword || '',
    sortDesc: savedState.sortDesc || false
  };

  // Create UI
  const dock = CGPTPager.createDock();
  const { host, wrap } = CGPTPager.createPanel(savedState);
  state.root = wrap;
  
  // Restore saved search and sort preferences
  const searchInput = wrap.querySelector('#search');
  const sortBtn = wrap.querySelector('#sort');
  searchInput.value = state.keyword;
  if (state.sortDesc) {
    sortBtn.textContent = 'Oldest';
  }

  // Cleanup function for memory management
  function cleanup() {
    try {
      // Stop observing
      ob.disconnect();
      
      // Clear intervals
      clearInterval(routeCheckInterval);
      clearTimeout(timer);
      
      // Remove event listeners
      window.removeEventListener('popstate', handleRouteChange);
      document.removeEventListener('keydown', handleKeyDown);
      dock.removeEventListener('click', restore);
      
      // Remove DOM elements
      host.remove();
      dock.remove();
    } catch (e) {
      console.warn('[ChatGPT Pager] Error during cleanup:', e);
    }
  }

  // Dock behavior
  function minimize() { host.style.display = 'none'; dock.style.display = 'flex'; }
  function restore()  { host.style.display = 'block'; dock.style.display  = 'none'; }
  dock.addEventListener('click', restore);
  wrap.querySelector('#min').onclick   = minimize;
  wrap.querySelector('#close').onclick = cleanup;

  // Controls with state persistence
  searchInput.oninput = (e) => {
    state.keyword = e.target.value.trim();
    state.page = 1;
    saveState({ keyword: state.keyword });
    CGPTPager.renderList(state);
  };
  
  sortBtn.onclick = () => {
    state.sortDesc = !state.sortDesc;
    sortBtn.textContent = state.sortDesc ? 'Oldest' : 'Newest';
    saveState({ sortDesc: state.sortDesc });
    CGPTPager.renderList(state);
  };

  // Keyboard navigation
  function handleKeyDown(e) {
    const detail = wrap.querySelector('#detail');
    const isDetailView = detail.classList.contains('show');
    
    // ESC key - close detail view
    if (e.key === 'Escape' && isDetailView) {
      e.preventDefault();
      detail.classList.remove('show');
      wrap.querySelector('#list').classList.remove('hidden');
      CGPTPager.renderList(state);
      return;
    }
    
    // Arrow keys for pagination (only in list view)
    if (!isDetailView && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const filtered = state.keyword ? 
        state.items.filter(it => it.question.toLowerCase().includes(state.keyword.toLowerCase())) : 
        state.items;
      const total = Math.max(1, Math.ceil(filtered.length / CGPTPager.CONFIG.PAGE_SIZE));
      
      if (e.key === 'ArrowLeft' && state.page > 1) {
        state.page--;
        CGPTPager.renderList(state);
      } else if (e.key === 'ArrowRight' && state.page < total) {
        state.page++;
        CGPTPager.renderList(state);
      }
    }
  }
  
  // Add keyboard event listener
  document.addEventListener('keydown', handleKeyDown);

  // Scrape + render
  async function refresh() {
    try {
      const msgs = CGPTPager.parseMessages();
      state.items = CGPTPager.pairQA(msgs);
      CGPTPager.renderList(state);
    } catch (e) {
      console.error('[ChatGPT Pager] Error during refresh:', e);
    }
  }

  // Declare variables for cleanup
  let timer = null;
  let routeCheckInterval = null;
  const ob = new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(refresh, CGPTPager.CONFIG.REFRESH_DEBOUNCE);
  });
  
  function startObserving() {
    try {
      // Try to find the main chat container using configured selectors
      let chatContainer = null;
      for (const selector of CGPTPager.CONFIG.CHAT_CONTAINER_SELECTORS) {
        chatContainer = document.querySelector(selector);
        if (chatContainer) break;
      }
      
      if (!chatContainer) chatContainer = document.documentElement;
      
      ob.observe(chatContainer, { childList: true, subtree: true });
    } catch (e) {
      console.warn('[ChatGPT Pager] Could not observe chat container, falling back to document', e);
      ob.observe(document.documentElement, { childList: true, subtree: true });
    }
  }
  
  startObserving();

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
  
  function handleRouteChange() {
    if (location.href !== lastHref) {
      lastHref = location.href;
      refresh();
    }
  }
  
  // Listen for navigation events
  window.addEventListener('popstate', handleRouteChange);
  
  // For SPA navigation that doesn't trigger popstate, use less frequent polling
  routeCheckInterval = setInterval(handleRouteChange, CGPTPager.CONFIG.ROUTE_CHECK_INTERVAL);
})();
