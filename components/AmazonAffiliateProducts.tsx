'use client';

import { ExternalLink, Star } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { AMAZON_PRODUCTS, AmazonProduct, getAmazonAffiliateUrl, getAmazonProductImage, getRotatedProducts } from '../lib/config/amazon-products';
import { fetchAmazonProductsAction } from '../app/features/amazon/actions';
import { PaapiProduct } from '../lib/amazon-paapi';

interface AmazonAffiliateProductsProps {
  title?: string;
  maxProducts?: number;
  variant?: 'grid' | 'sidebar' | 'carousel';
  className?: string;
}

const STORAGE_KEY = 'amazon_affiliate_viewed_products';
const MAX_VIEWED_HISTORY = 20; // Keep track of last 20 viewed products

export const AmazonAffiliateProducts = ({
  title = 'Recommended Products',
  maxProducts = 3,
  variant = 'grid',
  className = '',
}: AmazonAffiliateProductsProps) => {
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      // 1. Get rotated base products (for ASINs)
      const viewedProductsJson = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      const viewedProducts: string[] = viewedProductsJson ? JSON.parse(viewedProductsJson) : [];

      const rotatedBase = getRotatedProducts(AMAZON_PRODUCTS, viewedProducts, maxProducts);

      // Separate real ASINs (exclude placeholders)
      const realAsins = rotatedBase.filter((p) => !p.id.startsWith('placeholder-')).map((p) => p.asin);

      // 2. Fetch live data for real ASINs
      let liveDataMap: Record<string, PaapiProduct> = {};
      if (realAsins.length > 0) {
        try {
          const liveData = await fetchAmazonProductsAction(realAsins);
          if (liveData) {
            liveData.forEach((p: PaapiProduct) => {
              liveDataMap[p.asin] = p;
            });
          }
        } catch (err) {
        }
      }

      // 3. Merge live data with base config
      if (mounted) {
        const mergedProducts = rotatedBase.map((p) => {
          const live = liveDataMap[p.asin];
          if (live) {
            return {
              ...p,
              title: live.title,
              imageUrl: live.imageUrl,
              price: live.price,
              affiliateLink: live.url, // Use PAAPI link which includes tag
            };
          }
          // Fallback for placeholders or failed detailed fetch
          return {
            ...p,
            // Ensure valid image for placeholders if possible
            imageUrl: p.imageUrl || getAmazonProductImage(p.asin),
          };
        });

        setProducts(mergedProducts);
        setLoading(false);

        // Update viewed products
        if (mergedProducts.length > 0 && typeof window !== 'undefined') {
          const newViewed = [...viewedProducts, ...mergedProducts.map((p) => p.id)].slice(-MAX_VIEWED_HISTORY);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newViewed));
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [maxProducts]);

  if (loading) {
    return <div className={`flex items-center justify-center p-8 ${className}`}>Loading products...</div>;
  }

  // Don't render if no products
  if (products.length === 0) {
    return null;
  }

  const handleProductClick = (productId: string) => {
    // Track product click
    if (typeof window !== 'undefined') {
      const clickedProductsJson = localStorage.getItem('amazon_affiliate_clicked_products');
      const clickedProducts: string[] = clickedProductsJson ? JSON.parse(clickedProductsJson) : [];
      if (!clickedProducts.includes(productId)) {
        clickedProducts.push(productId);
        localStorage.setItem('amazon_affiliate_clicked_products', JSON.stringify(clickedProducts));
      }
    }
  };

  const CardWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={`rounded-xl border bg-white text-gray-950 shadow-sm ${className || ''}`}>
      {children}
    </div>
  );

  if (variant === 'sidebar') {
    return (
      <div className={className}>
        <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
        <div className="space-y-4">
          {products.map((product) => (
            <a
              key={product.id}
              href={getAmazonAffiliateUrl(product.asin, undefined, product.affiliateLink)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => handleProductClick(product.id)}
              className="block"
            >
              <CardWrapper className="overflow-hidden border border-gray-200 transition-shadow hover:shadow-md">
                <div className="p-3">
                  <div className="flex gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded bg-gray-50">
                      {product.imageUrl && <img
                        src={product.imageUrl}
                        alt={product.title || 'Product'}
                        className="object-cover w-full h-full"
                      />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-2 text-xs font-medium text-gray-900">{product.title}</h4>
                      {product.price && <p className="mt-1 text-sm font-semibold text-indigo-600">{product.price}</p>}
                      {product.rating && (
                        <div className="mt-1 flex items-center gap-1">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">{product.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardWrapper>
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'carousel') {
    return (
      <div className={className}>
        {title && <h2 className="mb-6 text-center text-xl font-bold text-gray-800 md:text-2xl">{title}</h2>}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory">
            {products.map((product) => (
              <a
                key={product.id}
                href={getAmazonAffiliateUrl(product.asin, undefined, product.affiliateLink)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => handleProductClick(product.id)}
                className="block shrink-0 transition-transform hover:scale-105 snap-center"
              >
                <CardWrapper className="w-72 border-2 border-gray-200 bg-white shadow-sm transition-all hover:border-indigo-400 hover:shadow-lg h-full flex flex-col">
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
                      {product.imageUrl && <img
                        src={product.imageUrl}
                        alt={product.title || 'Product'}
                        className="object-contain w-full h-full mix-blend-multiply"
                      />}
                    </div>
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-gray-800 leading-tight">{product.title}</h3>
                    <div className="mt-auto pt-3">
                        {product.price && <p className="text-lg font-bold text-indigo-600">{product.price}</p>}
                        {product.rating && (
                        <div className="mt-1 flex items-center gap-1">
                            <Star className="size-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                        </div>
                        )}
                        <div className="mt-3 flex items-center justify-center gap-2 rounded-md bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100">
                        <span>Shop on Amazon</span>
                        <ExternalLink className="size-4" />
                        </div>
                    </div>
                  </div>
                </CardWrapper>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default grid variant
  return (
    <div className={className}>
      {title && <h2 className="mb-6 text-center text-xl font-bold text-gray-800 md:text-2xl">{title}</h2>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <a
            key={product.id}
            href={getAmazonAffiliateUrl(product.asin, undefined, product.affiliateLink)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => handleProductClick(product.id)}
            className="block h-full"
          >
            <CardWrapper className="h-full flex flex-col border border-gray-200 transition-all hover:shadow-md">
              <div className="p-6 flex-1 flex flex-col">
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
                  {product.imageUrl && <img
                    src={product.imageUrl}
                    alt={product.title || 'Product'}
                    className="object-contain w-full h-full mix-blend-multiply"
                  />}
                </div>
                <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 leading-tight">{product.title}</h3>
                {product.description && <p className="mb-3 line-clamp-2 text-xs text-gray-500">{product.description}</p>}
                
                <div className="mt-auto">
                    {product.price && <p className="mb-2 text-lg font-bold text-indigo-600">{product.price}</p>}
                    {product.rating && (
                    <div className="mb-3 flex items-center gap-1">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">{product.rating} rating</span>
                    </div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                    <span>View on Amazon</span>
                    <ExternalLink className="size-4" />
                    </div>
                </div>
              </div>
            </CardWrapper>
          </a>
        ))}
      </div>
    </div>
  );
};
