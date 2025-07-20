
import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  label = "Senha",
  placeholder = "Digite os números",
  disabled = false
}) => {
  const [digits, setDigits] = useState<string[]>(value.split('').slice(0, 6));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, digit: string) => {
    // Permitir apenas números
    const numericValue = digit.replace(/[^0-9]/g, '');
    
    if (numericValue.length <= 1) {
      const newDigits = [...digits];
      newDigits[index] = numericValue;
      setDigits(newDigits);
      onChange(newDigits.join(''));

      // Mover para o próximo campo se um dígito foi inserido
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    const pastedDigits = pastedText.split('').slice(0, 6);
    
    const newDigits = Array(6).fill('');
    pastedDigits.forEach((digit, index) => {
      newDigits[index] = digit;
    });
    
    setDigits(newDigits);
    onChange(newDigits.join(''));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-2" onPaste={handlePaste}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[index] || ''}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="•"
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">Digite os 6 números da sua senha</p>
    </div>
  );
};
