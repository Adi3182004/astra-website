import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  id?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: "footwear" | "outerwear" | "apparel" | "accessories" | "limited-drop";
  gender?: "unisex" | "men" | "women";
  sizes: string[];
  colors: string[];
  images: string[];
  featuredImage: string;
  isFeatured: boolean;
  isNewDrop: boolean;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: {
      type: String,
      enum: ["footwear", "outerwear", "apparel", "accessories", "limited-drop"],
      required: true,
    },
    gender: { type: String, enum: ["unisex", "men", "women"], default: "unisex" },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    images: [{ type: String }],
    featuredImage: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    isNewDrop: { type: Boolean, default: true },
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, default: 50 },
    rating: { type: Number, default: 4.9 },
    reviewsCount: { type: Number, default: 24 },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation in development
export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
