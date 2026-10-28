"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  activityStatusLabel,
  type ActivityDetail as ActivityDetailData,
} from "./types";

export default function ActivityDetail({ id }: { id: string }) {
  const [activity, setActivity] = useState<ActivityDetailData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/activity-load?id=${encodeURIComponent(id)}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.result || !result.data) {
          throw new Error(result.message ?? "게시물을 불러오지 못했습니다.");
        }
        setActivity(result.data);
      })
      .catch((reason: unknown) => {
        setMessage(
          reason instanceof Error ? reason.message : "게시물을 불러오지 못했습니다.",
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!token || !email) {
      setMessage("로그인 후 신청할 수 있습니다.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/activity-apply", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: Number(id), email }),
      });
      const result = await response.json();

      if (!response.ok || !result.result) {
        throw new Error(result.message ?? "신청 처리에 실패했습니다.");
      }

      setMessage(result.message);
    } catch (reason: unknown) {
      setMessage(
        reason instanceof Error ? reason.message : "신청 처리에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main><p>불러오는 중...</p></main>;
  if (!activity) return <main><p>{message}</p><Link href="/share">목록으로</Link></main>;

  return (
    <main>
      <Link href="/share">목록으로</Link>
      <article>
        <h1>{activity.title}</h1>
        <p>상태: {activityStatusLabel[activity.status]}</p>
        <p>작성자: {activity.leader}</p>
        <p>{activity.text}</p>
        <p>기술 스택: {activity.techStacks.join(", ") || "없음"}</p>
        <p>활동 기간: {activity.startDate} ~ {activity.endDate}</p>
        <p>
          모집 인원: {activity.currentParticipants}/{activity.maxParticipants}
        </p>

        <section>
          <h2>신청자</h2>
          {activity.participants.length > 0 ? (
            <ul>
              {activity.participants.map((participant) => (
                <li key={participant}>{participant}</li>
              ))}
            </ul>
          ) : (
            <p>아직 신청자가 없습니다.</p>
          )}
        </section>

        <button disabled={submitting} onClick={handleApply} type="button">
          {submitting ? "처리 중..." : "신청 / 철회"}
        </button>
        {message && <p>{message}</p>}
      </article>

      <section>
        <h2>댓글</h2>
        <p>댓글 API가 정해지면 이 영역에 연결합니다.</p>
      </section>
    </main>
  );
}
