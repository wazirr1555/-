-- 005_update_rls_for_auth.sql
-- 다중 사용자 환경을 위한 행 단위 보안(Row Level Security) 적용

-- 1. 기존에 존재하던 "모두에게 허용" 정책(001 파일에서 생성함)을 삭제합니다.
DROP POLICY IF EXISTS "Enable all for everyone" ON assets;

-- 2. 로그인한 사용자 본인의 데이터만 조회할 수 있는 정책
CREATE POLICY "Users can view their own assets" 
ON assets FOR SELECT 
USING (auth.uid()::text = user_id);

-- 3. 로그인한 사용자 본인의 데이터만 추가할 수 있는 정책
CREATE POLICY "Users can insert their own assets" 
ON assets FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- 4. 로그인한 사용자 본인의 데이터만 수정할 수 있는 정책
CREATE POLICY "Users can update their own assets" 
ON assets FOR UPDATE 
USING (auth.uid()::text = user_id) 
WITH CHECK (auth.uid()::text = user_id);

-- 5. 로그인한 사용자 본인의 데이터만 삭제할 수 있는 정책
CREATE POLICY "Users can delete their own assets" 
ON assets FOR DELETE 
USING (auth.uid()::text = user_id);
