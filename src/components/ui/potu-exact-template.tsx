"use client";

import React, { useEffect, useState, useRef } from "react";

export function PotuExactTemplate() {
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch exact body HTML
    fetch("/potu-exact-body.html")
      .then((res) => res.text())
      .then((data) => {
        setHtmlContent(data);
        setIsLoaded(true);
      })
      .catch((err) => console.error("Error loading Potu template:", err));
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    const container = containerRef.current;

    // 2. Hide Preloader after delay
    const loader = container.querySelector(".loader-wrap") as HTMLElement;
    if (loader) {
      setTimeout(() => {
        loader.style.transition = "opacity 0.6s ease";
        loader.style.opacity = "0";
        setTimeout(() => {
          loader.style.display = "none";
        }, 600);
      }, 700);
    }

    // 3. Setup Custom Mouse Pointer
    const mousePointer = container.querySelector(".mouse-pointer") as HTMLElement;
    const handleMouseMove = (e: MouseEvent) => {
      if (mousePointer) {
        mousePointer.style.left = `${e.clientX}px`;
        mousePointer.style.top = `${e.clientY}px`;
        mousePointer.style.display = "block";
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 4. Setup Theme Switcher (Dark / Light)
    const darkBtn = container.querySelector(".demo-dark-bg");
    const lightBtn = container.querySelector(".demo-light-bg");
    const boxedWrapper = container.querySelector(".boxed_wrapper");
    const darkLogo = container.querySelector(".dark-logo");
    const lightLogo = container.querySelector(".light-logo");

    const setDarkMode = () => {
      if (boxedWrapper) {
        boxedWrapper.classList.remove("light_bg");
        boxedWrapper.classList.add("dark_bg");
      }
      if (darkLogo) darkLogo.classList.remove("sf-hidden");
      if (lightLogo) lightLogo.classList.add("sf-hidden");
      document.documentElement.classList.add("dark");
    };

    const setLightMode = () => {
      if (boxedWrapper) {
        boxedWrapper.classList.remove("dark_bg");
        boxedWrapper.classList.add("light_bg");
      }
      if (darkLogo) darkLogo.classList.add("sf-hidden");
      if (lightLogo) lightLogo.classList.remove("sf-hidden");
      document.documentElement.classList.remove("dark");
    };

    if (darkBtn) darkBtn.addEventListener("click", setDarkMode);
    if (lightBtn) lightBtn.addEventListener("click", setLightMode);

    // 5. Setup Mobile Nav Toggler
    const toggler = container.querySelector(".mobile-nav-toggler");
    const closeBtn = container.querySelector(".mobile-menu .close-btn");
    const backdrop = container.querySelector(".menu-backdrop");
    const mobileMenu = container.querySelector(".mobile-menu") as HTMLElement;

    const openMenu = () => {
      document.body.classList.add("mobile-menu-visible");
      if (mobileMenu) mobileMenu.style.opacity = "1";
    };

    const closeMenu = () => {
      document.body.classList.remove("mobile-menu-visible");
    };

    if (toggler) toggler.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (backdrop) backdrop.addEventListener("click", closeMenu);

    // 6. Smooth Scroll for Navigation Links
    const navLinks = container.querySelectorAll("a[href^='#']");
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.length > 1) {
          const target = container.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            closeMenu();
          }
        }
      });
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (darkBtn) darkBtn.removeEventListener("click", setDarkMode);
      if (lightBtn) lightBtn.removeEventListener("click", setLightMode);
      if (toggler) toggler.removeEventListener("click", openMenu);
      if (closeBtn) closeBtn.removeEventListener("click", closeMenu);
      if (backdrop) backdrop.removeEventListener("click", closeMenu);
    };
  }, [isLoaded]);

  return (
    <>
      {/* Exact Potu CSS */}
      <link rel="stylesheet" href="/potu-exact.css" />

      {/* Render exact HTML template */}
      <div
        ref={containerRef}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="w-full min-h-screen"
      />
    </>
  );
}

export default PotuExactTemplate;
