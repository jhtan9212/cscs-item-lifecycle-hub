export function generateProjectNumber(): string {
  const year = new Date().getFullYear();
  const prefix = 'ISH';
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

export function formatDate(date: Date): string {
  return date.toISOString();
}

