import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UserWidget } from "@/components/user-widget";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <UserWidget user={session?.user ?? null} />
    </div>
  );
}
