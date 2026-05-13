import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { logger } from '../config/logger.js';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Address } from '../models/Address.js';
import { Cart } from '../models/Cart.js';
import { Wishlist } from '../models/Wishlist.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';
import { Review } from '../models/Review.js';
import { Otp } from '../models/Otp.js';
import { VendorApplication } from '../models/VendorApplication.js';
import {
  ROLES,
  VENDOR_STATUS,
  VENDOR_TIER,
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  REVIEW_STATUS,
} from '../constants/index.js';
import { uniqueSlug } from '../utils/slug.js';

/** Matches `SHIPPING_PER_VENDOR` in order.service.js */
const SHIPPING_PER_VENDOR = 39;

const USER_PASSWORD = 'User@1234';
const VENDOR_PASSWORD = 'Vendor@1234';
const ADMIN_PASSWORD = 'Admin@1234';

const shippingAddressSeed = () => ({
  fullName: 'Demo Customer',
  phone: '+91 98765 43210',
  line1: '42 Lake View Apartments',
  line2: 'Near City Mall',
  city: 'Mumbai',
  state: 'MH',
  postalCode: '400001',
  country: 'India',
});

/** @template T */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DEMO_REVIEW_SNIPPETS = [
  'Quick delivery and solid packaging.',
  'Matches the description — would buy again.',
  'Great value for the price.',
  'Quality exceeded my expectations.',
  'Happy with this purchase from the marketplace.',
  'Works well; no issues so far.',
  'Would recommend to friends.',
];

function buildGroup(vendor, itemsFromDb) {
  const groupItems = itemsFromDb.map(({ productDoc, qty }) => ({
    product: productDoc._id,
    title: productDoc.title,
    image: productDoc.images?.[0]?.url,
    sku: productDoc.sku,
    variantId: null,
    price: productDoc.price,
    quantity: qty,
    subtotal: productDoc.price * qty,
  }));
  const subtotal = groupItems.reduce((s, x) => s + x.subtotal, 0);
  const shippingFee = SHIPPING_PER_VENDOR;
  const commission = Math.round((subtotal * vendor.commissionRate) / 100);
  const total = subtotal + shippingFee;
  const payout = subtotal - commission;
  return {
    vendor: vendor._id,
    items: groupItems,
    subtotal,
    shippingFee,
    discount: 0,
    commission,
    payout,
    total,
    status: ORDER_STATUS.PENDING,
    statusHistory: [{ status: ORDER_STATUS.PENDING, at: new Date() }],
  };
}

async function flushCollections() {
  logger.info('Wiping seeded collections…');
  await Promise.all([
    User.deleteMany({}),
    Vendor.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Address.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
    Review.deleteMany({}),
    Otp.deleteMany({}),
    VendorApplication.deleteMany({}),
  ]);
}

const run = async () => {
  await connectDb();
  await flushCollections();

  await User.create({
    name: 'Platform Admin',
    email: 'admin@partnercart.io',
    password: ADMIN_PASSWORD,
    role: ROLES.ADMIN,
    isEmailVerified: true,
  });

  const customers = [];
  const primaryCustomer = await User.create({
    name: 'Aarav Sharma',
    email: 'customer@partnercart.io',
    password: USER_PASSWORD,
    role: ROLES.CUSTOMER,
    isEmailVerified: true,
    location: { city: 'Mumbai', state: 'MH', country: 'India' },
  });
  customers.push(primaryCustomer);

  for (let i = 2; i <= 40; i += 1) {
    const n = String(i).padStart(2, '0');
    const cust = await User.create({
      name: `Demo Customer ${n}`,
      email: `customer${n}@partnercart.io`,
      password: USER_PASSWORD,
      role: ROLES.CUSTOMER,
      isEmailVerified: true,
      location: {
        city: ['Pune', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata'][i % 6],
        state: ['MH', 'DL', 'KA', 'TN', 'TS', 'WB'][i % 6],
        country: 'India',
      },
    });
    customers.push(cust);
  }

  const vendorDefs = [
    {
      user: { name: 'Riya Patel', email: 'vendor@partnercart.io' },
      store: {
        storeName: 'Saffron Crafts',
        tagline: 'Handcrafted home & lifestyle goods',
        description:
          'A boutique studio in Jaipur creating premium home, kitchen, and lifestyle products with traditional Indian craftsmanship.',
        contactEmail: 'hello@saffroncrafts.in',
        contactPhone: '+91 90000 11111',
        address: { line1: '12, MI Road', city: 'Jaipur', state: 'RJ', postalCode: '302001', country: 'India' },
        tier: VENDOR_TIER.PREMIUM,
        commissionRate: 8,
        isFeatured: true,
      },
    },
    {
      user: { name: 'Karan Shah', email: 'vendor2@partnercart.io' },
      store: {
        storeName: 'Coastal Greens',
        tagline: 'Farm-fresh organic produce delivered daily',
        description:
          'Direct from farms in Konkan — organic vegetables, fruits and pantry staples across Mumbai and Pune.',
        contactEmail: 'orders@coastalgreens.in',
        contactPhone: '+91 90000 22222',
        address: { line1: 'Plot 7', city: 'Mumbai', state: 'MH', postalCode: '400076', country: 'India' },
        tier: VENDOR_TIER.VERIFIED,
        commissionRate: 6,
        isFeatured: false,
      },
    },
    {
      user: { name: 'Ananya Rao', email: 'vendor3@partnercart.io' },
      store: {
        storeName: 'Urban Threads',
        tagline: 'Premium everyday fashion',
        description: 'Minimal wardrobe essentials, sustainable fabrics and Indian silhouettes.',
        contactEmail: 'care@urbanthreads.in',
        address: { line1: 'Khan Market', city: 'New Delhi', state: 'DL', postalCode: '110003', country: 'India' },
        tier: VENDOR_TIER.BASIC,
        commissionRate: 10,
        isFeatured: true,
      },
    },
    {
      user: { name: 'Vikram Desai', email: 'vendor4@partnercart.io' },
      store: {
        storeName: 'TechNest Audio',
        tagline: 'Headphones, speakers & smart accessories',
        description: 'Curated electronics with warranty-friendly fulfilment.',
        contactEmail: 'support@technest.audio',
        address: { line1: 'Electronic City Phase 2', city: 'Bengaluru', state: 'KA', postalCode: '560100', country: 'India' },
        tier: VENDOR_TIER.PREMIUM,
        commissionRate: 7,
        isFeatured: false,
      },
    },
    {
      user: { name: 'Priya Menon', email: 'vendor5@partnercart.io' },
      store: {
        storeName: 'Bloom Ayurveda',
        tagline: 'Herbal oils, teas & body care',
        description: 'Small-batch wellness from Kerala — cold-pressed oils and Ayurvedic blends.',
        contactEmail: 'hello@bloomayurveda.com',
        address: { line1: 'FC Road', city: 'Pune', state: 'MH', postalCode: '411004', country: 'India' },
        tier: VENDOR_TIER.VERIFIED,
        commissionRate: 9,
        isFeatured: true,
      },
    },
    {
      user: { name: 'Rahul Srinivasan', email: 'vendor6@partnercart.io' },
      store: {
        storeName: 'Spice Route Pantry',
        tagline: 'Whole spices, masalas & regional staples',
        description: 'Sourced-from-farm pantry boxes and single-origin spice jars.',
        contactEmail: 'pantry@spiceroute.co',
        address: { line1: 'T Nagar', city: 'Chennai', state: 'TN', postalCode: '600017', country: 'India' },
        tier: VENDOR_TIER.BASIC,
        commissionRate: 10,
        isFeatured: false,
      },
    },
  ];

  const vendors = [];
  for (const def of vendorDefs) {
    const vendorUser = await User.create({
      name: def.user.name,
      email: def.user.email,
      password: VENDOR_PASSWORD,
      role: ROLES.VENDOR,
      isEmailVerified: true,
    });
    const vendor = await Vendor.create({
      user: vendorUser._id,
      storeName: def.store.storeName,
      slug: await uniqueSlug(Vendor, def.store.storeName),
      tagline: def.store.tagline,
      description: def.store.description,
      contactEmail: def.store.contactEmail,
      contactPhone: def.store.contactPhone,
      address: def.store.address,
      status: VENDOR_STATUS.VERIFIED,
      tier: def.store.tier,
      commissionRate: def.store.commissionRate,
      isFeatured: def.store.isFeatured ?? false,
    });
    vendorUser.vendor = vendor._id;
    await vendorUser.save();
    vendors.push(vendor);
  }

  const [v1, v2, v3, v4, v5, v6] = vendors;

  const cats = await Category.insertMany([
    { name: 'Home & Living', slug: 'home-living', icon: 'sofa', order: 1 },
    { name: 'Kitchen', slug: 'kitchen', icon: 'utensils', order: 2 },
    { name: 'Grocery', slug: 'grocery', icon: 'shopping-basket', order: 3 },
    { name: 'Fashion', slug: 'fashion', icon: 'shirt', order: 4 },
    { name: 'Wellness', slug: 'wellness', icon: 'leaf', order: 5 },
    { name: 'Electronics', slug: 'electronics', icon: 'cpu', order: 6 },
  ]);

  const bySlug = (slug) => cats.find((c) => c.slug === slug)._id;

  const productSeeds = [
    { v: v1, cat: 'kitchen', title: 'Hand-painted Ceramic Tea Set', description: '6-piece floral tea set by Jaipur artisans.', shortDescription: 'Dishwasher safe, 6-piece', tags: ['ceramic', 'tea'], price: 2199, compareAtPrice: 2799, stock: 24 },
    { v: v1, cat: 'home-living', title: 'Brass Diya Set of 4', description: 'Classic brass diyas for festivals.', tags: ['brass', 'pooja'], price: 899, stock: 80 },
    { v: v1, cat: 'home-living', title: 'Cotton Block-print Bedsheet', description: '100% cotton with two pillow covers.', tags: ['bedsheet', 'cotton'], price: 1599, compareAtPrice: 1999, stock: 12 },
    { v: v1, cat: 'home-living', title: 'Jute Floor Mat Natural', description: 'Handwoven jute mat, 120×180 cm.', tags: ['jute', 'rug'], price: 1299, stock: 40 },
    { v: v1, cat: 'kitchen', title: 'Copper Hammered Jug 1.5L', description: 'Ayurvedic copper water jug.', tags: ['copper', 'kitchen'], price: 1899, stock: 18 },

    { v: v2, cat: 'grocery', title: 'Organic Alphonso Mangoes (1 kg)', description: 'Ratnagiri Alphonso, naturally ripened.', tags: ['fruit', 'organic'], price: 549, stock: 60 },
    { v: v2, cat: 'grocery', title: 'Cold-pressed Coconut Oil 1L', description: 'Wood-pressed virgin oil.', tags: ['oil', 'organic'], price: 449, stock: 35 },
    { v: v2, cat: 'wellness', title: 'Himalayan Pink Salt 500g', description: 'Fine-grain mineral salt.', tags: ['salt'], price: 199, stock: 100 },
    { v: v2, cat: 'grocery', title: 'Multigrain Atta 5kg', description: 'Stone-ground multigrain flour.', tags: ['atta', 'staple'], price: 399, stock: 55 },
    { v: v2, cat: 'grocery', title: 'Basmati Rice aged 1 year 5kg', description: 'Long-grain basmati for biryani.', tags: ['rice'], price: 899, compareAtPrice: 999, stock: 42 },

    { v: v3, cat: 'fashion', title: 'Linen Overshirt Ivory', description: 'Breathable linen blend, relaxed fit.', tags: ['linen', 'shirt'], price: 2499, stock: 30 },
    { v: v3, cat: 'fashion', title: 'Handloom Cotton Saree', description: 'Handloom cotton with subtle zari border.', tags: ['saree', 'festive'], price: 3299, stock: 14 },
    { v: v3, cat: 'fashion', title: 'Leather Minimal Belt', description: 'Vegetable-tanned belt, matte black.', tags: ['belt', 'accessory'], price: 1199, stock: 65 },
    { v: v3, cat: 'fashion', title: 'Merino Wool Stole Grey', description: 'Light stole for offices and travel.', tags: ['wool', 'winter'], price: 1799, stock: 22 },

    { v: v4, cat: 'electronics', title: 'ANC Over-ear Headphones', description: '40h battery, USB-C charging.', tags: ['audio'], price: 7999, compareAtPrice: 9999, stock: 25 },
    { v: v4, cat: 'electronics', title: 'Portable Bluetooth Speaker', description: 'IPX7 waterproof stereo.', tags: ['speaker'], price: 3499, stock: 48 },
    { v: v4, cat: 'electronics', title: 'USB-C GaN Charger 65W', description: 'Dual-port fast charger.', tags: ['charger'], price: 2199, stock: 70 },
    { v: v4, cat: 'electronics', title: 'Mechanical Keyboard TKL', description: 'Hot-swap sockets, tactile switches.', tags: ['keyboard', 'gaming'], price: 6499, stock: 15 },

    { v: v5, cat: 'wellness', title: 'Brahmi Hair Oil 200ml', description: 'Cold-pressed Ayurvedic blend.', tags: ['hair', 'oil'], price: 449, stock: 90 },
    { v: v5, cat: 'wellness', title: 'Tulsi Green Tea Loose 250g', description: 'Single-origin Kerala tulsi.', tags: ['tea', 'organic'], price: 349, stock: 55 },
    { v: v5, cat: 'wellness', title: 'Kumkumadi Face Serum 30ml', description: 'Night serum with saffron.', tags: ['skincare'], price: 1299, stock: 38 },
    { v: v5, cat: 'home-living', title: 'Lavender Soy Candle Trio', description: '3×90g soy wax candles.', tags: ['candle', 'gift'], price: 999, stock: 44 },

    { v: v6, cat: 'grocery', title: 'Guntur Chili Powder 250g', description: 'Sun-dried, stone-ground chili.', tags: ['spice', 'masala'], price: 149, stock: 120 },
    { v: v6, cat: 'grocery', title: 'Idli Dosa Batter 1kg', description: 'Fermented batter, no preservatives.', tags: ['batter', 'fresh'], price: 99, stock: 200 },
    { v: v6, cat: 'grocery', title: 'Filter Coffee Powder 500g', description: 'Chicory blend, medium roast.', tags: ['coffee'], price: 399, stock: 75 },
    { v: v6, cat: 'kitchen', title: 'Clay Handi Set of 2', description: 'Unglazed cooking handis.', tags: ['clay', 'cookware'], price: 799, stock: 28 },

    { v: v1, cat: 'kitchen', title: 'Stoneware Pasta Bowls Set of 6', description: 'Microwave-safe reactive glaze stoneware bowls.', tags: ['dinnerware', 'serve'], price: 1899, stock: 36 },
    { v: v1, cat: 'home-living', title: 'Moroccan Pouf Ottoman Tan', description: 'Hand-stitched genuine leather pouf, unstuffed.', tags: ['furniture', 'boho'], price: 4599, stock: 15 },
    { v: v1, cat: 'home-living', title: 'Macrame Wall Hanging Ivory', description: 'Bohemian fibre art, 90 cm drop.', tags: ['decor', 'boho'], price: 2299, stock: 22 },
    { v: v1, cat: 'kitchen', title: 'Cast Iron Kadai 10 inch', description: 'Pre-seasoned, induction friendly.', tags: ['iron', 'cookware'], price: 1699, stock: 41 },

    { v: v2, cat: 'grocery', title: 'Raw Honey Wildflower 500g', description: 'Unprocessed, strained once.', tags: ['honey', 'organic'], price: 329, stock: 88 },
    { v: v2, cat: 'grocery', title: 'Free-range Brown Eggs 12 pack', description: 'Farm-collected weekly.', tags: ['eggs', 'protein'], price: 159, stock: 150 },
    { v: v2, cat: 'grocery', title: 'White Quinoa 1 kg', description: 'Washed grain, cooks fluffy.', tags: ['quinoa', 'healthy'], price: 549, compareAtPrice: 649, stock: 47 },
    { v: v2, cat: 'grocery', title: 'Mixed Berry Pack Frozen 400g', description: 'Strawberry, blueberry, raspberry blend.', tags: ['frozen', 'fruit'], price: 399, stock: 72 },

    { v: v3, cat: 'fashion', title: 'Slim Fit Denim Jeans Indigo', description: 'Stretch cotton 2% elastane.', tags: ['denim', 'jeans'], price: 2799, stock: 53 },
    { v: v3, cat: 'fashion', title: 'Canvas Tote Bag Natural', description: 'Heavy 12oz cotton, inner pocket.', tags: ['bag', 'eco'], price: 899, stock: 94 },
    { v: v3, cat: 'fashion', title: 'Canvas Sneakers Off-white', description: 'Cupsole, cushioned footbed.', tags: ['shoes', 'casual'], price: 1999, stock: 61 },
    { v: v3, cat: 'fashion', title: 'Silk Printed Scarf Emerald', description: 'Hand-rolled hem, 85×85 cm.', tags: ['accessory', 'silk'], price: 2199, stock: 31 },

    { v: v4, cat: 'electronics', title: 'Ergonomic Wireless Mouse', description: 'Silent clicks, Bluetooth + USB dongle.', tags: ['mouse', 'office'], price: 1599, stock: 112 },
    { v: v4, cat: 'electronics', title: '1080p Webcam with Dual Mic', description: 'Privacy shutter, autofocus.', tags: ['webcam', 'work'], price: 2899, stock: 44 },
    { v: v4, cat: 'electronics', title: 'Aluminium Laptop Stand Adjustable', description: 'Folds flat, supports 17".', tags: ['desk', 'ergonomic'], price: 3199, stock: 56 },
    { v: v4, cat: 'electronics', title: 'NVMe SSD 1TB Gen4', description: 'Read up to 5000 MB/s, 5yr warranty.', tags: ['ssd', 'storage'], price: 8499, compareAtPrice: 9999, stock: 33 },

    { v: v5, cat: 'wellness', title: 'Neem & Turmeric Soap Pack 4', description: 'Cold process, no sulphates.', tags: ['soap', 'ayurveda'], price: 299, stock: 210 },
    { v: v5, cat: 'wellness', title: 'Pure Rose Water Facial Mist 100ml', description: 'Damask roses, steam distilled.', tags: ['skincare', 'toner'], price: 449, stock: 124 },
    { v: v5, cat: 'wellness', title: 'Ashwagandha Extract Capsules 60', description: 'KSM-66 root extract 500 mg.', tags: ['supplement', 'herbs'], price: 699, stock: 67 },
    { v: v5, cat: 'home-living', title: 'Natural Incense Sticks Gift Set', description: 'Sandalwood, nag champa & oud blends.', tags: ['incense', 'gift'], price: 549, stock: 89 },

    { v: v6, cat: 'grocery', title: 'Turmeric Powder Premium 400g', description: 'Erode high-curcumin turmeric.', tags: ['spice', 'masala'], price: 229, stock: 180 },
    { v: v6, cat: 'grocery', title: 'Cold Pressed Sesame Oil 750ml', description: 'Wooden ghani pressed.', tags: ['oil', 'cooking'], price: 579, stock: 64 },
    { v: v6, cat: 'grocery', title: 'Split Moong Dal 1 kg', description: 'Unpolished, pesticide-tested.', tags: ['dal', 'staple'], price: 189, stock: 140 },
    { v: v6, cat: 'grocery', title: 'Ready Sambar Paste 200g', description: 'Tamil Nadu style, no preservatives.', tags: ['paste', 'instant'], price: 149, stock: 95 },
  ];

  /** @type {import('mongoose').Document[]} */
  const products = [];
  for (let i = 0; i < productSeeds.length; i += 1) {
    const p = productSeeds[i];
    const imageUrl = `https://picsum.photos/seed/partnercart-${String(i + 1).padStart(3, '0')}/900/900`;
    const doc = await Product.create({
      vendor: p.v._id,
      title: p.title,
      slug: await uniqueSlug(Product, p.title),
      description: p.description,
      shortDescription: p.shortDescription,
      category: bySlug(p.cat),
      tags: p.tags,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      stock: p.stock,
      images: [{ url: imageUrl, alt: p.title }],
      rating: { average: 0, count: 0 },
      salesCount: Math.floor(Math.random() * 120),
      isPublished: true,
      location: { city: p.v.address?.city || 'India' },
    });
    products.push(doc);
  }

  let reviewCount = 0;
  for (const prodDoc of products) {
    const n = Math.min(customers.length, 4 + Math.floor(Math.random() * 9));
    const reviewers = shuffle(customers).slice(0, n);
    for (const cust of reviewers) {
      const rating = Math.min(5, Math.max(3, Math.round((35 + Math.random() * 18) / 10)));
      await Review.create({
        product: prodDoc._id,
        vendor: prodDoc.vendor,
        user: cust._id,
        rating,
        title: rating >= 4.5 ? 'Love it' : rating >= 4 ? 'Very good' : 'Good value',
        body: DEMO_REVIEW_SNIPPETS[Math.floor(Math.random() * DEMO_REVIEW_SNIPPETS.length)],
        status: REVIEW_STATUS.PUBLISHED,
      });
      reviewCount += 1;
    }
  }

  const ratingAgg = await Review.aggregate([
    { $match: { status: REVIEW_STATUS.PUBLISHED } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, cnt: { $sum: 1 } } },
  ]);
  await Promise.all(
    ratingAgg.map(({ _id, avg, cnt }) =>
      Product.updateOne(
        { _id },
        { $set: { rating: { average: Math.round(avg * 10) / 10, count: cnt } } }
      )
    )
  );
  logger.info(`Seeded ${reviewCount} customer reviews; product ratings synced from reviews.`);

  for (const v of vendors) {
    const count = await Product.countDocuments({ vendor: v._id, isDeleted: false });
    await Vendor.updateOne({ _id: v._id }, { $set: { 'stats.totalProducts': count } });
  }

  await Address.create({
    user: primaryCustomer._id,
    label: 'Home',
    fullName: 'Aarav Sharma',
    phone: '+91 98765 41111',
    line1: '14 Marine Drive Society',
    city: 'Mumbai',
    state: 'MH',
    postalCode: '400002',
    country: 'India',
    isDefault: true,
  });
  await Address.create({
    user: customers[3]._id,
    label: 'Office',
    fullName: 'Demo Customer 04',
    phone: '+91 98765 42222',
    line1: 'Tower B, MG Road',
    city: 'Bengaluru',
    state: 'KA',
    postalCode: '560001',
    country: 'India',
    isDefault: true,
  });

  const findProduct = (title) => {
    const p = products.find((x) => x.title === title);
    if (!p) throw new Error(`Seed typo: unknown product title "${title}"`);
    return p;
  };

  const orderSpecs = [
    {
      cust: primaryCustomer,
      groups: [{ vendor: v1, items: [[findProduct('Brass Diya Set of 4'), 2]] }],
      status: ORDER_STATUS.DELIVERED,
    },
    {
      cust: primaryCustomer,
      groups: [{ vendor: v2, items: [[findProduct('Organic Alphonso Mangoes (1 kg)'), 3], [findProduct('Cold-pressed Coconut Oil 1L'), 1]] }],
      status: ORDER_STATUS.SHIPPED,
    },
    {
      cust: customers[5],
      groups: [{ vendor: v3, items: [[findProduct('Linen Overshirt Ivory'), 1]] }],
      status: ORDER_STATUS.CONFIRMED,
    },
    {
      cust: customers[7],
      groups: [{ vendor: v4, items: [[findProduct('Portable Bluetooth Speaker'), 2]] }],
      status: ORDER_STATUS.PREPARING,
    },
    {
      cust: customers[9],
      groups: [{ vendor: v6, items: [[findProduct('Filter Coffee Powder 500g'), 4], [findProduct('Idli Dosa Batter 1kg'), 2]] }],
      status: ORDER_STATUS.PENDING,
    },
    {
      cust: customers[11],
      groups: [
        { vendor: v1, items: [[findProduct('Jute Floor Mat Natural'), 1]] },
        { vendor: v5, items: [[findProduct('Tulsi Green Tea Loose 250g'), 2]] },
      ],
      status: ORDER_STATUS.CONFIRMED,
    },
  ];

  for (const spec of orderSpecs) {
    const orderGroups = spec.groups.map((g) => {
      const group = buildGroup(g.vendor, g.items.map(([doc, qty]) => ({ productDoc: doc, qty })));
      group.status = spec.status;
      const hist = [{ status: ORDER_STATUS.PENDING, at: new Date(Date.now() - 86400000 * 3) }];
      if ([ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED].includes(spec.status)) {
        hist.push({ status: ORDER_STATUS.CONFIRMED, at: new Date(Date.now() - 86400000 * 2) });
      }
      if ([ORDER_STATUS.PREPARING, ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED].includes(spec.status)) {
        hist.push({ status: ORDER_STATUS.PREPARING, at: new Date(Date.now() - 86400000) });
      }
      if ([ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED].includes(spec.status)) {
        hist.push({ status: ORDER_STATUS.SHIPPED, at: new Date(Date.now() - 3600000 * 12) });
      }
      if (spec.status === ORDER_STATUS.DELIVERED) {
        hist.push({ status: ORDER_STATUS.DELIVERED, at: new Date(Date.now() - 3600000 * 2) });
        group.deliveredAt = new Date(Date.now() - 3600000 * 2);
      }
      group.statusHistory = hist;
      group.status = spec.status;
      return group;
    });

    const subtotal = orderGroups.reduce((s, g) => s + g.subtotal, 0);
    const shippingFee = orderGroups.reduce((s, g) => s + g.shippingFee, 0);
    const total = subtotal + shippingFee;

    await Order.create({
      customer: spec.cust._id,
      shippingAddress: shippingAddressSeed(),
      orderGroups,
      subtotal,
      shippingFee,
      total,
      payment: { method: PAYMENT_METHOD.COD, status: PAYMENT_STATUS.UNPAID },
    });
  }

  logger.info('Seeded successfully.');
  logger.info('── Accounts (passwords) ──');
  logger.info(`Admin:     admin@partnercart.io / ${ADMIN_PASSWORD}`);
  logger.info(`Vendors:   vendor@ … vendor6@partnercart.io / ${VENDOR_PASSWORD}`);
  logger.info(`Customers: customer@partnercart.io + customer02@ … customer40@partnercart.io / ${USER_PASSWORD}`);
  logger.info(`──────────`);
  logger.info(`${customers.length} customers · ${vendors.length} vendor stores · ${products.length} products · ${orderSpecs.length} demo orders`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  logger.error(err);
  process.exit(1);
});
