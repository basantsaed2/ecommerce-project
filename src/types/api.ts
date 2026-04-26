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

export interface ProductOption {
    _id: string;
    variationId: string;
    name: string;
    ar_name?: string;
}

export interface ProductVariation {
    _id: string;
    product_price_id: string;
    name: string;
    ar_name?: string;
    options: ProductOption[];
}

export interface ProductPrice {
    _id: string;
    price: number;
    price_after_discount?: number;
    quantity: number;
    sku?: string;
    variations: ProductVariation[];
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
    brandId: string;
    price: number;
    main_price?: number;
    quantity: number;
    cost?: number;
    is_featured?: boolean;
    prices?: ProductPrice[];
    createdAt: string;
    updatedAt: string;
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
