import pool from "../../../lib/db_test"; 
import { generateAccessToken } from "../../../utils/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, pw } = body;

    // 1. 필수 입력값 체크
    if (!email || !pw) {
      return Response.json(
        { result: false, message: "이메일과 비밀번호를 모두 입력해주세요.", data: null },
        { status: 400 }
      );
    }

    // 2. DB에서 유저 조회 (테이블명: member, 가져올 컬럼: email, name, password, role)
    const [rows]: any = await pool.query(
      "SELECT email, name, password, role FROM member WHERE email = ?",
      [email]
    );

    // 2-1. 계정이 존재하지 않는 경우
    if (rows.length === 0) {
      return Response.json(
        { result: false, message: "계정이 존재하지 않습니다", data: null },
        { status: 401 }
      );
    }

    const user = rows[0];

    // 3. 비밀번호 일치 여부 확인 (사용자가 입력한 pw와 DB의 password 비교)
    const isPasswordValid = await bcrypt.compare(pw, user.password);
    if (!isPasswordValid) {
      return Response.json(
        { result: false, message: "비밀번호가 일치하지 않습니다", data: null },
        { status: 401 }
      );
    }

    // 4. 유효한 역할(role)인지 확인 (미승인 상태 등 차단)
    if (!user.role || user.role === "unapproved") {
      return Response.json(
        { result: false, message: "유효하지 않은 역할입니다", data: null },
        { status: 403 }
      );
    }

    // 5. JWT 토큰 생성
    const token = generateAccessToken({
      id: user.email, 
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // 6. 명세서 양식에 맞춘 성공 응답 반환
    return Response.json(
      {
        result: true,
        message: "로그인 성공",
        data: {
          token,
          email: user.email,
          name: user.name,
          role: user.role, // "admin" 또는 "member"
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("로그인 처리 에러:", error);
    return Response.json(
      { result: false, message: "서버 내부 오류가 발생했습니다.", data: null },
      { status: 500 }
    );
  }
}