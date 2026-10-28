import pool from "../../../lib/db_test";
import { verifyAccessToken } from "../../../utils/jwt";

export async function POST(req: Request) {
  try {
    // 1. Headers에서 Authorization 토큰 추출 및 검증
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { result: false, message: "인증 토큰이 누락되었거나 형식이 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // 토큰 해독 (verifyAccessToken의 반환 타입에 맞게 처리)
    const decodedUser = verifyAccessToken(token);

    // 검증 실패 시 처리
    if (!decodedUser.result || !decodedUser.decoded) {
      return Response.json(
        { result: false, message: "유효하지 않은 토큰입니다." },
        { status: 401 }
      );
    }

    // 해독된 페이로드에서 이메일 추출
    const userEmail = (decodedUser.decoded as any).email;
    if (!userEmail) {
      return Response.json(
        { result: false, message: "토큰에 이메일 정보가 없습니다." },
        { status: 401 }
      );
    }

    // 2. DB에서 이메일 존재 여부 및 admin 역할 확인
    const [userRows]: any = await pool.query(
      "SELECT role FROM member WHERE email = ?",
      [userEmail]
    );

    // 계정이 없는 경우
    if (userRows.length === 0) {
      return Response.json(
        { result: false, message: "존재하지 않는 이메일입니다" },
        { status: 401 }
      );
    }

    // admin 권한이 아닌 경우
    const user = userRows[0];
    if (user.role !== "admin") {
      return Response.json(
        { result: false, message: "유효하지 않은 역할입니다" },
        { status: 403 }
      );
    }

    // 3. Request Body에서 캘린더 데이터 추출
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      startTime, 
      endTime 
    } = await req.json();

    // 💡 날짜와 시간을 DB의 datetime 형식에 맞게 하나로 결합
    const startDateTime = `${startDate} ${startTime}`;
    const endDateTime = `${endDate} ${endTime}`;

    // 4. DB에 캘린더 데이터 삽입 (DB 스키마에 맞춰 4개의 컬럼만 사용)
    await pool.query(
      `INSERT INTO calendar 
      (title, description, startDate, endDate) 
      VALUES (?, ?, ?, ?)`,
      [title, description, startDateTime, endDateTime]
    );

    // 5. 성공 응답 반환
    return Response.json(
      { result: true, message: "데이터 삽입 성공" },
      { status: 200 }
    );

  } catch (error) {
    console.error("캘린더 데이터 삽입 에러:", error);
    
    // 6. DB 오류 등 서버 에러 반환
    return Response.json(
      { result: false, message: "데이터베이스 오류" },
      { status: 500 }
    );
  }
}