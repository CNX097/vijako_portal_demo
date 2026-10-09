import dayjs from 'dayjs';

export const DATE_FMT = 'DD/MM/YYYY';
export const ISO = 'YYYY-MM-DD';

export const fmtDate = (d?: string) => (d ? dayjs(d).format(DATE_FMT) : '—');
export const fmtDateTime = (d?: string) => (d ? dayjs(d).format('HH:mm DD/MM/YYYY') : '—');
export const fmtMoney = (n?: number) => (n == null ? '—' : `${Math.round(n).toLocaleString('vi-VN')} ₫`);
export const today = () => dayjs().format(ISO);
export const nowIso = () => dayjs().format('YYYY-MM-DDTHH:mm:ss');

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[parts.length - 2][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2)).toUpperCase();
}

/** Màu avatar ổn định theo id */
export function avatarColor(id: string): string {
  const colors = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#db2777', '#4f46e5'];
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return colors[h % colors.length];
}

/** PRNG có seed — dữ liệu demo sinh ra giống nhau mỗi lần tải trang */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
export const fromMinutes = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
