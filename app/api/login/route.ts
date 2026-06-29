import pool from "../../lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { q } = body;
  if (q == "insert") {
    const { email, name, role } = body;
    const [result] = await pool.query(
      "INSERT INTO member (name, email, role) VALUES (?, ?, ?)",
      [name, email, role],
    );
    console.log(result);
    return Response.json({
      data: result,
    });
  } else if (q == "select") {
    const [rows] = await pool.query("SELECT * from member");
    console.log(rows);
    return Response.json({
      data: rows,
    });
  }
}
