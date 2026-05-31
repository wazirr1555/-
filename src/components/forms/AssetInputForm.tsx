"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Asset } from '../../types/asset';
import { X } from 'lucide-react';

interface AssetInputFormProps {
  onAdd: (asset: { name: string; amount: string; currency: string; category: string; sub_category?: string; record_date: string; user_id: string }) => void;
  onAddMultiple?: (assets: Omit<Asset, 'id' | 'created_at'>[]) => void;
  assets?: Asset[];
}

export function AssetInputForm({ onAdd, onAddMultiple, assets = [] }: AssetInputFormProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('KRW');
  const [category, setCategory] = useState('현금');
  const [subCategory, setSubCategory] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [hiddenNames, setHiddenNames] = useState<string[]>([]);

  // 컴포넌트가 렌더링될 때 로컬스토리지에서 숨긴 자산 이름들을 불러옵니다.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hidden_asset_names');
      if (stored) {
        setHiddenNames(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 현재 선택된 카테고리와 서브카테고리에 맞는 이전에 입력했던 자산 이름들을 추출합니다.
  const suggestedNames = useMemo(() => {
    // 1. 현재 선택된 카테고리(및 서브카테고리)와 일치하는 자산만 필터링합니다.
    const matchedAssets = assets.filter(a => {
      if (a.category !== category) return false;
      if (subCategory && a.sub_category !== subCategory) return false;
      return true;
    });

    // 2. 이름만 추출하고 최신 입력순으로 중복을 제거합니다. (과거 데이터가 뒤로 가게)
    const uniqueNames = Array.from(new Set(matchedAssets.slice().reverse().map(a => a.name)));

    // 3. 사용자가 숨김(x) 처리한 이름들은 제외합니다.
    return uniqueNames.filter(n => !hiddenNames.includes(n));
  }, [assets, category, subCategory, hiddenNames]);

  // 추천 버튼의 x를 눌렀을 때 실행되는 함수입니다.
  const handleHideName = (nameToHide: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 버튼 자체의 클릭 이벤트(이름 자동입력)가 실행되지 않도록 막습니다.
    if (window.confirm(`'${nameToHide}'을(를) 추천 목록에서 완전히 삭제하시겠습니까?`)) {
      const newHidden = [...hiddenNames, nameToHide];
      setHiddenNames(newHidden);
      localStorage.setItem('hidden_asset_names', JSON.stringify(newHidden));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount) {
      alert('자산 이름과 금액을 모두 입력해주세요!');
      return;
    }

    if ((category === '주식' || category === '가상자산') && !subCategory) {
      alert('세부 분류를 선택해주세요!');
      return;
    }

    onAdd({
      user_id: 'user-123',
      name,
      amount,
      currency,
      category,
      sub_category: subCategory || undefined,
      record_date: recordDate
    });

    setName('');
    setAmount('');
  };

  const handleLoadPreviousMonth = () => {
    // 1. 현재 선택된 날짜 이전의 모든 고유 날짜를 찾습니다.
    const allDates = Array.from(new Set(assets.map(a => a.record_date))).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
    
    // 2. 현재 입력된 recordDate보다 과거인 가장 최근 날짜를 찾습니다.
    const prevDate = allDates.find(d => new Date(d).getTime() < new Date(recordDate).getTime());
    
    if (!prevDate) {
      alert('불러올 이전 달 기록이 없습니다!');
      return;
    }

    // 3. 해당 이전 날짜의 자산 목록을 가져옵니다.
    const prevAssets = assets.filter(a => a.record_date === prevDate);
    
    if (!window.confirm(`'${prevDate}'에 기록된 총 ${prevAssets.length}개의 자산 항목을 불러오시겠습니까?\n(금액은 동일하게 복사되므로 목록에서 꼭 수정해주세요)`)) {
      return;
    }

    // 4. 불러온 목록에 현재 날짜를 적용하여 새로 추가합니다.
    const newAssetsToInsert = prevAssets.map(a => ({
      user_id: 'user-123',
      name: a.name,
      amount: a.amount,
      currency: a.currency || 'KRW',
      category: a.category,
      sub_category: a.sub_category,
      record_date: recordDate
    }));

    if (onAddMultiple) {
      onAddMultiple(newAssetsToInsert);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col gap-5 p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl"
    >
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        ✨ 새 자산 등록
      </h2>
      
      {/* 1. 카테고리 선택 영역을 제일 위로 올립니다. */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-slate-300 ml-1">분류</label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubCategory('');
          }}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-white/10 appearance-none cursor-pointer"
        >
          <option value="현금" className="bg-slate-800">💵 현금</option>
          <option value="주식" className="bg-slate-800">📈 주식</option>
          <option value="가상자산" className="bg-slate-800">🪙 가상자산</option>
          <option value="부동산" className="bg-slate-800">🏠 부동산</option>
          <option value="기타" className="bg-slate-800">📦 기타</option>
        </select>
      </div>

      {(category === '주식' || category === '가상자산') && (
        <div className="flex flex-col gap-1.5 w-full animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-sm font-medium text-slate-300 ml-1">세부 분류</label>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-white/10 appearance-none cursor-pointer"
            required
          >
            <option value="" disabled className="bg-slate-800">선택해주세요</option>
            {category === '주식' && (
              <>
                <option value="국내주식" className="bg-slate-800">🇰🇷 국내주식</option>
                <option value="해외주식" className="bg-slate-800">🌎 해외주식</option>
              </>
            )}
            {category === '가상자산' && (
              <>
                <option value="국내거래소" className="bg-slate-800">🏦 국내거래소</option>
                <option value="해외거래소" className="bg-slate-800">🌐 해외거래소</option>
                <option value="개인지갑" className="bg-slate-800">💼 개인지갑</option>
              </>
            )}
          </select>
        </div>
      )}

      {/* 2. 스마트 추천 버튼 영역 */}
      {suggestedNames.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 animate-in fade-in duration-300">
          {suggestedNames.map(suggestedName => (
            <button
              key={suggestedName}
              type="button"
              onClick={() => setName(suggestedName)}
              className="group flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium transition-colors border border-purple-500/20"
            >
              <span>{suggestedName}</span>
              <div 
                onClick={(e) => handleHideName(suggestedName, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-purple-500/30 rounded-full transition-all text-purple-200"
                title="추천에서 영구 삭제"
              >
                <X className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 3. 자산 이름 입력 영역 */}
      <Input
        label="자산 이름"
        placeholder="예) 카카오뱅크 예금 (위 버튼 클릭 시 자동 입력)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      {/* 4. 금액 및 기타 설정 */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label={currency === 'KRW' ? "금액 (원)" : "금액 (달러)"}
            type="number"
            placeholder={currency === 'KRW' ? "예) 1000000" : "예) 1000"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="w-28 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300 ml-1">통화</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-white/10 appearance-none cursor-pointer text-center"
          >
            <option value="KRW" className="bg-slate-800">🇰🇷 원(₩)</option>
            <option value="USD" className="bg-slate-800">🇺🇸 달러($)</option>
          </select>
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            label="기록 날짜"
            type="date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleLoadPreviousMonth}
          className="h-[46px] px-4 bg-emerald-500/20 text-emerald-300 rounded-xl font-medium text-sm border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors whitespace-nowrap"
        >
          지난달 기록 복사
        </button>
      </div>

      <div className="mt-2">
        <Button type="submit" className="w-full">
          자산 추가하기
        </Button>
      </div>
    </form>
  );
}
