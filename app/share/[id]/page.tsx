import ActivityDetail from "@/app/components/share/ActivityDetail";

export default async function ShareDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ActivityDetail id={id} />;
}
