import pool from "../../lib/db";

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
    
    // DB 설정에 따라 ID가 자동 증가하지 않을 경우를 대비한 랜덤 ID 생성
    const tempId = Math.floor(Math.random() * 1000000);

    if (!leader_email || !title) {
      return Response.json(
        { success: false, message: "작성자 이메일과 제목은 필수입니다." },
        { status: 400 }
      );
    }

    await pool.query(
      `INSERT INTO activity 
      (id, leader_email, title, status, created_at, start_date, end_date, max_participants, current_participants) 
      VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [tempId, leader_email, title, status, start_date, end_date, max_participants, current_participants]
    );

    if (tech_stack && tech_stack.length > 0) {
      for (const stack of tech_stack) {
        await pool.query(
          `INSERT INTO activity_tech_stack (activity_id, tech_stack) VALUES (?, ?)`,
          [tempId, stack]
        );
      }
    }

    return Response.json(
      { 
        success: true, 
        message: "게시물과 기술 스택 저장 완료",
        activityId: tempId 
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