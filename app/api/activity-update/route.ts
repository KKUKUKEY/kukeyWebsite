import jwt from "jsonwebtoken";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../lib/db";

const VALID_STATUSES = ["RECRUITING", "COMPLETED", "DONE"];

interface ActivityRow extends RowDataPacket {
  writerId: number;
}

// PATCH /api/activity-update
// 지정된 id의 활동 공유/모집 게시물을 탐색하여 수정합니다. (작성자 본인만 가능)
export async function PATCH(req: Request) {
  try {
    // 1. Authorization 헤더 검증 ("Bearer <token>")
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { result: false, message: "인증 토큰이 필요합니다" },
        { status: 401 },
      );
    }

    const token = authHeader.slice("Bearer ".length);
    let memberId: number;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: number;
      };
      memberId = payload.id;
    } catch {
      return Response.json(
        { result: false, message: "유효하지 않은 토큰입니다" },
        { status: 401 },
      );
    }

    // 2. 요청 바디 파싱
    const body = await req.json();
    const {
      id,
      title,
      text,
      status,
      techStacks,
      startDate,
      endDate,
      maxParticipants,
    } = body;

    if (!id) {
      return Response.json(
        { result: false, message: "id는 필수입니다" },
        { status: 400 },
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return Response.json(
        {
          result: false,
          message: "status는 RECRUITING, COMPLETED, DONE 중 하나여야 합니다",
        },
        { status: 400 },
      );
    }

    // 3. 게시물 탐색
    const [rows] = await pool.query<ActivityRow[]>(
      "SELECT writerId FROM activity WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return Response.json(
        { result: false, message: "존재하지 않는 게시물입니다" },
        { status: 404 },
      );
    }

    // 4. 작성자 본인 확인
    if (rows[0].writerId !== memberId) {
      return Response.json(
        { result: false, message: "게시물 작성자만 수정할 수 있습니다" },
        { status: 403 },
      );
    }

    // 5. 게시물 수정
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE activity
       SET title = ?, text = ?, status = ?, techStacks = ?, startDate = ?, endDate = ?, maxParticipants = ?
       WHERE id = ?`,
      [
        title,
        text,
        status,
        JSON.stringify(techStacks ?? []),
        startDate,
        endDate,
        maxParticipants,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return Response.json(
        { result: false, message: "데이터 수정 실패" },
        { status: 500 },
      );
    }

    return Response.json({
      result: true,
      message: "데이터 수정 완료",
    });
  } catch (error: any) {
    console.error("activity-update API 에러:", error);
    return Response.json(
      { result: false, message: error.message },
      { status: 500 },
    );
  }
}
