"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ActivityCard from "@/app/components/share/ActivityCard";
import type { ActivityPreview } from "@/app/components/share/types";

export default function SharePage() {
  const [activities, setActivities] = useState<ActivityPreview[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity-preload?page=1")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.result) {
          throw new Error(result.message ?? "활동 목록을 불러오지 못했습니다.");
        }
        setActivities(result.data ?? []);
      })
      .catch((reason: unknown) => {
        setMessage(
          reason instanceof Error ? reason.message : "활동 목록을 불러오지 못했습니다.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <header>
        <h1>활동 공유 및 모집</h1>
        <Link href="/share/new">모집글 작성</Link>
      </header>

      {loading && <p>불러오는 중...</p>}
      {message && <p>{message}</p>}
      {!loading && !message && activities.length === 0 && (
        <p>등록된 모집글이 없습니다.</p>
      )}
      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            <ActivityCard activity={activity} />
          </li>
        ))}
      </ul>
    </main>
  );
}
