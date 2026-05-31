import React from 'react';

// 교육용 주석:
// 앱 전체에서 재사용할 '입력창(Input)' 컴포넌트입니다.
// 겉보기에 투명한 유리 같은 느낌(Glassmorphism)을 주어 고급스러운 디자인을 연출합니다.

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-slate-300 ml-1">
        {label}
      </label>
      <input
        {...props}
        className={`
          w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl
          text-white placeholder-slate-400
          backdrop-blur-md shadow-sm transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          hover:bg-white/10
          ${props.className || ''}
        `}
      />
    </div>
  );
}
