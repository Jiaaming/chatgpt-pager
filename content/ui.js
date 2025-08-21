// ui.js — floating UI, styles, renderers
(function () {
  const NS = (window.CGPTPager = window.CGPTPager || {});

  NS.createDock = function () {
    const btn = document.createElement('div');
    Object.assign(btn.style, {
      position:'fixed', right:'16px', bottom:'16px', width:'44px', height:'44px',
      borderRadius:'999px', zIndex:'999999999', background:'#10a37f',
      boxShadow:'0 6px 24px rgba(0,0,0,.18)', display:'none', alignItems:'center',
      justifyContent:'center', cursor:'pointer', userSelect:'none'
    });
    btn.id = 'cgpt-pager-dock';
    btn.title = 'Open ChatGPT Pager';
    btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2a5 5 0 0 1 5 5v2h2a3 3 0 1 1 0 6h-2v2a5 5 0 1 1-10 0v-2H5a3 3 0 1 1 0-6h2V7a5 5 0 0 1 5-5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.documentElement.appendChild(btn);
    return btn;
  };

  NS.createPanel = function () {
    const host = document.createElement('div');
    host.id = 'cgpt-pager-host';
    Object.assign(host.style, {
      all:'initial', position:'fixed', zIndex:'999999999', right:'16px', bottom:'16px',
      width:'480px', maxWidth:'92vw', height:'580px', maxHeight:'82vh',
      borderRadius:'14px', overflow:'hidden', background:'transparent'
    });

    const shadow = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host {
        --panel-bg: #ffffff; --border: #d1d5db; --text: #0b0f19; --muted:#4b5563;
        --accent:#10a37f; --chip:#f3f4f6; --shadow: 0 12px 40px rgba(0,0,0,.18);
      }
      @media (prefers-color-scheme: dark) {
        :host {
          --panel-bg:#111827; --border:#374151; --text:#e5e7eb; --muted:#9ca3af;
          --accent:#10a37f; --chip:#1f2937; --shadow: 0 12px 40px rgba(0,0,0,.55);
        }
      }
      *{ box-sizing:border-box; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: var(--text);
         -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      a{ color: var(--accent); }
      .wrap{ position:relative; display:flex; flex-direction:column; height:100%; background-color:var(--panel-bg); border:1px solid var(--border); box-shadow:var(--shadow); }
      header{ display:flex; align-items:center; gap:8px; padding:10px; border-bottom:1px solid var(--border); }
      .logo{ width:18px; height:18px; border-radius:4px; display:inline-flex; align-items:center; justify-content:center; background:var(--accent); color:#fff; font-weight:700; }
      h1{ font-size:14px; font-weight:700; margin:0; letter-spacing:.3px; }
      input#search{ flex:1; padding:6px 10px; border:1px solid var(--border); background:transparent; border-radius:10px; outline:none; }
      .chip{ font-size:12px; padding:4px 8px; border:1px solid var(--border); border-radius:999px; background:var(--chip); cursor:pointer; }
      .iconbtn{ padding:6px 10px; border:1px solid var(--border); background:transparent; border-radius:10px; cursor:pointer; }
      .count{ font-size:12px; color: var(--muted); }

      main{ display:flex; flex:1; min-height:0; position:relative; }
      .list{ position:absolute; inset:0; overflow:auto; padding:10px; background-color:var(--panel-bg); }
      .list.hidden{ display:none; }

      .qa{ border:1px solid var(--border); border-radius:12px; padding:10px; margin:8px 0; cursor:pointer; background:transparent; transition: background .15s ease; }
      .qa:hover{ background: rgba(16,163,127,0.08); }
      .row{ display:flex; align-items:center; gap:8px; justify-content:space-between; }
      .q{ font-weight:600; font-size:13px; padding-right:6px; }
      .meta{ color:var(--muted); font-size:12px; margin-top:4px; display:flex; gap:8px; align-items:center; }

      .detail{ position:absolute; inset:0; display:none; flex-direction:column; z-index:2; background-color:var(--panel-bg); }
      .detail.show{ display:flex; }
      .d-head{ display:flex; align-items:center; gap:8px; padding:10px; border-bottom:1px solid var(--border); }
      .d-head button{ padding:6px 10px; border:1px solid var(--border); background:transparent; border-radius:10px; cursor:pointer; }
      .d-body{ padding:14px; overflow:auto; line-height:1.6; font-size:14px; }
      .d-body #qTitle{ font-size:15px; font-weight:600; margin:0 0 8px 0; }
      .d-body pre{ background:var(--chip); padding:10px; border-radius:10px; overflow:auto; }
      .d-body code{ background:var(--chip); padding:2px 4px; border-radius:6px; }

      footer{ padding:8px; border-top:1px solid var(--border); display:flex; gap:6px; flex-wrap:wrap; justify-content:center; background-color:var(--panel-bg); }
      .page{ padding:4px 10px; border:1px solid var(--border); background:transparent; border-radius:999px; cursor:pointer; font-size:12px; }
      .page.active{ border-color: var(--accent); }

      .dragbar{ position:absolute; left:0; top:0; right:0; height:10px; cursor:move; }
      .resize{ position:absolute; right:0; bottom:0; width:14px; height:14px; cursor:nwse-resize; }
    `;

    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    wrap.innerHTML = `
      <div class="dragbar" title="Drag to move"></div>
      <header>
        <span class="logo">G</span>
        <h1>ChatGPT Pager</h1>
        <span class="count" id="count"></span>
        <input id="search" placeholder="Search questions…" />
        <button id="sort" class="chip" title="Toggle sort">Newest</button>
        <button id="min" class="iconbtn" title="Minimize">—</button>
        <button id="close" class="iconbtn" title="Close">×</button>
      </header>
      <main>
        <div class="list" id="list"></div>
        <div class="detail" id="detail">
          <div class="d-head">
            <button id="back">← Back</button>
          </div>
          <div class="d-body">
            <div id="qTitle"></div>
            <div id="aBody"></div>
          </div>
        </div>
      </main>
      <footer id="pagination"></footer>
      <div class="resize" title="Resize"></div>
    `;

    shadow.append(style, wrap);
    document.documentElement.appendChild(host);

    // Drag to move
    (function () {
      const drag = wrap.querySelector('.dragbar');
      let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
      drag.addEventListener('mousedown', (e) => {
        dragging = true; sx = e.clientX; sy = e.clientY;
        const r = host.getBoundingClientRect(); ox = r.left; oy = r.top;
        e.preventDefault();
      });
      window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        host.style.right = 'auto'; host.style.bottom = 'auto';
        host.style.left = (ox + e.clientX - sx) + 'px';
        host.style.top  = (oy + e.clientY - sy) + 'px';
      });
      window.addEventListener('mouseup', () => { dragging = false; });
    })();

    // Resize
    (function () {
      const r = wrap.querySelector('.resize');
      let sw = 0, sh = 0, sx = 0, sy = 0, resizing = false;
      r.addEventListener('mousedown', (e) => {
        resizing = true; sx = e.clientX; sy = e.clientY;
        const rect = host.getBoundingClientRect(); sw = rect.width; sh = rect.height;
        e.preventDefault();
      });
      window.addEventListener('mousemove', (e) => {
        if (!resizing) return;
        host.style.width = Math.max(360, sw + (e.clientX - sx)) + 'px';
        host.style.height = Math.max(420, sh + (e.clientY - sy)) + 'px';
      });
      window.addEventListener('mouseup', () => { resizing = false; });
    })();

    return { host, wrap, shadow };
  };

  // Rendering helpers (called from content.js)
  NS.renderList = function (state) {
    const { root, items, page, keyword, sortDesc } = state;
    const list = root.querySelector('#list');
    const pag  = root.querySelector('#pagination');
    const detail = root.querySelector('#detail');
    const count  = root.querySelector('#count');

    detail.classList.remove('show');
    list.classList.remove('hidden');

    let filtered = keyword ? items.filter(it => it.question.toLowerCase().includes(keyword.toLowerCase())) : items;
    filtered = filtered.slice();
    if (sortDesc) filtered = filtered.reverse();
    count.textContent = `${filtered.length} items`;

    const { page: cur, total, slice } = CGPTPager.paginate(filtered, page, CGPTPager.PAGE_SIZE);

    list.innerHTML = slice.map(it => `
      <div class="qa" data-qid="${it.qId}">
        <div class="row">
          <div class="q">${CGPTPager.escapeHtml(it.question.slice(0, 180))}${it.question.length > 180 ? '…' : ''}</div>
        </div>
        <div class="meta">${it.answer ? 'Answered' : 'No answer'}</div>
      </div>
    `).join('');

    list.querySelectorAll('.qa').forEach(el => {
      el.addEventListener('click', () => {
        const qid = el.getAttribute('data-qid');
        const item = filtered.find(x => x.qId === qid) || items.find(x => x.qId === qid);
        NS.showDetail(state, item);
      });
    });

    pag.innerHTML = Array.from({ length: total }, (_, i) => i + 1).map(n =>
      `<button class="page ${n === cur ? 'active' : ''}" data-page="${n}">${n}</button>`
    ).join('');

    pag.querySelectorAll('.page').forEach(btn => {
      btn.addEventListener('click', () => {
        state.page = Number(btn.getAttribute('data-page'));
        NS.renderList(state);
      });
    });
  };

  NS.showDetail = function (state, item) {
    const list = state.root.querySelector('#list');
    const detail = state.root.querySelector('#detail');
    list.classList.add('hidden');
    detail.classList.add('show');
    state.root.querySelector('#qTitle').textContent = item.question;
    state.root.querySelector('#aBody').innerHTML = CGPTPager.mdToHtml(item.answer || '(no answer)');
    state.root.querySelector('#back').onclick = () => {
      detail.classList.remove('show');
      list.classList.remove('hidden');
      NS.renderList(state);
    };
  };
})();
