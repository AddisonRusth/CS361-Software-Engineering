const DEFAULT_SERVICE_URL = import.meta.env.VITE_PDF_SERVICE_URL || 'http://localhost:4000';

export async function exportCaseSummaryPDF(operation) {
  if (!operation) throw new Error('no_operation');

  const endpoint = `${DEFAULT_SERVICE_URL.replace(/\/$/, '')}/pdf-export`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation }),
  });

  if (!response.ok) {
    let message = 'Export failed. Please retry. No file was saved.';
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {}
    const err = new Error(message);
    err.code = 'export_failed';
    throw err;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `case-summary-${operation.id || 'export'}.pdf`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  return blob;
}
