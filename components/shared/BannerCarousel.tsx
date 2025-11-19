import React, { useState, useCallback, useEffect } from 'react';
import { Banner } from '../../types';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons/Icons';

interface BannerCarouselProps {
    banners: Banner[];
    currentUser: { name: string };
    onCtaClick: (link: string) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, currentUser, onCtaClick }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
    }, [banners.length]);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
    };

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 7000); // Change slide every 7 seconds
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    if (!banners || banners.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-lg group">
            <div className="relative w-full h-full">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${banner.background} ${
                            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                        <div className="w-full h-full flex flex-col justify-center items-center text-center p-8 text-white relative">
                             <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full filter blur-xl"></div>
                             <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-white/10 rounded-full filter blur-xl"></div>
                            <h2 className="text-4xl font-bold drop-shadow-md z-10 transition-all duration-500" style={{ transform: index === currentIndex ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentIndex ? 1 : 0, transitionDelay: '200ms' }}>
                                {banner.title(currentUser.name)}
                            </h2>
                            <p className="mt-4 max-w-2xl text-lg text-white/90 drop-shadow-sm z-10 transition-all duration-500" style={{ transform: index === currentIndex ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentIndex ? 1 : 0, transitionDelay: '400ms' }}>
                                {banner.subtitle}
                            </p>
                            <button
                                onClick={() => onCtaClick(banner.ctaLink)}
                                className="mt-8 px-8 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold rounded-lg hover:bg-white/30 transition-all duration-300 z-10 transform hover:scale-105"
                                style={{ transform: index === currentIndex ? 'translateY(0)' : 'translateY(20px)', opacity: index === currentIndex ? 1 : 0, transitionDelay: '600ms' }}
                            >
                                {banner.ctaText}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute top-1/2 left-4 -translate-y-1/2 z-20 bg-black/30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous slide"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute top-1/2 right-4 -translate-y-1/2 z-20 bg-black/30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next slide"
            >
                <ArrowRightIcon className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
