import pool from "../../../lib/db";
import { verifyAccessToken, generateAccessToken } from "../../../utils/jwt";
import path from "path";
import fs from "fs/promises";
type MemberIntroduce = {
  name: string;
  introduce: string;
};
export async function PATCH(req: Request) {
  let savedFilePath: string | null = null;
  try {
    const authorization =
      "Bearer " +
      generateAccessToken({
        id: "1",
        email: "test@gmail.com",
        name: "testname",
        role: "admin",
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
        { status: 403 },
      );
    }

    const contentType = req.headers.get("content-type") ?? "";

    if (!contentType.startsWith("multipart/form-data")) {
      return Response.json(
        {
          result: false,
          message: "multipart/form-data 형식으로 요청해주세요.",
          data: null,
        },
        { status: 400 },
      );
    }

    const formData = await req.formData();

    const introduce = formData.get("introduce");
    const memberIntroduceString = formData.get("memberIntroduce");
    if (typeof memberIntroduceString !== "string") {
      throw new Error("memberIntroduce가 없습니다.");
    }
    const memberIntroduce = JSON.parse(memberIntroduceString) as {
      name: string;
      introduce: string;
    }[];
    const photos = formData.getAll("photos") as File[];

    if (!introduce || !memberIntroduce || !photos) {
      return Response.json(
        {
          result: false,
          message: "필드가 누락됐습니다.",
          data: null,
        },
        { status: 400 },
      );
    }

    if (photos.some((photo) => !(photo instanceof File))) {
      return Response.json(
        {
          result: false,
          message: "사진 파일이 올바르지 않습니다.",
          data: null,
        },
        { status: 400 },
      );
    }

    if (photos.some((photo) => !photo.type.startsWith("image/"))) {
      return Response.json(
        {
          result: false,
          message: "이미지 파일만 업로드할 수 있습니다.",
          data: null,
        },
        { status: 400 },
      );
    }
    await pool.query("DELETE FROM team_introduce");
    for (const memberIntro of memberIntroduce) {
      await pool.query(
        "INSERT INTO team_introduce (name, introduce) VALUES (?, ?)",
        [memberIntro.name, memberIntro.introduce],
      );
    }

    await pool.query("UPDATE site_setting SET introduce = ? WHERE id = 1", [
      introduce,
    ]);

    const publicPath = path.join(process.cwd(), "public");

    // public 폴더가 없으면 생성
    await fs.mkdir(publicPath, { recursive: true });

    for (let i = 0; i < photos.length; i++) {
      const extension = path.extname(photos[i].name).toLowerCase();

      const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

      if (!allowedExtensions.includes(extension)) {
        return Response.json(
          {
            result: false,
            message: "지원하지 않는 이미지 형식입니다.",
            data: null,
          },
          { status: 400 },
        );
      }
      const fileName = `activity_photo_${i}${extension}`;
      const filePath = path.join(publicPath, fileName);
      // File → Buffer 변환
      const bytes = await photos[i].arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 이미지 파일 저장
      await fs.writeFile(filePath, buffer);

      // DB 저장 실패 시 삭제하기 위해 경로 보관
      savedFilePath = filePath;
    }
    return Response.json(
      {
        result: true,
        message: "소개 페이지 정보가 수정되었습니다",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("introduce-insert API 에러:", error);
    // DB 저장 등에 실패했다면 방금 저장한 이미지 삭제
    if (savedFilePath) {
      try {
        await fs.unlink(savedFilePath);
      } catch (fileError) {
        console.error("저장된 이미지 삭제 실패:", fileError);
      }
    }
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
