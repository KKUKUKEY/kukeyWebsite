import pool from "../../../lib/db";
import { verifyAccessToken } from "../../../utils/jwt"; 

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { result: false, message: "권한이 없습니다 (토큰 없음)", data: null },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(" ")[1];

    // 2. 팀원이 만든 함수에 토큰을 넣어 검증 결과를 받습니다.
    const tokenCheck = verifyAccessToken(token);

    // 3. 검증 실패 시 (만료되거나 조작된 경우) 튕겨냅니다.
    if (!tokenCheck.result) {
      return Response.json(
        { result: false, message: "유효하지 않거나 만료된 토큰입니다", data: null },
        { status: 401 }
      );
    }

    // 4. [핵심] 관리자(admin) 계정인지 한 번 더 확인합니다.
    const decodedUser = tokenCheck.decoded as any;
    if (decodedUser?.role !== "admin") {
      return Response.json(
        { result: false, message: "접근이 거부되었습니다 (관리자 전용)", data: null },
        { status: 403 }
      );
    }

    // 이하 기존 로직과 동일
    const body = await req.json();
    const { snsUrl, githubUrl, representativeEmail } = body;

    if (!representativeEmail || !emailRegex.test(representativeEmail)) {
      return Response.json(
        { result: false, message: "유효하지 않은 이메일입니다", data: null },
        { status: 400 }
      );
    }

    await pool.query(
      `INSERT INTO footer_info (id, snsUrl, githubUrl, representativeEmail) 
       VALUES (1, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       snsUrl = VALUES(snsUrl), 
       githubUrl = VALUES(githubUrl), 
       representativeEmail = VALUES(representativeEmail)`,
      [snsUrl, githubUrl, representativeEmail]
    );

    return Response.json(
      { 
        result: true, 
        message: "데이터 삽입 완료", 
        data: { snsUrl, githubUrl, representativeEmail } 
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("푸터 데이터 삽입 에러:", error);
    return Response.json(
      { result: false, message: "서버 내부 오류가 발생했습니다.", data: null }, 
      { status: 500 }
    );
  }
}