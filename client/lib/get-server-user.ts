import { cookies } from "next/headers";
import ApiStrings from "@/lib/apis/api-strings";
import { ACCESS_TOKEN } from "@/constants";

export async function getServerUser() {
  const cookie = await cookies();
  const token = cookie.get(ACCESS_TOKEN)?.value;

  if (!token) return null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1${ApiStrings.ME}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) return null;

    const { data } = await res.json();

    return data.user;
  } catch  {
    return null;
  }
}
