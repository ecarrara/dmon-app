import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Header } from "@/components/dashboard/header";
import { SystemStatusCard } from "@/components/dashboard/system-status-card";
import { StartTrackingButton } from "@/components/dashboard/start-tracking-button";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { RecentTrips } from "@/components/dashboard/recent-trips";
import { BottomNav } from "@/components/dashboard/bottom-nav";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = session.user;
  const firstName = user.name.split(" ")[0];

  return (
    <DashboardShell>
      <Header
        userName={firstName}
        userImage={user.image}
        role="Newbie Driver"
      />
      <SystemStatusCard status="ready" cameraStatus="Ready" />
      <StartTrackingButton />
      <StatsGrid />
      <RecentTrips />
      <BottomNav activeTab="home" />
    </DashboardShell>
  );
}
