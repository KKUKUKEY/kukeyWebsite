"use client";

import { useEffect, useState } from "react";

interface FooterData {
  snsUrl: string;
  githubUrl: string;
  representativeEmail: string;
}

export default function Footer() {
  const [data, setData] = useState<FooterData | null>(null);

  useEffect(() => {
    fetch("/api/footer-load")
      .then((res) => res.json())
      .then((res) => {
        if (res.result) {
          setData(res.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <footer>
      {data ? (
        <>
          <a href={data.snsUrl} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>

          <a href={data.githubUrl} target="_blank" rel="noopener noreferrer">
            Github
          </a>

          <p>{data.representativeEmail}</p>
        </>
      ) : (
        <p>정보를 불러오는 중...</p>
      )}
    </footer>
  );
}
