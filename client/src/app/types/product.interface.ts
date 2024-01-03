export interface IProduct {
    id: number,
    name: string,
    price: number,
    img: string,
    info?: IInfo[]
}

export interface IProductResponse {
    count: number,
    rows: IProduct[]
}

export interface IInfo {
    id: number,
    title: string,
    description: string | string[] | number[]
}

export interface IProductInBasket extends IProduct {
    size: string,
    color: string
}