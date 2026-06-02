# 🏸 BadmintonTracker

แอปติดตามการตีแบดมินตัน — บันทึกสนาม ก๊วน และสถิติการตีของคุณ

## Features

### 🏟️ สนาม
- บันทึกสนามพร้อม Google Maps search
- เพิ่มก๊วนแต่ละสนาม (วัน/เวลา/ระดับ)
- จดโน้ตแต่ละก๊วนได้ inline ไม่ต้องเปิด modal

### 📝 บันทึกการตี
- บันทึก session พร้อมวันที่ (ปฏิทิน), เวลา, จำนวนเกม, อารมณ์
- แก้ไขหรือลบบันทึกได้ (กดที่การ์ด)
- สถิติ hero card: เกมทั้งหมด, วันที่ตีเดือนนี้, เกม/วัน
- Heatmap รายเดือน: bar chart 6 เดือน + ปฏิทินดูย้อนหลัง + ความถี่รายวัน
- Streak counter 🔥 เมื่อตีติดต่อกัน

## วิธีติดตั้ง

```bash
npm install
npm run dev
```

## Google Maps Integration

1. สร้าง API key ที่ [Google Cloud Console](https://console.cloud.google.com)
2. เปิด API: Maps JavaScript API, Places API
3. แก้ `index.html` ใส่ key:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places" async defer></script>
```

## โครงสร้างไฟล์

```
src/
├── types/index.ts
├── styles/tokens.ts          # Design token system
├── hooks/
│   ├── useCourts.ts          # Courts state + localStorage
│   └── useSessions.ts        # Sessions state + localStorage
└── components/
    ├── BottomSheet.tsx        # Shared modal wrapper
    ├── CourtsView.tsx
    ├── SessionsView.tsx
    ├── LogSessionModal.tsx
    ├── AddCourtModal.tsx
    ├── AddGroupModal.tsx
    ├── CourtInfoModal.tsx
    └── ReviewModal.tsx
```

## TODO
- [ ] แผนที่แสดงสนามทั้งหมด
- [ ] Export ข้อมูลเป็น CSV
- [ ] แชร์ก๊วนให้เพื่อน
- [ ] Push notification แจ้งเตือนวันที่มีก๊วน
