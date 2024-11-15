import React, { useEffect, useState, useMemo } from 'react';

export default function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to calculate responsive size based on screen width
  const getResponsiveSize = (baseSize: number) => {
    const breakpoint = 768; // mobile breakpoint
    if (windowWidth <= breakpoint) {
      return baseSize * 0.5; // 50% of original size for mobile
    } else if (windowWidth <= 1024) {
      return baseSize * 0.75; // 75% of original size for tablets/small laptops
    }
    return baseSize; // original size for large screens
  };

  const circles = useMemo(() => {
    return [
      {
        label: 'Circle 1', // Closest circle
        baseSize: 750,
        initialLeft: -15,
        initialTop: 25,
        speed: 0.75,
        color: 'rgba(139, 115, 85, 1)',
        opacity: 0.3,
        depth: 1,
      },
      {
        label: 'Circle 2',
        baseSize: 400,
        initialLeft: 70,
        initialTop: 600,
        speed: 0.3,
        color: 'rgba(139, 115, 85, 0.9)',
        opacity: 0.9,
        depth: 1.5,
      },
      {
        label: 'Circle 3',
        baseSize: 250,
        initialLeft: 40,
        initialTop: 900,
        speed: 0.2,
        color: 'rgba(92, 75, 55, 0.8)',
        opacity: 0.8,
        depth: 2,
      },
      {
        label: 'Circle 4',
        baseSize: 160,
        initialLeft: 20,
        initialTop: 1400,
        speed: 0.05,
        color: 'rgba(92, 75, 55, 0.7)',
        opacity: 0.7,
        depth: 2.5,
      },
      {
        label: 'Circle 5',
        baseSize: 180,
        initialLeft: 80,
        initialTop: 1500,
        speed: 0.1,
        color: 'rgba(44, 24, 16, 0.6)',
        opacity: 0.6,
        depth: 3,
      },
      {
        label: 'Circle 6',
        baseSize: 160,
        initialLeft: 50,
        initialTop: 1800,
        speed: 0.05,
        color: 'rgba(44, 24, 16, 0.5)',
        opacity: 0.5,
        depth: 3.5,
      },
      {
        label: 'Circle 7', // Farthest circle
        baseSize: 1140,
        initialLeft: 65,
        initialTop: 2000,
        speed: 0.2,
        color: 'rgba(44, 24, 16, 0.4)',
        opacity: 0.4,
        depth: 4,
      },
    ];
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    const handleResize = () => {
      requestAnimationFrame(() => {
        setWindowWidth(window.innerWidth);
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="absolute left-0 top-0 z-0 overflow-hidden pointer-events-none"
      style={{ width: '100%', height: `${document.documentElement.scrollHeight}px` }}
    >
      {circles.map((circle, i) => (
        <div
          key={i}
          className="absolute rounded-full will-change-transform"
          style={{
            width: `${getResponsiveSize(circle.baseSize)}px`,
            height: `${getResponsiveSize(circle.baseSize)}px`,
            left: `${circle.initialLeft}%`,
            top: `${circle.initialTop}px`,
            backgroundColor: circle.color,
            opacity: circle.opacity,
            filter: `blur(${(circle.depth * 2) + 2}px)`,
            transform: `translate3d(
              0px,
              ${scrollY * circle.speed}px,
              0
            )`,
            transition: 'transform 0.15s ease-out',
            zIndex: Math.floor((1 - circle.depth) * 10),
          }}
        />
      ))}
    </div>
  );
}