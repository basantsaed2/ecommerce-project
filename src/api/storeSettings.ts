import axios from 'axios';
import { getCookie } from 'cookies-next';
import { getSessionId } from '@/utils/session';
import {
    StoreSettingsResponse,
    StoreSettings,
    ThemeCategoriesResponse,
    ThemesResponse,
    SingleThemeResponse,
    UpdateStoreSettingsPayload
} from '@/types/storeSettings';

const getApiBaseUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || '';
};

const getAuthHeaders = () => {
    const token = getCookie('token');
    const sessionId = getSessionId();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (sessionId) {
        headers['x-session-id'] = sessionId;
    }
    return headers;
};

// 1. Get Store Settings
export const getStoreSettingsApi = async (): Promise<StoreSettingsResponse> => {
    const baseUrl = getApiBaseUrl();
    // Try /api/store/store-settings first, with fallback support for /api/store/settings
    try {
        const { data } = await axios.get<StoreSettingsResponse>(
            `${baseUrl}/api/store/store-settings`,
            { headers: getAuthHeaders() }
        );
        return data;
    } catch (storeError: any) {
        try {
            const { data } = await axios.get<StoreSettingsResponse>(
                `${baseUrl}/api/store/store-settings`,
                { headers: getAuthHeaders() }
            );
            return data;
        } catch (storeError) {
            throw storeError;
        }
    }
};

// 2. Update Store Settings
export const updateStoreSettingsApi = async (
    payload: UpdateStoreSettingsPayload
): Promise<StoreSettingsResponse> => {
    const baseUrl = getApiBaseUrl();
    const { data } = await axios.put<StoreSettingsResponse>(
        `${baseUrl}/api/store/store-settings`,
        payload,
        { headers: getAuthHeaders() }
    );
    return data;
};

// 3. Get Theme Categories
export const getThemeCategoriesApi = async (): Promise<ThemeCategoriesResponse> => {
    const baseUrl = getApiBaseUrl();
    const { data } = await axios.get<ThemeCategoriesResponse>(
        `${baseUrl}/api/store/store-settings/themes/categories`,
        { headers: getAuthHeaders() }
    );
    return data;
};

// 4. Get Themes by Category ID
export const getThemesByCategoryApi = async (categoryId: string): Promise<ThemesResponse> => {
    const baseUrl = getApiBaseUrl();
    const { data } = await axios.get<ThemesResponse>(
        `${baseUrl}/api/store/store-settings/themes/categories/${categoryId}`,
        { headers: getAuthHeaders() }
    );
    return data;
};

// 5. Get Theme by Slug
export const getThemeBySlugApi = async (slug: string): Promise<SingleThemeResponse> => {
    const baseUrl = getApiBaseUrl();
    const { data } = await axios.get<SingleThemeResponse>(
        `${baseUrl}/api/store/store-settings/themes/${slug}`,
        { headers: getAuthHeaders() }
    );
    return data;
};
