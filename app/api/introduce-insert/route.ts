import pool from "../../lib/db";
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

    const formData = await req.formData();

    const introduce = formData.get("introduce");
    const memberIntroduce = formData.get("memberIntroduce");
    const photos = formData.get("photos");

    if (!introduce || !memberIntroduce || !photos) {
      return Response.json(
        {
          result: false,
          message: "필드가 누락됐습니다.",
          data: null,
        },
        { status: 400 }
      );
    }

    if (photos.some((photo) => !(photo instanceof File))) {
      return Response.json(
        {
          result: false,
          message: "사진 파일이 올바르지 않습니다.",
          data: null,
        },
        { status: 400 }
      );
    }

    if (photos.some((photo) => !photo.type.startsWith("image/"))) {
      return Response.json(
        {
          result: false,
          message: "이미지 파일만 업로드할 수 있습니다.",
          data: null,
        },
        { status: 400 }
      );
    }

    await pool.query(
      "INSERT INTO team_introduce (name, introduce) VALUES (?, ?)",
      [memberIntroduce.name, memberIntroduce.introduce]
    );

    await pool.query(
      "INSERT INTO site_setting (introduce) VALUES (?)",
      [introduce]
    );
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