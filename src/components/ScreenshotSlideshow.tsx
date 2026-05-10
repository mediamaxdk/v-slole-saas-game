"use client";

import { useState, useEffect } from "react";

interface ScreenshotSlideshowProps {
  screenshots: string[];
  alt: string;
  width: number;
  height: number;
}

export default function ScreenshotSlideshow({ screenshots, alt, width, height }: ScreenshotSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [screenshots.length]);

  return (
    <div className="relative w-full overflow-hidden rounded-b-xl">
      <div className="relative h-full">
        {screenshots.map((screenshot, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={screenshot}
              alt={`${alt} - Skærmbillede ${index + 1}`}
              width={width}
              height={height}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>
      
      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {screenshots.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Gå til skærmbillede ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
