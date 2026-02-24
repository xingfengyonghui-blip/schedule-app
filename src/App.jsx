import React, { useState, useEffect } from "react";
import "./App.css";

const levelColors = {
  "very-low": "green",
  low: "limegreen",
  medium: "gold",
  high: "orange",
  "very-high": "red"
};

const levelValues = {
  "very-low": 1,
  low: 2,
  medium: 3,
  high: 4,
  "very-high": 5
};

export default function App() {
  const [events, setEvents] = useState(() => {
    return JSON.parse(localStorage.getItem("events_W")) || [];
  });

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [level, setLevel] = useState("very-low");
  const [selectedDates, setSelectedDates] = useState(new Set());

  useEffect(() => {
    localStorage.setItem("events_W", JSON.stringify(events));
  }, [events]);

  const toggleDateSelection = (dateStr) => {
    const newSet = new Set(selectedDates);
    if (newSet.has(dateStr)) newSet.delete(dateStr);
    else newSet.add(dateStr);
    setSelectedDates(newSet);
  };

  const getDayTotalValue = (dateStr) => {
    return events
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + (levelValues[e.level] || 0), 0);
  };

  const getWeekTotal = (dateStr) => {
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.getDay();
    const sunday = new Date(dateObj);
    sunday.setDate(dateObj.getDate() - dayOfWeek);

    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dStr = `${y}-${m}-${day}`;
      total += getDayTotalValue(dStr);
    }
    return total;
  };

  const canAddEvent = (dateStr, newLevel) => {
    const total = getDayTotalValue(dateStr);
    if (total + levelValues[newLevel] > 8) return false;

    const weekTotal = getWeekTotal(dateStr);
    if (weekTotal + levelValues[newLevel] > 42) return false;

    return true;
  };

  const handleAdd = () => {
    if (!title) return alert("タイトルを入力してください");

    let datesToAdd = [];
    if (date) datesToAdd.push(date);
    else if (selectedDates.size > 0) datesToAdd = Array.from(selectedDates);
    else return alert("日付を選択してください");

    const newEvents = [];

    for (let d of datesToAdd) {
      if (!canAddEvent(d, level)) {
        alert(`${d} の追加は制限によりできません`);
        continue;
      }
      newEvents.push({
        id: Date.now() + Math.random(),
        title,
        date: d,
        level
      });
    }

    setEvents([...events, ...newEvents]);
    setTitle("");
    setDate("");
    setLevel("very-low");
    setSelectedDates(new Set());
  };

  const deleteEvent = (id) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startWeekDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const cells = [];

    for (let i = 0; i < startWeekDay; i++) {
      cells.push(<div key={"empty" + i}></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(d).padStart(2, "0")}`;

      const dayEvents = events.filter((e) => e.date === dateStr);
      const totalValue = getDayTotalValue(dateStr);
      const weekDay = new Date(currentYear, currentMonth, d).getDay();

      cells.push(
        <div
          key={dateStr}
          className={`day ${selectedDates.has(dateStr) ? "selected" : ""}`}
          onClick={() => toggleDateSelection(dateStr)}
          style={{
            color: weekDay === 0 ? "red" : weekDay === 6 ? "blue" : ""
          }}
        >
          <div className="date-number">{d}</div>

          {dayEvents.length > 0 && (
            <div className="events-wrapper">
              {dayEvents.map((e) => (
                <div key={e.id} className="event-item">
                  <div
                    className="event-dot"
                    style={{ background: levelColors[e.level] }}
                  />
                  <span className="event-text">{e.title}</span>
                </div>
              ))}
            </div>
          )}

          {totalValue > 0 && (
            <div
              className="marker"
              style={{
                backgroundColor:
                  totalValue <= 2
                    ? "green"
                    : totalValue <= 4
                    ? "yellow"
                    : totalValue <= 6
                    ? "orange"
                    : "red"
              }}
            >
              {totalValue}
            </div>
          )}

          {totalValue >= 8 && <div className="over-limit">もう無理</div>}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="container">
      <h2>スケジュール帳＜仕事編＞</h2>

      {/* 入力フォーム */}
      <div className="input-group">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="予定タイトル"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="very-low">とても低</option>
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="very-high">とても高</option>
        </select>
        <button onClick={handleAdd}>追加</button>
      </div>

      {/* カレンダー切替 */}
      <div className="calendar-header">
        <button onClick={prevMonth}>&lt;</button>
        <span>{currentYear}年 {currentMonth + 1}月</span>
        <button onClick={nextMonth}>&gt;</button>
      </div>

      {/* カレンダー */}
      <div className="calendar">{renderCalendar()}</div>

      {/* 登録済みスケジュール */}
      <h3>登録済みスケジュール</h3>
      <div className="schedule-list">
        {events
          .filter((e) => {
            const [y, m] = e.date.split("-");
            return Number(y) === currentYear && Number(m) === currentMonth + 1;
          })
          .map((e) => (
            <div key={e.id} className="schedule-item">
              <div>
                {e.date} : {e.title}{" "}
                <span
                  className="level"
                  style={{ background: levelColors[e.level] }}
                >
                  {e.level}
                </span>
              </div>
              <button onClick={() => deleteEvent(e.id)}>削除</button>
            </div>
          ))}
      </div>
    </div>
  );
}