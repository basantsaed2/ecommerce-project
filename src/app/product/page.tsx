import { redirect } from "next/navigation";

export default async function ProductPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const { id } = await searchParams;
    redirect(id ? `/product/${encodeURIComponent(id)}` : "/products");
}
