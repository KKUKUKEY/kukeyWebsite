import Link from "next/link";

import {
  activityStatusLabel,
  type ActivityPreview,
} from "./types";

export default function ActivityCard({ activity }: { activity: ActivityPreview }) {
  return (
    <article>
      <Link href={`/share/${activity.id}`}>
        <h2>{activity.title}</h2>
      </Link>
      <p>상태: {activityStatusLabel[activity.status]}</p>
      <p>작성자: {activity.leader}</p>
      <p>
        모집 인원: {activity.currentParticipants}/{activity.maxParticipants}
      </p>
      <p>신청자: {activity.currentApplicants}명</p>
      <p>작성일: {activity.createdAt}</p>
    </article>
  );
}
