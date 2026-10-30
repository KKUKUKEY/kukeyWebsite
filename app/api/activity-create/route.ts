// 데이터베이스 위임 (테스트 DB로 통일)
import pool from "../../lib/db_test";

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

    const {
      email,
      title,
      status,
      techStacks,
      leader,
      createdAt,
      startDate,
      endDate,
      maxParticipants,
      text,
    } = body;

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
      (email, title, status, createdAt, startDate, endDate, maxParticipants, currentParticipants,leader,text) 
      VALUES (?, ?, ?, NOW(), ?, ?, ?, ?,?,?)`,
      [
        email,
        title,
        status,
        createdAt,
        startDate,
        endDate,
        maxParticipants,
        current_participants,
        leader,
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
