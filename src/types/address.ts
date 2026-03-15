export interface AddressList {
    _id: string;
    name: string;
    ar_name?: string;
    country?: string; // For cities
    countryId?: string; // For zones
    cityId?: string; // For zones
}

export interface AddressListsResponse {
    countries: AddressList[];
    cities: AddressList[];
    zones: AddressList[];
}

export interface Address {
    _id: string;
    country: any; // ID or object
    city: any; // ID or object
    zone: any; // ID or object
    street: string;
    buildingNumber: string;
    floorNumber?: string;
    apartmentNumber?: string;
    uniqueIdentifier?: string;
    user: string;
    createdAt: string;
    updatedAt: string;
}

export interface AddressRequest {
    country: string;
    city: string;
    zone: string;
    street: string;
    buildingNumber: string;
    floorNumber?: string;
    apartmentNumber?: string;
    uniqueIdentifier?: string;
}
