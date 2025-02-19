import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';

interface Holiday {
  date: string;
  name: string;
}

const App: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);  // ✅ Fix: Initialize as empty array
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [holidayName, setHolidayName] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:8080/holidays")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch holidays");
        }
        return res.json();
      })
      .then((data) => {
        setHolidays(data || []);  // ✅ Fix: Ensure `data` is an array
      })
      .catch((error) => {
        console.error("Error fetching holidays:", error);
        setHolidays([]);  // ✅ Fix: Set empty array on error
      });
  }, []);

  const addHoliday = () => {
    if (!selectedDate || !holidayName.trim()) {
      alert("Select a date and enter a holiday name.");
      return;
    }

    const newHoliday = { date: selectedDate, name: holidayName };

    fetch("http://localhost:8080/holidays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newHoliday),
    })
      .then((res) => res.json())
      .then((data) => {
        setHolidays((prevHolidays) => [...prevHolidays, data]);
        setHolidayName(""); // Reset input field
      })
      .catch((error) => console.error("Error adding holiday:", error));
  };

  return (
    <div className="App">
      <h1>Holiday Calendar</h1>

      <div className="holiday-input">
        <input
          type="text"
          placeholder="Enter holiday name"
          value={holidayName}
          onChange={(e) => setHolidayName(e.target.value)}
        />
        <button onClick={addHoliday}>Add Holiday</button>
      </div>

      <Calendar
        onClickDay={(date) => setSelectedDate(date.toISOString().split("T")[0])}
        tileClassName={({ date }) =>
          holidays.some((holiday) => holiday.date === date.toISOString().split("T")[0]) ? "holiday" : ""
        }
      />

      {/* Prevent crash by checking if holidays is an array */}
      {holidays.length > 0 ? (
        <ul className="holiday-list">
          {holidays.map((holiday, index) => (
            <li key={index} className="holiday-item">
              {holiday.date}: {holiday.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No holidays added yet.</p>
      )}
    </div>
  );
};

export default App;
