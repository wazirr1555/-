"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useAssetData } from '../hooks/useAssetData';
import { useChartData } from '../hooks/useChartData';
import { AssetInputForm } from '../components/forms/AssetInputForm';
import { SummaryCards } from '../components/dashboards/SummaryCards';
import { AssetChart } from '../components/dashboards/AssetChart';
import { TrendChart } from '../components/dashboards/TrendChart';
import { AssetList } from '../components/dashboards/AssetList';
import { AssetDiffDashboard } from '../components/dashboards/AssetDiffDashboard';
import { Wallet, Calendar, Trash2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { AuthScreen } from '../components/auth/AuthScreen';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 인증 상태 확인
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { assets, loading, addAsset, addAssets, deleteAsset, deleteAssetsByDate, updateAsset } = useAssetData(session?.user?.id);
  
  // 흐름 차트(트렌드 차트)는 과거부터 지금까지 '모든 자산'의 변화를 봐야하므로 assets 전체를 가공합니다.
  const { trendData, trendCategories } = useChartData(assets);

  // 고유한 기록 날짜들을 추출하고 과거->최신(오름차순)으로 정렬합니다.
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(assets.map(a => a.record_date)));
    return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [assets]);

  // 선택된 날짜와 자산 목록/대시보드 토글 상태
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isAssetListVisible, setIsAssetListVisible] = useState(false);
  const [isDiffDashboardVisible, setIsDiffDashboardVisible] = useState(false);

  // 현재 선택된 날짜 바로 이전의 날짜를 찾습니다.
  const prevDate = useMemo(() => {
    if (!selectedDate || uniqueDates.length === 0) return null;
    const currentIndex = uniqueDates.indexOf(selectedDate);
    // index가 0이면 가장 오래된 날짜이므로 이전 날짜가 없음
    return currentIndex > 0 ? uniqueDates[currentIndex - 1] : null;
  }, [uniqueDates, selectedDate]);

  // 이전 날짜의 자산만 필터링합니다.
  const prevDateAssets = useMemo(() => {
    if (!prevDate) return [];
    return assets.filter(a => a.record_date === prevDate);
  }, [assets, prevDate]);

  // 데이터가 로드되고 선택된 날짜가 없을 때 가장 최신 날짜(배열의 마지막 요소)로 기본값을 설정합니다.
  useEffect(() => {
    if (uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(uniqueDates[uniqueDates.length - 1]);
    }
  }, [uniqueDates, selectedDate]);

  // 사용자가 선택한 특정 날짜에 해당하는 자산만 필터링합니다.
  const currentDateAssets = useMemo(() => {
    if (!selectedDate) return [];
    return assets.filter(a => a.record_date === selectedDate);
  }, [assets, selectedDate]);

  // 선택된 날짜의 자산만으로 도넛 차트 데이터를 다시 계산합니다.
  const { assetCategoryData: currentAssetData, liabilityCategoryData: currentLiabilityData } = useChartData(currentDateAssets);

  // 인증 상태 로딩 중이면 빈 화면(또는 스피너)을 보여줍니다.
  if (authLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <span className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
    </div>;
  }

  // 로그인하지 않았다면 로그인 화면을 보여줍니다.
  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-purple-500/30">
      
      <header className="max-w-6xl mx-auto mb-10 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Wallet className="text-white w-7 h-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300">
            내 자산 지킴이
          </h1>
          <p className="text-slate-400 text-sm mt-1">안전하게 암호화되어 관리되는 나만의 자산 대시보드</p>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700 font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <section className="lg:col-span-4 flex flex-col gap-6">
          <AssetInputForm onAdd={addAsset} onAddMultiple={addAssets} assets={assets} userId={session.user.id} />
        </section>

        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {loading ? (
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-32 bg-slate-800/50 rounded-2xl w-full"></div>
              <div className="h-80 bg-slate-800/50 rounded-2xl w-full"></div>
            </div>
          ) : (
            <>
              {/* 날짜 선택 UI */}
              {uniqueDates.length > 0 && (
                <div className="flex items-center gap-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-xl shadow-lg">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span className="text-slate-300 font-medium">조회 날짜:</span>
                  <select
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setIsAssetListVisible(false); // 날짜가 바뀌면 열려있는 패널들을 닫습니다.
                      setIsDiffDashboardVisible(false);
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    {uniqueDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (window.confirm(`⚠️ 경고: [${selectedDate}]에 기록된 모든 자산 데이터(${currentDateAssets.length}개)가 완전히 삭제됩니다.\n정말 통째로 지우시겠습니까?`)) {
                        deleteAssetsByDate(selectedDate);
                        setIsAssetListVisible(false);
                      }
                    }}
                    className="p-2 ml-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 flex items-center justify-center"
                    title="선택한 날짜 기록 전체 삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* 1. 요약 카드 */}
              <SummaryCards 
                assets={currentDateAssets} 
                onAssetCountClick={() => setIsAssetListVisible(!isAssetListVisible)} 
                onTotalAssetsClick={() => setIsDiffDashboardVisible(!isDiffDashboardVisible)}
              />

              {/* 1.5 자산 증감 대시보드 (토글 상태에 따라 보여주기) */}
              {isDiffDashboardVisible && (
                <AssetDiffDashboard 
                  currentAssets={currentDateAssets} 
                  prevAssets={prevDateAssets} 
                />
              )}
              
              {/* 2. 자산 목록 조립 (토글 상태에 따라 부드럽게 보여주기) */}
              {isAssetListVisible && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 ease-out">
                  <AssetList assets={currentDateAssets} onDelete={deleteAsset} onUpdate={updateAsset} />
                </div>
              )}

              {/* 3. 도넛 차트 (선택된 날짜의 데이터 및 전체 자산 목록 전달) */}
              <AssetChart assetData={currentAssetData} liabilityData={currentLiabilityData} assets={currentDateAssets} />

              {/* 4. 흐름 차트 (이건 전체 날짜 추이를 봐야하므로 전체 자산으로 계산된 데이터 전달) */}
              <TrendChart data={trendData} categories={trendCategories} />
            </>
          )}

        </section>
      </main>

    </div>
  );
}
