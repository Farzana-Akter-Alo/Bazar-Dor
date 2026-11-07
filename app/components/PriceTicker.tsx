
"use client";

import { useEffect, useState } from "react";

// Product API endpoint
const PRODUCT_API =
  "https://openapi.programming-hero.com/api/bazardor/products";

// Product data type
type Product = {
  id: string;
  name: string;
  price: string;
  unit: string;
  change: number | null;
};

// Raw API product type
type RawProduct = Record<string, unknown>;

// Get the first available text value from the API
function getText(
  product: RawProduct,
  keys: string[],
  fallback: string
): string {
  for (const key of keys) {
    const value = product[key];

    if (
      (typeof value === "string" ||
        typeof value === "number") &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }
  }

  return fallback;
}

// Get the product price change percentage
function getChange(product: RawProduct): number | null {
  const keys = [
    "changePercent",
    "priceChangePercent",
    "change_percentage",
    "change",
  ];

  for (const key of keys) {
    const value = product[key];

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
}

// Extract product array from the API response
function extractProducts(result: unknown): RawProduct[] {
  if (Array.isArray(result)) {
    return result.filter(
      (item): item is RawProduct =>
        typeof item === "object" &&
        item !== null &&
        !Array.isArray(item)
    );
  }

  if (typeof result === "object" && result !== null) {
    const data = result as Record<string, unknown>;

    for (const key of ["data", "products", "results"]) {
      if (Array.isArray(data[key])) {
        return extractProducts(data[key]);
      }
    }
  }

  return [];
}

// Convert raw API data into clean product data
function formatProducts(result: unknown): Product[] {
  const rawProducts = extractProducts(result);

  return rawProducts.map((item, index) => ({
    id: getText(item, ["id", "_id", "slug"], String(index)),
    name: getText(
      item,
      ["nameBn", "name", "productName", "title"],
      "পণ্য"
    ),
    price: getText(
      item,
      ["price", "currentPrice", "priceTk", "marketPrice"],
      "—"
    ),
    unit: getText(
      item,
      ["unit", "unitBn", "priceUnit"],
      "একক"
    ),
    change: getChange(item),
  }));
}

export default function PriceTicker() {
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch product data when the component loads
  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        const response = await fetch(PRODUCT_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch product data");
        }

        const result: unknown = await response.json();

        setProducts(formatProducts(result));
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "AbortError"
        ) {
          console.error("Price ticker error:", error);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, []);

  // Show loading message while product data is unavailable
  if (products.length === 0) {
    return (
      <div className="border-t border-purple-100 bg-purple-50 px-4 py-2 text-sm text-gray-600">
        বাজারদরের তথ্য লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div
      aria-label="পণ্যের বাজারদর"
      className="overflow-hidden border-t border-purple-100 bg-purple-50"
    >
      {/* Infinite scrolling container */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">

        {/* Duplicate product list for seamless scrolling */}
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1}
          >
            {products.map((product) => {
              const change = product.change;

              // Determine price trend
              const isIncreasing = change !== null && change > 0;
              const isDecreasing = change !== null && change < 0;

              const trendColor = isIncreasing
                ? "text-red-600"
                : isDecreasing
                  ? "text-green-700"
                  : "text-gray-500";

              const arrow = isIncreasing
                ? "▲"
                : isDecreasing
                  ? "▼"
                  : "•";

              return (
                <span
                  key={`${product.id}-${copy}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap px-5 py-3 text-sm"
                >
                  {/* Product icon */}
                  <span aria-hidden="true">🛒</span>

                  {/* Product name */}
                  <span className="font-semibold text-gray-800">
                    {product.name}
                  </span>

                  {/* Product price and unit */}
                  <span className="font-bold text-purple-800">
                    ৳{product.price}/{product.unit}
                  </span>

                  {/* Price change indicator */}
                  <span className={`font-semibold ${trendColor}`}>
                    {change === null
                      ? "পরিবর্তনের তথ্য নেই"
                      : `${arrow} ${Math.abs(change)}%`}
                  </span>

                  {/* Item separator */}
                  <span
                    className="ml-3 text-purple-200"
                    aria-hidden="true"
                  >
                    |
                  </span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
