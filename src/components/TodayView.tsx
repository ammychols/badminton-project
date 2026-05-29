import React from 'react';
import { Court, Review, FLOOR_LABELS, LIGHT_LABELS, AIR_LABELS, CROWD_LABELS, SHUTTLE_LABELS } from '../types';
import { getTodayGroups, getAverageScore, formatTime } from '../utils';
import { DAY_FULL_LABELS } from '../types';

interface TodayViewProps {
  courts: Court[];
  onAddReview: (courtId: string, groupId: string) => void;
}

function ReviewBadges({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return <p className="text-xs text-gray-400">ยังไม่มีรีวิว</p>;

  const last = reviews[reviews.length - 1];
  const avg = (r: Review) => ((r.fun + r.arrangement + r.travel) / 3);
  const overallAvg = reviews.reduce((s, r) => s + avg(r), 0) / reviews.length;

  const starBadges = [
    { label: '🎉', val: Math.round(reviews.reduce((s, r) => s + r.fun, 0) / reviews.length) },
    { label: '🤝', val: Math.round(reviews.reduce((s, r) => s + r.arrangement, 0) / reviews.length) },
    { label: '🚗', val: Math.round(reviews.reduce((s, r) => s + r.travel, 0) / reviews.length) },
  ];

  const infoBadges: string[] = [];
  if (last.floor) infoBadges.push(FLOOR_LABELS[last.floor]);
  if (last.light) infoBadges.push(LIGHT_LABELS[last.light]);
  if (last.air) infoBadges.push(AIR_LABELS[last.air]);
  if (last.crowd) infoBadges.push(CROWD_LABELS[last.crowd]);
  if (last.shuttle) infoBadges.push(SHUTTLE_LABELS[last.shuttle]);

  return (
    <div className="mt-2 flex flex-wrap gap-1.5 items-center">
      {starBadges.map(({ label, val }) => (
        <span key={label} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
          {label} {'★'.repeat(val)}{'☆'.repeat(5 - val)}
        </span>
      ))}
      {infoBadges.map(text => (
        <span key={text} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
          {text}
        </span>
      ))}
      <span className="text-xs text-gray-400 ml-auto">{reviews.length} รีวิว</span>
    </div>
  );
}

export function TodayView({ courts, onAddReview }: TodayViewProps) {
  const todayGroups = getTodayGroups(courts);
  const today = new Date();
  const days: Array<keyof typeof DAY_FULL_LABELS> = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const todayLabel = DAY_FULL_LABELS[days[today.getDay()]];

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-700">🏸 วันนี้ตีที่ไหนดี?</h1>
        <p className="text-gray-500 text-sm">วัน{todayLabel} {today.toLocaleDateString('th-TH')}</p>
      </div>

      {todayGroups.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">😢</div>
          <p>ไม่มีก๊วนเปิดวันนี้</p>
          <p className="text-sm mt-1">ลองเพิ่มก๊วนในสนามที่บันทึกไว้</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {todayGroups.map(({ court, group }, index) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 relative overflow-hidden"
            >
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-xl">
                  แนะนำ 🏆
                </div>
              )}
              <p className="font-semibold text-gray-800">{group.name}</p>
              <p className="text-sm text-gray-500">{court.name}</p>
              <p className="text-sm text-green-600 mt-1">
                🕐 {formatTime(group.startTime)} – {formatTime(group.endTime)} น.
              </p>

              <ReviewBadges reviews={group.reviews} />

              {group.notes && (
                <p className="text-xs text-gray-400 mt-2 italic">"{group.notes}"</p>
              )}

              <button
                onClick={() => onAddReview(court.id, group.id)}
                className="mt-3 w-full bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium py-2 rounded-xl transition-colors"
              >
                + รีวิวก๊วนนี้
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
