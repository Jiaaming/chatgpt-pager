// markdown.js — safe, minimal Markdown (no headings/lists to avoid big fonts)
(function () {
  const NS = (window.CGPTPager = window.CGPTPager || {});

  NS.mdToHtml = function (md) {
    if (!md) return '';
    // escape
    let html = md.replace(/[&<>]/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[m]));
    // code blocks
    html = html.replace(/```([\s\S]*?)```/g, (m, p1) => `<pre><code>${p1.replace(/</g,'&lt;')}</code></pre>`);
    // inline code
    html = html.replace(/`([^`]+)`/g, (m, p1) => `<code>${p1.replace(/</g,'&lt;')}</code>`);
    // bold / italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // paragraphize
    html = html.split(/\n{2,}/).map(p => `<p>${p.trim()}</p>`).join('');
    return html;
  };
})();
