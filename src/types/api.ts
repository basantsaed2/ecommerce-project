export interface Banner {
    _id: string;
    name: string[];
    images: string[];
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

export interface Product {
    _id: string;
    name: string;
    ar_name?: string;
    description?: string;
    ar_description?: string;
    image: string;
    categoryId: string[];
    brandId: string;
    price: number;
    quantity: number;
    cost?: number;
    is_featured?: boolean;
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
