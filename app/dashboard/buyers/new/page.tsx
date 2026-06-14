import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";

export default async function NewBuyerPage() {
  const { userId: clerkUserId } = await auth();
  const clerkUser = await currentUser();
  if (!clerkUserId) redirect("/sign-in");

  async function createBuyer(formData: FormData) {
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

    const companyName = formData.get("companyName") as string;
    const contactPerson = formData.get("contactPerson") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const postalCode = formData.get("postalCode") as string;
    const vatNumber = formData.get("vatNumber") as string;

    await prisma.buyer.create({
      data: {
        userId: dbUser.id,
        companyName,
        contactPerson,
        email,
        phone,
        address,
        city,
        country,
        postalCode,
        vatNumber,
      },
    });

    redirect("/dashboard/buyers");
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Buyer</h1>
      <form action={createBuyer} className="space-y-4">
        <div>
          <label className="block font-medium">Company Name *</label>
          <input name="companyName" required className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Contact Person</label>
          <input name="contactPerson" className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input name="email" type="email" className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Phone</label>
          <input name="phone" className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Address</label>
          <textarea name="address" className="border rounded w-full p-2" rows={2} />
        </div>
        <div>
          <label className="block font-medium">City</label>
          <input name="city" className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Country</label>
          <input name="country" className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">Postal Code</label>
          <input name="postalCode" className="border rounded w-full p-2" />
        </div>
        <div>
          <label className="block font-medium">VAT Number (for EU)</label>
          <input name="vatNumber" className="border rounded w-full p-2" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Buyer</button>
      </form>
    </div>
  );
}