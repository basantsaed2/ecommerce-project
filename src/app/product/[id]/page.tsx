// Server component wrapper — required for static export with dynamic routes
export async function generateStaticParams() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_BASE_URL;
        const res = await fetch(`${apiUrl}/api/store/product`);
        const json = await res.json();
        const products = json?.data?.data || [];
        return products.map((p: any) => ({
            id: p._id,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

import ProductDetailClient from './ProductDetailClient';

export default function ProductPage() {
    return <ProductDetailClient />;
}
