"use client";

import { useEffect, useState } from "react";

interface MainData {
  bannerImageUrl: string;
  mainTitle: string;
}

export default function HomePage() {
  const [data, setData] = useState<MainData>({
    bannerImageUrl: "",
    mainTitle: "코딩으로 세상을 바꾸는 KUKEY",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/main-load")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.result || !result.data) {
          throw new Error(result.message ?? "메인 페이지를 불러오지 못했습니다.");
        }
        setData(result.data);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "데이터를 불러오지 못했습니다.");
      });
  }, []);

  return (
    <main>
      <section>
        <h1>{data.mainTitle}</h1>
        <p>KUKEY 동아리 메인 페이지</p>
        {data.bannerImageUrl ? (
          <div
            role="img"
            aria-label="KUKEY 배너"
            style={{
              backgroundImage: `url(${data.bannerImageUrl})`,
              minHeight: 240,
            }}
          />
        ) : (
          <p>배너 이미지가 준비되면 이 영역에 표시됩니다.</p>
        )}
        {error && <p>{error}</p>}
      </section>
    </main>
  );
}
