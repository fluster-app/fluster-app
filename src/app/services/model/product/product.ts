export class ProductValidity {
    from: Date;
    end: Date;
}

export class ProductDuration {
    duration: number;
    type: string;
}

export class ProductPricePrice {
    monthly: number;
}

export class ProductPriceFree {
    enabled: boolean;
    hashtag: string;
    needAcknowledgement: boolean;
}

export class ProductPrice {
    price: ProductPricePrice;
    free: ProductPriceFree;
}

export class Product {
    _id: string;

    validity: ProductValidity;
    duration: ProductDuration;
    price: ProductPrice;

    browse: boolean;

    createdAt: Date;
    updatedAt: Date;
}
