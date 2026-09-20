"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export interface OrderTrackingParallaxCardProps {
  orderId: string;
  product: string;
  status: "Processing" | "Shipped" | "Out for Delivery" | "Delivered";
  eta: string;
  imageUrl?: string;
  className?: string;
}

export const OrderTrackingParallaxCard = React.forwardRef<
  HTMLDivElement,
  OrderTrackingParallaxCardProps
>(
  (
    {
      orderId,
      product,
      status,
      eta,
      imageUrl = "/delivery-truck.png",
      className,
    },
    ref
  ) => {
    // Motion values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

    const rotateX = useTransform(ySpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const translateZImg = useTransform(ySpring, [-0.5, 0.5], [-40, 40]);
    const translateZContent = useTransform(ySpring, [-0.5, 0.5], [25, -25]);
    const translateZProgress = useTransform(ySpring, [-0.5, 0.5], [35, -35]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPct = mouseX / rect.width - 0.5;
      const yPct = mouseY / rect.height - 0.5;
      x.set(xPct);
      y.set(yPct);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    // Progress steps
    const steps = ["Processing", "Shipped", "Out for Delivery", "Delivered"] as const;
    const activeStep = steps.indexOf(status);

    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className={cn(
          "relative h-[430px] w-full max-w-[340px] sm:w-[340px] rounded-3xl p-2 select-none",
          className
        )}
      >
        {/* Ambient subtle glow */}
        <div className="absolute inset-2 rounded-3xl bg-[#E06A8B]/15 blur-xl pointer-events-none" />

        <div
          style={{
            transform: "translateZ(40px)",
            transformStyle: "preserve-3d",
            backgroundColor: "#FFEAF1",
            borderColor: "#F5D3DF",
          }}
          className="relative h-full w-full flex flex-col justify-between rounded-3xl shadow-xl shadow-[#E06A8B]/10 hover:shadow-2xl hover:shadow-[#E06A8B]/20 p-6 border transition-all duration-300"
        >
          {/* Truck Image (Transparent) */}
          <motion.div
            style={{ transform: "translateZ(60px)", translateY: translateZImg }}
            className="relative flex justify-center items-center py-2"
          >
            <div className="relative flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Delivery truck"
                className="pointer-events-none h-32 w-32 object-contain relative z-10 transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          </motion.div>

          {/* Order Info */}
          <motion.div
            style={{ transform: "translateZ(30px)", translateY: translateZContent }}
            className="mt-2 text-center"
          >
            <div
              style={{ backgroundColor: "#E06A8B", color: "#FFFFFF" }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-2 shadow-xs"
            >
              <span>PRIORA EXPRESS</span>
            </div>
            <h2
              style={{ color: "#3D2A25" }}
              className="text-xl font-serif font-bold tracking-tight"
            >
              Order #{orderId}
            </h2>
            <p
              style={{ color: "#8A6270" }}
              className="text-xs font-semibold line-clamp-1 mt-0.5 px-2"
            >
              {product}
            </p>
            <div className="mt-2.5 flex items-center justify-center gap-2">
              <span
                style={{
                  backgroundColor: "#FBE1EA",
                  color: "#E06A8B",
                  borderColor: "#F5D3DF",
                }}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold tracking-wide border shadow-xs"
              >
                <span className="h-2 w-2 rounded-full bg-[#E06A8B] animate-pulse" />
                {status}
              </span>
            </div>
            <p style={{ color: "#8A6270" }} className="mt-2.5 text-xs font-bold">
              ETA:{" "}
              <span style={{ color: "#3D2A25" }} className="font-black">
                {eta}
              </span>
            </p>
          </motion.div>

          {/* Progress Tracker */}
          <motion.div
            style={{
              transform: "translateZ(45px)",
              translateY: translateZProgress,
              borderTopColor: "#F5D3DF",
            }}
            className="mt-4 pt-3.5 border-t"
          >
            <div className="flex justify-between text-[10px] font-bold tracking-tight mb-2">
              {steps.map((step, i) => (
                <span
                  key={step}
                  style={{
                    color: i === activeStep ? "#E06A8B" : i < activeStep ? "#3D2A25" : "#8A6270",
                  }}
                  className="flex-1 text-center transition-colors duration-200"
                >
                  {step}
                </span>
              ))}
            </div>
            <div className="flex w-full items-center gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: i <= activeStep ? "#E06A8B" : "#F5D3DF",
                  }}
                  className="h-2 flex-1 rounded-full transition-all duration-500 shadow-xs"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

OrderTrackingParallaxCard.displayName = "OrderTrackingParallaxCard";
