import { createClient } from '@supabase/supabase-js';

// 교육용 주석:
// 이 파일은 우리 앱과 Supabase 데이터베이스를 연결해 주는 '다리' 역할을 합니다.
// NEXT_PUBLIC_ 이 붙은 환경 변수는 브라우저(클라이언트)에서도 접근 가능합니다.

// 실제 운영 환경에서는 .env.local 파일에 URL과 KEY를 저장해야 합니다.
// 임시로 환경변수가 없을 때를 대비해 빈 문자열로 처리해 두었습니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// createClient 함수를 통해 데이터베이스에 접속할 수 있는 객체를 만듭니다.
export const supabase = createClient(supabaseUrl, supabaseKey);
