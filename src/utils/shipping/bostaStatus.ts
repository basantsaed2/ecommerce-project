/**
 * Bosta Shipping Status Definition & Mapping for Storefront / E-commerce
 * Compatible with Bosta Webhook and Backend Order Statuses
 */

export interface BostaStateMapping {
    code: number;
    bostaStatus: string;
    orderStatus: 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'returned' | 'failed_to_deliver' | 'canceled';
    labelAr: string;
    labelEn: string;
}

export const BOSTA_STATES_MAP: Record<number, BostaStateMapping> = {
    10: { code: 10, bostaStatus: 'Pickup requested', orderStatus: 'processing', labelAr: 'تم إنشاء الطلب في بوسطة', labelEn: 'Pickup requested' },
    11: { code: 11, bostaStatus: 'Waiting for route', orderStatus: 'processing', labelAr: 'بانتظار التعيين على مسار', labelEn: 'Waiting for route' },
    20: { code: 20, bostaStatus: 'Route Assigned', orderStatus: 'processing', labelAr: 'تم تعيين مندوب/مسار', labelEn: 'Route Assigned' },
    21: { code: 21, bostaStatus: 'Picked up from business', orderStatus: 'processing', labelAr: 'تم الاستلام من التاجر', labelEn: 'Picked up from business' },
    22: { code: 22, bostaStatus: 'Picking up from consignee', orderStatus: 'processing', labelAr: 'جاري الاستلام من العميل', labelEn: 'Picking up from consignee' },
    23: { code: 23, bostaStatus: 'Picked up from consignee', orderStatus: 'out_for_delivery', labelAr: 'تم الاستلام من العميل', labelEn: 'Picked up from consignee' },
    24: { code: 24, bostaStatus: 'Received at warehouse', orderStatus: 'processing', labelAr: 'تم الاستلام في مخزن بوسطة', labelEn: 'Received at warehouse' },
    25: { code: 25, bostaStatus: 'Fulfilled', orderStatus: 'processing', labelAr: 'تم التجهيز', labelEn: 'Fulfilled' },
    30: { code: 30, bostaStatus: 'In transit', orderStatus: 'out_for_delivery', labelAr: 'قيد النقل بين الفروع', labelEn: 'In transit' },
    40: { code: 40, bostaStatus: 'Picking up', orderStatus: 'out_for_delivery', labelAr: 'المندوب في طريقه للاستلام/التحصيل', labelEn: 'Picking up' },
    41: { code: 41, bostaStatus: 'Picked up', orderStatus: 'out_for_delivery', labelAr: 'خرج مع المندوب للتوصيل', labelEn: 'Out for delivery' },
    45: { code: 45, bostaStatus: 'Delivered', orderStatus: 'delivered', labelAr: 'تم التسليم للعميل', labelEn: 'Delivered' },
    46: { code: 46, bostaStatus: 'Returned to business', orderStatus: 'returned', labelAr: 'مرتجع إلى التاجر', labelEn: 'Returned to business' },
    47: { code: 47, bostaStatus: 'Exception', orderStatus: 'failed_to_deliver', labelAr: 'فشل مؤقت / تعذر التوصيل', labelEn: 'Delivery Exception' },
    48: { code: 48, bostaStatus: 'Terminated', orderStatus: 'canceled', labelAr: 'تم الإنهاء', labelEn: 'Terminated' },
    49: { code: 49, bostaStatus: 'Canceled', orderStatus: 'canceled', labelAr: 'ملغي', labelEn: 'Canceled' },
    100: { code: 100, bostaStatus: 'PendingPickup', orderStatus: 'pending', labelAr: 'في انتظار الاستلام', labelEn: 'Pending pickup' },
    101: { code: 101, bostaStatus: 'Lost', orderStatus: 'failed_to_deliver', labelAr: 'شحنة مفقودة', labelEn: 'Lost' },
    102: { code: 102, bostaStatus: 'Damaged', orderStatus: 'failed_to_deliver', labelAr: 'شحنة تالفة', labelEn: 'Damaged' },
    103: { code: 103, bostaStatus: 'Investigation', orderStatus: 'processing', labelAr: 'قيد التحقيق والمراجعة', labelEn: 'Investigation' },
    104: { code: 104, bostaStatus: 'Awaiting your action', orderStatus: 'failed_to_deliver', labelAr: 'بانتظار اتخاذ إجراء', labelEn: 'Awaiting action' },
    105: { code: 105, bostaStatus: 'Archived', orderStatus: 'canceled', labelAr: 'مؤرشف', labelEn: 'Archived' },
};

/**
 * Resolved labels and helpers for order status
 */
export const ORDER_STATUS_LABELS: Record<string, { ar: string; en: string }> = {
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    processing: { ar: 'قيد التجهيز', en: 'Processing' },
    shipped: { ar: 'تم الشحن', en: 'Shipped' },
    out_for_delivery: { ar: 'خرج مع المندوب للتوصيل', en: 'Out for Delivery' },
    delivered: { ar: 'تم التسليم بنجاح', en: 'Delivered' },
    returned: { ar: 'مرتجع', en: 'Returned' },
    failed_to_deliver: { ar: 'تعذر التوصيل', en: 'Delivery Failed' },
    canceled: { ar: 'ملغي', en: 'Canceled' },
    cancelled: { ar: 'ملغي', en: 'Canceled' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
};

export const getOrderStatusLabel = (status: string, isRtl: boolean = false): string => {
    const key = (status || '').toLowerCase().trim();
    const found = ORDER_STATUS_LABELS[key];
    if (found) {
        return isRtl ? found.ar : found.en;
    }
    return status;
};

export const getBostaStateInfo = (code: number | string) => {
    const numericCode = Number(code);
    return BOSTA_STATES_MAP[numericCode] || null;
};
