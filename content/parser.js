// parser.js — DOM scraping + pairing + helpers
(function () {
  const NS = (window.CGPTPager = window.CGPTPager || {});

  NS.PAGE_SIZE = 10;

  NS.getConversationId = function () {
    return (location.pathname.match(/\/c\/([a-f0-9-]+)/i) || [])[1] || 'no-conversation';
  };

  function queryMessageNodes() {
    let nodes = Array.from(document.querySelectorAll('[data-message-author-role]'));
    if (nodes.length === 0) nodes = Array.from(document.querySelectorAll('[data-testid="conversation-turn"]'));
    if (nodes.length === 0) {
      nodes = Array.from(document.querySelectorAll('div')).filter(n => {
        const t = n.getAttribute('data-message-author-role') || '';
        return t === 'user' || t === 'assistant';
      });
    }
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
    const c = node.querySelector('.markdown, .prose, [data-message-content], .whitespace-pre-wrap');
    const raw = (c ? c.innerText : node.innerText) || '';
    return raw.trim();
  }

  NS.parseMessages = function () {
    const nodes = queryMessageNodes();
    const msgs = [];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const role = parseRole(n);
      if (!role) continue;
      const text = extractText(n);
      if (!text) continue;
      const id = n.getAttribute('data-message-id') || `dom-${i}`;
      msgs.push({ role, text, id });
    }
    return msgs;
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
