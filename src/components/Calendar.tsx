import React, { useState, useEffect } from 'react';

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [holidays, setHolidays] = useState<{ [key: string]: string }>({}); // { date: holidayName }

  // Days of the week
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper function to get the number of days in a month
  const getDaysInMonth = (month: number, year: number): number[] => {
    const date = new Date(year, month + 1, 0);
    const daysInMonth = date.getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Get the days in the current month
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  // Fetch holidays from backend API
  const fetchHolidays = async () => {
    const res = await fetch('http://localhost:8080/holidays');
    const data = await res.json();
    const holidayMap: { [key: string]: string } = {};
    data.forEach((holiday: { date: string, name: string }) => {
      holidayMap[holiday.date] = holiday.name;
    });
    setHolidays(holidayMap);
  };

  // Fetch holidays when the component mounts or the month changes
  useEffect(() => {
    fetchHolidays();
  }, [currentMonth, currentYear]);

  // Helper function to handle the previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Helper function to handle the next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Add holiday function
  const addHoliday = async (date: string) => {
    const holidayName = prompt('Enter holiday name:');
    if (holidayName) {
      await fetch('http://localhost:8080/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, name: holidayName }),
      });
      fetchHolidays(); // Reload holidays after adding
    }
  };

  // Delete holiday function
  const deleteHoliday = async (date: string) => {
    if (window.confirm(`Are you sure you want to delete the holiday on ${date}?`)) {
      await fetch(`http://localhost:8080/holidays/${date}`, {
        method: 'DELETE',
      });
      fetchHolidays(); // Reload holidays after deletion
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>Prev</button>
        <h2>{`${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}`}</h2>
        <button onClick={nextMonth}>Next</button>
      </div>
      <div className="calendar-body">
        <div className="weekdays">
          {weekdays.map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="days">
          {daysInMonth.map((day) => {
            const date = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            return (
              <div
                key={day}
                className={`day ${holidays[date] ? 'holiday' : ''}`}
                onClick={() => holidays[date] ? deleteHoliday(date) : addHoliday(date)}
              >
                {day}
                {holidays[date] && <span className="holiday-name">{holidays[date]}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
export {};

