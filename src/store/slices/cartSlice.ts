import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartApi } from '@/api/cart';
import { CartItem, PopulatedCartItem, Cart } from '@/types/cart';
import { RootState } from '../store';
import { toast } from 'sonner';

interface CartState {
    items: PopulatedCartItem[];
    totalCartPrice: number;
    shippingCost: number;
    couponDiscount: number;
    taxAmount: number;
    serviceFee: number;
    orderType: 'delivery' | 'pickup';
    loading: boolean;
    error: string | null;
}

const initialState: CartState = {
    items: [],
    totalCartPrice: 0,
    shippingCost: 0,
    couponDiscount: 0,
    taxAmount: 0,
    serviceFee: 0,
    orderType: 'delivery',
    loading: false,
    error: null,
};

// Helper to safely extract cart data from SuccessResponse
const getCartFromResponse = (response: any) => {
    // Backend returns { success: true, data: { cart: { ... }, shippingCost: ... } } 
    // or { success: true, data: { cart: [ ... ], shippingCost: ... } }
    const data = response.data?.data || response.data;
    let cartData = data?.cart || data;
    const shippingCost = data?.shippingCost || 0;

    // If cart is explicitly an empty array, return an empty cart structure
    if (Array.isArray(cartData) && cartData.length === 0) {
        return { cart: { cartItems: [], totalCartPrice: 0 }, shippingCost };
    }

    if (Array.isArray(cartData)) {
        cartData = cartData[0];
    }

    return { cart: cartData, shippingCost };
};

// Helper to extract error message safely
const extractError = (error: any) => {
    return error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Operation failed';
};

// Async Thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { getState, rejectWithValue }) => {
        try {
            // Guest support: backend handles session via x-session-id

            const response = await cartApi.getCart();
            return getCartFromResponse(response);
        } catch (error: any) {
            return rejectWithValue(extractError(error));
        }
    }
);

export const syncCart = createAsyncThunk(
    'cart/syncCart',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const items = state.cart.items.map(item => ({
                productId: item.product._id,
                productVariantId: item.variant?._id || item.productVariantId,
                quantity: item.quantity
            }));
            const response = await cartApi.syncCart(items);
            return getCartFromResponse(response);
        } catch (error: any) {
            return rejectWithValue(extractError(error));
        }
    }
);

export const clearCartSync = createAsyncThunk(
    'cart/clearCartSync',
    async (_, { getState, rejectWithValue }) => {
        try {
            // Guest support: backend handles session via x-session-id

            await cartApi.clearCart();
            return null;
        } catch (error: any) {
            return rejectWithValue(extractError(error));
        }
    }
);

export const applyCoupon = createAsyncThunk(
    'cart/applyCoupon',
    async (couponCode: string, { rejectWithValue }) => {
        try {
            const response = await cartApi.applyCoupon(couponCode);
            toast.success('Coupon applied successfully');
            return getCartFromResponse(response);
        } catch (error: any) {
            const msg = extractError(error);
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const removeCoupon = createAsyncThunk(
    'cart/removeCoupon',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartApi.removeCoupon();
            toast.success('Coupon removed');
            return getCartFromResponse(response);
        } catch (error: any) {
            const msg = extractError(error);
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Guest Reducers (Local Only)
        addItem: (state, action: PayloadAction<{ product: any; variant?: any; quantity: number }>) => {
            const { product, variant, quantity } = action.payload;
            const existing = state.items.find(item => 
                item.product._id === product._id && 
                (variant ? (item.variant?._id === variant._id) : !item.variant)
            );

            if (existing) {
                existing.quantity += quantity;
            } else {
                state.items.push({
                    product,
                    variant,
                    quantity,
                    price: variant ? variant.price : (product.price_after_discount || product.price || 0)
                } as any);
            }
            state.totalCartPrice = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        },
        updateQuantity: (state, action: PayloadAction<{ productId: string; variantId?: string; quantity: number }>) => {
            const { productId, variantId, quantity } = action.payload;
            const item = state.items.find(item => 
                item.product._id === productId && 
                (variantId ? (item.variant?._id === variantId) : !item.variant)
            );
            if (item) {
                item.quantity = quantity;
            }
            state.totalCartPrice = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        },
        removeItem: (state, action: PayloadAction<{ productId: string; variantId?: string }>) => {
            const { productId, variantId } = action.payload;
            state.items = state.items.filter(item => 
                !(item.product._id === productId && (variantId ? (item.variant?._id === variantId) : !item.variant))
            );
            state.totalCartPrice = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        },
        clearCartLocal: (state) => {
            state.items = [];
            state.totalCartPrice = 0;
            state.couponDiscount = 0;
            state.taxAmount = 0;
            state.serviceFee = 0;
        },
        setCartState: (state, action: PayloadAction<any>) => {
            let cartData = action.payload;
            if (Array.isArray(cartData)) {
                cartData = cartData[0];
            }
            if (cartData) {
                state.items = (cartData.cartItems || []).map((item: any) => ({
                    ...item,
                    product: typeof item.product === 'string'
                        ? { _id: item.product, price: item.price }
                        : item.product
                }));
                state.totalCartPrice = cartData.totalCartPrice ||
                    state.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                state.couponDiscount = cartData.couponDiscount || 0;
                state.taxAmount = cartData.taxAmount || 0;
                state.serviceFee = cartData.serviceFee || 0;
            } else {
                state.items = [];
                state.totalCartPrice = 0;
                state.couponDiscount = 0;
                state.taxAmount = 0;
                state.serviceFee = 0;
            }
        },
        setOrderType: (state, action: PayloadAction<'delivery' | 'pickup'>) => {
            state.orderType = action.payload;
        }
    },
    extraReducers: (builder) => {
        const handleCartUpdate = (state: any, action: PayloadAction<any>) => {
            state.loading = false;
            if (!action.payload) return;

            const { cart, shippingCost } = action.payload;
            let cartData = cart;

            // Handle if backend returns array [cartObject] or just cartObject
            if (Array.isArray(cartData)) {
                cartData = cartData[0];
            }

            if (cartData) {
                // Normalize items to ensure each item has a product object, even if not populated
                state.items = (cartData.cartItems || []).map((item: any) => ({
                    ...item,
                    product: typeof item.product === 'string'
                        ? { _id: item.product, price: item.price }
                        : item.product
                }));
                // Calculate total price if missing from backend
                state.totalCartPrice = cartData.totalCartPrice ||
                    state.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

                state.shippingCost = shippingCost || 0;
                state.couponDiscount = cartData.couponDiscount || 0;
                state.taxAmount = cartData.taxAmount || 0;
                state.serviceFee = cartData.serviceFee || 0;
            }
        };

        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                handleCartUpdate(state, action);
            })
            // Sync Cart
            .addCase(syncCart.pending, (state) => {
                state.loading = true;
            })
            .addCase(syncCart.fulfilled, (state, action) => {
                handleCartUpdate(state, action);
            })
            .addCase(syncCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Clear Cart Sync
            .addCase(clearCartSync.fulfilled, (state) => {
                state.items = [];
                state.totalCartPrice = 0;
                toast.success('Cart cleared');
            })
            // Apply Coupon
            .addCase(applyCoupon.fulfilled, (state, action) => {
                handleCartUpdate(state, action);
            })
            // Remove Coupon
            .addCase(removeCoupon.fulfilled, (state, action) => {
                handleCartUpdate(state, action);
            });
    },
});

export const { addItem, updateQuantity, removeItem, clearCartLocal, setCartState, setOrderType } = cartSlice.actions;
export default cartSlice.reducer;