//   app/api/activity/route.ts
import pool from "../../lib/db";

interface ActivityRequest {
  leaderEmail: string;
  title: string;
  status: string;
  techStack: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants?: number;
  participantsEmail: string;
}

export async function POST(req: Request) {
  try {
    const body: ActivityRequest = await req.json();

    const {
      leaderEmail,
      title,
      status,
      techStack,
      startDate,
      endDate,
      maxParticipants,
      participantsEmail,
    } = body;

    const currentParticipants = body.currentParticipants || 1;

    if (!leaderEmail || !title) {
      return Response.json(
        { success: false, message: "작성자 이메일과 제목은 필수입니다." },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO activity 
      (leaderEmail, title, status, techStack, createdAt, startDate, endDate, maxParticipants, currentParticipants, participantsEmail) 
      VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
      [
        leaderEmail,
        title,
        status,
        techStack,
        startDate,
        endDate,
        maxParticipants,
        currentParticipants,
        participantsEmail,
      ]
    );

    return Response.json(
      {
        success: true,
        data: result,
        message: "활동 모집 게시물이 성공적으로 생성되었습니다.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("게시물 생성 API 에러:", error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}