import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";

export default async function NewProductPage() {
  const { userId: clerkUserId } = await auth();
  const clerkUser = await currentUser();
  if (!clerkUserId) redirect("/sign-in");

  async function createProduct(formData: FormData) {
    "use server";
    const { userId: clerkUserId } = await auth();
    const clerkUser = await currentUser();
    if (!clerkUserId) throw new Error("Unauthorized");

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

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const hsCode = formData.get("hsCode") as string;
    const unitPrice = parseFloat(formData.get("unitPrice") as string);
    const unitType = formData.get("unitType") as string;
    const weightKg = formData.get("weightKg") ? parseFloat(formData.get("weightKg") as string) : null;

    await prisma.product.create({
      data: {
        userId: dbUser.id,
        name,
        description,
        hsCode,
        unitPrice,
        unitType,
        weightKg,
      },
    });

    redirect("/dashboard/products");
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <form action={createProduct} className="space-y-4">
        <div>
          <label className="block font-medium">Product Name *</label>
          <input name="name" required className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Description</label>
          <textarea name="description" className="border rounded w-full p-2" rows={2} />
        </div>
        <div>
          <label className="block font-medium">HS Code (Customs code)</label>
          <input name="hsCode" className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Unit Price (USD) *</label>
          <input name="unitPrice" type="number" step="0.01" required className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Unit Type</label>
          <select name="unitType" className="border rounded w-full p-2">
            <option value="PCS">Pieces (PCS)</option>
            <option value="KG">Kilogram (KG)</option>
            <option value="M">Meter (M)</option>
            <option value="L">Liter (L)</option>
            <option value="SET">Set (SET)</option>
            <option value="CTN">Carton (CTN)</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Weight per Unit (KG, optional)</label>
          <input name="weightKg" type="number" step="0.01" className="border rounded w-full p-2" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Product</button>
      </form>
    </div>
  );
}