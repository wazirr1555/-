import { useMemo } from 'react';
import { Asset } from '../types/asset';

// 교육용 주석:
// 'useChartData' 훅은 위에서 불러온(그리고 복호화된) 자산 목록(assets)을 바탕으로,
// 차트(파이 차트 등)를 그리기 좋게 데이터를 가공해 주는 역할을 합니다.

// 차트에 들어갈 데이터 형태 (예: 카테고리별 합계)
export interface ChartDataPoint {
  name: string;  // 카테고리 이름 (예: "현금", "주식")
  value: number; // 해당 카테고리의 총합 금액
}

// 흐름 차트에 들어갈 데이터 형태 (예: 날짜별 자산 총액)
export interface TrendDataPoint {
  date: string;  // 기록 날짜 (예: "2026-05-31")
  total: number; // 해당 날짜의 자산 총액
  [key: string]: any; // 카테고리별 금액을 동적으로 담기 위한 속성
}

export function useChartData(assets: Asset[]) {
  // useMemo는 자산(assets) 데이터가 바뀔 때만 이 계산을 다시 하도록 도와주는 리액트 기능입니다.
  // 이렇게 하면 화면이 깜빡일 때마다 불필요한 계산을 막아줍니다.
  const categoryData = useMemo(() => {
    // 1. 카테고리별로 금액을 누적할 바구니(객체)를 만듭니다.
    const totals: Record<string, number> = {};

    assets.forEach((asset) => {
      // 실시간 환율이 적용된 convertedAmount가 있다면 그것을 쓰고, 없으면 기존 방식을 사용합니다.
      const amountValue = asset.convertedAmount ?? Number(asset.amount);
      
      // 숫자가 아니면 무시 (오류 방지)
      if (isNaN(amountValue)) return;

      // 옵션 B: 하위 분류가 있으면 하위 분류를 우선적으로 보여줍니다.
      const displayCategory = asset.sub_category || asset.category;

      if (totals[displayCategory]) {
        totals[displayCategory] += amountValue;
      } else {
        totals[displayCategory] = amountValue;
      }
    });

    // 2. 바구니(객체) 형태를 차트가 좋아하는 배열(Array) 형태로 바꿉니다.
    // 도넛 차트 범례에서 가장 비율이 높은 자산이 왼쪽에 나오도록 금액이 큰 순서대로 정렬합니다.
    const chartArray: ChartDataPoint[] = Object.keys(totals).map((key) => ({
      name: key,
      value: totals[key]
    })).sort((a, b) => b.value - a.value);

    return chartArray;
  }, [assets]); // assets가 변경될 때만 재계산!

  // 시간에 따른 자산 변화 흐름(트렌드) 데이터 계산 (Stacked Area Chart용)
  const { trendData, trendCategories } = useMemo(() => {
    // 날짜별, 그리고 카테고리별 합계를 저장할 객체
    const dailyTotals: Record<string, Record<string, number>> = {};
    const categories: Set<string> = new Set(); // 존재하는 모든 카테고리 수집
    const overallTotals: Record<string, number> = {}; // 정렬을 위해 전체 기간 합계 수집

    assets.forEach((asset) => {
      // 날짜가 없으면 오늘 날짜로 간주 (과거 데이터 호환성)
      const date = asset.record_date || new Date().toISOString().split('T')[0];
      const amountValue = asset.convertedAmount ?? Number(asset.amount);
      const displayCategory = asset.sub_category || asset.category;
      
      if (isNaN(amountValue)) return;

      categories.add(displayCategory);
      overallTotals[displayCategory] = (overallTotals[displayCategory] || 0) + amountValue;

      if (!dailyTotals[date]) {
        dailyTotals[date] = {};
      }
      if (dailyTotals[date][displayCategory]) {
        dailyTotals[date][displayCategory] += amountValue;
      } else {
        dailyTotals[date][displayCategory] = amountValue;
      }
    });

    const dates = Object.keys(dailyTotals).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    // 더 이상 누적하지 않으므로 cumulativeTotals 객체는 삭제합니다.
    const trendArray: TrendDataPoint[] = dates.map((date) => {
      let dayTotal = 0;
      const point: TrendDataPoint = { date, total: 0 };
      
      // 각 카테고리별로 해당 날짜에 입력된 총액을 그대로 차트에 반영합니다 (누적 아님).
      categories.forEach(cat => {
        const val = dailyTotals[date][cat] || 0;
        point[cat] = val;
        dayTotal += val;
      });
      
      point.total = dayTotal;
      return point;
    });

    // 자산 변화 흐름 차트에서 가장 비중이 높은 자산이 가장 아래로(가장 먼저 렌더링되게) 가도록
    // 전체 기간 합산 금액이 큰 순서대로 카테고리를 정렬합니다.
    const sortedCategories = Array.from(categories).sort((a, b) => (overallTotals[b] || 0) - (overallTotals[a] || 0));

    return { trendData: trendArray, trendCategories: sortedCategories };
  }, [assets]);

  return {
    categoryData,
    trendData,
    trendCategories
  };
}
