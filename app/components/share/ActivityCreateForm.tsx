"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface FormState {
  title: string;
  text: string;
  status: "RECRUITING" | "COMPLETED" | "DONE";
  techStacks: string;
  leader: string;
  startDate: string;
  endDate: string;
  maxParticipants: string;
}

const initialForm: FormState = {
  title: "",
  text: "",
  status: "RECRUITING",
  techStacks: "",
  leader: "",
  startDate: "",
  endDate: "",
  maxParticipants: "",
};

export default function ActivityCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");

    if (!token || !email) {
      setMessage("로그인 후 모집글을 작성할 수 있습니다.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/activity-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          title: form.title,
          text: form.text,
          status: form.status,
          techStacks: form.techStacks
            .split(",")
            .map((stack) => stack.trim())
            .filter(Boolean),
          leader: form.leader,
          createdAt: new Date().toISOString(),
          startDate: form.startDate,
          endDate: form.endDate,
          maxParticipants: Number(form.maxParticipants),
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.result) {
        throw new Error(result.message ?? "모집글 작성에 실패했습니다.");
      }

      router.push("/share");
    } catch (reason: unknown) {
      setMessage(
        reason instanceof Error ? reason.message : "모집글 작성에 실패했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>모집글 작성</h1>

      <label>
        제목
        <input
          required
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
        />
      </label>

      <label>
        작성자
        <input
          required
          value={form.leader}
          onChange={(event) => update("leader", event.target.value)}
        />
      </label>

      <label>
        본문
        <textarea
          required
          value={form.text}
          onChange={(event) => update("text", event.target.value)}
        />
      </label>

      <label>
        상태
        <select
          value={form.status}
          onChange={(event) => update("status", event.target.value)}
        >
          <option value="RECRUITING">모집중</option>
          <option value="COMPLETED">모집완료</option>
          <option value="DONE">활동종료</option>
        </select>
      </label>

      <label>
        기술 스택 (쉼표로 구분)
        <input
          value={form.techStacks}
          onChange={(event) => update("techStacks", event.target.value)}
        />
      </label>

      <label>
        시작일
        <input
          required
          type="date"
          value={form.startDate}
          onChange={(event) => update("startDate", event.target.value)}
        />
      </label>

      <label>
        종료일
        <input
          required
          type="date"
          value={form.endDate}
          onChange={(event) => update("endDate", event.target.value)}
        />
      </label>

      <label>
        모집 인원
        <input
          required
          min="1"
          type="number"
          value={form.maxParticipants}
          onChange={(event) => update("maxParticipants", event.target.value)}
        />
      </label>

      <button disabled={submitting} type="submit">
        {submitting ? "작성 중..." : "작성하기"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
