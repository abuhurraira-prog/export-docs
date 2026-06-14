import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import Link from "next/link";

export default async function BuyersPage() {
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Buyers</h1>
        <Link href="/dashboard/buyers/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Buyer
        </Link>
      </div>
      {buyers.length === 0 ? (
        <p className="text-gray-500">No buyers yet. Click "Add Buyer" to create one.</p>
      ) : (
        <div className="border rounded overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Company</th>
                <th className="px-4 py-2 text-left">Contact</th>
                <th className="px-4 py-2 text-left">Country</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map((buyer) => (
                <tr key={buyer.id} className="border-t">
                  <td className="px-4 py-2">{buyer.companyName}</td>
                  <td className="px-4 py-2">{buyer.contactPerson || "-"}</td>
                  <td className="px-4 py-2">{buyer.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}