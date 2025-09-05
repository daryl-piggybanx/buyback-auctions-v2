import { useState } from "react";
import { format } from "date-fns";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  timezone?: string;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className = "", timezone = "America/Los_Angeles" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      // Create date in Pacific Time
      const pacificDate = new Date(`${dateValue}T00:00:00`);
      // Convert to UTC for storage
      const utcDate = new Date(pacificDate.toLocaleString("en-US", { timeZone: "UTC" }));
      onChange(utcDate);
    } else {
      onChange(undefined);
    }
  };

  // Convert UTC date back to Pacific for display
  const displayValue = value ? format(value, "yyyy-MM-dd") : "";

  return (
    <div className={`relative ${className}`}>
      <input
        type="date"
        value={displayValue}
        onChange={handleDateChange}
        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
}
