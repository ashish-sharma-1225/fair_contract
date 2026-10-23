import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ClauseCategory, RiskSeverity } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function truncateHash(hash: string, lead = 8, trail = 8): string {
  if (!hash || hash.length <= lead + trail) return hash;
  return `${hash.slice(0, lead)}...${hash.slice(-trail)}`;
}

export async function computeFileSha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getCategoryLabel(category: ClauseCategory): string {
  switch (category) {
    case 'payment':
      return 'Payment Terms';
    case 'renewal':
      return 'Automatic Renewal';
    case 'liability':
      return 'Liability & Indemnity';
    case 'jurisdiction':
      return 'Governing Law & Venue';
    case 'other':
    default:
      return 'General Terms';
  }
}

export function getCategoryBadgeClasses(category: ClauseCategory): string {
  switch (category) {
    case 'payment':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'renewal':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'liability':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'jurisdiction':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case 'other':
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function getSeverityClasses(severity: RiskSeverity): {
  badge: string;
  pill: string;
  bgLight: string;
  border: string;
  text: string;
} {
  switch (severity) {
    case 'high':
      return {
        badge: 'bg-red-50 text-red-700 border-red-200',
        pill: 'bg-red-600 text-white',
        bgLight: 'bg-red-50/50',
        border: 'border-red-200',
        text: 'text-red-700',
      };
    case 'medium':
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        pill: 'bg-amber-500 text-white',
        bgLight: 'bg-amber-50/50',
        border: 'border-amber-200',
        text: 'text-amber-700',
      };
    case 'low':
      return {
        badge: 'bg-sky-50 text-sky-700 border-sky-200',
        pill: 'bg-sky-600 text-white',
        bgLight: 'bg-sky-50/50',
        border: 'border-sky-200',
        text: 'text-sky-700',
      };
  }
}
