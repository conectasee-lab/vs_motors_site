"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

export default function VehicleGallery({ images, alt }: { images: string[]; alt: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);
  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, close, prev, next]);

  if (images.length === 0) {
    return (
      <div className="w-full h-80 bg-brand-black-soft rounded-lg flex items-center justify-center text-gray-400 text-sm">
        Sem foto
      </div>
    );
  }

  const thumbs = images.slice(1, 5);
  const extraCount = images.length - 5;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2 h-[320px] md:h-[420px]">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="relative w-full h-full rounded-lg overflow-hidden bg-black cursor-pointer"
        >
          <Image src={images[0]} alt={alt} fill className="object-cover hover:scale-105 transition-transform duration-300" />
        </button>

        {thumbs.length > 0 && (
          <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2 h-full">
            {thumbs.map((src, i) => {
              const index = i + 1;
              const isLast = i === thumbs.length - 1;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="relative w-full h-full rounded-lg overflow-hidden bg-black cursor-pointer"
                >
                  <Image src={src} alt={`${alt} - foto ${index + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                  {isLast && extraCount > 0 && (
                    <span className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-sm font-semibold text-center px-2">
                      Ver todas as fotos
                      <span className="text-xs font-normal mt-0.5">({images.length} fotos)</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none"
          >
            &times;
          </button>

          <span className="absolute top-5 left-5 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </span>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="Foto anterior"
              className="absolute left-2 md:left-6 text-white/80 hover:text-white text-4xl px-3 py-6"
            >
              ‹
            </button>
          )}

          <div
            className="relative w-full max-w-4xl h-[70vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={images[lightboxIndex]} alt={`${alt} - foto ${lightboxIndex + 1}`} fill className="object-contain" />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="Próxima foto"
              className="absolute right-2 md:right-6 text-white/80 hover:text-white text-4xl px-3 py-6"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
