import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import Link from "next/link";

export default async function ShipmentsPage() {
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

  const shipments = await prisma.shipment.findMany({
    where: { userId: dbUser.id },
    include: { buyer: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shipments</h1>
        <Link href="/dashboard/shipments/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          + New Shipment
        </Link>
      </div>
      {shipments.length === 0 ? (
        <p className="text-gray-500">No shipments yet. Click "New Shipment" to create one.</p>
      ) : (
        <div className="border rounded overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Shipment #</th>
                <th className="px-4 py-2 text-left">Buyer</th>
                <th className="px-4 py-2 text-right">Total (USD)</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Invoice</th>
                <th className="px-4 py-2 text-left">Packing</th>
                <th className="px-4 py-2 text-left">COO</th>
                <th className="px-4 py-2 text-left">B/L</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="border-t">
                  <td className="px-4 py-2">{shipment.shipmentNumber}</td>
                  <td className="px-4 py-2">{shipment.buyer.companyName}</td>
                  <td className="px-4 py-2 text-right">{shipment.totalAmount}</td>
                  <td className="px-4 py-2">{shipment.status}</td>
                  <td className="px-4 py-2">
                    <a href={`/api/documents/invoice/${shipment.id}`} target="_blank" className="text-blue-600 underline">PDF</a>
                  </td>
                  <td className="px-4 py-2">
                    <a href={`/api/documents/packinglist/${shipment.id}`} target="_blank" className="text-blue-600 underline">PDF</a>
                  </td>
                  <td className="px-4 py-2">
                    <a href={`/api/documents/coo/${shipment.id}`} target="_blank" className="text-blue-600 underline">PDF</a>
                  </td>
<td className="px-4 py-2">
  <a href={`/api/documents/bol/${shipment.id}`} target="_blank" className="text-blue-600 underline">PDF</a>
</td>
                  <td className="px-4 py-2">{new Date(shipment.shipmentDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}