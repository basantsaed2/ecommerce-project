export interface CartItem {
    product: string; // Product ID
    variant?: string; // Variant ID
    quantity: number;
    price: number;
}

export interface PopulatedCartItem {
    product: {
        _id: string;
        name?: string;
        ar_name?: string;
        image?: string;
        price: number;
    };
    variant?: {
        _id: string;
        price: number;
        [key: string]: any;
    };
    productVariantId?: string; // For syncing purposes
    quantity: number;
    price: number;
}

export interface Cart {
    _id: string;
    user: string;
    cartItems: PopulatedCartItem[];
    totalCartPrice?: number;
}

export interface AddToCartRequest {
    productId: string;
    quantity: number;
    productVariantId?: string;
}

export interface UpdateQuantityRequest {
    productId: string;
    quantity: number;
    productVariantId?: string;
}
