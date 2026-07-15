"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const isLogin =
    typeof window !== "undefined" && !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    router.refresh();
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between border-b px-8 py-4">
      {/* 로고 */}
      <Link href="/" className="text-2xl font-bold">
        KUkey
      </Link>

      {/* 네비게이션 */}
      <nav className="flex gap-8">
        <Link href="/about" className="hover:text-gray-500">
          About
        </Link>

        <Link href="/calendar" className="hover:text-gray-500">
          캘린더
        </Link>

        <Link href="/portfolio" className="hover:text-gray-500">
          포트폴리오
        </Link>

        <Link href="/share" className="hover:text-gray-500">
          활동 공유
        </Link>
      </nav>

      {/* 로그인 / 로그아웃 */}
      <div>
        {isLogin ? (
          <button
            onClick={handleLogout}
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            로그아웃
          </button>
        ) : (
          <Link
            href="/login"
            className="rounded border px-4 py-2 hover:bg-gray-100"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
