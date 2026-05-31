"use client";

import React, { useMemo, useState } from 'react';
import { Asset } from '../../types/asset';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';

// 교육용 주석:
// 현재 기록과 이전 기록의 자산을 비교하여 카테고리별 증감액과 비중을 보여주는 컴포넌트입니다.

interface AssetDiffDashboardProps {
  currentAssets: Asset[];
  prevAssets: Asset[];
}

const CATEGORY_ICONS: Record<string, string> = {
  '현금': '💵',
  '주식': '📈',
  '국내주식': '🇰🇷',
  '해외주식': '🌎',
  '가상자산': '🪙',
  '국내거래소': '🏦',
  '해외거래소': '🌐',
  '개인지갑': '💼',
  '부동산': '🏠',
  '기타': '📦'
};

interface DiffItem {
  name: string;
  currentAmount: number;
  prevAmount: number;
  diffAmount: number;
  percentage: number;
  diffPercentage: number;
  subItems: DiffItem[];
}

export function AssetDiffDashboard({ currentAssets, prevAssets }: AssetDiffDashboardProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // 현재/과거 자산 총액 계산
  const currentTotal = useMemo(() => {
    return currentAssets.reduce((sum, a) => {
      const val = a.convertedAmount ?? Number(a.amount);
      return isNaN(val) ? sum : sum + val;
    }, 0);
  }, [currentAssets]);

  const prevTotal = useMemo(() => {
    return prevAssets.reduce((sum, a) => {
      const val = a.convertedAmount ?? Number(a.amount);
      return isNaN(val) ? sum : sum + val;
    }, 0);
  }, [prevAssets]);

  const totalDiffAmount = currentTotal - prevTotal;
  const totalDiffPercentage = prevTotal > 0 ? (totalDiffAmount / prevTotal) * 100 : 0;

  // 카테고리별 증감 및 비중 계산 로직
  const categoryDiffs = useMemo(() => {
    // 1. 큰 분류(category)와 소분류(sub_category) 별로 맵 생성
    const currentMap: Record<string, { total: number; subs: Record<string, number> }> = {};
    const prevMap: Record<string, { total: number; subs: Record<string, number> }> = {};

    const addToMap = (map: typeof currentMap, asset: Asset) => {
      const val = asset.convertedAmount ?? Number(asset.amount);
      const amount = isNaN(val) ? 0 : val;
      const cat = asset.category;
      const sub = asset.sub_category;

      if (!map[cat]) map[cat] = { total: 0, subs: {} };
      map[cat].total += amount;

      if (sub) {
        if (!map[cat].subs[sub]) map[cat].subs[sub] = 0;
        map[cat].subs[sub] += amount;
      }
    };

    currentAssets.forEach(a => addToMap(currentMap, a));
    prevAssets.forEach(a => addToMap(prevMap, a));

    // 2. 모든 고유 카테고리 추출
    const allCategories = Array.from(new Set([...Object.keys(currentMap), ...Object.keys(prevMap)]));

    // 3. 트리 구조의 데이터 생성
    const result: DiffItem[] = allCategories.map(cat => {
      const currentAmount = Math.round(currentMap[cat]?.total || 0);
      const prevAmount = Math.round(prevMap[cat]?.total || 0);
      const diffAmount = currentAmount - prevAmount;
      const percentage = currentTotal > 0 ? (currentAmount / currentTotal) * 100 : 0;

      const subCategories = Array.from(new Set([
        ...Object.keys(currentMap[cat]?.subs || {}),
        ...Object.keys(prevMap[cat]?.subs || {})
      ]));

      const subItems: DiffItem[] = subCategories.map(sub => {
        const subCurrent = Math.round(currentMap[cat]?.subs[sub] || 0);
        const subPrev = Math.round(prevMap[cat]?.subs[sub] || 0);
        const subDiff = subCurrent - subPrev;
        const subPercentage = currentTotal > 0 ? (subCurrent / currentTotal) * 100 : 0;
        const subDiffPercentage = subPrev > 0 ? (subDiff / subPrev) * 100 : 0;

        return {
          name: sub,
          currentAmount: subCurrent,
          prevAmount: subPrev,
          diffAmount: subDiff,
          percentage: subPercentage,
          diffPercentage: subDiffPercentage,
          subItems: [] // 소분류의 하위는 없음
        };
      }).sort((a, b) => b.currentAmount - a.currentAmount);

      const diffPercentage = prevAmount > 0 ? (diffAmount / prevAmount) * 100 : 0;

      return {
        name: cat,
        currentAmount,
        prevAmount,
        diffAmount,
        percentage,
        diffPercentage,
        subItems
      };
    }).sort((a, b) => b.currentAmount - a.currentAmount);

    return result;
  }, [currentAssets, prevAssets, currentTotal]);

  if (currentAssets.length === 0 && prevAssets.length === 0) {
    return null;
  }

  const toggleExpand = (catName: string) => {
    if (expandedCategory === catName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(catName);
    }
  };

  // 재사용 가능한 아이템 렌더링 함수
  const renderItemCard = (item: DiffItem, isSub: boolean = false) => {
    const isPositive = item.diffAmount > 0;
    const isNegative = item.diffAmount < 0;
    const hasSubs = item.subItems.length > 0;
    const isExpanded = expandedCategory === item.name;

    return (
      <div 
        key={item.name} 
        className={`${isSub ? 'bg-slate-800/80 border-l-2 border-l-purple-500 rounded-r-xl' : 'bg-slate-800/40 border border-slate-700/50 rounded-xl group'} p-4 flex flex-col gap-3 transition-colors ${hasSubs && !isSub ? 'cursor-pointer hover:bg-slate-800/60' : ''}`}
        onClick={() => { if (hasSubs && !isSub) toggleExpand(item.name) }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-xl">{CATEGORY_ICONS[item.name] || (isSub ? '↳' : '📦')}</span>
            <span className={`font-semibold ${isSub ? 'text-slate-300' : 'text-slate-200'}`}>
              {item.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-0.5">현재 금액</p>
              <p className="font-bold text-white">
                {new Intl.NumberFormat('ko-KR').format(item.currentAmount)}원
              </p>
            </div>
            {hasSubs && !isSub && (
              <div className="ml-2 bg-white/5 p-1.5 rounded-lg text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            )}
          </div>
        </div>

        {/* 비중(Proportion) 바 */}
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>전체 자산 중 비중</span>
            <span className={`${isSub ? 'text-indigo-300' : 'text-purple-300'} font-medium`}>{Math.round(item.percentage)}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${isSub ? 'bg-gradient-to-r from-indigo-500 to-blue-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>

        {/* 증감액 (Diff) 표시 */}
        {prevAssets.length > 0 && (
          <div className={`mt-2 p-2.5 rounded-lg flex items-center justify-between text-sm font-medium ${
            isPositive ? 'bg-emerald-500/10 text-emerald-400' : 
            isNegative ? 'bg-red-500/10 text-red-400' : 
            'bg-slate-700/30 text-slate-400'
          }`}>
            <span className="flex items-center gap-1.5 opacity-90 text-xs">
              지난번 대비
            </span>
            <div className="flex items-center gap-1">
              {isPositive ? <TrendingUp className="w-4 h-4" /> : 
               isNegative ? <TrendingDown className="w-4 h-4" /> : 
               <Minus className="w-4 h-4" />}
              <span>
                {isPositive ? '+' : ''}
                {new Intl.NumberFormat('ko-KR').format(item.diffAmount)}원
              </span>
              {item.prevAmount > 0 && (
                <span className="ml-1 opacity-80 text-xs font-bold">
                  ({isPositive ? '+' : ''}{item.diffPercentage.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-6 animate-in fade-in slide-in-from-top-4 duration-300 ease-out mt-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          📊 자산군별 변동 상세
        </h3>
        {prevAssets.length === 0 && currentAssets.length > 0 && (
          <span className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
            비교할 이전 기록이 없습니다
          </span>
        )}
      </div>

      {/* 총자산 증감 표시 부분 */}
      {prevAssets.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">총 자산 변동 (지난번 대비)</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">
                {new Intl.NumberFormat('ko-KR').format(currentTotal)}원
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center justify-end gap-1 font-bold text-xl ${
              totalDiffAmount > 0 ? 'text-emerald-400' :
              totalDiffAmount < 0 ? 'text-red-400' : 'text-slate-400'
            }`}>
              {totalDiffAmount > 0 ? <TrendingUp className="w-6 h-6" /> :
               totalDiffAmount < 0 ? <TrendingDown className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
              <span>
                {totalDiffAmount > 0 ? '+' : ''}
                {new Intl.NumberFormat('ko-KR').format(totalDiffAmount)}원
              </span>
            </div>
            <div className={`text-sm font-medium mt-1 ${
              totalDiffAmount > 0 ? 'text-emerald-500/80' :
              totalDiffAmount < 0 ? 'text-red-500/80' : 'text-slate-500'
            }`}>
              ({totalDiffAmount > 0 ? '+' : ''}{totalDiffPercentage.toFixed(1)}%)
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryDiffs.map((catItem) => (
          <div key={catItem.name} className="flex flex-col gap-2">
            {/* 큰 분류 렌더링 */}
            {renderItemCard(catItem, false)}
            
            {/* 세부 분류 렌더링 (확장된 경우) */}
            {expandedCategory === catItem.name && catItem.subItems.length > 0 && (
              <div className="pl-6 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {catItem.subItems.map(subItem => renderItemCard(subItem, true))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
