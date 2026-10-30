// 데이터베이스 위임 (테스트 DB로 통일)
import { generateAccessToken, verifyAccessToken } from "@/app/utils/jwt";
import pool from "../../../lib/db_test";

interface ActivityRequest {
  email: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  current_participants?: number;
  techStacks: string[];
  leader: string;
  createdAt: string;
  text: string;
}

export async function POST(req: Request) {
  try {
    const body: ActivityRequest = await req.json();
    const authorization = req.headers.get("authorization");
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
    const decodedUser = tokenCheck.decoded as any;
    if (decodedUser?.role !== "admin" && decodedUser?.role !== "member") {
      return Response.json(
        {
          result: false,
          message: "접근이 거부되었습니다 (관리자 전용)",
          data: null,
        },
        { status: 403 },
      );
    }
    const {
      email,
      title,
      status,
      techStacks,
      startDate,
      endDate,
      maxParticipants,
      text,
    } = body;
    if (decodedUser?.sub != email) {
      return Response.json(
        {
          result: false,
          message: "접근이 거부되었습니다 (계정 정보가 일치하지 않음)",
          data: null,
        },
        { status: 403 },
      );
    }
    const current_participants = body.current_participants || 1;

    if (!email || !title) {
      return Response.json(
        { success: false, message: "작성자 이메일과 제목은 필수입니다." },
        { status: 400 },
      );
    }

    // 1. activity 테이블에 게시물 메인 정보 저장
    const [result]: any = await pool.query(
      `INSERT INTO activity 
      (leaderEmail, title, status, createdAt, startDate, endDate, maxParticipants, currentParticipants,text) 
      VALUES (?, ?, ?, NOW(), ?,  ?, ?,?,?)`,
      [
        email,
        title,
        status,
        startDate,
        endDate,
        maxParticipants,
        current_participants,
        text,
      ],
    );

    // 2. 방금 생성된 게시물의 고유 ID 확보
    const generatedId = result.insertId;

    // 3. 실제 DB 컬럼명(id, techStack)에 맞춰 기술 스택 저장[cite: 13]
    if (techStacks && techStacks.length > 0) {
      for (const stack of techStacks) {
        await pool.query(
          `INSERT INTO activity_tech_stack (id, techStack) VALUES (?, ?)`,
          [generatedId, stack],
        );
      }
    }

    return Response.json(
      {
        success: true,
        message: "게시물과 기술 스택 저장 완료",
        activityId: generatedId,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("게시물 생성 API 에러:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
