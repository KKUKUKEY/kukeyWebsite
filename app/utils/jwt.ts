import { log } from "console";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string; // DB 식별 ID (sub로 매핑)
  email: string; // 이메일
  name: string; // 이름
  role: string; // 역할 (admin, member 등)
}
//토큰 생성
export function generateAccessToken(user: UserPayload): string {
  //키 가져오기
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("환경 변수에 JWT_SECRET이 정의되지 않았습니다.");
  }
  //토큰 내부 데이터
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  // 2. 토큰 생성 및 옵션 설정
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "5h", // 유효 시간 5시간
    issuer: "konkuk-club-server", // 토큰 발행자 식별 정보
  });
}

//토큰 검증
export function verifyAccessToken(token: string) {
  const JWT_SECRET = process.env.JWT_SECRET;
  try {
    // 서명이 맞고 만료가 안 됐다면 해독된 payload를 반환
    const decoded = jwt.verify(token, JWT_SECRET as string);
    return { result: true, decoded };
  } catch (error) {
    // 만료되었거나 누군가 임의로 조작한 토큰인 경우
    return { result: false, error };
  }
}
