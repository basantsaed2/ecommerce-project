// src/hooks/useWishlist.ts
import { useGet } from './useGet';
import { usePost } from './usePost';
import { useDelete } from './useDelete';
import { useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/api/axiosInstance';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface WishlistItem {
    _id: string;
    name: string;
    ar_name?: string;
    image: string;
    price: number;
    quantity: number;
    is_featured?: boolean;
}

export interface WishlistResponse {
    success: boolean;
    data: {
        message: string;
        data: WishlistItem[];
    };
}

/** Fetch the current user's wishlist */
export const useGetWishlist = (enabled = true) =>
    useGet<WishlistResponse>(['wishlist'], '/wishlist', { enabled });

/** Toggle a product in/out of wishlist via POST /wishlist/toggle */
export const useToggleWishlist = () =>
    usePost<{ productId: string }, any>(
        '/wishlist/toggle',
        ['wishlist'],
        undefined // suppress default toast; caller handles UI feedback
    );

/** Clear the entire wishlist via DELETE /wishlist/clear */
export const useClearWishlist = () => {
    const queryClient = useQueryClient();

    return useMutation<any, Error, void>({
        mutationFn: async () => {
            const { data } = await axiosInstance.delete('/wishlist/clear');
            return data;
        },
        onSuccess: () => {
            toast.success('Wishlist cleared');
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        },
        onError: (error: any) => {
            const msg =
                error.response?.data?.error?.message ||
                error.response?.data?.message ||
                error.message ||
                'Failed to clear wishlist';
            toast.error(msg);
        },
    });
};
