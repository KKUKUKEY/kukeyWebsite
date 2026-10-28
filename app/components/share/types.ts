export type ActivityStatus = "RECRUITING" | "COMPLETED" | "DONE";

export interface ActivityPreview {
  id: number;
  title: string;
  status: ActivityStatus;
  leader: string;
  createdAt: string;
  maxParticipants: number;
  currentParticipants: number;
  currentApplicants: number;
}

export interface ActivityDetail extends ActivityPreview {
  text: string;
  techStacks: string[];
  startDate: string;
  endDate: string;
  participants: string[];
  participantsEmail: string[];
}

export const activityStatusLabel: Record<ActivityStatus, string> = {
  RECRUITING: "모집중",
  COMPLETED: "모집완료",
  DONE: "활동종료",
};
