import html2pdf from 'html2pdf.js';

/**
 * Clean and normalize filename with extension
 */
export function getPdfFilename(docTitle) {
  let name = (docTitle || 'document').trim();
  if (name.endsWith('.md') || name.endsWith('.markdown')) {
    name = name.replace(/\.(md|markdown)$/i, '');
  }
  return `${name || 'document'}.pdf`;
}

/**
 * Export preview element to high definition PDF using html2pdf.js
 * @param {HTMLElement} element
 * @param {string} filename
 * @param {Function} onProgress
 */
export async function exportToPdf(element, filename, onProgress) {
  if (!element) return;

  // Clone element to avoid altering active preview during rendering
  const clone = element.cloneNode(true);

  // Apply print-friendly container styles to clone
  clone.style.width = '780px';
  clone.style.maxWidth = '780px';
  clone.style.padding = '20px 24px';
  clone.style.background = '#ffffff';
  clone.style.color = '#0f172a';
  clone.style.boxSizing = 'border-box';
  clone.style.fontSize = '12px';

  // Fix all svg widths inside clone
  const svgs = clone.querySelectorAll('svg');
  svgs.forEach(svg => {
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
  });

  // Temporarily append to body offscreen
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = '#ffffff';
  container.appendChild(clone);
  document.body.appendChild(container);

  const opt = {
    margin: [10, 10, 10, 10], // top, left, bottom, right in mm
    filename: filename || 'document.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
      windowWidth: 800
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy']
    }
  };

  try {
    if (onProgress) onProgress('start');
    await html2pdf().set(opt).from(clone).save();
    if (onProgress) onProgress('success');
  } catch (err) {
    console.error('Failed to export PDF:', err);
    if (onProgress) onProgress('error', err);
    throw err;
  } finally {
    // Clean up temporary DOM node
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Trigger native browser vector print (Print to PDF)
 */
export function printDocument() {
  window.print();
}

/**
 * Trigger download of raw markdown file
 * @param {string} content
 * @param {string} filename
 */
export function exportMarkdownFile(content, filename) {
  let name = (filename || 'document').trim();
  if (!name.endsWith('.md')) {
    name += '.md';
  }
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download Standalone HTML file
 * @param {string} htmlContent
 * @param {string} title
 */
export function exportHtmlFile(htmlContent, title) {
  let name = (title || 'document').replace(/\.(md|markdown)$/i, '') + '.html';
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title || 'Document')}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.7; padding: 40px; max-width: 880px; margin: 0 auto; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin: 1.5em 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; }
    th { background: #f1f5f9; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #3b82f6; background: #f8fafc; margin: 1em 0; padding: 8px 16px; }
    img { max-width: 100%; }
    .mermaid-wrapper { text-align: center; margin: 2em 0; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
