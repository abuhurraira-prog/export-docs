import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import ShipmentForm from "@/components/ShipmentForm";

export default async function NewShipmentPage() {
  const { userId: clerkUserId } = await auth();
  const clerkUser = await currentUser();
  if (!clerkUserId) redirect("/sign-in");

  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUserId },
    update: {
      email: clerkUser?.emailAddresses?.[0]?.emailAddress || "",
      name: clerkUser?.fullName || "",
    },
    create: {
      clerkId: clerkUserId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress || "",
      name: clerkUser?.fullName || "",
    },
  });

  const buyers = await prisma.buyer.findMany({
    where: { userId: dbUser.id },
    orderBy: { companyName: "asc" },
  });

  const products = await prisma.product.findMany({
    where: { userId: dbUser.id, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Create New Shipment</h1>
      <ShipmentForm buyers={buyers} products={products} userId={dbUser.id} />
    </div>
  );
}
