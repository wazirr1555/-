"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartDataPoint } from '../../hooks/useChartData';
import { Asset } from '../../types/asset';
import { ArrowLeft } from 'lucide-react';

// 교육용 주석:
// 2단계에서 만든 '차트용 데이터'를 받아와서 실제로 화면에 파이(도넛) 차트로 그려주는 컴포넌트입니다.
// 'recharts'라는 유명한 차트 라이브러리를 사용하여 시각적으로 아름답게 표현합니다.

interface AssetChartProps {
  assetData: ChartDataPoint[];
  liabilityData: ChartDataPoint[];
  assets?: Asset[];
}

// 각 카테고리별로 예쁜 색상을 지정해줍니다. (테일윈드 컬러 기반)
// 개인지갑과 현금 등 비슷한 속성의 자산들이 명확히 구분되도록 색상을 다양하게 10가지로 늘렸습니다.
const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6', '#f43f5e', '#84cc16', '#06b6d4'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  // 비율이 5% 미만인 경우 글자가 겹칠 수 있으므로 라벨을 생략합니다.
  if (percent < 0.05) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function AssetChart({ assetData, liabilityData, assets = [] }: AssetChartProps) {
  // Recharts는 브라우저 환경에서만 렌더링되어야 하므로, 마운트(Mount) 여부를 확인합니다.
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'asset' | 'liability'>('asset');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayData = useMemo(() => {
    let rawData = viewType === 'asset' ? assetData : liabilityData;
    
    // 선택된 카테고리가 있다면 해당 하위 자산들을 추출합니다.
    if (selectedCategory) {
      const categoryAssets = assets.filter(a => (a.sub_category || a.category) === selectedCategory);
      const totals: Record<string, number> = {};
      
      categoryAssets.forEach(a => {
        const val = a.convertedAmount ?? Number(a.amount);
        if (!isNaN(val)) {
           totals[a.name] = (totals[a.name] || 0) + val;
        }
      });
      
      rawData = Object.keys(totals).map(name => ({ name, value: totals[name] }));
    }
    
    // 최상위 화면이든 세부 화면이든 무조건 금액(비율)이 가장 큰 순서대로 내림차순 정렬합니다.
    // 그래야 Recharts 범례(Legend)에서 가장 큰 항목이 제일 먼저(가장 왼쪽) 그려집니다.
    return [...rawData].sort((a, b) => b.value - a.value);
  }, [assetData, liabilityData, viewType, assets, selectedCategory]);

  if (!isMounted) {
    return <div className="h-64 animate-pulse bg-slate-800/50 rounded-xl"></div>;
  }

  // 자산 데이터가 없을 경우 보여줄 빈 화면입니다.
  if ((!assetData || assetData.length === 0) && (!liabilityData || liabilityData.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl">
        <p className="text-slate-400">등록된 자산이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl h-[26rem] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          📊 {selectedCategory ? `${selectedCategory} 세부 비율` : (viewType === 'asset' ? '자산 비율' : '부채 비율')}
        </h2>
        <div className="flex items-center gap-2">
          {!selectedCategory && (
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewType('asset')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewType === 'asset' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-300'}`}
              >
                자산
              </button>
              <button
                onClick={() => setViewType('liability')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewType === 'liability' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-slate-300'}`}
              >
                부채
              </button>
            </div>
          )}
          {selectedCategory && (
            <button 
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로 가기
            </button>
          )}
        </div>
      </div>
      
      {displayData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">해당 항목에 등록된 내역이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 w-full">
        {/* ResponsiveContainer는 차트가 화면 크기에 맞춰 자동으로 늘어나거나 줄어들게 해줍니다. */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%" // X축 중앙
              cy="50%" // Y축 중앙
              innerRadius={60} // 안쪽이 뚫린 도넛 모양으로 만들기 위해 수치 부여
              outerRadius={80} // 바깥쪽 크기
              paddingAngle={5} // 조각과 조각 사이의 간격
              dataKey="value"  // 어떤 값을 기준으로 크기를 정할 것인지
              stroke="none"    // 테두리 선 없애기
              labelLine={false} // 라벨 연결선 없애기
              label={renderCustomizedLabel} // 도넛 조각 위에 % 라벨 표시
              onClick={(entry) => {
                // 아직 선택된 카테고리가 없을 때(최상위 화면일 때)만 클릭해서 들어갈 수 있습니다.
                if (!selectedCategory && entry && entry.name) {
                  setSelectedCategory(entry.name);
                }
              }}
              className={!selectedCategory ? "cursor-pointer hover:opacity-80 transition-opacity outline-none" : "outline-none"}
            >
              {/* 각 조각마다 정해진 색상을 칠해줍니다. */}
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {/* 마우스를 올렸을 때 말풍선(Tooltip)으로 자세한 내용을 보여줍니다. */}
            <Tooltip 
              formatter={(value: any) => new Intl.NumberFormat('ko-KR').format(Math.round(Number(value))) + '원'}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', color: '#f8fafc' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
          {/* Recharts Legend 대신 직접 HTML로 범례를 그립니다. displayData는 금액 내림차순 정렬이므로 순서가 보장됩니다. */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 pt-4">
            {displayData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-sm text-slate-300">
                <span 
                  className="w-3 h-3 rounded-full inline-block flex-shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                {entry.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
