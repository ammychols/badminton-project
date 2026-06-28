# BadmintonTracker

แอป PWA ติดตามการตีแบดมินตัน (ภาษาไทย) — บันทึกสนาม, ก๊วน, session, สถิติ/สตรีค

## Stack & commands

- React 18 + TypeScript (strict) + Vite + Tailwind + Firebase (Firestore/Auth) + vite-plugin-pwa
- `npm run dev` — dev server
- `npm run build` — production build (รวม PWA generateSW)
- `npx tsc --noEmit` — typecheck (ต้องผ่านก่อน commit ทุกครั้ง)
- Base path: `/badminton-project/` (GitHub Pages)

## Design system conventions (สำคัญ — ห้ามหลุด)

### Overlay surfaces — มี 3 แบบเท่านั้น ห้าม hand-roll ใหม่
- **`BottomSheet`** (`src/components/BottomSheet.tsx`) — ทุกฟอร์ม create/edit (bottom sheet บนมือถือ / centered บน desktop)
- **`DetailPanel`** (`src/components/DetailPanel.tsx`) — ทุกหน้า detail แบบ slide-over (full-screen มือถือ / 480px ขวาบน desktop) ปุ่มปิด: ← มือถือ, × desktop
- **`ConfirmDialog`** (`src/components/ConfirmDialog.tsx`) — ทุก confirmation (focus ลง Cancel ก่อนเสมอ)
- ทั้งสามใช้ **`useOverlay`** hook (`src/hooks/useOverlay.ts`): focus trap, Escape, body scroll lock, focus restore — overlay ใหม่ใดๆ ต้องใช้ hook นี้

### z-index & backdrop
- ใช้ค่าจาก **`src/styles/overlay.ts`** (`Z.dropdown/panel/modal/confirm/lightbox/toast` และ `BACKDROP`) เท่านั้น
- **ห้าม** hardcode z-index หรือสี scrim ใหม่

### สี & tokens
- ใช้ CSS variables (`var(--p)`, `var(--text-1..4)`, `var(--card-border)`, `var(--chip-bg)`, ฯลฯ ใน `src/index.css`) และ class presets ใน `src/styles/tokens.ts`
- **ห้าม** hardcode hex ใหม่ (เช่น `#84cc16`, `#f1f5f9`) — ถ้าจำเป็นต้องมีสีใหม่ ให้เพิ่มเป็น CSS variable ก่อน
- Primary colour: `--p: #2fbf7f` — ข้อความบน `var(--p)` ต้องใช้ `text-[var(--p-text)]` หรือ `color: 'var(--p-text)'` เสมอ (**ห้ามใช้ `text-white`** บนพื้น `var(--p)`)
- `--p-tint: #e2f7ed` — ใช้สำหรับ selected state แบบ ring+tint (เช่น mood button ที่เลือก): `bg-[var(--p-tint)] shadow-[0_0_0_2px_var(--p)]`
- `BACKDROP_LIGHTBOX` จาก `src/styles/overlay.ts` (`rgba(1, 1, 32, 0.85)`) — ใช้เป็น scrim สำหรับ lightbox เท่านั้น
- การ์ดเด่น/gradient ใช้โทน hero: `linear-gradient(135deg, var(--hero-from) 0%, #0f172a 55%, var(--hero-to) 100%)` 

### วันที่/เวลา
- ใช้ helpers ใน **`src/utils/date.ts`** (`todayString`, `toDateString`, `formatDate`, `calcStreak`, `DAY_NAMES`, `MONTH_SHORT`) เท่านั้น
- **ห้าม** ใช้ `new Date().toISOString().slice(0,10)` หาวันที่ — UTC+7 จะผิดวันก่อน 07:00 น.
- ปี พ.ศ. = ค.ศ. + 543; `startTime/endTime === '00:00'` ทั้งคู่ = sentinel "ไม่ได้บันทึกเวลา" (อย่าแสดง/คำนวณ duration)

### ภาษา & copy
- UI เป็นภาษาไทย; ไทยปนอังกฤษต้องเว้นวรรค (เช่น "ตี S.T.A Badminton วันนี้?")
- สถิติจากข้อมูล < 3 ครั้ง: เลี่ยงคำว่า "เฉลี่ย/ส่วนใหญ่"

### Core loop components
- **`QuickLogCard`** — การ์ดบันทึกเร็วบนหัวฟีด (เดาก๊วนจากตาราง `days`, บันทึกเวลาเป็น '00:00') — เจ้าของโปรเจกต์ปรับเองแล้ว (เกมเริ่มที่ 0 ไม่ prefill) อย่า revert
- **`LogCelebration`** — toast ฉลองหลังบันทึก render ที่ App level ขับด้วย state `justLogged` (timer 5s)

## Architecture notes

- Groups เก็บ nested ใน court document (Firestore) — มีแผน migrate เป็น subcollection ภายหลัง
- `LogSessionModal` กรองสนาม/ก๊วนตามวันในสัปดาห์ (day filter) — **เจ้าของโปรเจกต์ตั้งใจคงไว้** อย่าปลดล็อกโดยไม่ถาม
## CourtsView — current state

Phase 1 + polish done. Key decisions:
- **Add-court** is a fixed FAB (bottom-right, above nav, `z-45`) — global action with no contextual home; shown only in list mode when ≥1 court exists.
- **Add-group** is context-aware: collapsed courts show nothing; empty expanded courts show a centered ghost "เพิ่มก๊วนแรก" invite; courts with groups show a quiet `--p-deep` text link *after* the rows (no tile/dashed circle). Shortcut also lives in the court `···` menu.
- **Group-row `···` menu** uses `position:fixed` anchored via `getBoundingClientRect` so it escapes any `overflow:hidden` ancestor.
- **Phase 2 flag**: drop per-row `···` entirely — tapping a row already opens edit, so move "ลบ" into the group edit modal. Eliminates the clipping class of bug at root and cleans up repeated `···` icons. Touches `AddGroupModal`, belongs in the modal/journey phase.
- `--p-deep: #0d6e4a` added to `src/index.css` — readable green text on white for add-group affordances.
- Collapse persisted in `localStorage['badminton.collapsedCourts']`; day filter auto-expands matching courts.

## Session data model

`Session` has optional `cost` (spend, THB). Captured only in the full `LogSessionModal` — placed after intensity, before notes. `QuickLogCard` intentionally skips it to stay fast. Blank inputs serialize to `undefined`, not `0`, so "not recorded" stays distinguishable from a real zero. `waitMinutes` removed (time-efficiency judged by นาที/เกม instead).

## Group stats

Per-group aggregates live in `src/utils/groupStats.ts` (`computeGroupStats(sessions)`), consumed by `GroupScorecard` and the upcoming today picker — don't recompute inline. Returns `count`, `avgGames`, `avgMinPerGame`, `avgMood`, `avgCost`/`costSampleSize`, `lastVisitDate`, `hasEnoughData`. `MIN_SESSIONS_FOR_AVG = 3` — averages and "ส่วนใหญ่เจอ" distribution are gated behind this; below threshold the scorecard shows only count + "ยังข้อมูลน้อย…". `GroupReviewModal` renamed to `GroupScorecard` (`src/components/GroupScorecard.tsx`). Cost surfaced as บาท/ครั้ง in the 2×2 overview grid.

## Backlog (เรียงตามที่คุยกันไว้)

1. เปลี่ยน default tab แรกเป็น `'sessions'` (ตอนนี้ fallback เป็น `'courts'`)
2. Loading/error states บน Firestore writes (ตอนนี้ fire-and-forget)

## Assets

- ไอคอน PWA generate จาก `scripts/make_icons.py` (cairosvg) — แก้ SVG ในสคริปต์แล้วรันใหม่ ได้ครบทุกขนาด (192/512/maskable/apple-touch)
- Manifest: แยก `purpose: 'any'` กับ `'maskable'` คนละไฟล์เสมอ (maskable มี safe-zone ~22%)
