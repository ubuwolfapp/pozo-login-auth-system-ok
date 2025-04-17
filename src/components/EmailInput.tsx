
import React from 'react';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Usuario", 
  className = ""
}) => {
  return (
    <div className={`${className}`}>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-white bg-opacity-20 bg-black backdrop-blur-md rounded-md px-4 py-3 outline-none border-0 ring-0"
      />
    </div>
  );
};

export default EmailInput;
