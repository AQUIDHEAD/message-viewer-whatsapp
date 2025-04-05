import React, { useState } from 'react';
import '../styles/DateNavigation.css';

const DateNavigation = ({ messages = [], onDateJump }) => {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  // Extract dates from messages
  const processedDates = React.useMemo(() => {
    return messages.map(message => {
      const dateMatch = message.match(/\[(\d{2})\/(\d{2})\/(\d{2})/);
      if (dateMatch) {
        return {
          day: dateMatch[1],
          month: dateMatch[2],
          year: '20' + dateMatch[3],
          fullDate: new Date(`20${dateMatch[3]}`, parseInt(dateMatch[2]) - 1, dateMatch[1])
        };
      }
      return null;
    }).filter(Boolean);
  }, [messages]);

  // Extract unique values
  const years = React.useMemo(() => 
    [...new Set(processedDates.map(date => date.year))]
      .sort((a, b) => parseInt(a) - parseInt(b)),
    [processedDates]
  );

  const months = React.useMemo(() => 
    [...new Set(processedDates.map(date => date.month))]
      .sort((a, b) => parseInt(a) - parseInt(b)),
    [processedDates]
  );

  const days = React.useMemo(() => 
    [...new Set(processedDates.map(date => date.day))]
      .sort((a, b) => parseInt(a) - parseInt(b)),
    [processedDates]
  );

  const findClosestDate = (targetDate) => {
    // Convert all dates to timestamps for comparison
    const targetTimestamp = targetDate.getTime();
    
    // Create array of differences between target date and all available dates
    const dateDistances = processedDates.map(date => ({
      date: `${date.day}/${date.month}/${date.year.slice(-2)}`,
      difference: Math.abs(date.fullDate.getTime() - targetTimestamp)
    }));

    // Sort by smallest difference and get the closest date
    dateDistances.sort((a, b) => a.difference - b.difference);
    
    return dateDistances[0].date;
  };

  const handleJump = () => {
    if (selectedYear && selectedMonth && selectedDay) {
      const shortYear = selectedYear.slice(-2);
      const targetDate = `${selectedDay}/${selectedMonth}/${shortYear}`;
      
      // Check if the exact date exists
      const exactDateExists = processedDates.some(date => 
        `${date.day}/${date.month}/${date.year.slice(-2)}` === targetDate
      );

      if (exactDateExists) {
        onDateJump(targetDate);
      } else {
        // Find and jump to closest date
        const targetDateObj = new Date(
          parseInt(selectedYear),
          parseInt(selectedMonth) - 1,
          parseInt(selectedDay)
        );
        
        const closestDate = findClosestDate(targetDateObj);
        
        // Show alert to inform user
        alert(`No messages found for ${targetDate}. Jumping to closest date: ${closestDate}`);
        
        onDateJump(closestDate);
      }
    }
  };

  return (
    <div className="date-navigation">
      <h3>Jump to Date</h3>
      <div className="date-selectors">
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="date-select"
        >
          <option value="">Year</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="date-select"
        >
          <option value="">Month</option>
          {months.map(month => (
            <option key={month} value={month}>
              {month.padStart(2, '0')}
            </option>
          ))}
        </select>

        <select 
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="date-select"
        >
          <option value="">Day</option>
          {days.map(day => (
            <option key={day} value={day}>
              {day.padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
      <button 
        onClick={handleJump}
        disabled={!selectedYear || !selectedMonth || !selectedDay}
        className="jump-button"
      >
        Jump to Date
      </button>
    </div>
  );
};

export default DateNavigation;