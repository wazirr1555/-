"use client";

import React, { useState } from 'react';
import { Asset } from '../../types/asset';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { useExchangeRate } from '../../hooks/useExchangeRate';

interface AssetListProps {
  assets: Asset[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedAsset: Omit<Asset, 'id' | 'created_at' | 'user_id' | 'convertedAmount'>) => void;
}

export function AssetList({ assets, onDelete, onUpdate }: AssetListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { usdToKrw } = useExchangeRate();
  
  // 수정할 때 임시로 값을 담아둘 상태들
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // 1. 자산군별로 총액을 미리 계산해 둡니다 (비율 계산용)
  const categoryTotals: Record<string, number> = {};
  assets.forEach(asset => {
    const displayCategory = asset.sub_category || asset.category;
    const value = asset.convertedAmount ?? Number(asset.amount);
    if (!isNaN(value)) {
      categoryTotals[displayCategory] = (categoryTotals[displayCategory] || 0) + value;
    }
  });

  const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6', '#f43f5e', '#84cc16', '#06b6d4'];
  const categoryOrder = Object.keys(categoryTotals);

  const handleEditClick = (asset: Asset) => {
    setEditingId(asset.id);
    setEditName(asset.name);
    setEditAmount(asset.amount);
  };

  const handleSaveClick = (asset: Asset) => {
    onUpdate(asset.id, {
      name: editName,
      amount: editAmount,
      currency: asset.currency,
      category: asset.category,
      sub_category: asset.sub_category,
      record_date: asset.record_date
    });
    setEditingId(null);
  };

  if (assets.length === 0) return null;

  return (
    <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col mt-6">
      <h2 className="text-xl font-bold text-white mb-4">📜 등록된 자산 목록</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400 text-sm">
              <th className="py-3 px-2 font-medium">분류</th>
              <th className="py-3 px-2 font-medium">자산명</th>
              <th className="py-3 px-2 font-medium text-right">금액</th>
              <th className="py-3 px-2 font-medium text-center">그룹 내 비율</th>
              <th className="py-3 px-2 font-medium text-center">기록일</th>
              <th className="py-3 px-2 font-medium text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {assets.slice().reverse().map((asset) => {
              const displayCategory = asset.sub_category || asset.category;
              const value = asset.convertedAmount ?? Number(asset.amount);
              const groupTotal = categoryTotals[displayCategory] || 1;
              const ratio = ((value / groupTotal) * 100).toFixed(1);

              const colorIndex = categoryOrder.indexOf(displayCategory);
              const badgeColor = COLORS[colorIndex % COLORS.length];

              const isEditing = editingId === asset.id;

              return (
                <tr key={asset.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-2">
                    <span 
                      className="px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: `${badgeColor}33`, color: badgeColor }}
                    >
                      {displayCategory}
                    </span>
                  </td>
                  
                  <td className="py-4 px-2">
                    {isEditing ? (
                      <input 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm w-full"
                      />
                    ) : (
                      <span className="text-white font-medium">{asset.name}</span>
                    )}
                  </td>
                  
                  <td className="py-4 px-2 text-right">
                    {isEditing ? (
                      <input 
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        type="number"
                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm w-24 text-right"
                      />
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-white font-medium">
                          {new Intl.NumberFormat('ko-KR').format(Number(asset.amount))} {asset.currency === 'USD' ? '$' : '원'}
                        </span>
                        {asset.currency === 'USD' ? (
                          <span className="text-xs text-slate-400">
                            (약 {new Intl.NumberFormat('ko-KR').format(Math.round(value))}원)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            (약 {new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(value / usdToKrw)}$)
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${ratio}%` }}></div>
                      </div>
                      <span className="text-slate-300 text-xs w-8 text-right">{ratio}%</span>
                    </div>
                  </td>

                  <td className="py-4 px-2 text-center text-slate-400 text-sm">
                    {asset.record_date}
                  </td>
                  
                  <td className="py-4 px-2 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleSaveClick(asset)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40 transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(asset)} className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20 rounded transition-colors" title="수정">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('정말 삭제하시겠습니까?')) onDelete(asset.id);
                          }} 
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors" title="삭제">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
