import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // ده بيستخدم LocalStorage تلقائياً
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';

// إعدادات الـ Persistence
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['cart'] // هنا بنقول له احفظ السلة بس، ومتحفظش الـ Auth لو هنعتمد على الكوكيز
};

const rootReducer = combineReducers({
    cart: cartReducer,
    auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // مهمة عشان redux-persist بتستخدم بيانات غير نصية أحياناً
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;