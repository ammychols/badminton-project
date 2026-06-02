// Design tokens — edit here to change styles app-wide

export const btn = {
  primary: 'bg-gray-900 text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-gray-700 transition-colors',
  primaryIcon: 'bg-gray-900 text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-gray-700 transition-colors flex items-center gap-1.5',
  primaryLg: 'bg-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-medium hover:bg-gray-700 transition-colors',
  ghost: 'text-gray-400 hover:text-gray-600 transition-colors',
  danger: 'flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors',
  cancel: 'flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors',
  pill: 'px-3.5 py-1.5 rounded-full text-sm font-medium transition-all',
  pillActive: 'bg-gray-900 text-white',
  pillInactive: 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300',
};

export const card = {
  base: 'bg-white border border-gray-100 rounded-2xl',
  padded: 'bg-white border border-gray-100 rounded-2xl p-4',
  dark: 'bg-gray-900 rounded-3xl p-5 text-white',
};

export const input = {
  base: 'w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white',
  select: 'w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white',
  textarea: 'w-full border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none',
  timeSelect: 'flex-1 border border-gray-200 rounded-xl px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white appearance-none text-center',
};

export const text = {
  pageTitle: 'text-xl font-bold text-gray-900',
  cardTitle: 'text-base font-semibold text-gray-900',
  body: 'text-sm text-gray-700',
  meta: 'text-xs text-gray-400',
  label: 'block text-sm font-medium text-gray-700 mb-1',
};

export const chip = {
  base: 'text-xs px-2.5 py-1 rounded-full font-medium',
  gray: 'bg-gray-100 text-gray-600',
};

export const emptyState = {
  wrapper: 'flex flex-col items-center justify-center py-20 text-center',
  icon: 'w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center text-4xl mb-5',
  title: 'text-base font-semibold text-gray-800 mb-1',
  subtitle: 'text-sm text-gray-400 mb-6',
};
