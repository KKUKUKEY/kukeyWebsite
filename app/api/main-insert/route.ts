import pool from "../../lib/db";
import { verifyAccessToken } from "../../utils/jwt";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

// 파일 저장을 위해 Node.js 런타임 사용
export const runtime = "nodejs";

export async function PATCH(req: Request) {
  let savedFilePath: string | null = null;

  try {
    // 1. Authorization 헤더 확인
    const authorization = req.headers.get("Authorization");

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

    // 2. JWT 검증
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

    // 3. 관리자 권한 확인
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

    // 4. multipart/form-data 받기
    const contentType = req.headers.get("Content-Type");

    if (!contentType?.includes("multipart/form-data")) {
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

    const bannerImage = formData.get("bannerImage");
    const mainTitle = formData.get("mainTitle");

    // 5. bannerImage 검증
    if (!(bannerImage instanceof File)) {
      return Response.json(
        {
          result: false,
          message: "배너 이미지가 없습니다.",
          data: null,
        },
        { status: 400 },
      );
    }

    if (!bannerImage.type.startsWith("image/")) {
      return Response.json(
        {
          result: false,
          message: "이미지 파일만 업로드할 수 있습니다.",
          data: null,
        },
        { status: 400 },
      );
    }

    // 6. mainTitle 검증
    if (typeof mainTitle !== "string" || !mainTitle.trim()) {
      return Response.json(
        {
          result: false,
          message: "메인 타이틀은 필수입니다.",
          data: null,
        },
        { status: 400 },
      );
    }

    // 7. 이미지 파일명 생성
    const extension = path.extname(bannerImage.name).toLowerCase();

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

    const fileName = `banner_${randomUUID()}${extension}`;

    // 8. public 폴더에 이미지 저장
    // 프로젝트 루트/public
    const publicPath = path.join(process.cwd(), "public");

    // public 폴더가 없으면 생성
    await fs.mkdir(publicPath, { recursive: true });

    const filePath = path.join(publicPath, fileName);

    // File → Buffer 변환
    const bytes = await bannerImage.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 이미지 파일 저장
    await fs.writeFile(filePath, buffer);

    // DB 저장 실패 시 삭제하기 위해 경로 보관
    savedFilePath = filePath;

    // 9. DB에 저장할 이미지 URL 생성
    // 예:
    // http://192.168.0.15:5000/banner_xxxxx.png
    const origin = new URL(req.url).origin;
    const bannerImageUrl = `${origin}/${fileName}`;

    // 10. site_setting INSERT / UPDATE
    await pool.query(
      `
      INSERT INTO site_setting
      (id, bannerImageUrl, mainTitle)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        bannerImageUrl = VALUES(bannerImageUrl),
        mainTitle = VALUES(mainTitle)
      `,
      [1, bannerImageUrl, mainTitle.trim()],
    );

    // 11. 성공 응답
    return Response.json(
      {
        result: true,
        message: "메인 페이지 정보가 수정되었습니다",
        data: {
          bannerImageUrl: bannerImageUrl,
          mainTitle: mainTitle.trim(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("메인 페이지 정보 수정 API 에러:", error);

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
        message:
          error.message || "메인 페이지 정보 수정 중 오류가 발생했습니다.",
        data: null,
      },
      { status: 500 },
    );
  }
}
