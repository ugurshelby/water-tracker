export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseInputAmount(str: string): number {
  const clean = str.trim().toLowerCase();
  let value = parseFloat(clean);
  if (isNaN(value)) return 0;

  if (clean.endsWith('l') || clean.endsWith('litre')) {
    value = value * 1000;
  } else if (clean.includes('.') && value < 10 && !clean.endsWith('ml')) {
    // assume liters
    value = value * 1000;
  }

  const result = Math.floor(value);
  return Math.max(1, Math.min(result, 5000));
}

export function formatDateToTurkish(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

export function getTodayFormatted(): string {
  const today = new Date();
  return `Bugün, ${today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}`;
}
