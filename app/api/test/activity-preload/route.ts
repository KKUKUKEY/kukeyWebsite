import pool from "../../../lib/db_test";

export async function GET(req: Request) {
  try {
    // 1. URL에서 쿼리 스트링(page 번호) 추출
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");

    // page 값이 없거나 숫자가 아닌 경우 에러 처리
    const page = parseInt(pageParam || "", 10);
    if (isNaN(page) || page < 1) {
      return Response.json(
        { result: false, message: "존재하지 않는 페이지", data: null },
        { status: 404 }
      );
    }

    // 2. 페이지네이션 설정 (한 페이지당 10개씩)
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    // 3. DB에서 전체 게시물 수 조회
    const [countResult]: any = await pool.query(
      "SELECT COUNT(*) as total FROM activity"
    );
    const totalCount = countResult[0].total;

    // 존재하지 않는 페이지 번호를 요청한 경우 예외 처리
    if (totalCount > 0 && offset >= totalCount) {
      return Response.json(
        { result: false, message: "존재하지 않는 페이지", data: null },
        { status: 404 }
      );
    } else if (totalCount === 0 && page > 1) {
      return Response.json(
        { result: false, message: "존재하지 않는 페이지", data: null },
        { status: 404 }
      );
    }

    // 4. DB에서 실제 데이터 조회 (activity_participants 테이블과 조인하여 인원수 실시간 계산)
    const [rows]: any = await pool.query(
      `SELECT 
        a.id, 
        a.title, 
        a.status, 
        a.leaderEmail AS leader, 
        DATE_FORMAT(a.createdAt, '%Y-%m-%d') AS createdAt, 
        a.maxParticipants,
        -- approved 상태인 참여자 수 실시간 집계
        COALESCE(SUM(CASE WHEN p.status = 'APPROVED' THEN 1 ELSE 0 END), 0) AS currentParticipants,
        -- applied 상태인 지원자 수 실시간 집계
        COALESCE(SUM(CASE WHEN p.status = 'APPLIED' THEN 1 ELSE 0 END), 0) AS currentApplicants
       FROM activity a
       LEFT JOIN activity_participants p ON a.id = p.id
       GROUP BY a.id
       ORDER BY a.createdAt DESC 
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    // 5. 성공 응답 반환
    return Response.json(
      { 
        result: true, 
        message: "데이터 로드 성공", 
        data: rows 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("활동 게시물 로드 에러:", error);
    return Response.json(
      { result: false, message: "데이터베이스 오류", data: null },
      { status: 500 }
    );
  }
}