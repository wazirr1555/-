-- 001_create_assets_table.sql
-- 교육용 주석:
-- 이 파일은 Supabase(PostgreSQL 기반) 데이터베이스에 'assets'라는 테이블을 만들기 위한 SQL 명령어입니다.
-- 규칙에 따라 파일명 앞에 순서를 알 수 있도록 '001_'을 붙였습니다.

-- 기존에 'assets' 테이블이 있다면 만약을 위해 지우고 새로 시작합니다. 
-- (실제 서비스에서는 데이터를 날릴 수 있으므로 DROP TABLE은 신중히 사용해야 합니다.)
DROP TABLE IF EXISTS assets;

-- 'assets' 테이블을 생성합니다.
CREATE TABLE assets (
  -- id: 각 자산 항목을 구분하는 고유한 번호입니다. 자동으로 생성(uuid)됩니다.
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- user_id: 어떤 사용자의 자산인지 구분합니다. (로그인 구현 시 활용, 현재는 임시 텍스트)
  user_id TEXT NOT NULL,
  
  -- name: 자산의 이름입니다. (예: "국민은행 예금", "비트코인")
  -- 중요: 데이터베이스 관리자가 봐도 어떤 자산인지 모르게끔 앱에서 암호화하여 저장할 것이므로 타입은 TEXT입니다.
  name TEXT NOT NULL,
  
  -- amount: 자산의 금액입니다.
  -- 중요: 금액 역시 강력한 보안을 위해 암호화된 문자열(TEXT) 형태로 저장됩니다.
  -- (앱에서 복호화한 후 숫자로 변환해서 차트를 그립니다.)
  amount TEXT NOT NULL,
  
  -- category: 자산의 분류입니다. (예: "현금", "주식", "부동산" 등)
  category TEXT NOT NULL,
  
  -- created_at: 데이터가 언제 생성되었는지 시간을 자동으로 기록합니다.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 보안을 위해 RLS(Row Level Security)를 활성화합니다. (현재는 연습용이므로 간단히 설정)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 데이터를 읽고 쓸 수 있는 임시 정책 (추후 인증 추가 시 변경)
CREATE POLICY "Enable all for everyone" ON assets FOR ALL USING (true) WITH CHECK (true);
