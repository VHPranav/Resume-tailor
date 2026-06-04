import { auth } from "@clerk/nextjs/server";
import { checkAndResetUserLimit } from "@/lib/limits";
import UploadForm from "./UploadForm";
import LimitReachedView from "@/components/LimitReachedView";
import DashboardShell from "@/components/DashboardShell";

export default async function UploadPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return null;
  }

  // Check usage and monthly limits
  const limitCheck = await checkAndResetUserLimit(clerkId);
  const isBlocked = limitCheck?.isBlocked || false;
  const role = limitCheck?.role || "USER";
  const aiUsageCount = limitCheck?.aiUsageCount || 0;

  if (isBlocked && role !== "ADMIN") {
    return (
      <DashboardShell>
        <LimitReachedView usageCount={aiUsageCount} />
      </DashboardShell>
    );
  }

  return <UploadForm />;
}
