import {verifyAccessToken} from "../../utils/jwt";

export async function PATCH(req: Request) {
  try {
    const authorization = req.headers.get("Authorization");

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
          message: "관리자만 메인 페이지 정보를 수정할 수 있습니다.",
          data: null,
        },
        { status: 403 }
      );
    }

    const contentType = req.headers.get("Content-Type");

    if (contentType !== "multipart/form-data") {
      return Response.json(
        {
          result: false,
          message: "multipart/form-data 형식으로 요청해주세요.",
          data: null,
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { introduce, memberIntroduce, photos } = body;
  } catch (error: any) {
    console.error("introduce-insert API 에러:", error);

    return Response.json(
      {
        result: false,
        message: error.message,
        data: null,
      },
      { status: 500 }
    );
  }
}