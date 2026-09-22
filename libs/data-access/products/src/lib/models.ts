export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  availabilityStatus?: string;
  thumbnail: string;
  images: string[];
  [key: string]: unknown;
}

/** An entry from DummyJSON's `/products/categories` endpoint. */
export interface ProductCategory {
  slug: string;
  name: string;
  url: string;
}
