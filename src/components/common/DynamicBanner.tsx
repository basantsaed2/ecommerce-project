import React from 'react';
import { useGet } from '@/hooks/useGet';
import { ApiResponse, Banner } from '@/types/api';

interface DynamicBannerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    pageName: string;
    fallbackImage: string;
    imageIndex?: number;
}

export default function DynamicBanner({ pageName, fallbackImage, imageIndex = 0, ...rest }: DynamicBannerProps) {
    const { data: bannersData } = useGet<ApiResponse<Banner>>(['banners'], '/banner');
    
    let imageUrl = fallbackImage;
    if (bannersData?.data?.data) {
        const bannerObj = bannersData.data.data.find(b => b.name.includes(pageName));
        if (bannerObj && bannerObj.images.length > imageIndex) {
            imageUrl = bannerObj.images[imageIndex];
        } else if (bannerObj && bannerObj.images.length > 0) {
            imageUrl = bannerObj.images[0];
        }
    }
    
    return (
        <img src={imageUrl} {...rest} />
    );
}
