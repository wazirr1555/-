-- 002_add_record_date.sql
-- 교육용 주석:
-- 사용자가 자산을 기록한 '날짜(record_date)'를 저장하기 위해 기존 assets 테이블에 컬럼을 추가합니다.
-- 이미 저장된 데이터가 있을 수 있으므로, 기본값(DEFAULT)으로 '오늘 날짜(CURRENT_DATE)'를 넣어줍니다.

ALTER TABLE assets ADD COLUMN IF NOT EXISTS record_date DATE DEFAULT CURRENT_DATE NOT NULL;
