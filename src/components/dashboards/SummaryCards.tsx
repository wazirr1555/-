"use client";

import React from 'react';
import { Asset } from '../../types/asset';
import { Wallet, TrendingUp, AlertCircle } from 'lucide-react';

// 교육용 주석:
// 현재 사용자의 총 자산을 계산하고, 이를 아름다운 카드로 보여주는 컴포넌트입니다.

interface SummaryCardsProps {
  assets: Asset[];
  onAssetCountClick?: () => void;
  onTotalAssetsClick?: () => void;
}

export function SummaryCards({ assets, onAssetCountClick, onTotalAssetsClick }: SummaryCardsProps) {
  // 복호화된 자산 목록(assets)을 돌면서 모든 금액을 더합니다.
  const totalAmount = assets.reduce((sum, asset) => {
    // 실시간 환율이 적용된 convertedAmount가 있다면 그것을 쓰고, 없으면 기존 방식을 사용합니다.
    const value = asset.convertedAmount ?? Number(asset.amount);
    return isNaN(value) ? sum : sum + value;
  }, 0);

  // 숫자를 "1,000,000" 처럼 쉼표가 들어간 돈 형식으로 예쁘게 바꿔줍니다.
  const formattedTotal = new Intl.NumberFormat('ko-KR').format(totalAmount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 총 자산 카드 */}
      <div 
        onClick={onTotalAssetsClick}
        className={`p-6 rounded-2xl bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-purple-500/30 backdrop-blur-xl shadow-xl flex items-center justify-between group transition-transform duration-300 ${onTotalAssetsClick ? 'cursor-pointer hover:scale-[1.02] hover:border-purple-400/60 hover:shadow-purple-500/20' : 'hover:scale-[1.02]'}`}
      >
        <div>
          <p className="text-purple-200 text-sm font-medium mb-1">나의 총 자산</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {formattedTotal} <span className="text-xl text-purple-300 font-normal">원</span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
          <Wallet className="w-6 h-6 text-purple-200" />
        </div>
      </div>

      {/* 등록된 자산 개수 카드 (클릭 가능) */}
      <div 
        onClick={onAssetCountClick}
        className={`p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 backdrop-blur-xl shadow-xl flex items-center justify-between group transition-transform duration-300 ${onAssetCountClick ? 'cursor-pointer hover:scale-[1.02] hover:border-slate-500/50 hover:shadow-purple-500/10' : 'hover:scale-[1.02]'}`}
      >
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">등록된 자산 항목</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {assets.length} <span className="text-xl text-slate-400 font-normal">개</span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <TrendingUp className="w-6 h-6 text-slate-300" />
        </div>
      </div>
    </div>
  );
}
