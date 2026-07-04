import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { GiFlowerEmblem } from "react-icons/gi";

// ─── Replace with your actual heroData import ───────────────────────────────
import { heroData } from "../../../commen/data.js";

const images = heroData;

const WORDS = ["World", "Class", "Fragrance"];

export default function Hero() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const slider = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 7000);
        return () => clearInterval(slider);
    }, []);

    const prev = () =>
        setCurrent((current - 1 + images.length) % images.length);
    const next = () =>
        setCurrent((current + 1) % images.length);

    return (
        <section className="relative min-h-screen w-full bg-black overflow-hidden flex items-center">
            {/* Added padding-top to account for fixed/sticky navbar */}
            {/* Navbar height is approximately 80-100px on mobile and 100-120px on desktop */}
            
            {/* ── Ambient glow ─────────────────────────────────────────── */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#A98450]/10 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#A98450]/8 blur-[100px]" />
            </div>

            {/* ── Noise / grain texture overlay ───────────────────────── */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                    backgroundSize: "200px 200px",
                }}
            />

            {/* Main content with padding-top to clear the navbar */}
            <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 lg:px-12 py-8 flex flex-col lg:flex-row items-center justify-between gap-8 pt-20 sm:pt-24 lg:pt-28">
                {/* pt-20 for mobile, pt-24 for tablet, pt-28 for desktop */}

                {/* ════════════════════════════════════════════
                    LEFT — COPY
                ════════════════════════════════════════════ */}
                <div className="flex-1 w-full">

                    {/* Eyebrow */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <GiFlowerEmblem className="text-[#A98450] text-base" />
                        <span
                            className="text-[#A98450]/70 text-[11px] tracking-[0.35em] uppercase"
                            style={{ fontFamily: "Cormorant Garamond, serif" }}
                        >
                           Zahoor Fragrances
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-[#A98450]/40 to-transparent max-w-[100px]" />
                    </motion.div>

                    {/* Headline – staggered per word */}
                    <h1 className="Syne">
                        {WORDS.map((word, i) => (
                            <motion.span
                                key={word}
                                className="block leading-[0.9] text-[#D4A96A]"
                                style={{
                                    fontSize: "clamp(40px, 7vw, 100px)",
                                    fontWeight: 600,
                                    letterSpacing: "-0.02em",
                                    textShadow: "0 0 80px rgba(169,132,80,0.2)",
                                }}
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: 0.2 + i * 0.15,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </h1>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.75 }}
                        className="mt-6 pl-4 max-w-[420px]"
                        style={{ borderLeft: "1.5px solid #A98450" }}
                    >
                        <p
                            className="text-[#c2a87a]/70 leading-7 text-[13px] Syne"
                        >
                            Discover timeless fragrances crafted to capture your
                            individuality. Each note designed to linger, long after
                            you've left the room.
                        </p>
                    </motion.div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.95 }}
                        className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5"
                    >
                        <button
                            className="group relative px-6 py-2.5 overflow-hidden text-[#0a0804] text-xs tracking-[0.2em] uppercase font-semibold w-full sm:w-auto"
                            style={{
                                background: "linear-gradient(135deg, #D4A96A, #A98450)",
                                fontFamily: "Cormorant Garamond, serif",
                                clipPath:
                                    "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                            }}
                        >
                            <span className="relative z-10">Explore Collection</span>
                            <span
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: "linear-gradient(135deg, #c49955, #8a6a34)",
                                }}
                            />
                        </button>

                        <button
                            className="text-[#A98450]/60 hover:text-[#A98450] text-xs tracking-[0.2em] uppercase transition-colors duration-300 outfit w-full sm:w-auto"
                        >
                            About us →
                        </button>
                    </motion.div>

                    {/* Slide counter - hidden on mobile, visible on tablet and up */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 }}
                        className="hidden md:flex mt-8 items-center gap-2"
                    >
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className="transition-all duration-500"
                                style={{
                                    height: "2px",
                                    width: current === i ? "32px" : "12px",
                                    background:
                                        current === i
                                            ? "#D4A96A"
                                            : "rgba(169,132,80,0.3)",
                                    borderRadius: "2px",
                                }}
                            />
                        ))}
                    </motion.div>
                </div>

                {/* ════════════════════════════════════════════
                    RIGHT — IMAGE SLIDER
                ════════════════════════════════════════════ */}
                <motion.div
                    className="flex-1 w-full flex justify-center lg:justify-end"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div
                        className="relative w-full max-w-[350px] sm:max-w-[400px]"
                        style={{ aspectRatio: "4/5" }}
                    >
                        {/* Decorative corner frames */}
                        {[
                            "top-0 left-0 border-t border-l",
                            "top-0 right-0 border-t border-r",
                            "bottom-0 left-0 border-b border-l",
                            "bottom-0 right-0 border-b border-r",
                        ].map((cls, i) => (
                            <span
                                key={i}
                                className={`absolute w-4 h-4 sm:w-6 sm:h-6 border-[#A98450]/50 ${cls}`}
                                style={{ zIndex: 20 }}
                            />
                        ))}

                        {/* Gold frame border */}
                        <div
                            className="absolute inset-0 border border-[#A98450]/20"
                            style={{ zIndex: 10 }}
                        />

                        {/* Images */}
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={current}
                                src={images[current]}
                                alt={`Fragrance ${current + 1}`}
                                className="absolute inset-0 w-full h-full object-cover"
                                initial={{ opacity: 0, scale: 1.06 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </AnimatePresence>

                        {/* Gradient overlay at bottom */}
                        <div
                            className="absolute bottom-0 left-0 right-0 h-2/5"
                            style={{
                                background:
                                    "linear-gradient(to top, rgba(10,8,4,0.85) 0%, transparent 100%)",
                                zIndex: 5,
                            }}
                        />

                        {/* Nav buttons */}
                        <div
                            className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-3 sm:px-5"
                            style={{ zIndex: 15 }}
                        >
                            <button
                                onClick={prev}
                                aria-label="Previous slide"
                                className="group flex items-center gap-1 sm:gap-2 text-[#D4A96A]/70 hover:text-[#D4A96A] transition-colors duration-300"
                            >
                                <span>
                                    <FiArrowLeft size={16} className="sm:w-5 sm:h-5" />
                                </span>
                                <span
                                    className="text-[10px] sm:text-[15px] tracking-[0.25em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 Syne hidden sm:inline-block"
                                >
                                    Prev
                                </span>
                            </button>

                            <span
                                className="text-[#A98450]/80 text-[11px] sm:text-[15px] tracking-widest Syne"
                            >
                                0{current + 1} / 0{images.length}
                            </span>

                            <button
                                onClick={next}
                                aria-label="Next slide"
                                className="group flex items-center gap-1 sm:gap-2 text-[#D4A96A]/70 hover:text-[#D4A96A] transition-colors duration-300"
                            >
                                <span
                                    className="text-[10px] sm:text-[15px] tracking-[0.25em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 Syne hidden sm:inline-block"
                                >
                                    Next
                                </span>
                                <span>
                                    <FiArrowRight size={16} className="sm:w-5 sm:h-5" />
                                </span>
                            </button>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}