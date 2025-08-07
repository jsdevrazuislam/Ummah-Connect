import { VideoOff } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { UploadShortModal } from "@/components/upload-shorts";
import { ACCESS_TOKEN } from "@/constants";

async function fetchUser() {
  const cookie = await cookies();
  const token = cookie.get(ACCESS_TOKEN)?.value;

  if (!token)
    return null;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/stream/shorts?page=1&limit=10`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok)
    return undefined;
  return res.json();
}

async function Page() {
  const response = await fetchUser() as ShortsResponse;

  if (response?.data?.shorts?.length > 0)
    return redirect(`/shorts/${response?.data?.shorts[0].id}`);

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-96px)] text-gray-400">
      <VideoOff className="h-10 w-10 mb-3" />
      <p className="text-lg font-semibold">Short not found</p>
      <p className="text-sm mt-1">The requested short video doesn't exist.</p>
      <UploadShortModal />
    </div>
  );
}

export default Page;
