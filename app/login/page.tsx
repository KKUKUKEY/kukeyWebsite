"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          pw,
          role: "user",
        }),
      });

      const result = await response.json();

      if (result.result) {
        localStorage.setItem("token", result.data.token);

        localStorage.setItem("email", result.data.email);

        localStorage.setItem("role", result.data.role);

        alert("로그인 성공!");
        router.push("/");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl border p-8 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">로그인</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border p-3"
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="rounded border p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-black p-3 text-white"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/signup" className="text-sm underline">
            회원가입하기
          </Link>
        </div>
      </div>
    </main>
  );
}
