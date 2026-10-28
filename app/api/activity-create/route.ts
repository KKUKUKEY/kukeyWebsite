// 데이터베이스 위임 (테스트 DB로 통일)
import pool from "../../lib/db_test";

interface ActivityRequest {
  leader_email: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  current_participants?: number;
  tech_stack: string[];
}

export async function POST(req: Request) {
  try {
    const body: ActivityRequest = await req.json();
    
    const { 
      leader_email, 
      title, 
      status, 
      start_date, 
      end_date, 
      max_participants, 
      tech_stack 
    } = body;

    const current_participants = body.current_participants || 1;

    if (!leader_email || !title) {
      return Response.json(
        { success: false, message: "작성자 이메일과 제목은 필수입니다." },
        { status: 400 }
      );
    }

    // 1. activity 테이블에 게시물 메인 정보 저장
    const [result]: any = await pool.query(
      `INSERT INTO activity 
      (leaderEmail, title, status, createdAt, startDate, endDate, maxParticipants, currentParticipants) 
      VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [leader_email, title, status, start_date, end_date, max_participants, current_participants]
    );

    // 2. 방금 생성된 게시물의 고유 ID 확보
    const generatedId = result.insertId;

    // 3. 실제 DB 컬럼명(id, techStack)에 맞춰 기술 스택 저장[cite: 13]
    if (tech_stack && tech_stack.length > 0) {
      for (const stack of tech_stack) {
        await pool.query(
          `INSERT INTO activity_tech_stack (id, techStack) VALUES (?, ?)`,
          [generatedId, stack]
        );
      }
    }

    return Response.json(
      { 
        success: true, 
        message: "게시물과 기술 스택 저장 완료",
        activityId: generatedId 
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