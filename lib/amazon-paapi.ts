import aws4 from 'aws4';

interface PaapiConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  marketplace: string;
  region: string;
}

const config: PaapiConfig = {
  accessKey: process.env.AMAZON_ACCESS_KEY || '',
  secretKey: process.env.AMAZON_SECRET_KEY || '',
  partnerTag: process.env.AMAZON_PARTNER_TAG || 'qualitysite05-21',
  marketplace: 'webservices.amazon.co.uk', // UK Endpoint for PAAPI 5.0
  region: 'eu-west-1', // UK Region
};

export interface PaapiProduct {
  asin: string;
  title: string;
  imageUrl: string;
  price: string;
  url: string;
}

export const getAmazonProducts = async (itemIds: string[]): Promise<PaapiProduct[]> => {
  if (!config.accessKey || !config.secretKey) {
    return [];
  }

  // Maximum 10 items per request for GetItems
  const chunks = [];
  for (let i = 0; i < itemIds.length; i += 10) {
    chunks.push(itemIds.slice(i, i + 10));
  }

  const allProducts: PaapiProduct[] = [];

  for (const chunk of chunks) {
    try {
      const payload = {
        ItemIds: chunk,
        ItemIdType: 'ASIN',
        Resources: ['ItemInfo.Title', 'Images.Primary.Large', 'Offers.Listings.Price', 'DetailPageURL'],
        PartnerTag: config.partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.co.uk', // Must match the target marketplace
      };

      const opts = {
        host: config.marketplace,
        path: '/paapi5/getitems',
        service: 'ProductAdvertisingAPI',
        region: config.region,
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'content-encoding': 'amz-1.0',
          'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
        },
      };

      // Sign the request
      aws4.sign(opts, { accessKeyId: config.accessKey, secretAccessKey: config.secretKey });

      const response = await fetch(`https://${opts.host}${opts.path}`, {
        method: opts.method,
        headers: opts.headers as HeadersInit,
        body: opts.body,
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        continue;
      }

      const data = await response.json();

      if (data.ItemsResult && data.ItemsResult.Items) {
        const items = data.ItemsResult.Items.map((item: any) => ({
          asin: item.ASIN,
          title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Title',
          imageUrl: item.Images?.Primary?.Large?.URL || '/icon.svg',
          price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Check Price',
          url: item.DetailPageURL,
        }));
        allProducts.push(...items);
      }
    } catch (error) {
    }
  }

  return allProducts;
};
