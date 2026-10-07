import pool from "../../lib/db";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, email } = body;

    if (!id || !email) {
      return Response.json(
        { result: false, message: "id와 이메일은 필수입니다" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query("SELECT status FROM activity_participants WHERE id = ?", [id]);

    if (rows[0]) {
      pool.query("DELETE FROM activity_participants WHERE id = ?", [id]);
      return Response.json({ result: true, message: "철회 완료" });
    }

    pool.query("INSERT INTO activity_participants (id, email, status) VALUES (?, ?, 'APPLIED')", [id, email]);
    return Response.json({ result: true, message: "신청 완료" });
  } catch (error: any) {
    console.error("activity-apply API 에러:", error);
    return Response.json(
      { result: false, message: error.message },
      { status: 500 }
    )
  }
}
