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
- การ์ดเด่น/gradient ใช้โทน hero: `linear-gradient(135deg, var(--hero-from) 0%, #0f172a 55%, var(--hero-to) 100%)` 

### วันที่/เวลา
- ใช้ helpers ใน **`src/utils/date.ts`** (`todayString`, `toDateString`, `formatDate`, `calcStreak`, `DAY_NAMES`, `MONTH_SHORT`) เท่านั้น
- **ห้าม** ใช้ `new Date().toISOString().slice(0,10)` หาวันที่ — UTC+7 จะผิดวันก่อน 07:00 น.
- ปี พ.ศ. = ค.ศ. + 543; `startTime/endTime === '00:00'` ทั้งคู่ = sentinel "ไม่ได้บันทึกเวลา" (อย่าแสดง/คำนวณ duration)

### ภาษา & copy
- UI เป็นภาษาไทย; ไทยปนอังกฤษต้องเว้นวรรค (เช่น "ตี S.T.A Badminton วันนี้?")
- สถิติจากข้อมูล < 3 ครั้ง: เลี่ยงคำว่า "เฉลี่ย/ส่วนใหญ่" (backlog ข้อ 1 ด้านล่าง)

### Core loop components
- **`QuickLogCard`** — การ์ดบันทึกเร็วบนหัวฟีด (เดาก๊วนจากตาราง `days`, บันทึกเวลาเป็น '00:00') — เจ้าของโปรเจกต์ปรับเองแล้ว (เกมเริ่มที่ 0 ไม่ prefill) อย่า revert
- **`LogCelebration`** — toast ฉลองหลังบันทึก render ที่ App level ขับด้วย state `justLogged` (timer 5s)

## Architecture notes

- Groups เก็บ nested ใน court document (Firestore) — มีแผน migrate เป็น subcollection ภายหลัง
- `LogSessionModal` กรองสนาม/ก๊วนตามวันในสัปดาห์ (day filter) — **เจ้าของโปรเจกต์ตั้งใจคงไว้** อย่าปลดล็อกโดยไม่ถาม
- `SessionsView.tsx` ยังใหญ่ (~700+ บรรทัด) — มีไฟล์ extraction (HeroCard, SessionRow) วางไว้ที่ `src/components/` แล้วแต่ยังไม่ได้ wire เข้า (ดู backlog)

## Backlog (เรียงตามที่คุยกันไว้)

1. Wire `HeroCard`/`SessionRow` (อยู่ที่ `src/components/` แล้ว ยังไม่ได้ import) เข้า `SessionsView` แทนโค้ดซ้ำเดิม + ย้าย date helpers ไปใช้ `utils/date.ts`
2. แทน `CourtPanel` ใน SessionsView ด้วย `DetailPanel` + ลบ `CourtDetailPanel` (dead code) ใน CourtsView
3. Migrate confirm dialogs ทั้ง 3 จุดไปใช้ `ConfirmDialog` กลาง
4. เปลี่ยน default tab แรกเป็น `'sessions'` (ตอนนี้ fallback เป็น `'courts'`)
5. Loading/error states บน Firestore writes (ตอนนี้ fire-and-forget)
6. Bottom nav: เพิ่ม label ไทย + เปลี่ยนไอคอนสนาม (ตอนนี้เป็นลูกโลก)

## Assets

- ไอคอน PWA generate จาก `scripts/make_icons.py` (cairosvg) — แก้ SVG ในสคริปต์แล้วรันใหม่ ได้ครบทุกขนาด (192/512/maskable/apple-touch)
- Manifest: แยก `purpose: 'any'` กับ `'maskable'` คนละไฟล์เสมอ (maskable มี safe-zone ~22%)
