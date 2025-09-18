export interface ProductConfig {
  tripwirePrice: number;
  tripwireCredits: number;
  bumpEnabled: boolean;
  bumpPrice: number;
  hostName: string;
  eventId: string;
}

export interface StripeProduct {
  productId: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  type: 'tripwire' | 'bump' | 'upsell';
}

export async function createStripeProducts(config: ProductConfig): Promise<StripeProduct[]> {
  const products: StripeProduct[] = [];
  
  // Main tripwire product
  const tripwireProduct = await createTripwireProduct(config);
  products.push(tripwireProduct);
  
  // Bump offer if enabled
  if (config.bumpEnabled) {
    const bumpProduct = await createBumpProduct(config);
    products.push(bumpProduct);
  }
  
  return products;
}

async function createTripwireProduct(config: ProductConfig): Promise<StripeProduct> {
  // In real implementation, this would call Stripe API:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // const product = await stripe.products.create({...});
  // const price = await stripe.prices.create({...});
  
  const productId = `prod_tripwire_${config.eventId}`;
  const priceId = `price_tripwire_${config.eventId}`;
  
  console.log(`Created Stripe tripwire product: ${productId}`);
  
  return {
    productId,
    priceId,
    name: `${config.hostName} - Lead Recon Mastery`,
    description: `Get ${config.tripwireCredits} lead analysis credits and access to AI-powered lead intelligence tools. Perfect for businesses looking to transform their lead generation with cutting-edge automation.`,
    price: config.tripwirePrice,
    type: 'tripwire',
  };
}

async function createBumpProduct(config: ProductConfig): Promise<StripeProduct> {
  const productId = `prod_bump_${config.eventId}`;
  const priceId = `price_bump_${config.eventId}`;
  
  console.log(`Created Stripe bump product: ${productId}`);
  
  return {
    productId,
    priceId,
    name: `${config.hostName} - Premium Lead Intelligence`,
    description: `Monthly subscription for unlimited lead analysis, advanced segmentation, and priority support. Includes automated outreach sequences and CRM integrations.`,
    price: config.bumpPrice,
    type: 'bump',
  };
}

export interface PaymentLink {
  url: string;
  productId: string;
  priceId: string;
}

export async function createPaymentLinks(products: StripeProduct[]): Promise<PaymentLink[]> {
  const links: PaymentLink[] = [];
  
  for (const product of products) {
    // In real implementation:
    // const paymentLink = await stripe.paymentLinks.create({
    //   line_items: [{ price: product.priceId, quantity: 1 }],
    //   success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.BASE_URL}/cancel`,
    // });
    
    const mockUrl = `https://buy.stripe.com/test_${product.priceId}`;
    
    links.push({
      url: mockUrl,
      productId: product.productId,
      priceId: product.priceId,
    });
  }
  
  return links;
}

export interface WebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      customer: string;
      amount_total: number;
      payment_status: string;
      metadata: Record<string, string>;
    };
  };
}

export function handleStripeWebhook(event: WebhookEvent) {
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Payment completed:', event.data.object);
      // Handle successful payment
      // - Send welcome email
      // - Provision access
      // - Update CRM
      // - Trigger fulfillment
      break;
      
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object);
      // Handle failed payment
      // - Send recovery email
      // - Log for analysis
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

export function calculateRevenueProjection(
  products: StripeProduct[],
  expectedTraffic: number,
  conversionRate: number = 0.15
): {
  projectedSales: number;
  projectedRevenue: number;
  breakdown: Array<{
    product: string;
    sales: number;
    revenue: number;
  }>;
} {
  const projectedSales = Math.floor(expectedTraffic * conversionRate);
  
  // Assume 80% take main offer, 30% of those take bump
  const mainOfferSales = Math.floor(projectedSales * 0.8);
  const bumpSales = products.length > 1 ? Math.floor(mainOfferSales * 0.3) : 0;
  
  const breakdown = [
    {
      product: products[0].name,
      sales: mainOfferSales,
      revenue: mainOfferSales * products[0].price,
    },
  ];
  
  if (bumpSales > 0 && products[1]) {
    breakdown.push({
      product: products[1].name,
      sales: bumpSales,
      revenue: bumpSales * products[1].price,
    });
  }
  
  const projectedRevenue = breakdown.reduce((sum, item) => sum + item.revenue, 0);
  
  return {
    projectedSales: mainOfferSales + bumpSales,
    projectedRevenue,
    breakdown,
  };
}
