import React from 'react';
import { Court } from '../types';
import { getTodayGroups, getAverageScore, formatTime } from '../utils';
import { DAY_FULL_LABELS } from '../types';
import { StarRating } from './StarRating';

interface TodayViewProps {
  courts: Court[];
  onAddReview: (courtId: string, groupId: string) => void;
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
          {todayGroups.map(({ court, group, averageScore }, index) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl shadow-md p-4 border border-gray-100 relative overflow-hidden"
            >
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-xl">
                  แนะนำ 🏆
                </div>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{group.name}</p>
                  <p className="text-sm text-gray-500">{court.name}</p>
                  <p className="text-sm text-green-600 mt-1">
                    🕐 {formatTime(group.startTime)} – {formatTime(group.endTime)} น.
                  </p>
                </div>
                <div className="text-right">
                  <StarRating value={Math.round(averageScore)} readonly size="sm" />
                  <p className="text-xs text-gray-400 mt-1">
                    {group.reviews.length > 0
                      ? `${averageScore.toFixed(1)} (${group.reviews.length} รีวิว)`
                      : 'ยังไม่มีรีวิว'}
                  </p>
                </div>
              </div>

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
