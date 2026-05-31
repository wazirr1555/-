import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase/client';
import { encryptData, decryptData } from '../lib/security/encryption';
import { Asset } from '../types/asset';
import { useExchangeRate } from './useExchangeRate';

// 교육용 주석:
// 커스텀 훅(Custom Hook)인 'useAssetData'입니다.
// 리액트 컴포넌트(화면)에서는 '보여주는' 역할만 하고,
// '데이터를 불러오고, 암호화해서 저장하는' 복잡한 로직은 모두 이 파일에서 처리합니다.

export function useAssetData(userId?: string) {
  // DB에서 복호화된 원본 데이터를 가지고 있는 상태
  const [rawAssets, setRawAssets] = useState<Asset[]>([]);
  const { usdToKrw } = useExchangeRate();

  // 화면에 보여줄 자산 목록 (원본 데이터 + 환율이 적용된 convertedAmount)
  const assets = useMemo(() => {
    return rawAssets.map((asset) => {
      const numAmount = Number(asset.amount);
      // 달러(USD)인 경우 환율을 곱해주고, 아니면 그대로 원화 금액을 사용합니다.
      const converted = asset.currency === 'USD' && !isNaN(numAmount) ? numAmount * usdToKrw : numAmount;
      return {
        ...asset,
        convertedAmount: converted
      };
    });
  }, [rawAssets, usdToKrw]);
  // 데이터를 불러오는 중인지 나타내는 상태
  const [loading, setLoading] = useState(true);

  // 1. 자산 데이터 불러오기 (Read)
  const fetchAssets = async () => {
    if (!userId) return; // 유저 ID가 없으면 데이터를 불러오지 않음
    
    setLoading(true);
    // Supabase의 'assets' 테이블에서 현재 사용자의 데이터만 가져옵니다.
    const { data, error } = await supabase.from('assets').select('*').eq('user_id', userId);
    
    if (error) {
      console.error('데이터 불러오기 실패:', error);
    } else if (data) {
      // DB에서 가져온 데이터는 현재 '암호화'되어 있습니다.
      // 이를 화면에 보여주기 위해 전부 '복호화(해독)' 해야 합니다.
      const decryptedAssets: Asset[] = data.map((item: any) => ({
        ...item,
        // 이름과 금액이 암호화되어 있으므로, decryptData 함수를 거쳐 원래 글자로 바꿉니다.
        name: decryptData(item.name),
        amount: decryptData(item.amount),
        currency: item.currency ? decryptData(item.currency) : 'KRW', // 과거 데이터 호환성
        category: decryptData(item.category),
        sub_category: item.sub_category ? decryptData(item.sub_category) : undefined
      }));
      // 복호화가 완료된 원본 데이터를 상태에 저장합니다.
      setRawAssets(decryptedAssets);
    }
    setLoading(false);
  };

  // 앱이 처음 켜질 때, 또는 userId가 변경될 때 데이터를 불러오도록 합니다.
  useEffect(() => {
    fetchAssets();
  }, [userId]);

  // 2. 자산 데이터 추가하기 (Create)
  const addAsset = async (newAsset: Omit<Asset, 'id' | 'created_at'>) => {
    // 중요: DB에 저장하기 전에 데이터를 반드시 '암호화'합니다.
    const encryptedAsset = {
      user_id: newAsset.user_id, // 사용자 ID는 검색을 위해 암호화하지 않음 (상황에 따라 다름)
      name: encryptData(newAsset.name),
      amount: encryptData(newAsset.amount),
      currency: encryptData(newAsset.currency),
      category: encryptData(newAsset.category),
      sub_category: newAsset.sub_category ? encryptData(newAsset.sub_category) : null,
      record_date: newAsset.record_date // 빠른 정렬과 차트 렌더링을 위해 날짜는 암호화하지 않음
    };

    const { error } = await supabase.from('assets').insert([encryptedAsset]);

    if (error) {
      console.error('데이터 추가 실패:', error);
      alert('자산을 추가하는데 실패했습니다.');
    } else {
      // 성공하면 데이터를 다시 불러와 화면을 갱신합니다.
      fetchAssets();
    }
  };

  // 2-1. 여러 자산 데이터 한 번에 추가하기 (Batch Create)
  const addAssets = async (newAssets: Omit<Asset, 'id' | 'created_at'>[]) => {
    // 중요: DB에 저장하기 전에 데이터를 모두 '암호화'합니다.
    const encryptedAssets = newAssets.map(asset => ({
      user_id: asset.user_id,
      name: encryptData(asset.name),
      amount: encryptData(asset.amount),
      currency: encryptData(asset.currency),
      category: encryptData(asset.category),
      sub_category: asset.sub_category ? encryptData(asset.sub_category) : null,
      record_date: asset.record_date
    }));

    const { error } = await supabase.from('assets').insert(encryptedAssets);

    if (error) {
      console.error('데이터 일괄 추가 실패:', error);
      alert('자산을 불러오는데 실패했습니다.');
    } else {
      fetchAssets();
    }
  };

  // 3. 자산 삭제하기 (Delete)
  const deleteAsset = async (id: string) => {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) {
      console.error('데이터 삭제 실패:', error);
      alert('자산을 삭제하는데 실패했습니다.');
    } else {
      fetchAssets();
    }
  };

  // 3-1. 특정 날짜의 자산 전체 삭제하기 (Batch Delete)
  const deleteAssetsByDate = async (date: string) => {
    const { error } = await supabase.from('assets').delete().eq('record_date', date);
    if (error) {
      console.error('날짜별 일괄 삭제 실패:', error);
      alert('해당 날짜의 기록을 삭제하는데 실패했습니다.');
    } else {
      fetchAssets();
    }
  };

  // 4. 자산 수정하기 (Update)
  const updateAsset = async (id: string, updatedAsset: Omit<Asset, 'id' | 'created_at' | 'user_id' | 'convertedAmount'>) => {
    const encryptedAsset = {
      name: encryptData(updatedAsset.name),
      amount: encryptData(updatedAsset.amount),
      currency: encryptData(updatedAsset.currency),
      category: encryptData(updatedAsset.category),
      sub_category: updatedAsset.sub_category ? encryptData(updatedAsset.sub_category) : null,
      record_date: updatedAsset.record_date
    };

    const { error } = await supabase.from('assets').update(encryptedAsset).eq('id', id);
    if (error) {
      console.error('데이터 수정 실패:', error);
      alert('자산을 수정하는데 실패했습니다.');
    } else {
      fetchAssets();
    }
  };

  return {
    assets,
    loading,
    addAsset,
    addAssets,
    deleteAsset,
    deleteAssetsByDate,
    updateAsset,
    refresh: fetchAssets // 수동으로 새로고침이 필요할 때 사용
  };
}
