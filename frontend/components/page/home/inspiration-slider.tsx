"use client";

import { Icon } from "@iconify/react";
import * as React from "react";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type QuoteSlide = {
  text: string;
  accent: string;
  icon: string;
};

type InspirationSliderProps = {
  label: string;
  slides: QuoteSlide[];
};

export function InspirationSlider({ label, slides }: InspirationSliderProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const handleSelect = () => setSelected(api.selectedScrollSnap());
    handleSelect();
    api.on("select", handleSelect);
    api.on("reInit", handleSelect);
    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api]);

  React.useEffect(() => {
    if (!api || slides.length <= 1) return;
    const intervalId = window.setInterval(() => {
      api.scrollNext();
    }, 4500);
    return () => window.clearInterval(intervalId);
  }, [api, selected, slides.length]);

  return (
    <div>
      <Typography
        as="p"
        className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </Typography>

      <Carousel setApi={setApi} opts={{ loop: true }} className="mt-4">
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div
                className={cn(
                  "flex h-[132px] items-center justify-between rounded-[18px] p-5",
                  slide.accent,
                )}
              >
                <Typography
                  as="p"
                  className="max-w-[240px] text-[15px] font-bold leading-[22px] text-white"
                >
                  {slide.text}
                </Typography>
                <Icon
                  icon={slide.icon}
                  className="size-9 shrink-0 text-white/70"
                  aria-hidden="true"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-4 flex justify-center gap-1.5">
        {slides.map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === selected ? "w-5 bg-primary" : "w-1.5 bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}
