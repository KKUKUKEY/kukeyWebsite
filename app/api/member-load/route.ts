import pool from "../../lib/db";
import { verifyAccessToken } from "../../utils/jwt";
import type { RowDataPacket } from "mysql2";

interface MemberRow extends RowDataPacket {
  name: string;
  email: string;
  role: string;
}

export async function GET(req: Request) {
  try {
    // 1. Authorization 헤더에서 토큰 꺼내기

    // 2. verifyAccessToken으로 토큰 검증

    // 3. role이 admin인지 확인

    // 4. 회원 목록 조회
    const [rows] = await pool.query<MemberRow[]>(
      "SELECT name, email, role FROM member",
    );

    return Response.json({
      result: true,
      message: "데이터 로드 성공",
      data: rows,
    });
  } catch (error) {
    return Response.json(
      {
        result: false,
        message: "데이터 로드 실패",
        data: null,
      },
      { status: 500 },
    );
  }
}
