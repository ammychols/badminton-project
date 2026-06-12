// Design tokens — edit here to change styles app-wide

export const btn = {
  primary: 'bg-[var(--p)] text-[var(--p-text)] px-4 py-2 rounded-2xl text-sm font-medium hover:bg-[var(--p-h)] transition-colors',
  primaryIcon: 'bg-[var(--p)] text-[var(--p-text)] px-4 py-2 rounded-2xl text-sm font-medium hover:bg-[var(--p-h)] transition-colors flex items-center gap-1.5',
  primaryLg: 'bg-[var(--p)] text-[var(--p-text)] px-6 py-3 rounded-2xl text-sm font-medium hover:bg-[var(--p-h)] transition-colors',
  ghost: 'text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors',
  danger: 'flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors',
  cancel: 'flex-1 py-2.5 rounded-xl border border-[var(--input-b)] text-sm text-[var(--text-2)] hover:bg-[var(--hover-bg)] transition-colors',
  pill: 'px-3.5 py-1.5 rounded-full text-sm font-medium transition-all',
  pillActive: 'bg-[var(--p)] text-[var(--p-text)]',
  pillInactive: 'bg-white border border-[var(--input-b)] text-[var(--text-4)] hover:border-[var(--input-f)]',
};

export const card = {
  base: 'bg-white border border-[var(--card-border)] rounded-2xl shadow-md',
  padded: 'bg-white border border-[var(--card-border)] rounded-2xl p-4 shadow-md',
  dark: 'bg-[var(--p)] rounded-3xl p-5 text-white',
};

export const input = {
  base: 'w-full border border-[var(--input-b)] rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--input-f)] bg-white',
  select: 'w-full border border-[var(--input-b)] rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--input-f)] bg-white',
  textarea: 'w-full border border-[var(--input-b)] rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--input-f)] resize-none',
  timeSelect: 'flex-1 border border-[var(--input-b)] rounded-xl px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--input-f)] bg-white appearance-none text-center',
};

export const text = {
  pageTitle: 'text-xl font-bold text-[var(--text-1)]',
  cardTitle: 'text-base font-semibold text-[var(--text-1)]',
  body: 'text-sm text-[var(--text-2)]',
  meta: 'text-xs text-[var(--text-3)]',
  label: 'block text-sm font-medium text-[var(--text-2)] mb-1',
};

export const chip = {
  base: 'text-xs px-2.5 py-1 rounded-full font-medium',
  gray: 'bg-[var(--chip-bg)] text-[var(--chip-t)]',
};

export const emptyState = {
  wrapper: 'flex flex-col items-center justify-center py-20 text-center',
  icon: 'w-20 h-20 rounded-full bg-[var(--p)] flex items-center justify-center text-4xl mb-5',
  title: 'text-base font-semibold text-[var(--text-1)] mb-1',
  subtitle: 'text-sm text-[var(--text-3)] mb-6',
};
