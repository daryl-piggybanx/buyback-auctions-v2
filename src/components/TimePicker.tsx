import { useState } from "react";

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({ value, onChange, placeholder = "Select time", className = "" }: TimePickerProps) {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    onChange(timeValue);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="time"
        value={value || ""}
        onChange={handleTimeChange}
        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
}
