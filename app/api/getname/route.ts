export async function POST(req: Request) {
  const body = await req.json();
  const { name } = body;
  return Response.json({
    data: "hello " + name,
  });
}
