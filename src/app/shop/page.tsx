"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ui/product-card";
import { INITIAL_PRODUCTS, ProductItem } from "@/lib/products-data";
import { Search, SlidersHorizontal, ArrowUpDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(500);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Fetch from MongoDB API endpoint, fallback to in-memory
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.success && json.data) {
          setProducts(json.data);
        }
      } catch (err) {
        console.warn("Using local products dataset:", err);
      }
    }
    loadProducts();
  }, []);

  const categories = [
    { id: "all", name: "All Drops" },
    { id: "footwear", name: "Footwear & Sneakers" },
    { id: "apparel", name: "Raw Silk Apparel" },
    { id: "outerwear", name: "Tailored Outerwear" },
    { id: "accessories", name: "Leather Accessories" },
  ];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Size filter
    if (selectedSize !== "all") {
      result = result.filter((p) => p.sizes?.includes(selectedSize));
    }

    // Price
    result = result.filter((p) => p.price <= maxPrice);

    // Sort
    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [products, selectedCategory, searchQuery, selectedSize, maxPrice, sortBy]);

  return (
    <div className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="py-8 border-b border-border mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-mono text-accent uppercase tracking-widest font-semibold">
            Runway Archive
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground mt-1">
            The Collection
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Engineered footwear and raw silk apparel designed for high-performance and luxury aesthetics.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search footwear, hoodies, coats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-card/60 rounded-full text-xs"
          />
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10 pb-6 border-b border-border/60">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all ${
                selectedCategory === cat.id
                  ? "bg-accent text-white shadow-md shadow-accent/25 font-semibold"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="featured">Featured Releases</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border">
          <h3 className="text-lg font-semibold">No pieces match your search</h3>
          <p className="text-xs text-muted-foreground mt-1">Try resetting your filters or search keywords.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setSelectedSize("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-xs font-mono">Loading Astra Runway...</div>}>
      <ShopContent />
    </Suspense>
  );
}
