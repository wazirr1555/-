-- 003_add_sub_category.sql
-- 교육용 주석:
-- 주식, 가상자산 등 더 세분화된 분류를 저장하기 위해 기존 assets 테이블에 컬럼을 추가합니다.
-- 하위 분류가 없는 경우도 있으므로 비워둘 수 있도록(NULL 허용) 설정합니다.

ALTER TABLE assets ADD COLUMN IF NOT EXISTS sub_category TEXT;
