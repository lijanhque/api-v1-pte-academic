'use client';

import { useState, useEffect } from 'react';

export function ExamCountdown({ examDate }: { examDate: Date | null }) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    if (!examDate) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(examDate).getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown({ days, hours, minutes });
    }, 1000);

    return () => clearInterval(interval);
  }, [examDate]);

  return (
    <div className="flex justify-around text-center">
      <div>
        <div className="text-3xl font-bold">{countdown.days}</div>
        <div className="text-sm text-gray-500">Days</div>
      </div>
      <div>
        <div className="text-3xl font-bold">{countdown.hours}</div>
        <div className="text-sm text-gray-500">Hours</div>
      </div>
      <div>
        <div className="text-3xl font-bold">{countdown.minutes}</div>
        <div className="text-sm text-gray-500">Minutes</div>
      </div>
    </div>
  );
}
