import { parseMarkdown, renderMermaidDiagrams } from './utils/parser.js';
import { TEMPLATES, MERMAID_SNIPPETS } from './utils/constants.js';
import { exportToPdf, printDocument, exportMarkdownFile, exportHtmlFile, getPdfFilename } from './utils/exporter.js';

// DOM Element Selectors
const docTitleInput = document.getElementById('documentTitle');
const markdownInput = document.getElementById('markdownInput');
const lineNumbersEl = document.getElementById('lineNumbers');
const previewOutput = document.getElementById('previewOutput');
const previewContainer = document.getElementById('previewContainer');
const workspaceEl = document.getElementById('workspace');
const paneEditor = document.getElementById('paneEditor');
const panePreview = document.getElementById('panePreview');
const paneResizer = document.getElementById('paneResizer');
const toastContainer = document.getElementById('toastContainer');
const mermaidBadge = document.getElementById('mermaidBadge');
const saveIndicator = document.getElementById('saveIndicator');

// Stats Elements
const statWords = document.getElementById('statWords');
const statChars = document.getElementById('statChars');
const statLines = document.getElementById('statLines');
const statReadingTime = document.getElementById('statReadingTime');

// Control Buttons
const viewModeGroup = document.getElementById('viewModeGroup');
const btnSyncScroll = document.getElementById('btnSyncScroll');
const btnThemeToggle = document.getElementById('btnThemeToggle');
const btnFullscreen = document.getElementById('btnFullscreen');
const btnExportPdf = document.getElementById('btnExportPdf');
const btnDirectPdf = document.getElementById('btnDirectPdf');
const btnPrintPdf = document.getElementById('btnPrintPdf');
const btnExportMd = document.getElementById('btnExportMd');
const btnImport = document.getElementById('btnImport');
const fileInput = document.getElementById('fileInput');
const btnCopyHtml = document.getElementById('btnCopyHtml');
const editorToolbar = document.getElementById('editorToolbar');

// State Management
let isSyncScrollActive = true;
let isScrollingEditor = false;
let isScrollingPreview = false;
let renderDebounceTimer = null;
let currentTheme = localStorage.getItem('markflow_theme') || 'dark';

// Storage Keys
const DRAFT_KEY = 'markflow_draft_markdown';
const TITLE_KEY = 'markflow_draft_title';

/**
 * Initialize Application
 */
async function initApp() {
  // Apply saved theme
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Restore draft or load default welcome template
  const savedDraft = localStorage.getItem(DRAFT_KEY);
  const savedTitle = localStorage.getItem(TITLE_KEY);

  if (savedTitle) {
    docTitleInput.value = savedTitle;
  }

  const initialContent = (savedDraft !== null && savedDraft.trim() !== '') 
    ? savedDraft 
    : TEMPLATES.welcome;

  markdownInput.value = initialContent;

  // Render initial content
  updateLineNumbers();
  updateStats(initialContent);
  await renderContent(initialContent);

  // Bind all event listeners
  bindEditorEvents();
  bindToolbarEvents();
  bindHeaderEvents();
  bindSplitterEvents();
  bindDropdownEvents();
  bindKeyboardShortcuts();
}

/**
 * Render Markdown & Mermaid pipeline
 */
async function renderContent(rawText) {
  setMermaidBadgeStatus('rendering', '渲染中...');
  try {
    const html = parseMarkdown(rawText);
    previewOutput.innerHTML = html;

    // Attach copy event to generated code blocks
    setupCodeBlockCopyButtons();

    // Render Mermaid diagrams
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    await renderMermaidDiagrams(previewOutput, isDark, ({ count, hasError }) => {
      if (hasError) {
        setMermaidBadgeStatus('error', '语法告警');
      } else if (count > 0) {
        setMermaidBadgeStatus('success', `${count} 个图表就绪`);
      } else {
        setMermaidBadgeStatus('success', 'Mermaid 就绪');
      }
    });

    saveIndicator.textContent = '已自动保存';
    saveIndicator.classList.remove('unsaved');
  } catch (err) {
    console.error('Rendering error:', err);
    setMermaidBadgeStatus('error', '解析异常');
  }
}

/**
 * Debounced render on user input
 */
function handleInputChange() {
  saveIndicator.textContent = '输入中...';
  saveIndicator.classList.add('unsaved');

  const text = markdownInput.value;
  updateLineNumbers();
  updateStats(text);

  // Auto-save draft
  localStorage.setItem(DRAFT_KEY, text);

  clearTimeout(renderDebounceTimer);
  renderDebounceTimer = setTimeout(() => {
    renderContent(text);
  }, 220);
}

/**
 * Update Editor Line Numbers
 */
function updateLineNumbers() {
  const lineCount = (markdownInput.value.match(/\n/g) || []).length + 1;
  let numbersHtml = '';
  for (let i = 1; i <= lineCount; i++) {
    numbersHtml += `<div>${i}</div>`;
  }
  lineNumbersEl.innerHTML = numbersHtml;
}

/**
 * Update Document Statistics
 */
function updateStats(text) {
  const chars = text.length;
  // Count words (treat CJK characters as individual words, and English by space)
  const cjkChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const enWords = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/\b[a-zA-Z0-9_-]+\b/g) || []).length;
  const totalWords = cjkChars + enWords;
  const lines = (text.match(/\n/g) || []).length + 1;
  const readingTimeMin = Math.max(1, Math.ceil(totalWords / 260));

  statWords.textContent = totalWords.toLocaleString();
  statChars.textContent = chars.toLocaleString();
  statLines.textContent = lines.toLocaleString();
  statReadingTime.textContent = `${readingTimeMin} 分钟`;
}

/**
 * Status Badge helper
 */
function setMermaidBadgeStatus(type, text) {
  mermaidBadge.className = `badge-status badge-${type}`;
  const textEl = mermaidBadge.querySelector('.status-text');
  if (textEl) textEl.textContent = text;
}

/**
 * Bind Editor Events (Scroll sync, Tab support)
 */
function bindEditorEvents() {
  markdownInput.addEventListener('input', handleInputChange);

  // Sync scroll line numbers
  markdownInput.addEventListener('scroll', () => {
    lineNumbersEl.scrollTop = markdownInput.scrollTop;
    if (isSyncScrollActive && !isScrollingPreview) {
      isScrollingEditor = true;
      const editorScrollable = markdownInput.scrollHeight - markdownInput.clientHeight;
      if (editorScrollable > 0) {
        const ratio = markdownInput.scrollTop / editorScrollable;
        const previewScrollable = previewContainer.scrollHeight - previewContainer.clientHeight;
        previewContainer.scrollTop = ratio * previewScrollable;
      }
      setTimeout(() => { isScrollingEditor = false; }, 50);
    }
  });

  // Sync scroll preview
  previewContainer.addEventListener('scroll', () => {
    if (isSyncScrollActive && !isScrollingEditor) {
      isScrollingPreview = true;
      const previewScrollable = previewContainer.scrollHeight - previewContainer.clientHeight;
      if (previewScrollable > 0) {
        const ratio = previewContainer.scrollTop / previewScrollable;
        const editorScrollable = markdownInput.scrollHeight - markdownInput.clientHeight;
        markdownInput.scrollTop = ratio * editorScrollable;
        lineNumbersEl.scrollTop = markdownInput.scrollTop;
      }
      setTimeout(() => { isScrollingPreview = false; }, 50);
    }
  });

  // Tab key indentation support
  markdownInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      insertTextAtCursor('  ');
    }
  });
}

/**
 * Insert or wrap text around selection
 */
function wrapSelection(before, after = before, defaultText = '') {
  const start = markdownInput.selectionStart;
  const end = markdownInput.selectionEnd;
  const val = markdownInput.value;
  const selected = val.substring(start, end) || defaultText;

  const replacement = before + selected + after;
  markdownInput.value = val.substring(0, start) + replacement + val.substring(end);

  const newCursorPos = start + before.length + selected.length;
  markdownInput.focus();
  markdownInput.setSelectionRange(newCursorPos, newCursorPos);

  handleInputChange();
}

/**
 * Insert raw text at cursor
 */
function insertTextAtCursor(text) {
  const start = markdownInput.selectionStart;
  const end = markdownInput.selectionEnd;
  const val = markdownInput.value;

  markdownInput.value = val.substring(0, start) + text + val.substring(end);
  const newPos = start + text.length;
  markdownInput.focus();
  markdownInput.setSelectionRange(newPos, newPos);

  handleInputChange();
}

/**
 * Bind Formatting Toolbar
 */
function bindToolbarEvents() {
  editorToolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    switch (action) {
      case 'h1': wrapSelection('# ', '', '一级标题'); break;
      case 'h2': wrapSelection('## ', '', '二级标题'); break;
      case 'h3': wrapSelection('### ', '', '三级标题'); break;
      case 'bold': wrapSelection('**', '**', '粗体文本'); break;
      case 'italic': wrapSelection('*', '*', '斜体文本'); break;
      case 'strikethrough': wrapSelection('~~', '~~', '删除文本'); break;
      case 'inline-code': wrapSelection('`', '`', 'code'); break;
      case 'quote': wrapSelection('> ', '', '引用内容'); break;
      case 'ul': insertTextAtCursor('\n- 列表项目 1\n- 列表项目 2\n'); break;
      case 'ol': insertTextAtCursor('\n1. 第一步\n2. 第二步\n'); break;
      case 'task': insertTextAtCursor('\n- [ ] 待完成事项\n- [x] 已完成事项\n'); break;
      case 'table':
        insertTextAtCursor('\n| 列名称 1 | 列名称 2 | 状态 |\n| :--- | :--- | :---: |\n| 数据项 A | 详情内容 | ✅ 就绪 |\n| 数据项 B | 更多细节 | ⏳ 进行中 |\n');
        break;
      case 'codeblock':
        wrapSelection('```javascript\n', '\n```', '// 在此编写代码');
        break;
      case 'link':
        wrapSelection('[', '](https://example.com)', '链接文字');
        break;
      case 'hr':
        insertTextAtCursor('\n---\n');
        break;
    }
  });

  // Mermaid dropdown inserter
  const mermaidDropdown = document.getElementById('mermaidDropdown');
  mermaidDropdown.addEventListener('click', (e) => {
    const item = e.target.closest('[data-mermaid]');
    if (!item) return;
    const type = item.getAttribute('data-mermaid');
    const snippet = MERMAID_SNIPPETS[type];
    if (snippet) {
      insertTextAtCursor(`\n\n${snippet}\n\n`);
      showToast(`已插入 ${item.querySelector('.item-title').textContent.trim()}`, 'info');
    }
    mermaidDropdown.classList.remove('show');
  });

  // Copy rendered HTML button
  btnCopyHtml.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(previewOutput.innerHTML);
      showToast('渲染后的 HTML 已复制到剪贴板', 'success');
    } catch {
      showToast('复制失败，请检查剪贴板权限', 'error');
    }
  });
}

/**
 * Bind Header & Top Navigation controls
 */
function bindHeaderEvents() {
  // Document title change auto-save
  docTitleInput.addEventListener('input', () => {
    localStorage.setItem(TITLE_KEY, docTitleInput.value);
  });

  // View Mode toggles
  viewModeGroup.addEventListener('click', (e) => {
    const btn = e.target.closest('.segment-btn');
    if (!btn) return;
    viewModeGroup.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const view = btn.getAttribute('data-view');
    workspaceEl.className = 'workspace-layout';
    if (view === 'edit') workspaceEl.classList.add('mode-edit');
    else if (view === 'preview') workspaceEl.classList.add('mode-preview');
  });

  // Sync scroll toggle
  btnSyncScroll.addEventListener('click', () => {
    isSyncScrollActive = !isSyncScrollActive;
    btnSyncScroll.classList.toggle('active', isSyncScrollActive);
    showToast(`同步滚动已${isSyncScrollActive ? '开启' : '关闭'}`, 'info');
  });

  // Theme Toggle
  btnThemeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('markflow_theme', currentTheme);

    // Re-render Mermaid charts with new theme colors
    renderContent(markdownInput.value);
    showToast(`已切换至${currentTheme === 'dark' ? '深色' : '浅色'}模式`, 'info');
  });

  // Fullscreen
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        showToast('全屏请求失败: ' + err.message, 'error');
      });
    } else {
      document.exitFullscreen();
    }
  });

  // Templates menu selection
  const templatesMenu = document.getElementById('templatesMenu');
  templatesMenu.addEventListener('click', (e) => {
    const item = e.target.closest('[data-template]');
    if (!item) return;

    const templateKey = item.getAttribute('data-template');
    if (templateKey === 'clear') {
      if (confirm('确认清空编辑器内容吗？')) {
        markdownInput.value = '';
        docTitleInput.value = '未命名文档.md';
        localStorage.removeItem(DRAFT_KEY);
        localStorage.removeItem(TITLE_KEY);
        handleInputChange();
        showToast('编辑器已重置为空白', 'info');
      }
    } else if (TEMPLATES[templateKey]) {
      markdownInput.value = TEMPLATES[templateKey];
      handleInputChange();
      showToast(`已载入模版: ${item.querySelector('.item-title').textContent.trim()}`, 'success');
    }
    templatesMenu.classList.remove('show');
  });

  // Export Markdown file
  btnExportMd.addEventListener('click', () => {
    exportMarkdownFile(markdownInput.value, docTitleInput.value);
    showToast('Markdown 文件已开始下载', 'success');
  });

  // Import Markdown file
  btnImport.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      markdownInput.value = event.target.result;
      docTitleInput.value = file.name;
      handleInputChange();
      localStorage.setItem(TITLE_KEY, file.name);
      showToast(`成功导入文档: ${file.name}`, 'success');
    };
    reader.readAsText(file);
  });

  // PDF Export options
  btnDirectPdf.addEventListener('click', async () => {
    const pdfMenu = document.getElementById('pdfMenu');
    pdfMenu.classList.remove('show');

    const filename = getPdfFilename(docTitleInput.value);
    showToast('正在生成高清 PDF，请稍候...', 'info');

    try {
      await exportToPdf(previewOutput, filename, (status) => {
        if (status === 'success') {
          showToast(`PDF 导出成功: ${filename}`, 'success');
        }
      });
    } catch (err) {
      showToast('PDF 导出异常: ' + (err.message || '请尝试浏览器打印导出'), 'error');
    }
  });

  btnPrintPdf.addEventListener('click', () => {
    const pdfMenu = document.getElementById('pdfMenu');
    pdfMenu.classList.remove('show');
    showToast('正在启动浏览器矢量打印面板...', 'info');
    setTimeout(() => {
      printDocument();
    }, 300);
  });
}

/**
 * Dropdown trigger handlers
 */
function bindDropdownEvents() {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.dropdown-trigger');
    const allMenus = document.querySelectorAll('.dropdown-menu');

    if (trigger) {
      const parent = trigger.closest('.dropdown-wrapper');
      const menu = parent ? parent.querySelector('.dropdown-menu') : null;
      const isOpen = menu && menu.classList.contains('show');

      // Close all other dropdowns
      allMenus.forEach(m => m.classList.remove('show'));

      if (menu && !isOpen) {
        menu.classList.add('show');
      }
      return;
    }

    // Click outside dropdowns
    if (!e.target.closest('.dropdown-menu')) {
      allMenus.forEach(m => m.classList.remove('show'));
    }
  });
}

/**
 * Resizable split pane drag handler
 */
function bindSplitterEvents() {
  let isResizing = false;

  paneResizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    paneResizer.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const containerRect = workspaceEl.getBoundingClientRect();
    const minWidth = 280;
    const maxWidth = containerRect.width - minWidth;
    let newLeftWidth = e.clientX - containerRect.left;

    if (newLeftWidth < minWidth) newLeftWidth = minWidth;
    if (newLeftWidth > maxWidth) newLeftWidth = maxWidth;

    const percentage = (newLeftWidth / containerRect.width) * 100;
    paneEditor.style.flex = `0 0 ${percentage}%`;
    panePreview.style.flex = `0 0 ${100 - percentage}%`;
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      paneResizer.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
}

/**
 * Code block copy button bindings
 */
function setupCodeBlockCopyButtons() {
  const buttons = previewOutput.querySelectorAll('.code-copy-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const encoded = btn.getAttribute('data-code');
      const code = decodeURIComponent(encoded);
      try {
        await navigator.clipboard.writeText(code);
        const textSpan = btn.querySelector('span');
        if (textSpan) textSpan.textContent = '已复制 ✓';
        btn.style.color = 'var(--accent-emerald)';
        setTimeout(() => {
          if (textSpan) textSpan.textContent = '复制';
          btn.style.color = '';
        }, 1600);
      } catch {
        showToast('复制失败', 'error');
      }
    });
  });
}

/**
 * Keyboard Shortcuts
 */
function bindKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    if (modifier && e.key.toLowerCase() === 's') {
      e.preventDefault();
      localStorage.setItem(DRAFT_KEY, markdownInput.value);
      localStorage.setItem(TITLE_KEY, docTitleInput.value);
      showToast('草稿已安全保存至本地', 'success');
      return;
    }

    if (modifier && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      wrapSelection('**', '**', '粗体文本');
      return;
    }

    if (modifier && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      wrapSelection('*', '*', '斜体文本');
      return;
    }

    if (modifier && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      wrapSelection('[', '](https://)', '链接');
      return;
    }

    if (modifier && e.key === '1') {
      e.preventDefault();
      document.querySelector('[data-view="edit"]').click();
      return;
    }

    if (modifier && e.key === '2') {
      e.preventDefault();
      document.querySelector('[data-view="split"]').click();
      return;
    }

    if (modifier && e.key === '3') {
      e.preventDefault();
      document.querySelector('[data-view="preview"]').click();
      return;
    }
  });
}

/**
 * Display toast notification
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 200);
  }, 2600);
}

// Start application
initApp();
