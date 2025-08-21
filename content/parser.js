// parser.js — DOM scraping + pairing + helpers
(function () {
  const NS = (window.CGPTPager = window.CGPTPager || {});

  // Configuration constants
  NS.CONFIG = {
    PAGE_SIZE: 10,
    REFRESH_DEBOUNCE: 300,
    ROUTE_CHECK_INTERVAL: 3000,
    MESSAGE_SELECTORS: [
      '[data-message-author-role]',
      '[data-testid="conversation-turn"]'
    ],
    CONTENT_SELECTORS: [
      '.markdown',
      '.prose', 
      '[data-message-content]',
      '.whitespace-pre-wrap'
    ],
    CHAT_CONTAINER_SELECTORS: [
      'main',
      '[role="main"]',
      '.conversation-turn'
    ]
  };

  // Backward compatibility
  NS.PAGE_SIZE = NS.CONFIG.PAGE_SIZE;

  NS.getConversationId = function () {
    return (location.pathname.match(/\/c\/([a-f0-9-]+)/i) || [])[1] || 'no-conversation';
  };

  // Cache successful selector for performance
  let cachedSelector = null;

  function queryMessageNodes() {
    // Try cached selector first
    if (cachedSelector) {
      const nodes = Array.from(document.querySelectorAll(cachedSelector));
      if (nodes.length > 0) return nodes;
      // Cache is stale, clear it
      cachedSelector = null;
    }

    // Try each selector and cache the successful one
    for (const selector of NS.CONFIG.MESSAGE_SELECTORS) {
      const nodes = Array.from(document.querySelectorAll(selector));
      if (nodes.length > 0) {
        cachedSelector = selector;
        return nodes;
      }
    }

    // Fallback to filtering all divs
    const nodes = Array.from(document.querySelectorAll('div')).filter(n => {
      const t = n.getAttribute('data-message-author-role') || '';
      return t === 'user' || t === 'assistant';
    });
    return nodes;
  }

  function parseRole(node) {
    const attr = node.getAttribute('data-message-author-role');
    if (attr === 'user' || attr === 'assistant') return attr;
    const label = node.getAttribute('aria-label') || '';
    if (/assistant/i.test(label)) return 'assistant';
    if (/user|you/i.test(label)) return 'user';
    return null;
  }

  function extractText(node) {
    try {
      const selectorString = NS.CONFIG.CONTENT_SELECTORS.join(', ');
      const c = node.querySelector(selectorString);
      const raw = (c ? c.innerText : node.innerText) || '';
      return raw.trim();
    } catch (e) {
      console.warn('[ChatGPT Pager] Error extracting text from node:', e);
      return '';
    }
  }

  NS.parseMessages = function () {
    try {
      const nodes = queryMessageNodes();
      const msgs = [];
      for (let i = 0; i < nodes.length; i++) {
        try {
          const n = nodes[i];
          const role = parseRole(n);
          if (!role) continue;
          const text = extractText(n);
          if (!text) continue;
          const id = n.getAttribute('data-message-id') || `dom-${i}`;
          msgs.push({ role, text, id });
        } catch (e) {
          console.warn('[ChatGPT Pager] Error parsing message node:', e);
          continue;
        }
      }
      return msgs;
    } catch (e) {
      console.error('[ChatGPT Pager] Error parsing messages:', e);
      return [];
    }
  };

  NS.pairQA = function (messages) {
    const items = [];
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.role === 'user') {
        let ans = null;
        for (let j = i + 1; j < messages.length; j++) {
          if (messages[j].role === 'assistant') { ans = messages[j]; break; }
          if (messages[j].role === 'user') break;
        }
        items.push({ qId: m.id, aId: ans?.id || null, question: m.text, answer: ans?.text || '' });
      }
    }
    return items;
  };

  NS.paginate = function (arr, page, size) {
    const total = Math.max(1, Math.ceil(arr.length / size));
    const p = Math.min(Math.max(1, page), total);
    const start = (p - 1) * size;
    return { page: p, total, slice: arr.slice(start, start + size) };
  };

  NS.escapeHtml = s => s.replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
})();
