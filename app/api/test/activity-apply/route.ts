import pool from "../../../lib/db_test";
import { generateAccessToken, verifyAccessToken } from "@/app/utils/jwt";
export async function PATCH(req: Request) {
  try {
    const authorization =
      "Bearer " +
      generateAccessToken({
        id: "test@gmail.com",
        email: "test@gmail.com",
        name: "testname",
        role: "admin",
      });
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return Response.json(
        { result: false, message: "권한이 없습니다 (토큰 없음)", data: null },
        { status: 401 },
      );
    }
    const token = authorization.split(" ")[1];
    const tokenCheck = verifyAccessToken(token);
    if (!tokenCheck.result) {
      return Response.json(
        {
          result: false,
          message: "유효하지 않거나 만료된 토큰입니다",
          data: null,
        },
        { status: 401 },
      );
    }
    const body = await req.json();
    const { id, email } = body;

    if (!id || !email) {
      return Response.json(
        { result: false, message: "id와 이메일은 필수입니다" },
        { status: 400 },
      );
    }

    const [rows] = await pool.query(
      "SELECT status FROM activity_participants WHERE id = ?",
      [id],
    );

    if (rows[0]) {
      pool.query("DELETE FROM activity_participants WHERE id = ?", [id]);
      return Response.json({ result: true, message: "철회 완료" });
    }

    pool.query(
      "INSERT INTO activity_participants (id, email, status) VALUES (?, ?, 'APPLIED')",
      [id, email],
    );
    return Response.json({ result: true, message: "신청 완료" });
  } catch (error: any) {
    console.error("activity-apply API 에러:", error);
    return Response.json(
      { result: false, message: error.message },
      { status: 500 },
    );
  }
}
