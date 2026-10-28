import pool from "../../lib/db";
import {verifyAccessToken} from "../../utils/jwt";

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("Authorization");
    const body = await req.json();
    const { email, targetRole } = body;

    if (!authorization) {
      return Response.json(
        {
          result: false,
          message: "인증 토큰이 없습니다.",
          data: null,
        },
        { status: 401 }
      );
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return Response.json(
        {
          result: false,
          message: "잘못된 인증 형식입니다.",
          data: null,
        },
        { status: 401 }
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
        { status: 401 }
      );
    }

    const decoded = verification.decoded as {
      role?: string;
    };

    if (decoded.role !== "admin") {
      return Response.json(
        {
          result: false,
          message: "관리자만 회원 정보를 수정할 수 있습니다.",
          data: null,
        },
        { status: 403 }
      );
    }

    await pool.query("UPDATE member SET role = ? WHERE email = ?", [targetRole, email]);

    return Response.json(
      {
        result: true,
        message: "권한 변경 성공",
        data: {
          newRole: targetRole,
        }
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("access-control API 에러:", error);

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