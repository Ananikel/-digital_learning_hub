import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format money with CFA/Currency suffix
 */
export function formatMoney(amount: number) {
  return amount.toLocaleString() + " F";
}

/**
 * Basic HTML escaping for CSV/PDF
 */
export function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Download a CSV file from data
 */
export function downloadCsv(filename: string, data: any[]) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvLines = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(","))
  ];
  const csv = csvLines.join(String.fromCharCode(10));
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Clamp a number between min and max
 */
export function clampNumber(value: any, min = 0, max = 100) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return min;
  return Math.min(max, Math.max(min, numericValue));
}

/**
 * Calculate safe percentage
 */
export function safePercent(part: any, total: any) {
  const numericTotal = Number(total);
  if (!Number.isFinite(numericTotal) || numericTotal <= 0) return 0;
  return Math.round((Number(part) / numericTotal) * 100);
}

