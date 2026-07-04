"use client";

import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

const DEFAULT_DATA = [
  "https://images.unsplash.com/photo-1540968221243-29f5d70540bf?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1596135187959-562c650d98bc?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1628944682084-831f35256163?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1590013330451-3946e83e0392?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1590421959604-741d0eec0a2e?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1572613000712-eadc57acbecd?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1570097192570-4b49a6736f9f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1620789550663-2b10e0080354?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1617775623669-20bff4ffaa5c?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1548600916-dc8492f8e845?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1573824969595-a76d4365a2e6?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1633936929709-59991b5fdd72?w=800&auto=format&fit=crop&q=60",
];

export default function ImageSlider3D({
  children = null,
  images = DEFAULT_DATA,
  cardWidth = "17.5em",
  cardAspectRatio = "7/10",
  perspective = "35em",
  containerClassName = "",
  imageClassName = "",
  rotationDirection = "left",
  withMask = true,
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef(null);

  const hasChildren = React.Children.count(children) > 0;
  const items = hasChildren ? React.Children.toArray(children) : images;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // raw rotation
  const rawRotate = useTransform(
    scrollYProgress,
    [0, 1],
    rotationDirection === "left" ? [0, 360] : [360, 0]
  );

  // smooth spring animation
  const rotateValue = useSpring(rawRotate, {
    stiffness: 45,
    damping: 25,
    mass: 1.5,
  });

  const maskStyles = withMask
    ? {
        WebkitMask:
          "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
        mask: "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
      }
    : {};

  const getTranslateZ = (cardWidth, itemCount) => {
    const widthValue = parseFloat(cardWidth);
    const widthUnit = cardWidth.replace(widthValue.toString(), "");
    const angle = (Math.PI * 2) / itemCount;
    const radius = widthValue / (2 * Math.tan(angle / 2));
    return `calc(-1 * (${radius}${widthUnit} + 0.5em))`;
  };

  const renderItem = (item, index) => {
    const transformStyle = {
      width: cardWidth,
      aspectRatio: cardAspectRatio,
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      transform: `rotateY(calc(${index} * (1turn / ${items.length}))) translateZ(${getTranslateZ(
        cardWidth,
        items.length
      )})`,
    };

    if (hasChildren && React.isValidElement(item)) {
      return React.cloneElement(item, {
        key: index,
        className:
          "col-start-1 row-start-1 rounded-[1.5em] overflow-hidden " +
          imageClassName,
        style: { ...transformStyle, ...item.props.style },
      });
    }

    if (typeof item === "string") {
      return (
        <img
          key={index}
          src={item}
          alt={`slide-${index}`}
          className={
            "col-start-1 row-start-1 object-cover rounded-[1.5em] " +
            imageClassName
          }
          style={transformStyle}
        />
      );
    }

    return (
      <div
        key={index}
        className={
          "col-start-1 row-start-1 rounded-[1.5em] " + imageClassName
        }
        style={transformStyle}
      >
        {item}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={
        "grid w-full min-h-[500px] place-items-center overflow-hidden " +
        containerClassName
      }
      style={{
        perspective,
        ...maskStyles,
      }}
    >
      <motion.div
        className="grid place-items-center"
        style={{
          transformStyle: "preserve-3d",
          rotateY: prefersReducedMotion ? 0 : rotateValue,
        }}
      >
        {items.map((item, i) => renderItem(item, i))}
      </motion.div>
    </div>
  );
}