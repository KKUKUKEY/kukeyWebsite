// 이 파일을 프로젝트의 app/api/register/route.ts 경로에 넣으세요.

import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../../lib/db_test";

interface MemberRow extends RowDataPacket {
  email: string;
}

// ERD 기준: role은 admin/member (email이 PK라서 별도 id 컬럼 없음)
const VALID_ROLES = ["admin", "member"];

// ⚠️ TODO: "인증되지 않은 이메일" 조건이 정확히 뭔지 확정되면 이 배열/로직을 채워주세요.
// 지금은 "학교 이메일 도메인이 아니면 거부"로 임시 구현해뒀습니다.
// (운영진 사전 승인 목록이나 이메일 인증코드(OTP) 방식이면 이 블록을 통째로 교체하면 됩니다)
const ALLOWED_EMAIL_DOMAINS: string[] = []; // 예: ["konkuk.ac.kr"]

function isAuthenticatedEmail(email: string): boolean {
  if (ALLOWED_EMAIL_DOMAINS.length === 0) return true; // 도메인 목록 비어있으면 일단 통과
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}

// POST /api/register
// 신규 동아리원을 등록합니다.
// (참고: 현재는 JWT 미발급 - 추후 로그인 로직을 JWT 방식으로 바꿀 때 여기도 같이 연결 예정)
export async function POST(req: Request) {
  try {
    // 1. 요청 바디 파싱
    const body = await req.json();
    const { email, pw, role, name } = body;

    // 2. 필수값 검증
    // ⚠️ member 테이블의 name 컬럼이 NOT NULL이라 회원가입 시 name도 필수로 받습니다.
    if (!email || !pw || !role || !name) {
      return Response.json(
        {
          result: false,
          message: "email, pw, role, name은 필수입니다",
          data: null,
        },
        { status: 400 },
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return Response.json(
        {
          result: false,
          message: "role은 admin 또는 member만 가능합니다",
          data: null,
        },
        { status: 400 },
      );
    }

    if (typeof pw !== "string" || pw.length < 8) {
      return Response.json(
        {
          result: false,
          message: "비밀번호는 8자 이상이어야 합니다",
          data: null,
        },
        { status: 400 },
      );
    }

    // 3. 이메일 인증(허용) 여부 확인
    if (!isAuthenticatedEmail(email)) {
      return Response.json(
        { result: false, message: "인증되지 않은 이메일입니다", data: null },
        { status: 403 },
      );
    }

    // 4. 이메일 중복 확인
    const [existing] = await pool.query<MemberRow[]>(
      "SELECT email FROM member WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      return Response.json(
        { result: false, message: "이미 가입된 이메일입니다", data: null },
        { status: 409 },
      );
    }

    // 5. 비밀번호 해싱 (평문 저장 금지)
    const hashedPassword = await bcrypt.hash(pw, 10);

    // 6. 회원 등록
    await pool.query<ResultSetHeader>(
      "INSERT INTO member (email, password, role, name) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, role, name],
    );

    // 7. 회원가입 성공 시 로그인 수행
    // (지금은 세션/토큰 없이 바로 성공 응답만 반환. 추후 JWT 도입 시 여기서 토큰 발급해서
    //  응답에 추가하면 됨 - 예: return Response.json({ ...위 데이터, token })  )

    return Response.json(
      {
        result: true,
        message: "회원가입 성공",
        data: { email, role, name },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("register API 에러:", error);
    const message = error instanceof Error ? error.message : "알 수 없는 에러";
    return Response.json(
      { result: false, message, data: null },
      { status: 500 },
    );
  }
}
