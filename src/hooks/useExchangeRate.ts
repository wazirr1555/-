import { useState, useEffect } from 'react';

// 교육용 주석:
// 이 훅은 무료 공개 API를 호출하여 현재 1달러가 우리나라 돈으로 얼마인지(환율) 가져옵니다.
// 실시간 자산 가치를 계산할 때 아주 유용하게 쓰입니다.

export function useExchangeRate() {
  // 기본값은 대략적인 환율인 1350원으로 설정해둡니다. (API 호출 실패 시 대비)
  const [usdToKrw, setUsdToKrw] = useState(1350);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        // 회원가입이나 키 없이 쓸 수 있는 공개 무료 환율 API (예: er-api.com)
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();

        // 가져온 데이터 중 원화(KRW) 환율만 쏙 빼서 저장합니다.
        if (data && data.rates && data.rates.KRW) {
          setUsdToKrw(data.rates.KRW);
        }
      } catch (error) {
        console.error('환율 정보를 가져오는데 실패했습니다:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []); // []는 '앱이 처음 켜질 때 딱 한 번만 실행해라'라는 뜻입니다.

  return { usdToKrw, loading };
}
