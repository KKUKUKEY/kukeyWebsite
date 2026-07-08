// app/api/posts/route.ts
import pool from "../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    //title, content, type, author
    const { title, content, post_type, author } = body;

    if (!title || !content) {
      return Response.json(
        { success: false, message: "제목과 본문은 필수 입력 사항입니다." },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      "INSERT INTO posts (title, content, post_type, author) VALUES (?, ?, ?, ?)",
      [title, content, post_type, author]
    );

    return Response.json(
      {
        success: true,
        data: result,
        message: "게시물이 성공적으로 생성되었습니다.",
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