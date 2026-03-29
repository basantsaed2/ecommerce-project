"use client";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchCart } from '@/store/slices/cartSlice';

export default function CartInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const { token } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(fetchCart());
    }, [token, dispatch]);

    return <>{children}</>;
}
