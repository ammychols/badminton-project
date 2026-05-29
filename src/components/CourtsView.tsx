import React, { useState } from 'react';
import { Court, Group, DAY_LABELS, DayOfWeek } from '../types';
import { getAverageScore } from '../utils';
import { StarRating } from './StarRating';

interface CourtsViewProps {
  courts: Court[];
  onAddCourt: () => void;
  onAddGroup: (courtId: string) => void;
  onDeleteCourt: (courtId: string) => void;
  onDeleteGroup: (courtId: string, groupId: string) => void;
  onAddReview: (courtId: string, groupId: string) => void;
}

export function CourtsView({ courts, onAddCourt, onAddGroup, onDeleteCourt, onDeleteGroup, onAddReview }: CourtsViewProps) {
  const [expandedCourt, setExpandedCourt] = useState<string | null>(null);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">🏟️ สนามของฉัน</h2>
        <button
          onClick={onAddCourt}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
        >
          + เพิ่มสนาม
        </button>
      </div>

      {courts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🏟️</div>
          <p>ยังไม่มีสนาม</p>
          <p className="text-sm mt-1">กดปุ่ม + เพิ่มสนาม เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {courts.map(court => (
            <div key={court.id} className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedCourt(expandedCourt === court.id ? null : court.id)}
              >
                <div>
                  <p className="font-semibold text-gray-800">{court.name}</p>
                  <p className="text-xs text-gray-400">{court.address}</p>
                  <p className="text-xs text-gray-400 mt-1">{court.groups.length} ก๊วน</p>
                </div>
                <span className="text-gray-400 text-xl">
                  {expandedCourt === court.id ? '▲' : '▼'}
                </span>
              </div>

              {expandedCourt === court.id && (
                <div className="border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row">
                    {/* Groups */}
                    <div className="flex-1 px-4 pb-4">
                      {court.groups.map(group => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          onDelete={() => onDeleteGroup(court.id, group.id)}
                          onReview={() => onAddReview(court.id, group.id)}
                        />
                      ))}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => onAddGroup(court.id)}
                          className="flex-1 bg-green-50 text-green-700 text-sm py-2 rounded-xl hover:bg-green-100 transition-colors"
                        >
                          + เพิ่มก๊วน
                        </button>
                        <button
                          onClick={() => onDeleteCourt(court.id)}
                          className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          ลบสนาม
                        </button>
                      </div>
                    </div>

                    {/* Google Map */}
                    <div className="sm:w-56 sm:min-h-0 h-44 sm:h-auto sm:border-l border-t sm:border-t-0 border-gray-100 flex-shrink-0">
                      <iframe
                        title={court.name}
                        width="100%"
                        height="100%"
                        className="rounded-b-2xl sm:rounded-bl-none sm:rounded-r-2xl"
                        style={{ border: 0, minHeight: '160px' }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(court.address || court.name)}&output=embed&z=15`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GroupCard({ group, onDelete, onReview }: { group: Group; onDelete: () => void; onReview: () => void }) {
  const avg = getAverageScore(group.reviews);

  return (
    <div className="mt-3 bg-gray-50 rounded-xl p-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-sm text-gray-800">{group.name}</p>
          <p className="text-xs text-green-600">
            {group.startTime} – {group.endTime} น.
          </p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {(Object.keys(DAY_LABELS) as DayOfWeek[]).map(day => (
              <span
                key={day}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  group.days.includes(day)
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {DAY_LABELS[day]}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <StarRating value={Math.round(avg)} readonly size="sm" />
          <p className="text-xs text-gray-400">{group.reviews.length} รีวิว</p>
          <button
            onClick={onReview}
            className="text-xs text-green-500 mt-1 hover:text-green-700 block"
          >
            + รีวิว
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-red-400 mt-1 hover:text-red-600 block"
          >
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
}
