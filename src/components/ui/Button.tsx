import React from 'react';

// 교육용 주석:
// 앱 전체에서 재사용할 '버튼' 컴포넌트입니다.
// 매번 버튼을 만들 때마다 색상과 효과를 지정하면 코드가 길어지므로,
// 이렇게 공통 컴포넌트로 만들어두면 한 줄로 예쁜 버튼을 가져다 쓸 수 있습니다.
// 최신 트렌드인 그라데이션과 마우스 오버(Hover) 시 살짝 떠오르는 애니메이션을 적용했습니다.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        relative px-6 py-3 font-semibold text-white rounded-xl shadow-lg
        bg-gradient-to-r from-indigo-500 to-purple-600 
        hover:from-indigo-400 hover:to-purple-500
        active:scale-95 transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        ${props.className || ''}
      `}
    >
      {children}
    </button>
  );
}
