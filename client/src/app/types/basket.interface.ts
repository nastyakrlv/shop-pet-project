import { IProduct } from "./product.interface"

export interface IBasket {
    id: number,
    userId: number,
    basket_products: IBasketProducts[]
}

export interface IBasketProducts {
    id: number,
    size: string,
    color: string,
    basketId: number,
    productId: number,
    product: IProduct
}


export interface IAddProductRequest {
    productId: number;
    size: string;
    color: string;
}

export interface IAddProductResponse extends IAddProductRequest {
    id: number;
    basketId: number;
}