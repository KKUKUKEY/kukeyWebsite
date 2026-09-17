import pool from "../../../lib/db_test";
import { verifyAccessToken, generateAccessToken } from "../../../utils/jwt";

export async function GET(req: Request) {
  try {
    // 1. Authorization 헤더 확인
    //const authorization = req.headers.get("Authorization");
    const authorization =
      "Bearer " +
      generateAccessToken({
        id: "1",
        email: "test@gmail.com",
        name: "testname",
        role: "user",
      });
    if (!authorization) {
      return Response.json(
        {
          result: false,
          message: "인증 토큰이 없습니다.",
          data: null,
        },
        { status: 401 },
      );
    }

    // 2. Bearer 토큰 추출 및 검증
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return Response.json(
        {
          result: false,
          message: "잘못된 인증 형식입니다.",
          data: null,
        },
        { status: 401 },
      );
    }

    const verification = verifyAccessToken(token);

    if (!verification.result) {
      return Response.json(
        {
          result: false,
          message: "유효하지 않은 인증 토큰입니다.",
          data: null,
        },
        { status: 401 },
      );
    }

    // 3. 관리자 권한 확인
    const decoded = verification.decoded as {
      role?: string;
    };

    if (decoded.role !== "admin") {
      return Response.json(
        {
          result: false,
          message: "관리자만 회원 목록을 조회할 수 있습니다.",
          data: null,
        },
        { status: 403 },
      );
    }

    // 4. 회원 목록 조회
    const [rows] = await pool.query("SELECT name, email, role FROM member");

    return Response.json(
      {
        result: true,
        message: "데이터 로드 성공",
        data: rows,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("member-load API 에러:", error);

    return Response.json(
      {
        result: false,
        message: error.message,
        data: null,
      },
      { status: 500 },
    );
  }
}
