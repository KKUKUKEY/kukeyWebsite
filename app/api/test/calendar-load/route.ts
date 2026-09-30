import pool from "../../../lib/db_test";
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CalendarRow extends RowDataPacket {
  title: string | null;
  description: string | null;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      result: false,
      message,
      data: null,
    },
    { status },
  );
}

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year");
  const monthParam = request.nextUrl.searchParams.get("month");

  if (
    !yearParam ||
    !monthParam ||
    !/^\d+$/.test(yearParam) ||
    !/^\d+$/.test(monthParam)
  ) {
    return errorResponse("year와 month는 정수로 입력해주세요", 400);
  }

  const year = Number(yearParam);
  const month = Number(monthParam);

  if (
    !Number.isSafeInteger(year) ||
    !Number.isSafeInteger(month) ||
    year < 1000 ||
    year > 9998 ||
    month < 1 ||
    month > 12
  ) {
    return errorResponse("year는 1000~9998, month는 1~12로 입력해주세요", 400);
  }

  const monthStart = `${year}-${String(month).padStart(2, "0")}-01 00:00:00`;

  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  const nextMonthStart = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01 00:00:00`;

  try {
    const [rows] = await pool.execute<CalendarRow[]>(
      `
        SELECT
          title,
          description,
          DATE_FORMAT(startDate, '%Y-%m-%d') AS startDate,
          DATE_FORMAT(endDate, '%Y-%m-%d') AS endDate,
          DATE_FORMAT(startDate, '%H:%i') AS startTime,
          DATE_FORMAT(endDate, '%H:%i') AS endTime
        FROM calendar
        WHERE startDate < ?
          AND endDate >= ?
        ORDER BY calendar.startDate, calendar.id
      `,
      [nextMonthStart, monthStart],
    );

    return NextResponse.json({
      result: true,
      message: "데이터 로드 성공",
      date: rows.map((row) => ({
        title: row.title ?? "",
        description: row.description ?? "",
        startDate: row.startDate,
        endDate: row.endDate,
        startTime: row.startTime,
        endTime: row.endTime,
      })),
    });
  } catch (error) {
    console.error("캘린더 조회 실패:", error);
    return errorResponse("데이터베이스 오류", 500);
  }
}
