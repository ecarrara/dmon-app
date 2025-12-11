import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TripDetailView } from "@/components/trip-detail/trip-detail-view";

interface TripDetailPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { tripId } = await params;

  return <TripDetailView tripId={tripId} />;
}
