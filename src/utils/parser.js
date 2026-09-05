import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark-dimmed.css';
import mermaid from 'mermaid';

// Unique counter for mermaid diagrams
let mermaidIdCounter = 0;

// Setup marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false
});

/**
 * Custom renderer for marked to support:
 * 1. Mermaid codeblock identification
 * 2. Pre-styled code blocks with Mac window controls & copy button
 * 3. Enhanced checkboxes for task lists
 */
const renderer = new marked.Renderer();

renderer.code = function({ text, lang }) {
  const language = (lang || '').trim().toLowerCase();

  // Special handling for Mermaid blocks
  if (language === 'mermaid') {
    mermaidIdCounter++;
    const chartId = `mermaid-chart-${Date.now()}-${mermaidIdCounter}`;
    // Encode code in base64 or HTML attribute safely
    const encoded = encodeURIComponent(text);
    return `
      <div class="mermaid-wrapper">
        <div class="mermaid-diagram" id="${chartId}" data-code="${encoded}">
          ${escapeHtml(text)}
        </div>
      </div>
    `;
  }

  // Highlight normal code blocks
  let highlighted = '';
  const validLang = language && hljs.getLanguage(language) ? language : null;

  try {
    if (validLang) {
      highlighted = hljs.highlight(text, { language: validLang, ignoreIllegals: true }).value;
    } else {
      highlighted = hljs.highlightAuto(text).value;
    }
  } catch (e) {
    highlighted = escapeHtml(text);
  }

  const displayLang = validLang || language || 'text';
  const encodedContent = encodeURIComponent(text);

  return `
    <div class="code-block-wrapper">
      <div class="code-block-header">
        <div class="window-dots">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        <span class="code-lang">${escapeHtml(displayLang)}</span>
        <button type="button" class="code-copy-btn" data-code="${encodedContent}" title="复制代码">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span>复制</span>
        </button>
      </div>
      <pre><code class="hljs language-${escapeHtml(displayLang)}">${highlighted}</code></pre>
    </div>
  `;
};

// Custom checkbox for task list
renderer.checkbox = function({ checked }) {
  return `<input type="checkbox" ${checked ? 'checked' : ''} disabled class="task-checkbox" /> `;
};

renderer.listitem = function(item) {
  if (item.task) {
    return `<li class="task-list-item">${item.text}</li>\n`;
  }
  return `<li>${item.text}</li>\n`;
};

marked.use({ renderer });

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Parse Markdown string into HTML
 */
export function parseMarkdown(rawContent) {
  if (!rawContent) return '';
  return marked.parse(rawContent);
}

/**
 * Initialize and render all Mermaid charts inside the given container
 * @param {HTMLElement} container
 * @param {boolean} isDark
 * @param {Function} onStatusChange (optional callback: { count, hasError })
 */
export async function renderMermaidDiagrams(container, isDark, onStatusChange) {
  const chartElements = container.querySelectorAll('.mermaid-diagram');
  const count = chartElements.length;

  if (count === 0) {
    if (onStatusChange) onStatusChange({ count: 0, hasError: false });
    return;
  }

  // Configure Mermaid theme
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: isDark ? 'dark' : 'default',
    themeVariables: isDark ? {
      darkMode: true,
      background: '#0e1424',
      primaryColor: '#3b82f6',
      primaryTextColor: '#f8fafc',
      primaryBorderColor: '#60a5fa',
      lineColor: '#94a3b8',
      secondaryColor: '#a855f7',
      tertiaryColor: '#1e293b'
    } : {
      darkMode: false,
      background: '#ffffff',
      primaryColor: '#3b82f6',
      primaryTextColor: '#0f172a',
      primaryBorderColor: '#2563eb',
      lineColor: '#64748b'
    },
    fontFamily: 'Inter, -apple-system, sans-serif'
  });

  let hasError = false;

  for (const el of chartElements) {
    const rawEncoded = el.getAttribute('data-code');
    const rawCode = rawEncoded ? decodeURIComponent(rawEncoded) : el.textContent.trim();
    const uniqueId = `mermaid-svg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      // Validate and render svg
      const { svg } = await mermaid.render(uniqueId, rawCode);
      el.innerHTML = svg;
      el.classList.add('rendered');
    } catch (err) {
      hasError = true;
      console.warn('Mermaid rendering error:', err);
      // Render friendly error card
      el.innerHTML = `
        <div class="mermaid-error">
          <div class="mermaid-error-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Mermaid 语法解析告警</span>
          </div>
          <div class="mermaid-error-content">${escapeHtml(err.message || String(err))}</div>
        </div>
      `;
    }
  }

  if (onStatusChange) {
    onStatusChange({ count, hasError });
  }
}
