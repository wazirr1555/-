"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendDataPoint } from '../../hooks/useChartData';

// 교육용 주석:
// 시간에 따른 자산의 변화(트렌드)를 보여주는 선/영역 차트 컴포넌트입니다.
// Recharts 라이브러리의 AreaChart를 사용하여 부드러운 곡선과 아래가 채워진 예쁜 차트를 만듭니다.

interface TrendChartProps {
  data: TrendDataPoint[];
  categories: string[];
}

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6', '#f43f5e', '#84cc16', '#06b6d4'];

export function TrendChart({ data, categories = [] }: TrendChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-80 animate-pulse bg-slate-800/50 rounded-xl"></div>;
  }

  if (!data || data.length === 0) {
    return null; // 데이터가 없으면 아무것도 보여주지 않습니다.
  }

  // 선택된 카테고리가 있으면 그것만 렌더링하고, 없으면 전체(categories)를 렌더링합니다.
  const activeCategories = selectedCategory ? [selectedCategory] : categories;

  return (
    <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl h-[30rem] flex flex-col mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-white whitespace-nowrap">📈 자산 변화 흐름</h2>
        
        {/* 카테고리 필터 뱃지 */}
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
              selectedCategory === null 
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            전체
          </button>
          {categories.map((cat, index) => {
            const isSelected = selectedCategory === cat;
            const color = COLORS[index % COLORS.length];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: isSelected ? color : undefined,
                  color: isSelected ? '#fff' : undefined,
                  borderColor: isSelected ? color : 'transparent'
                }}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-all border ${
                  isSelected 
                    ? 'shadow-lg' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
          >
            {/* 차트 배경의 흐린 격자무늬 */}
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            
            {/* X축 (날짜) */}
            <XAxis 
              dataKey="date" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickMargin={10}
            />
            
            {/* Y축 (금액) - 너무 길면 잘리므로 큰 단위로 포맷팅하거나 생략 가능 */}
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12}
              tickFormatter={(value) => `${(value / 10000).toLocaleString()}만`}
            />
            
            {/* 마우스 올렸을 때 보여주는 정보 창 */}
            <Tooltip 
              formatter={(value: any, name: any) => [new Intl.NumberFormat('ko-KR').format(Number(value)) + '원', name === 'total' ? '총 자산' : name]}
              labelFormatter={(label) => `기록일: ${label}`}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem', color: '#f8fafc' }}
              itemStyle={{ color: '#fff' }}
            />
            
            {/* 차트 영역의 예쁜 그라데이션 색상 정의 */}
            <defs>
              {activeCategories.map((cat) => {
                // 원래 배열에서의 인덱스를 찾아 고유한 색상을 매칭합니다.
                const originalIndex = categories.indexOf(cat);
                const color = COLORS[originalIndex % COLORS.length];
                return (
                  <linearGradient key={`gradient-${cat}`} id={`color-${originalIndex}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0.2}/>
                  </linearGradient>
                );
              })}
            </defs>

            {/* 활성화된 자산군만 영역 차트로 렌더링합니다. */}
            {activeCategories.map((cat) => {
              const originalIndex = categories.indexOf(cat);
              const color = COLORS[originalIndex % COLORS.length];
              return (
                <Area 
                  key={cat}
                  type="monotone" 
                  dataKey={cat}
                  stackId="1" // 모든 Area에 동일한 stackId를 주면 누적(Stacked)됩니다. (선택된 카테고리가 1개일 땐 단일로 표시됨)
                  stroke={color} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#color-${originalIndex})`}
                  activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Recharts Legend 대신 직접 HTML로 범례를 그립니다. categories는 비중 내림차순 정렬이므로 순서가 보장됩니다. */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 pt-4">
        {activeCategories.map((cat) => {
          const originalIndex = categories.indexOf(cat);
          const color = COLORS[originalIndex % COLORS.length];
          return (
            <div key={cat} className="flex items-center gap-1.5 text-sm text-slate-300">
              <span 
                className="w-3 h-3 rounded-full inline-block flex-shrink-0" 
                style={{ backgroundColor: color }} 
              />
              {cat}
            </div>
          );
        })}
      </div>
    </div>
  );
}
