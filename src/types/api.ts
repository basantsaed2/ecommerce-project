export interface Banner {
    _id: string;
    name: string[];
    images: string[];
    title?: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    _id: string;
    name: string;
    ar_name?: string;
    image: string;
    product_quantity: number;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Discount {
    _id?: string;
    name?: string;
    type?: "percentage" | "fixed" | "amount" | string;
    amount?: number;
}

export interface ProductOption {
    _id: string;
    variationId?: string;
    name: string;
    ar_name?: string;
}

export interface ProductVariation {
    _id: string;
    product_price_id?: string;
    name: string;
    ar_name?: string;
    options: ProductOption[];
}

export interface ProductPrice {
    _id: string;
    price: number;
    final_price?: number;
    price_after_discount?: number;
    quantity: number;
    sku?: string;
    variations: ProductVariation[];
}

export interface Sku {
    _id?: string;
    code?: string;
    sku?: string;
    price: number;
    final_price?: number;
    price_after_discount?: number;
    quantity: number;
    option_ids: string[];
    gallery?: string[];
}

export interface ProductBrand {
    _id: string;
    name: string;
    ar_name?: string;
    logo?: string;
}

export interface Product {
    _id: string;
    name: string;
    ar_name?: string;
    description?: string;
    ar_description?: string;
    image: string;
    gallery_product?: string[];
    categoryId?: Category[];
    category?: Category;
    brand?: ProductBrand;
    price?: number;
    main_price?: number;
    final_price?: number;
    discount?: Discount;
    quantity: number;
    cost?: number;
    is_featured?: boolean;
    is_favorite?: boolean;
    prices?: ProductPrice[];
    variations?: ProductVariation[];
    skus?: Sku[];
    createdAt?: string;
    created_at?: string;
    updatedAt?: string;
}

export interface Brand {
    _id: string;
    name: string;
    ar_name?: string;
    logo: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: {
        message: string;
        data: T[];
    };
}

export interface SingleApiResponse<T> {
    success: boolean;
    data: {
        message: string;
        data: T;
    };
}
