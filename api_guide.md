# API작성 가이드

상태: Not started
카테고리: 백엔드

**node.js 설치**

[https://nodejs.org/ko](https://nodejs.org/ko)

**리포지토리 연결**

```jsx
git clone [https://github.com/KKUKUKEY/kukeyWebsite](https://github.com/KKUKUKEY/kukeyWebsite)
```

**의존성 설치**

```jsx
npm install
```

**vs코드 확장 설치**

api테스트: [https://www.thunderclient.com/](https://www.thunderclient.com/)

**REST API**

```
GET
```

: 데이터 조회

```
POST
```

: 데이터 생성

```
PATCH
```

: 데이터 업데이트(일부 변경)

```
PUT
```

: 데이터 업데이트 (전체 변경)

```
DELETE
```

: 데이터 삭제

**테스트 서버 실행**

```jsx
cd my-app
npm run dev
```

**API 작성 예시**

![스크린샷 2026-06-28 181458.png](%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2026-06-28_181458.png)

```jsx
// 클라이언트가 POST 메서드로 이 주소에 요청을 보내면 실행되는 함수입니다.
export async function POST(req: Request) {
  
  // req: 클라이언트가 보낸 요청 전체가 담긴 오브젝트 (헤더, 주소 정보 등 포함)
  // body: req에서 본문(body) 데이터를 꺼내 자바스크립트 객체(JSON)로 변환한 결과물
  const body = await req.json();
  
  // 구조 분해 할당을 통해 body 객체 안에서 'name'이라는 값만 쏙 빼내어 변수로 선언합니다.
  const { name } = body;
  
  // 클라이언트(프론트엔드)에게 최종 응답(Response)을 JSON 형태로 반환합니다.
  return Response.json({
    name: "hello " + name, // 프론트엔드가 받을 실제 데이터 구조
  });
}
```

**API 테스트**

![스크린샷 2026-06-28 181551.png](%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2026-06-28_181551.png)

![스크린샷 2026-06-28 181608.png](%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2026-06-28_181608.png)

![스크린샷 2026-06-28 181629.png](%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2026-06-28_181629.png)

![스크린샷 2026-06-28 181633.png](%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2026-06-28_181633.png)

![스크린샷 2026-06-28 181638.png](%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2026-06-28_181638.png)

**쿼리**

**INSERT**

```jsx
// 💡 공식: INSERT INTO [테이블명] ([컬럼1], [컬럼2]) VALUES (?, ?);
const [result] = await pool.query<ResultSetHeader>(
  "INSERT INTO member (name, email, role) VALUES (?, ?, ?)",
  [name, email, role] // 👈 '?' 자리에 순서대로 쏙쏙 박힐 실제 데이터 변수들
);
```

- **`member` (테이블명):** 데이터가 저장될 방의 이름입니다.
- **`(name, email, role)` (컬럼명 리스트):** 채워 넣을 항목들의 이름표입니다.
- **`VALUES (?, ?, ?)`:** 보안을 위해 실제 값 대신 빈 상자(`?`)를 뚫어둡니다.
- **두 번째 인자 배열 `[name, email, role]`:** 앞의 `?` 순서와 완벽히 일치하게 매칭해야 합니다.

**SELECT**

```jsx
// 💡 공식: SELECT [가져올컬럼] FROM [테이블명] WHERE [조건컬럼] = ?;
const [rows] = await pool.query<RowDataPacket[]>(
  "SELECT name, email FROM member WHERE id = ?",
  [userId] // 👈 '?' 자리에 들어갈 검색 조건 값
);
```

- **`name, email` (가져올 컬럼명):** 화면에 띄울 데이터 항목만 쏙쏙 골라 적습니다. 다 가져오고 싶다면 을 씁니다.
- **`member` (테이블명):** 뒤질 대상을 적습니다.
- **`WHERE id = ?` (조건절):** `member` 테이블의 `id` 컬럼 값이 `userId` 변수와 일치하는 행만 필터링하겠다는 뜻입니다.

**UPDATE**

```jsx
// 💡 공식: UPDATE [테이블명] SET [고칠컬럼1] = ?, [고칠컬럼2] = ? WHERE [조건컬럼] = ?;
const [result] = await pool.query<ResultSetHeader>(
  "UPDATE member SET email = ?, role = ? WHERE id = ?",
  [newEmail, newRole, userId] // 👈 SET의 '?'들과 WHERE의 '?' 순서대로 배열 배치!
);
```

- **`member` (테이블명):** 수정할 테이블 이름입니다.
- **`SET email = ?, role = ?`:** 어떤 컬럼을 새로운 값으로 엎어 쓸지 지정합니다.
- **`WHERE id = ?` (조건절):** **이게 없으면 큰일 납니다.** 이 조건 컬럼이 지정한 `userId`와 같은 사람의 데이터만 콕 집어서 바꿉니다.

**DELETE**

```jsx
// 💡 공식: DELETE FROM [테이블명] WHERE [조건컬럼] = ?;
const [result] = await pool.query<ResultSetHeader>(
  "DELETE FROM member WHERE id = ?",
  [userId] // 👈 '?' 자리에 들어갈 삭제 대상의 ID
);
```

- **`member` (테이블명):** 삭제가 일어날 테이블 이름입니다.
- **`WHERE id = ?` (조건절):** 이 조건과 일치하는 데이터 행(Row)을 통째로 날려버립니다. (마찬가지로 없으면 테이블 폭파됩니다!)

**쿼리 사용 예시**

```jsx
import pool from "../../lib/db";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { q } = body;
    // CASE 1: 새로운 동아리원 등록 (CREATE / INSERT)
    if (q == "insert") {
      // 바디에서 저장할 데이터(이메일, 이름, 역할)를 꺼냅니다.
      const { email, name, role } = body;

      // ⚠️ SQL 인젝션 방지를 위해 실제 데이터 자리는 '?'(파라미터)로 비워두고,
      // 뒤쪽 배열 `[name, email, role]`에 변수를 순서대로 매칭하여 안전하게 쿼리를 날립니다.
      const [result] = await pool.query(
        "INSERT INTO member (name, email, role) VALUES (?, ?, ?)",
        [name, email, role],
      );
      // 성공적으로 등록된 결과를 프론트엔드에 JSON 형식으로 응답합니다.
      return Response.json({
        data: result,
      });
    // CASE 2: 전체 동아리원 목록 조회 (READ / SELECT)
    } else if (q == "select") {
      // member 테이블의 모든 데이터(*)를 가져옵니다.
      // ⚠️ 리눅스 DB 환경에서는 대소문자를 구분하므로 실제 테이블명인 소문자 'member'를 사용합니다.
      const [rows] = await pool.query("SELECT * from member");

      // 조회된 회원 목록 배열을 프론트엔드에 JSON 형식으로 응답합니다.
      return Response.json({
        data: rows,
      });
    }

    // 예외 처리: q 값이 아예 없거나 일치하는 조건이 없을 때 (안전망)
    // 이 안전망이 없으면 Next.js에서 'No response is returned...' 에러를 뱉기 때문에 필수입니다.
    return Response.json(
      { data: "error", message: `알 수 없는 요청 명령(q)입니다: ${q}` },
      { status: 400 } // 잘못된 요청(Bad Request) 상태 코드 반환
    );
  } catch (error: any) {
    // 프론트에서 바디가 비어있거나 DB 연결/쿼리가 터졌을 때 서버가 다운되지 않도록 예외 처리
    console.error("API 라우터 실행 에러:", error);
    return Response.json(
      { data: "error", message: error.message },
      { status: 500 } // 서버 내부 에러(Internal Server Error) 상태 코드 반환
    );
  }
}
```