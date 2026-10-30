export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Smart compact currency formatting for dashboard KPI cards (e.g. ₹33L, ₹27.2L, ₹50k, ₹1.5Cr).
 * Prevents text overflow / ellipsis truncation on small cards and mobile layouts.
 */
export function formatCompactCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10_000_000) {
    // 1 Crore = 10,000,000
    const cr = abs / 10_000_000;
    const formatted = cr >= 10 ? cr.toFixed(1) : cr.toFixed(2);
    return `${sign}₹${formatted.replace(/\.?0+$/, '')} Cr`;
  }
  if (abs >= 100_000) {
    // 1 Lakh = 100,000
    const l = abs / 100_000;
    const formatted = l >= 10 ? l.toFixed(1) : l.toFixed(2);
    return `${sign}₹${formatted.replace(/\.?0+$/, '')}L`;
  }
  if (abs >= 1_000) {
    // 1 Thousand = 1,000
    const k = abs / 1_000;
    const formatted = k >= 10 ? k.toFixed(0) : k.toFixed(1);
    return `${sign}₹${formatted.replace(/\.?0+$/, '')}k`;
  }

  return `${sign}₹${Math.round(abs)}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  // Given YYYY-MM-DD
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${parseInt(day, 10)} ${months[monthIndex]} ${year}`;
    }
  }
  return dateString;
}
