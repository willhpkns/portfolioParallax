import React, { useEffect, useState, useMemo } from 'react';

export default function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const getResponsiveSize = (baseSize: number) => {
    const breakpoint = 768;
    if (windowWidth <= breakpoint) {
      return baseSize * 0.5;
    } else if (windowWidth <= 1024) {
      return baseSize * 0.75;
    }
    return baseSize;
  };

  const circles = useMemo(() => {
    return [
      {
        label: 'Foreground Circle',
        baseSize: 1100,
        initialLeft: -30,
        initialTop: -600,
        speed: 0.4,
        color: 'rgba(139, 115, 85, 1)',
        opacity: 0.3,
        depth: 1,
      },
      {
        label: 'Mid-layer Circle 1',
        baseSize: 450,
        initialLeft: 75,
        initialTop: 500,
        speed: 0.25,
        color: 'rgba(139, 115, 85, 0.9)',
        opacity: 0.9,
        depth: 1.5,
      },
      {
        label: 'Mid-layer Circle 2',
        baseSize: 350,
        initialLeft: 10,
        initialTop: 800,
        speed: 0.2,
        color: 'rgba(92, 75, 55, 0.8)',
        opacity: 0.8,
        depth: 2,
      },
      {
        label: 'Mid-layer Circle 3',
        baseSize: 300,
        initialLeft: 60,
        initialTop: 1200,
        speed: 0.15,
        color: 'rgba(92, 75, 55, 0.7)',
        opacity: 0.7,
        depth: 2.5,
      },
      {
        label: 'Background Circle 1',
        baseSize: 800,
        initialLeft: -20,
        initialTop: 1500,
        speed: 0.1,
        color: 'rgba(44, 24, 16, 0.6)',
        opacity: 0.6,
        depth: 3,
      },
      {
        label: 'Background Circle 2',
        baseSize: 700,
        initialLeft: 50,
        initialTop: 1800,
        speed: 0.05,
        color: 'rgba(44, 24, 16, 0.5)',
        opacity: 0.5,
        depth: 3.5,
      },
      {
        label: 'Far Background Circle',
        baseSize: 900,
        initialLeft: 70,
        initialTop: 2200,
        speed: 0.02,
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