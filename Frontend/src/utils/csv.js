export const parseCsv = (source) => {
  const text = String(source || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"' && cell.length === 0) {
      quoted = true;
    } else if (character === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell.trim());
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error('CSV has an unclosed quoted field.');
  row.push(cell.trim());
  if (row.some(value => value !== '')) rows.push(row);
  if (rows.length < 2) throw new Error('CSV must include a header row and at least one data row.');

  const headers = rows[0].map(header => header.trim().toLowerCase());
  if (headers.some(header => !header)) throw new Error('CSV headers cannot be empty.');
  if (new Set(headers).size !== headers.length) throw new Error('CSV contains duplicate headers.');

  return rows.slice(1).map((values, index) => {
    if (values.length > headers.length && values.slice(headers.length).some(Boolean)) {
      throw new Error(`CSV row ${index + 2} has more columns than the header.`);
    }
    return Object.fromEntries(headers.map((header, column) => [header, values[column] || '']));
  });
};

export const downloadCsvTemplate = (filename, headers, sample) => {
  const escapeCell = value => {
    const text = String(value ?? '');
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = [headers, sample].map(row => row.map(escapeCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
