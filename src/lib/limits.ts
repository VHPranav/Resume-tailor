import { prisma } from "@/lib/prisma";

export async function checkAndResetUserLimit(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId }
  });
  
  if (!user) return null;
  
  const adminEmail = process.env.ADMIN_EMAIL || "pranavvh778@gmail.com";
  const isAdmin = user.email.toLowerCase() === adminEmail.toLowerCase();
  
  // Sync role if necessary
  const expectedRole = isAdmin ? "ADMIN" : "USER";
  let currentRole = user.role;
  let currentUsage = user.aiUsageCount;
  let lastReset = new Date(user.lastUsageReset);
  const now = new Date();
  
  let needsUpdate = false;
  const updateData: any = {};

  if (currentRole !== expectedRole) {
    currentRole = expectedRole;
    updateData.role = expectedRole;
    needsUpdate = true;
  }

  if (isAdmin) {
    if (needsUpdate) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      });
    }
    return {
      isBlocked: false,
      role: "ADMIN" as const,
      aiUsageCount: 0,
      user
    };
  }

  // Monthly limit check (reset if it's a new calendar month)
  if (
    now.getMonth() !== lastReset.getMonth() || 
    now.getFullYear() !== lastReset.getFullYear()
  ) {
    currentUsage = 0;
    lastReset = now;
    updateData.aiUsageCount = 0;
    updateData.lastUsageReset = now;
    needsUpdate = true;
  }

  if (needsUpdate) {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });
    return {
      isBlocked: currentUsage >= 2,
      role: "USER" as const,
      aiUsageCount: currentUsage,
      user: updatedUser
    };
  }

  return {
    isBlocked: currentUsage >= 2,
    role: "USER" as const,
    aiUsageCount: currentUsage,
    user
  };
}
