export interface CartItem {
    product: string; // Product ID
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
}

export interface UpdateQuantityRequest {
    productId: string;
    quantity: number;
}
