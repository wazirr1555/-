-- 004_add_currency.sql
-- 교육용 주석:
-- 사용자가 입력한 자산이 원화(KRW)인지 달러(USD)인지 구분하기 위해
-- 기존 assets 테이블에 'currency'라는 텍스트 컬럼을 추가합니다.
-- 기본값은 'KRW'로 두어 과거에 입력한 데이터들도 원화로 인식되게 합니다.

ALTER TABLE assets ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'KRW' NOT NULL;
