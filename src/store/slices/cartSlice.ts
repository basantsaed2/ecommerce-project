import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cartApi } from '@/api/cart';
import { CartItem, PopulatedCartItem, Cart } from '@/types/cart';
import { RootState } from '../store';
import { toast } from 'sonner';

interface CartState {
    items: PopulatedCartItem[];
    totalCartPrice: number;
    shippingCost: number;
    orderType: 'delivery' | 'pickup';
    loading: boolean;
    error: string | null;
}

const initialState: CartState = {
    items: [],
    totalCartPrice: 0,
    shippingCost: 0,
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

export const addItemToCart = createAsyncThunk(
    'cart/addItemToCart',
    async (payload: { productId: string; quantity: number }, { dispatch, getState, rejectWithValue }) => {
        try {
            // Guest support: backend handles session via x-session-id

            const response = await cartApi.addToCart(payload);
            dispatch(fetchCart());
            return getCartFromResponse(response);
        } catch (error: any) {
            console.log(error);
            const msg = extractError(error);
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const updateItemQuantity = createAsyncThunk(
    'cart/updateItemQuantity',
    async (payload: { productId: string; quantity: number }, { dispatch, getState, rejectWithValue }) => {
        try {
            // Guest support: backend handles session via x-session-id

            const response = await cartApi.updateQuantity(payload);
            dispatch(fetchCart());
            return getCartFromResponse(response);
        } catch (error: any) {
            const msg = extractError(error);
            toast.error(msg);
            return rejectWithValue(msg);
        }
    }
);

export const removeItemFromCart = createAsyncThunk(
    'cart/removeItemFromCart',
    async (productId: string, { dispatch, getState, rejectWithValue }) => {
        try {
            // Guest support: backend handles session via x-session-id

            const response = await cartApi.removeFromCart(productId);
            dispatch(fetchCart());
            return getCartFromResponse(response);
        } catch (error: any) {
            const msg = extractError(error);
            toast.error(msg);
            return rejectWithValue(msg);
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

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Guest Reducers (Local Only)
        addToCartLocal: (state, action: PayloadAction<PopulatedCartItem>) => {
            const existing = state.items.find(item => item.product._id === action.payload.product._id);
            if (existing) {
                existing.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
            state.totalCartPrice = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        },
        updateQuantityLocal: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
            const item = state.items.find(item => item.product._id === action.payload.productId);
            if (item) {
                item.quantity = action.payload.quantity;
            }
            state.totalCartPrice = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        },
        removeFromCartLocal: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.product._id !== action.payload);
            state.totalCartPrice = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        },
        clearCartLocal: (state) => {
            state.items = [];
            state.totalCartPrice = 0;
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
            } else {
                state.items = [];
                state.totalCartPrice = 0;
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
            // Add Item Sync
            .addCase(addItemToCart.fulfilled, (state, action) => {
                handleCartUpdate(state, action);
                if (action.payload) toast.success('Added to your account cart');
            })
            // Update Quantity Sync
            .addCase(updateItemQuantity.fulfilled, (state, action) => {
                handleCartUpdate(state, action);
                if (action.payload) toast.success('Quantity updated successfully');
            })
            // Remove Item Sync
            .addCase(removeItemFromCart.fulfilled, (state, action) => {
                handleCartUpdate(state, action);
                toast.success('Removed from your account');
            })
            // Clear Cart Sync
            .addCase(clearCartSync.fulfilled, (state) => {
                state.items = [];
                state.totalCartPrice = 0;
                toast.success('Cart cleared');
            });
    },
});

export const { addToCartLocal, updateQuantityLocal, removeFromCartLocal, clearCartLocal, setCartState, setOrderType } = cartSlice.actions;
export default cartSlice.reducer;