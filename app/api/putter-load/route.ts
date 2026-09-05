// import isAuthenticatedEmail from "../register/route";

const ALLOWED_EMAIL_DOMAINS: string[] = [];

function isAuthenticatedEmail(email: string): boolean {
  if (ALLOWED_EMAIL_DOMAINS.length === 0) return true;
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}

export async function GET(req: Request) {
  try {
    const body = await req.json();
    const { snsUrl, githubUrl, representativeEmail } = body;
    if (!snsUrl || !githubUrl || !representativeEmail) {
      return Response.json(
        {
          result: false,
          message: "snsUrl, githubUrl, representativeEmail은 필수입니다",
          data: null,
        },
        { status: 400 },
      );
    }
    if (!isAuthenticatedEmail(representativeEmail)) {
      return Response.json(
        { result: false, message: "인증되지 않은 이메일입니다", data: null },
        { status: 403 },
      );
    }
    return Response.json(
      {
        result: true,
        message: "데이터 로드 성공",
        data: { snsUrl, githubUrl, representativeEmail },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("게시물 생성 API 에러:", error);
    return Response.json(
      { result: false, message: error.message, data: null }, 
      { status: 500 },
    );
  }
}
