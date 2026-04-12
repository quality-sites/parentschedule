'use server';

import { PaapiProduct, getAmazonProducts } from '@/lib/amazon-paapi';

export const fetchAmazonProductsAction = async (asins: string[]): Promise<PaapiProduct[]> => {
  if (!asins || asins.length === 0) {
    return [];
  }

  try {
    const products = await getAmazonProducts(asins);
    return products;
  } catch (error) {
    return [];
  }
};
