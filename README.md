# 🏸 BadmintonTracker

PWA ติดตามการตีแบดมินตัน — บันทึกสนาม ก๊วน และสถิติการตีของคุณ ข้อมูล sync ทุก device ผ่าน Firebase

## Features

### 🏟️ สนาม
- ค้นหาสนามผ่าน Google Maps Places autocomplete
- เพิ่มก๊วนแต่ละสนาม (วัน/เวลา/ระดับมือ/รูปภาพ)
- ดูรีวิว + โน้ตก๊วนใน slide-over panel
- แสดงข้อมูลสนาม (พื้น/แอร์/ที่จอดรถ) + นำทาง Google Maps
- มุมมองแผนที่ (map view) สลับกับรายการได้

### 📝 บันทึกการตี
- **QuickLogCard** — การ์ดบันทึกเร็วบนหัวฟีด กดยืนยันได้เลย ไม่ต้องเปิด modal (หายอัตโนมัติหลังบันทึกครั้งแรกของวัน)
- บันทึก session พร้อม: วันที่ (ปฏิทินยุบ/กาง), เวลา, เกม, อารมณ์, ความหนัก, โน้ต
- แก้ไขหรือลบบันทึกได้ กดไอคอน ··· บนการ์ด
- อัปโหลดรูปภาพได้หลายรูปต่อ session พร้อม lightbox

### 📊 สถิติ
- Hero card: ครั้งทั้งหมด, streak 🔥, เกมเดือนนี้, เกม/วัน, เวลาเฉลี่ย
- Bar chart 6 เดือน (นับครั้ง)
- Heatmap 16 สัปดาห์ย้อนหลัง
- ความถี่รายวันในสัปดาห์
- ดูสถิติย้อนหลังแต่ละเดือนได้

## Tech Stack

- **React 18** + TypeScript (strict) + Vite
- **Tailwind CSS** + CSS variables design token system
- **Firebase** — Firestore (realtime sync) + Google Auth
- **vite-plugin-pwa** — installable PWA, offline-ready
- Deploy บน **GitHub Pages** (`/badminton-project/`)

## วิธีติดตั้ง

```bash
npm install
npm run dev        # dev server
npm run build      # production build + PWA service worker
npx tsc --noEmit   # typecheck (ต้องผ่านก่อน commit)
```

## Google Maps Integration

1. สร้าง API key ที่ [Google Cloud Console](https://console.cloud.google.com)
2. เปิด API: Maps JavaScript API, Places API (New)
3. ใส่ key ใน `index.html`:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places" async defer></script>
```

## Design System

Design token ทั้งหมดอยู่ใน `src/index.css` (CSS variables) และ `src/styles/tokens.ts`

| Token | ค่า | ใช้สำหรับ |
|-------|-----|----------|
| `--p` | `#2fbf7f` | Primary action |
| `--p-text` | `#010120` | Text บนพื้น primary (ห้ามใช้ `text-white`) |
| `--p-tint` | `#e2f7ed` | Selected state แบบ ring+tint |
| `--nav-bg` | `#010120` | Header/nav background |
| `--app-bg` | `#f8f8f8` | Page background |

Overlay surfaces (ห้าม hand-roll ใหม่):
- **`BottomSheet`** — ฟอร์ม create/edit
- **`DetailPanel`** — slide-over detail (480px desktop / fullscreen mobile)
- **`ConfirmDialog`** — destructive confirmation

## โครงสร้างไฟล์

```
src/
├── types/index.ts
├── styles/
│   ├── tokens.ts             # btn/card/text/input presets
│   └── overlay.ts            # Z-index constants + BACKDROP values
├── hooks/
│   ├── useAuth.ts
│   ├── useCourts.ts          # Firestore courts + groups
│   ├── useSessions.ts        # Firestore sessions
│   └── useOverlay.ts         # Focus trap, Escape, scroll lock
├── utils/date.ts             # Date helpers (UTC+7 safe)
└── components/
    ├── SessionsView.tsx       # Feed + stats tabs
    ├── CourtsView.tsx         # Court list + map toggle
    ├── HeroCard.tsx           # Stats hero card
    ├── SessionRow.tsx         # Session card + lightbox
    ├── QuickLogCard.tsx       # One-tap log card
    ├── LogCelebration.tsx     # Post-log toast
    ├── DetailPanel.tsx        # Slide-over panel
    ├── BottomSheet.tsx        # Modal bottom sheet
    ├── ConfirmDialog.tsx      # Destructive confirm
    ├── GroupReviewModal.tsx   # Group detail + history
    ├── LogSessionModal.tsx    # Full session form
    ├── AddCourtModal.tsx
    ├── AddGroupModal.tsx
    ├── CourtInfoModal.tsx
    └── CourtsMap.tsx          # Google Maps view
```
