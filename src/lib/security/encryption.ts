import CryptoJS from 'crypto-js';

// 교육용 주석:
// 이 파일은 사용자 데이터(금액, 자산 이름 등)를 데이터베이스에 저장하기 전에
// 알아볼 수 없는 형태로 변환(암호화)하고, 화면에 보여줄 때 다시 원래대로 복원(복호화)하는 역할을 합니다.
// 강력한 보안을 위해 AES-256 알고리즘을 사용합니다.

// 암호화/복호화에 사용할 비밀 키입니다. 
// 실제 운영(Production) 환경에서는 이 값을 파일에 직접 적지 않고 .env 파일에 숨겨서 관리해야 합니다.
// (초보자 교육용이므로 우선 코드 내에 상수로 선언하여 동작 원리를 보여줍니다.)
const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'my-super-secret-key-12345';

/**
 * [암호화 함수]
 * 전달받은 문자열(text)을 AES 방식으로 암호화하여 알아볼 수 없는 문자열로 반환합니다.
 * @param text 암호화할 원본 데이터 (예: "1000000")
 * @returns 암호화된 데이터 (예: "U2FsdGVkX19...")
 */
export const encryptData = (text: string): string => {
  if (!text) return '';
  // CryptoJS를 이용하여 text를 SECRET_KEY로 암호화한 뒤, 문자열로 변환(toString)합니다.
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

/**
 * [복호화 함수]
 * 알아볼 수 없는 암호화된 문자열을 전달받아 원래의 문자로 복원합니다.
 * @param encryptedText 암호화된 데이터 (예: "U2FsdGVkX19...")
 * @returns 복호화된 원본 데이터 (예: "1000000")
 */
export const decryptData = (encryptedText: string): string => {
  if (!encryptedText) return '';
  try {
    // 암호화된 텍스트를 다시 SECRET_KEY로 풀고(decrypt),
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    // 풀려난 데이터(bytes)를 사람이 읽을 수 있는 문자열(UTF-8)로 변환합니다.
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    // 만약 잘못된 암호나 데이터로 인해 복호화에 실패하면 콘솔에 에러를 찍고 빈 문자열을 반환합니다.
    console.error('복호화 실패:', error);
    return '';
  }
};
