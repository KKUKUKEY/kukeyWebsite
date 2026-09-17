import pool from "../../lib/db";
import type { RowDataPacket } from "mysql2";
interface SiteSettingRow extends RowDataPacket {
  instagramUrl: string | null;
  githubUrl: string | null;
  representativeEmail: string | null;
}
export async function GET() {
  try {
    const [rows] = await pool.query<SiteSettingRow[]>(
      "SELECT instagramUrl, githubUrl, representativeEmail FROM site_setting",
    );
    return Response.json(
      {
        result: true,
        message: "데이터 로드 성공",
        data: rows[0],
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
