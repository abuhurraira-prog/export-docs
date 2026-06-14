import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import Link from "next/link";

export default async function ProductsPage() {
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

  const products = await prisma.product.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/dashboard/products/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Add Product
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="text-gray-500">No products yet. Click "Add Product" to create one.</p>
      ) : (
        <div className="border rounded overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">HS Code</th>
                <th className="px-4 py-2 text-right">Unit Price (USD)</th>
                <th className="px-4 py-2 text-left">Unit</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.hsCode || "-"}</td>
                  <td className="px-4 py-2 text-right">{product.unitPrice}</td>
                  <td className="px-4 py-2">{product.unitType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}