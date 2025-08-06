import ShortsPlayer from "@/app/(dashboard)/shorts/[id]/short";

export default async function ShortPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <ShortsPlayer id={Number(id)} />
  );
}
