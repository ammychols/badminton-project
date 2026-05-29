# 🏸 BadmintonTracker

แอปช่วยตัดสินใจว่าวันนี้ควรไปตีแบดที่ไหน

## Features
- 📅 **วันนี้** — แสดงก๊วนที่เปิดวันนี้ เรียงตามคะแนน
- 🏟️ **สนาม** — บันทึกสนามและก๊วนต่างๆ
- ⭐ **รีวิว** — ให้ดาว 3 หัวข้อ: ความสนุก, การจัดมือ, การเดินทาง

## วิธีติดตั้ง

```bash
npm install
npm run dev
```

## Google Maps Integration

1. ไปสร้าง API key ที่ [Google Cloud Console](https://console.cloud.google.com)
2. เปิด API:
   - Maps JavaScript API
   - Places API
3. แก้ไฟล์ `index.html` ใส่ key:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places" async defer></script>
```

## โครงสร้างไฟล์

```
src/
├── types/index.ts          # TypeScript types (Court, Group, Review)
├── hooks/useCourts.ts      # State management + localStorage
├── utils/index.ts          # Helper functions
└── components/
    ├── TodayView.tsx        # หน้าหลัก "วันนี้"
    ├── CourtsView.tsx       # จัดการสนาม
    ├── AddCourtModal.tsx    # เพิ่มสนาม + Google Maps search
    ├── AddGroupModal.tsx    # เพิ่มก๊วน
    ├── ReviewModal.tsx      # รีวิวก๊วน
    └── StarRating.tsx       # Star rating component
```

## TODO / ต่อยอดได้
- [ ] แผนที่แสดงสนามทั้งหมด
- [ ] ประวัติรีวิวย้อนหลัง
- [ ] Export ข้อมูลเป็น CSV
- [ ] แชร์ก๊วนให้เพื่อน
- [ ] Push notification แจ้งเตือนวันที่มีก๊วน
