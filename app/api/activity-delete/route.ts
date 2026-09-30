import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "../../lib/db";
import { verifyAccessToken } from "../../utils/jwt";

interface ActivityRow extends RowDataPacket {
  writerId: number;
}

// PATCH /api/activity-delete
// 지정된 id의 활동 공유/모집 게시물을 삭제합니다.
// 게시물 작성자 또는 관리자만 삭제할 수 있습니다.
export async function PATCH(req: Request) {
  try {
    // 1. Authorization 헤더 확인
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        {
          result: false,
          message: "인증 토큰이 필요합니다",
        },
        { status: 401 }
      );
    }

    // 2. 토큰 검증
    const token = authHeader.slice("Bearer ".length);
    const verification = verifyAccessToken(token);

    if (!verification.result || !verification.decoded) {
      return Response.json(
        {
          result: false,
          message: "유효하지 않은 토큰입니다",
        },
        { status: 401 }
      );
    }

    const decoded = verification.decoded as {
      sub?: string;
      email?: string;
      role?: string;
    };

    // 3. 요청 바디 가져오기
    const body = await req.json();
    const { id, email } = body;

    if (!id) {
      return Response.json(
        {
          result: false,
          message: "id는 필수입니다",
        },
        { status: 400 }
      );
    }

    if (!email || decoded.email !== email) {
      return Response.json(
        {
          result: false,
          message: "유효하지 않은 이메일입니다",
        },
        { status: 400 }
      );
    }

    // 4. 삭제할 게시물 탐색
    const [rows] = await pool.query<ActivityRow[]>(
      "SELECT writerId FROM activity WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return Response.json(
        {
          result: false,
          message: "존재하지 않는 게시물입니다",
        },
        { status: 404 }
      );
    }

    // JWT의 sub가 로그인한 회원의 id
    const memberId = Number(decoded.sub);

    // 5. 작성자 또는 관리자인지 확인
    const isWriter = rows[0].writerId === memberId;
    const isAdmin = decoded.role === "admin";

    if (!isWriter && !isAdmin) {
      return Response.json(
        {
          result: false,
          message: "게시물 작성자 또는 관리자만 삭제할 수 있습니다",
        },
        { status: 403 }
      );
    }

    // 6. 게시물 삭제
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM activity WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        {
          result: false,
          message: "게시물 삭제 실패",
        },
        { status: 500 }
      );
    }

    // 7. 삭제 성공
    return Response.json({
      result: true,
      message: "게시물 삭제 완료",
    });

  } catch (error: any) {
    console.error("activity-delete API 에러:", error);

    return Response.json(
      {
        result: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}