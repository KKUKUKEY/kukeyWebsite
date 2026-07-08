// 데이터베이스 위임
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

    if (!leader_email || !title) {
      return Response.json(
        { success: false, message: "작성자 이메일과 제목은 필수입니다." },
        { status: 400 }
      );
    }

    // id 칸은 아예 비워두고 INSERT
    const [result]: any = await pool.query(
      `INSERT INTO activity 
      (leader_email, title, status, created_at, start_date, end_date, max_participants, current_participants) 
      VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [leader_email, title, status, start_date, end_date, max_participants, current_participants]
    );

    // 2. 방금 DB가 스스로 만들어낸 고유 ID 번호를 가져옴.
    const generatedId = result.insertId;

    // 3. 확보한 고유 ID를 연결 고리로 삼아 기술 스택을 저장.
    if (tech_stack && tech_stack.length > 0) {
      for (const stack of tech_stack) {
        await pool.query(
          `INSERT INTO activity_tech_stack (activity_id, tech_stack) VALUES (?, ?)`,
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
