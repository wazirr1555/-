// 교육용 주석:
// 타입스크립트(TypeScript)를 사용하면 데이터의 '형태(Type)'를 미리 정의할 수 있습니다.
// 덕분에 개발 중에 오타를 방지하고, 어떤 데이터가 들어있는지 한눈에 파악할 수 있습니다.

// Asset(자산) 데이터의 형태를 정의합니다.
export interface Asset {
  id: string;         // 고유 번호 (데이터베이스에서 자동 생성된 uuid)
  user_id: string;    // 사용자 식별자
  name: string;       // 자산 이름 (예: "국민은행 예금")
  amount: string;     // 자산 금액 (숫자지만, 암호화를 거치거나 풀 때 문자열로 다룹니다)
  currency: string;   // 통화 (예: "KRW" 또는 "USD")
  category: string;   // 분류 (예: "현금", "주식")
  sub_category?: string; // 세부 분류 (예: "국내주식", "해외거래소" 등)
  record_date: string; // 자산 기록 날짜 (예: "2026-05-31")
  convertedAmount?: number; // 화면에 보여줄 때 환율을 곱한 최종 원화 금액 (DB 저장 안함)
  created_at?: string; // 생성 시간 (선택적)
}
