import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Header } from "@/components/dashboard/header";
import { SystemStatusCard } from "@/components/dashboard/system-status-card";
import { StartTrackingButton } from "@/components/dashboard/start-tracking-button";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { RecentTrips, type Trip } from "@/components/dashboard/recent-trips";
import { BottomNav } from "@/components/dashboard/bottom-nav";

// Demo data - in a real app this would come from a database
const demoTrips: Trip[] = [
  {
    id: "1",
    name: "Downtown Trip",
    time: "24m ago",
    distance: "5.2 mi",
    score: 95,
  },
  {
    id: "2",
    name: "Commute Home",
    time: "Yesterday",
    distance: "12.4 mi",
    score: 82,
  },
  {
    id: "3",
    name: "Gym Run",
    time: "2 days ago",
    distance: "3.1 mi",
    score: 98,
  },
];

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
      <Header userName={firstName} userImage={user.image} role="Pro Driver" />
      <SystemStatusCard
        status="ready"
        gpsStatus="Strong"
        cameraStatus="Ready"
        location="Current Location"
      />
      <StartTrackingButton />
      <StatsGrid score={92} hours={1} minutes={45} events={0} />
      <RecentTrips trips={demoTrips} />
      <BottomNav activeTab="home" />
    </DashboardShell>
  );
}
