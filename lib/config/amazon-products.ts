// Amazon Affiliate Product Configuration
// Replace 'YOUR_AFFILIATE_TAG' with your actual Amazon Associates tag
export const AMAZON_AFFILIATE_TAG = 'qualitysite05-21'; // e.g., '10xt-20'

export interface AmazonProduct {
  id: string;
  title?: string; // Optional fallback
  description?: string; // New field for product details
  asin: string; // Amazon ASIN
  imageUrl?: string; // Manual image URL (REQUIRED if API is not active)
  price?: string; // Optional fallback
  rating?: number; // Optional fallback
  category: 'productivity' | 'tech' | 'office' | 'books' | 'electronics' | 'sports'; // Expanded categories
  affiliateLink?: string; // Optional direct affiliate link
}

/**
 * Generate dynamic Amazon product image based on ASIN.
 * This uses the robust Amazon Ad System endpoint to avoid 404s.
 * Used as a fallback if API fails.
 */
export function getAmazonProductImage(asin: string, size: 'SL300' | 'SL500' | 'SL800' = 'SL500'): string {
  // Note: This dynamic generation might be blocked by Amazon without API keys.
  // Use manual 'imageUrl' in the product object for reliability.
  return `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_${size}_&ID=AsinImage&MarketPlace=GB`;
}

/**
 * Generate Amazon affiliate URL
 */
export function getAmazonAffiliateUrl(asin: string, tag: string = AMAZON_AFFILIATE_TAG, affiliateLink?: string): string {
  // Use direct affiliate link if available (most reliable)
  if (affiliateLink) {
    return affiliateLink;
  }
  // Fallback to generating link from ASIN
  return `https://www.amazon.co.uk/dp/${asin}?tag=${tag}&linkCode=ogi&th=1&psc=1`;
}

/**
 * Get products that haven't been shown recently
 */
export function getRotatedProducts(products: AmazonProduct[], viewedProductIds: string[], count: number = 3): AmazonProduct[] {
  // Logic: Always prioritize real products.
  // If we run out of "new" real products, loop back to the start of real products.

  const realProducts = products.filter((p) => !p.id.startsWith('placeholder-'));
  // If no real products exist (unlikely), fall back to placeholders
  if (realProducts.length === 0) return products.slice(0, count);

  // 1. Get real products that haven't been viewed
  const newRealProducts = realProducts.filter((p) => !viewedProductIds.includes(p.id));

  let selectedResults = [...newRealProducts];

  // 2. If we need more, shuffle the ALREADY VIEWED real products and append them
  if (selectedResults.length < count) {
    const alreadyViewed = realProducts.filter((p) => viewedProductIds.includes(p.id));
    const shuffledViewed = [...alreadyViewed].sort(() => Math.random() - 0.5);
    selectedResults = [...selectedResults, ...shuffledViewed];
  }

  // 3. Shuffle the result to mix new and old
  selectedResults = selectedResults.sort(() => Math.random() - 0.5);

  return selectedResults.slice(0, count);
}

// Product catalog
// IMPORTANT: Since you don't have API keys yet, you MUST paste the "imageUrl" manually for each item.
export const AMAZON_PRODUCTS: AmazonProduct[] = [
  {
    id: 'plastic-shelving-unit',
    title: '4/5 Tier Black Plastic Shelving Unit Storage',
    description:
      'Organised Garage/Home/Pantry Racking Shelf Shelves Workbench Workman Bays Racking Tools Paint Stationary Parts (5 Tier) by E-Bargains',
    asin: 'B01AS7DS8U',
    category: 'tech',
    affiliateLink: 'https://amzn.to/4q6Wx2k',
    imageUrl: 'https://m.media-amazon.com/images/I/619VXOfZ-+L._AC_SX679_.jpg',
  },
  {
    id: 'indigo-a4-printer-paper',
    title: 'Indigo® A4 Premium White Printer & Copier Paper',
    description: '75 GSM – 1 Box (5 Reams, 2500 Sheets) – Multipurpose Office Paper for Laser, Inkjet, and Copy Machines',
    asin: 'B08HJNBHWH',
    category: 'office',
    affiliateLink: 'https://amzn.to/48X96HG',
    imageUrl: 'https://m.media-amazon.com/images/I/61SrrHm7p8L._AC_SX679_.jpg',
  },
  {
    id: 'apple-mac-mini-m4',
    title: 'Apple Mac mini Desktop Computer with M4 chip',
    description:
      'with 10 core CPU and 10 core GPU: Built for Apple Intelligence, 16GB Unified Memory, 256GB SSD Storage, Gigabit Ethernet. Works with iPhone/iPad',
    asin: 'B0DLBSGKWV',
    category: 'tech',
    affiliateLink: 'https://amzn.to/4qv9hzL',
    imageUrl: 'https://m.media-amazon.com/images/I/6100l6RylqL._AC_SX679_.jpg',
  },
  {
    id: 'soulwit-cable-clips',
    title: 'SOULWIT Cable Holder Clips, 3-Pack Cable Management Cord Organiser',
    description: 'Clips Adhesive Organizer for USB Charging Cable Mouse Wire PC Office Home',
    asin: 'B08FKMMBVY',
    category: 'office',
    affiliateLink: 'https://amzn.to/4jd0FLD',
    imageUrl: 'https://m.media-amazon.com/images/I/61ny-K6-AAL._AC_SX679_.jpg',
  },
  {
    id: 'colamy-executive-office-chair',
    title: 'COLAMY Executive Office Chair for home',
    description: 'Ergonomic High Back Desk Chair with Footrest, PU Leather Computer Chair with Removable Lumbar Pillow(Black)',
    asin: 'B0FF4WPJF6',
    category: 'office',
    affiliateLink: 'https://amzn.to/48TnGzS',
    imageUrl: 'https://m.media-amazon.com/images/I/71EDjUSUCgL._AC_SX679_.jpg',
  },
  {
    id: 'oyrreu-rolling-printer-stand',
    title: 'OYRREU 3-Tier Rolling Printer Stand with Outlets',
    description:
      'Mobile 3-tier printer stand with charging station and adjustable storage shelves, suitable for printers and office equipment.',
    asin: 'B0F82F5S8C',
    category: 'office',
    affiliateLink: 'https://amzn.to/4jlsotU',
    imageUrl: 'https://m.media-amazon.com/images/I/61wb0VrxdrL._AC_SX679_.jpg',
  },
  {
    id: 'anygod-executive-office-chair',
    title: 'AnyGod Executive Office Chair, Ergonomic Leather Desk Chair with Lumbar Support for Back Pain',
    description: 'Heavy Duty Swivel Computer Seating with Flip-Up Armrests & Adjustable Height for Home & Study',
    asin: 'B0FF4CR3DC',
    category: 'office',
    affiliateLink: 'https://amzn.to/49hbR5x',
    imageUrl: 'https://m.media-amazon.com/images/I/71+kVfOxTpL._AC_SX679_.jpg',
  },
  {
    id: 'a4-sign-holder-stand',
    title: 'A4 Sign Holder Stand 3Pack',
    description: 'Heavy Duty Floor Standing Poster Display Stand with Snap Frame for Menu Holder, Outdoor Signage, Welcome Sign - Black',
    asin: 'B0F5HH8QNB',
    category: 'office',
    affiliateLink: 'https://amzn.to/3MTCFBg',
    imageUrl: 'https://m.media-amazon.com/images/I/71r9ac6WdgL._AC_SX679_.jpg',
  },
  {
    id: 'bonsaii-auto-feed-shredder',
    title: 'Bonsaii 110-Sheet Auto Feed Office Paper Shredder',
    description:
      '30 Mins Continuous Micro Cut Heavy Duty Paper Shredder, Manual 12-Sheet Home Office Credit Card Shredder with 4 Wheels, 23L Bin (C233-B upgrade)',
    asin: 'B0CSFWYZJL',
    category: 'office',
    affiliateLink: 'https://amzn.to/48VEdTR',
    imageUrl: 'https://m.media-amazon.com/images/I/61VnKSpJjpL._AC_SY879_.jpg',
  },
  {
    id: 'vizpro-magnetic-whiteboard',
    title: 'VIZ-PRO Magnetic Drywipe Whiteboard 90 x 60 cm',
    description: 'Dry Erase White Board with Black Aluminium Frame and Pen Tray',
    asin: 'B086WV92KL',
    category: 'office',
    affiliateLink: 'https://amzn.to/4sa4s0l',
    imageUrl: 'https://m.media-amazon.com/images/I/51Avbz7ty+L._AC_SX679_.jpg',
  },
  {
    id: 'fenge-dual-monitor-stand',
    title: 'Fenge Dual Monitor Stand for Desk',
    description:
      '108cm Large Monitor Riser for 2 Monitors 2 Tiers Desk Organizer for Computer PC Laptop Printer TV Screen Max Load 45KG (Brown)',
    asin: 'B0D9LKYWNV',
    category: 'tech',
    affiliateLink: 'https://amzn.to/48X4lxQ',
    imageUrl: 'https://m.media-amazon.com/images/I/71pQQKRg4FL._AC_SX679_.jpg',
  },
  {
    id: 'desktop-power-socket-usbc',
    title: 'Desk Power Socket with 65W USB C',
    description:
      'Haiaoyyds Aluminium Alloy Desktop Power Strip with 3 UK Plugs, 3 USB Ports, Overload Switch, and 1.8M Cable, Power Socket Surge Protection for Office Home, White',
    asin: 'B0DBZ5D9FQ',
    category: 'tech',
    affiliateLink: 'https://amzn.to/4p9lysJ',
    imageUrl: 'https://m.media-amazon.com/images/I/51PyWgb+yhL._AC_SX679_.jpg',
  },
  {
    id: 'hp-laserjet-mfp-m235sdw',
    title: 'HP LaserJet MFP M235sdw',
    description:
      'Compact | Black and White | Print, Scan, Copy | Easy Setup and Reliable Wi-Fi | Up to 28/27 Simplex ppm | Best Home Office Laser Printer, Best Laser Printer for Office',
    asin: 'B0C7JZ9YQF',
    category: 'office',
    affiliateLink: 'https://amzn.to/49gs2zX',
    imageUrl: 'https://m.media-amazon.com/images/I/61y1sOFbQ4L._AC_SX679_.jpg',
  },
  {
    id: 'apple-macbook-air-13-m4-2025',
    title: 'Apple 2025 MacBook Air 13-inch Laptop with M4 chip',
    description:
      'Built for Apple Intelligence, 13.6-inch Liquid Retina Display, 16GB Unified Memory, 256GB SSD Storage, 12MP Center Stage Camera, Touch ID; Midnight',
    asin: '', // add ASIN if required
    category: 'tech',
    affiliateLink: 'https://amzn.to/4qyGJFL',
    imageUrl: 'https://m.media-amazon.com/images/I/71sQdN4lfYL._AC_SX679_.jpg',
  },
  {
    id: '65-inch-4k-smart-board-touchscreen',
    title: '65" Smart Board, 4K UHD Touchscreen Whiteboard Display',
    description: 'All-in-One for Classroom Office Home Business w/Open App Ecosystem (Board & Wall Mount Only)',
    asin: '', // add ASIN if required
    category: 'office',
    affiliateLink: 'https://amzn.to/4aAzRCT',
    imageUrl: 'https://m.media-amazon.com/images/I/71j9nhgkJ3L._AC_SX679_.jpg',
  },
  {
    id: 'apple-iphone-17-256gb-black',
    title: 'Apple iPhone 17 256 GB',
    description:
      '6.3-inch Display with ProMotion, A19 Chip, Center Stage Front Camera for Smarter Group Selfies, Improved Scratch Resistance, All-Day Battery Life; Black',
    asin: '', // add ASIN if required
    category: 'tech',
    affiliateLink: 'https://amzn.to/3NijroY',
    imageUrl: 'https://m.media-amazon.com/images/I/61X5FknDWuL._AC_SX679_.jpg',
  },
  {
    id: 'tamperproof-lockable-felt-noticeboard',
    title: 'Tamperproof Lockable Felt Noticeboard',
    description: '900 x 600 mm | Red | with Double Locks & Keys | Ideal for Office, School Displays, venues, Family centres',
    asin: '', // add ASIN if required
    category: 'office',
    affiliateLink: 'https://amzn.to/3YaHJnl',
    imageUrl: 'https://m.media-amazon.com/images/I/6102A9hzDdL._AC_SX679_.jpg',
  },
  {
    id: 'smart-coffee-mug-warmer',
    title: 'Smart Coffee Mug Warmer',
    description:
      'Electric Cup Warmer With Aluminum Metal Panel for Office, Desk Accessories, Beverage Warmer for Cocoa, Milk, Gifts for Friends',
    asin: '', // add ASIN if required
    category: 'office',
    affiliateLink: 'https://amzn.to/3YNgdMI',
    imageUrl: 'https://m.media-amazon.com/images/I/617peXBjnML._AC_SX679_.jpg',
  },
  {
    id: 'ergear-electric-standing-desk-120x60',
    title: 'ErGear Electric Standing Desk Height Adjustable 120 x 60cm',
    description: 'Sit Stand Desk with 4 Memory Smart Pannel, Home Office Desk with Splice Board',
    asin: '', // add ASIN if required
    category: 'office',
    affiliateLink: 'https://amzn.to/49qcAT7',
    imageUrl: 'https://m.media-amazon.com/images/I/615nQaS3rvL._AC_SX679_.jpg',
  },
  {
    id: 'large-conference-table-137-inch',
    title: '137.8" Large Conference Table',
    description:
      '8-20 Person Meeting Desk Office Desk, Long Rectangular Desk with Cable Management, Modern Boardroom Table for Office for Meeting Room',
    asin: '', // add ASIN if required
    category: 'office',
    affiliateLink: 'https://amzn.to/4pTtRtz',
    imageUrl: 'https://m.media-amazon.com/images/I/615nQaS3rvL._AC_SX679_.jpg',
  },
];
