import pool from "../../../lib/db_test";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT instagramUrl, githubUrl, representativeEmail FROM site_setting",
    );

    return Response.json(
      {
        result: true,
        message: "데이터 로드 성공",
        data: rows,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("putter-load API 에러:", error);

    return Response.json(
      {
        result: false,
        message: error.message,
        data: null,
      },
      { status: 500 },
    );
  }
}
