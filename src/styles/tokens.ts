// Design tokens — edit here to change styles app-wide

export const btn = {
  primary: 'bg-[#3d6b4f] text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-[#2e5540] transition-colors',
  primaryIcon: 'bg-[#3d6b4f] text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-[#2e5540] transition-colors flex items-center gap-1.5',
  primaryLg: 'bg-[#3d6b4f] text-white px-6 py-3 rounded-2xl text-sm font-medium hover:bg-[#2e5540] transition-colors',
  ghost: 'text-[#8a9e90] hover:text-gray-600 transition-colors',
  danger: 'flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors',
  cancel: 'flex-1 py-2.5 rounded-xl border border-[#cdd7c8] text-sm text-gray-600 hover:bg-[#f2f5ef] transition-colors',
  pill: 'px-3.5 py-1.5 rounded-full text-sm font-medium transition-all',
  pillActive: 'bg-[#3d6b4f] text-white',
  pillInactive: 'bg-white border border-[#cdd7c8] text-[#6b8070] hover:border-[#b0c4aa]',
};

export const card = {
  base: 'bg-white border border-[#e2e8dd] rounded-2xl',
  padded: 'bg-white border border-[#e2e8dd] rounded-2xl p-4',
  dark: 'bg-[#3d6b4f] rounded-3xl p-5 text-white',
};

export const input = {
  base: 'w-full border border-[#cdd7c8] rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#3d6b4f] bg-white',
  select: 'w-full border border-[#cdd7c8] rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#3d6b4f] bg-white',
  textarea: 'w-full border border-[#cdd7c8] rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#3d6b4f] resize-none',
  timeSelect: 'flex-1 border border-[#cdd7c8] rounded-xl px-2 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#3d6b4f] bg-white appearance-none text-center',
};

export const text = {
  pageTitle: 'text-xl font-bold text-[#1a3329]',
  cardTitle: 'text-base font-semibold text-[#1a3329]',
  body: 'text-sm text-[#3a5045]',
  meta: 'text-xs text-[#8a9e90]',
  label: 'block text-sm font-medium text-[#3a5045] mb-1',
};

export const chip = {
  base: 'text-xs px-2.5 py-1 rounded-full font-medium',
  gray: 'bg-[#e8f0e4] text-[#4a7060]',
};

export const emptyState = {
  wrapper: 'flex flex-col items-center justify-center py-20 text-center',
  icon: 'w-20 h-20 rounded-full bg-[#3d6b4f] flex items-center justify-center text-4xl mb-5',
  title: 'text-base font-semibold text-[#1a3329] mb-1',
  subtitle: 'text-sm text-[#8a9e90] mb-6',
};
