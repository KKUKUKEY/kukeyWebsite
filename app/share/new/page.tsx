import Link from "next/link";

import ActivityCreateForm from "@/app/components/share/ActivityCreateForm";

export default function NewSharePage() {
  return (
    <main>
      <Link href="/share">목록으로</Link>
      <ActivityCreateForm />
    </main>
  );
}
