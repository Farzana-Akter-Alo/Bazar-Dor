
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
  "https://openapi.programming-hero.com/api/bazardor/products";

// Product data structure.
type Product = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  unit: string;
  price: number;
  change: number | null;
};

type RawProduct = Record<string, unknown>;

// Convert Bengali and Arabic numerals into English numerals.
function normalizeDigits(value: string) {
  return value
    .replace(/[০-৯]/g, (digit) =>
      String("০১২৩৪৫৬৭৮৯".indexOf(digit))
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    );
}

// Format numbers using Bengali digits.
function formatNumber(value: number) {
  return value.toLocaleString("bn-BD", {
    maximumFractionDigits: 1,
  });
}

// Read the first available value from possible API field names.
function getValue(
  product: RawProduct,
  keys: string[],
  fallback: unknown = ""
): unknown {
  for (const key of keys) {
    const value = product[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return fallback;
}

// Convert API values into numbers.
function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const normalized = normalizeDigits(value)
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "");

  const result = Number(normalized);

  return Number.isFinite(result) ? result : null;
}

// Extract the product array from different API response structures.
function extractProducts(response: unknown): RawProduct[] {
  if (Array.isArray(response)) {
    return response as RawProduct[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const data = response as RawProduct;

  const possibleKeys = [
    "data",
    "products",
    "results",
    "items",
  ];

  for (const key of possibleKeys) {
    const value = data[key];

    if (Array.isArray(value)) {
      return value as RawProduct[];
    }

    if (value && typeof value === "object") {
      const nestedProducts = extractProducts(value);

      if (nestedProducts.length > 0) {
        return nestedProducts;
      }
    }
  }

  return [];
}

// Provide an emoji when the API does not contain one.
function getProductEmoji(name: string) {
  const emojiMap: Record<string, string> = {
    চাল: "🍚",
    ডাল: "🫘",
    তেল: "🫙",
    আলু: "🥔",
    পেঁয়াজ: "🧅",
    পেঁয়াজ: "🧅",
    মরিচ: "🌶️",
    রসুন: "🧄",
    আদা: "🫚",
    মাছ: "🐟",
    ইলিশ: "🐟",
    মাংস: "🍗",
    মুরগি: "🍗",
    ডিম: "🥚",
    বেগুন: "🍆",
    টমেটো: "🍅",
    লবণ: "🧂",
  };

  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (name.includes(keyword)) {
      return emoji;
    }
  }

  return "🛒";
}

// Convert raw API products into a consistent structure.
function normalizeProducts(data: RawProduct[]): Product[] {
  return data.map((item, index) => {
    const id = String(
      getValue(
        item,
        ["id", "_id", "productId", "product_id", "slug"],
        index + 1
      )
    );

    const name = String(
      getValue(
        item,
        ["nameBn", "name", "productName", "product_name", "title"],
        "পণ্য"
      )
    );

    const price = toNumber(
      getValue(
        item,
        [
          "price",
          "currentPrice",
          "current_price",
          "priceTk",
          "marketPrice",
          "averagePrice",
        ],
        null
      )
    );

    const change = toNumber(
      getValue(
        item,
        [
          "changePercent",
          "priceChangePercent",
          "price_change_percent",
          "percentageChange",
          "change_percentage",
          "change",
        ],
        null
      )
    );

    return {
      id,
      slug: String(
        getValue(item, ["slug", "id", "_id", "productId"], id)
      ),
      name,
      emoji: String(
        getValue(item, ["emoji", "icon"], getProductEmoji(name))
      ),
      unit: String(
        getValue(
          item,
          ["unitBn", "unit", "priceUnit", "price_unit"],
          "প্রতি কেজি"
        )
      ),
      price: price ?? 0,
      change,
    };
  });
}

// Product Card Component.
function ProductCard({ product }: { product: Product }) {
  const isUp = product.change !== null && product.change > 0;
  const isDown = product.change !== null && product.change < 0;
  const isFlat = product.change === 0;

  // Select badge colors according to price movement.
  const badgeStyle = isUp
    ? "bg-[#FFF0F0] text-[#E53935]"
    : isDown
      ? "bg-[#EAF8EF] text-[#159447]"
      : "bg-[#F0F1F0] text-[#858B86]";

  // Prepare the percentage label.
  const changeLabel =
    product.change === null
      ? "তথ্য নেই"
      : isUp
        ? `▲ ${formatNumber(Math.abs(product.change))}%`
        : isDown
          ? `▼ ${formatNumber(Math.abs(product.change))}%`
          : "— ০.০%";

  return (
    <Link
      href={`/product/${encodeURIComponent(product.slug)}`}
      className="flex min-h-[82px] flex-col justify-between rounded-xl border border-[#E3EAE4] bg-[#FBFDFB] p-2.5 transition-all duration-200 hover:border-[#078B43]/40 hover:shadow-md sm:p-3"
    >
      {/* Product Information */}
      <div className="flex min-w-0 items-center gap-2">
        {/* Product Emoji */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F0F5F0] text-xl">
          {product.emoji}
        </div>

        {/* Product Name and Unit */}
        <div className="min-w-0">
          <h3 className="truncate text-xs font-bold text-[#26332A] sm:text-sm">
            {product.name}
          </h3>

          <p className="mt-0.5 text-[10px] text-[#778078]">
            {product.unit}
          </p>
        </div>
      </div>

      {/* Price and Percentage */}
      <div className="mt-2 flex items-end justify-between gap-1">
        <div>
          <p className="text-[9px] text-[#778078]">
            আজকের দাম
          </p>

          <p className="mt-0.5 text-xs font-extrabold text-[#26332A] sm:text-sm">
            {formatNumber(product.price)} টাকা
          </p>
        </div>

        {/* Price Change Badge */}
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${badgeStyle}`}
        >
          {changeLabel}
        </span>
      </div>
    </Link>
  );
}

// Product Card Loading Skeleton.
function ProductSkeleton() {
  return (
    <div className="h-[82px] animate-pulse rounded-xl border border-[#E3EAE4] bg-[#FBFDFB] p-3">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-gray-200" />

        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 rounded bg-gray-200" />
          <div className="h-2 w-1/2 rounded bg-gray-200" />
        </div>
      </div>

      <div className="mt-3 h-3 w-1/3 rounded bg-gray-200" />
    </div>
  );
}

// Reusable Product Section Component.
function ProductGrid({
  title,
  subtitle,
  items,
  id,
  type,
  loading,
}: {
  title: string;
  subtitle?: string;
  items: Product[];
  id?: string;
  type?: "up" | "down";
  loading: boolean;
}) {
  return (
    <section
      id={id}
      className="mb-7 scroll-mt-28 sm:mb-8"
    >
      {/* Section Heading */}
      <div className="mb-3 flex items-center gap-1.5">
        {type === "up" && (
          <span className="text-xs font-bold text-[#E53935]">
            ▲
          </span>
        )}

        {type === "down" && (
          <span className="text-xs font-bold text-[#159447]">
            ▼
          </span>
        )}

        <h2 className="text-sm font-extrabold text-[#26332A] sm:text-base">
          {title}
        </h2>
      </div>

      {/* Section Subtitle */}
      {subtitle && (
        <p className="mb-3 text-[11px] text-[#778078]">
          {subtitle}
        </p>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-[#E3EAE4] bg-[#FBFDFB] px-4 py-5 text-center text-xs text-[#778078]">
          এই মুহূর্তে কোনো পণ্যের তথ্য পাওয়া যায়নি।
        </p>
      )}
    </section>
  );
}

// Main Product Sections Component.
export default function ProductSections() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products from the API.
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("পণ্যের তথ্য পাওয়া যায়নি।");
      }

      const result: unknown = await response.json();

      const rawProducts = extractProducts(result);
      const formattedProducts = normalizeProducts(rawProducts);

      if (formattedProducts.length === 0) {
        throw new Error("কোনো পণ্যের তথ্য পাওয়া যায়নি।");
      }

      setProducts(formattedProducts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Get the top 6 products with increasing prices.
  const topRisers = [...products]
    .filter(
      (product) =>
        product.change !== null && product.change > 0
    )
    .sort(
      (a, b) => (b.change ?? 0) - (a.change ?? 0)
    )
    .slice(0, 6);

  // Get the top 6 products with decreasing prices.
  const topFallers = [...products]
    .filter(
      (product) =>
        product.change !== null && product.change < 0
    )
    .sort(
      (a, b) => (a.change ?? 0) - (b.change ?? 0)
    )
    .slice(0, 6);

  return (
    <div className="bg-[#F1F6F1] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">

        {/* API Error Message */}
        {error && !loading && (
          <div className="mb-5 rounded-lg border border-red-100 bg-white p-4 text-center">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={fetchProducts}
              className="mt-3 rounded-lg bg-[#078B43] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#067638]"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Section A: Today's Price Increases */}
        <ProductGrid
          title="আজ দাম বেড়েছে"
          type="up"
          items={topRisers}
          loading={loading}
        />

        {/* Section B: Today's Price Decreases */}
        <ProductGrid
          title="আজ দাম কমেছে"
          type="down"
          items={topFallers}
          loading={loading}
        />

        {/* Section C: All Products */}
        <ProductGrid
          id="সব-পণ্য"
          title="সব পণ্য"
          subtitle={`মোট ${formatNumber(products.length)}টি পণ্য দেখানো হচ্ছে`}
          items={products}
          loading={loading}
        />

      </div>
    </div>
  );
}
