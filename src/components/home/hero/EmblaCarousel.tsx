'use client';
import React, { useCallback, useEffect, useRef } from 'react';
import { EmblaCarouselType, EmblaEventType, EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { usePrevNextButtons } from './EmblaCarouselArrowButtons';
import { useDotButton } from './EmblaCarouselDotButton';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';

const autoplay = Autoplay({
  delay: 4000, // 4 seconds
  stopOnMouseEnter: false, // (optional) pauses on hover
});

const TWEEN_FACTOR_BASE = 0.2;

type SlideType = {
  image: string;
  text: string;
  button: string;
};

type PropType = {
  slides: SlideType[];
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [autoplay]);
  const tweenFactor = useRef(0);
  const tweenNodes = useRef<HTMLElement[]>([]);

  const { selectedIndex, scrollSnaps } = useDotButton(emblaApi);

  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
    usePrevNextButtons(emblaApi);

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector('.embla__parallax__layer') as HTMLElement;
    });
  }, []);

  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenParallax = useCallback((emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();
    const slidesInView = emblaApi.slidesInView();
    const isScrollEvent = eventName === 'scroll';

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[snapIndex];

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress);
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            }
          });
        }

        const translate = diffToTarget * (-1 * tweenFactor.current) * 100;
        const tweenNode = tweenNodes.current[slideIndex];
        tweenNode.style.transform = `translateX(${translate}%)`;
      });
    });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    setTweenNodes(emblaApi);
    setTweenFactor(emblaApi);
    tweenParallax(emblaApi);

    emblaApi
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenParallax)
      .on('scroll', tweenParallax)
      .on('slideFocus', tweenParallax);
  }, [emblaApi, tweenParallax]);

  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((slide, index) => (
            <div className="embla__slide" key={index}>
              <div className="embla__parallax">
                <div className="embla__parallax__layer">
                  <Image
                    width={1920}
                    height={1080}
                    className="embla__slide__img embla__parallax__img"
                    src={slide.image}
                    alt={`Slide ${index + 1}`}
                  />
                  <div className="absolute h-full w-full text-white">
                    <div className="absolute top-4 left-4">
                      <p className="pt-5 text-3xl font-bold text-yellow-300 md:text-5xl md:font-bold lg:text-7xl lg:font-extrabold">
                        {slide.text}
                      </p>
                      <a
                        href="#"
                        className="mt-2 inline-block border border-black bg-white px-4 py-2 font-[family-name:var(--font-space-mono)] text-sm text-black hover:underline"
                      >
                        {slide.button}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="absolute top-4 left-4 z-10 flex gap-4 text-sm text-zinc-500">
          <button
            onClick={onPrevButtonClick}
            className="underline hover:text-zinc-200"
            disabled={prevBtnDisabled}
          >
            LEFT
          </button>
          <button
            onClick={onNextButtonClick}
            className="underline hover:text-zinc-200"
            disabled={nextBtnDisabled}
          >
            RIGHT
          </button>
        </div>

        <div
          className="absolute top-4 right-4 z-10 text-sm text-zinc-400"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          {selectedIndex + 1}/{scrollSnaps.length}
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
};

export default EmblaCarousel;
