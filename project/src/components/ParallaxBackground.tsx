import React, { useEffect, useState, useMemo } from 'react';

export default function ParallaxBackground() {
  const [scrollY, setScrollY] = useState(0);

  const circles = useMemo(() => {
    return [
      {
        label: 'Circle 1', // Closest circle
        size: 750,
        initialLeft: -15,
        initialTop: 25, // Changed to be a percentage of viewport height
        speed: 0.75,
        color: 'rgba(139, 115, 85, 1)',
        opacity: 0.3,
        depth: 1,
      },
      {
        label: 'Circle 2',
        size: 400,
        initialLeft: 70,
        initialTop: 600,
        speed: 0.3,
        color: 'rgba(139, 115, 85, 0.9)',
        opacity: 0.9,
        depth: 1.5,
      },
      {
        label: 'Circle 3',
        size: 250,
        initialLeft: 40,
        initialTop: 900,
        speed: 0.2,
        color: 'rgba(92, 75, 55, 0.8)',
        opacity: 0.8,
        depth: 2,
      },
      {
        label: 'Circle 4',
        size: 160,
        initialLeft: 20,
        initialTop: 1400,
        speed: 0.05,
        color: 'rgba(92, 75, 55, 0.7)',
        opacity: 0.7,
        depth: 2.5,
      },
      {
        label: 'Circle 5',
        size: 180,
        initialLeft: 80,
        initialTop: 1500,
        speed: 0.1,
        color: 'rgba(44, 24, 16, 0.6)',
        opacity: 0.6,
        depth: 3,
      },
      {
        label: 'Circle 6',
        size: 160,
        initialLeft: 50,
        initialTop: 1800,
        speed: 0.05,
        color: 'rgba(44, 24, 16, 0.5)',
        opacity: 0.5,
        depth: 3.5,
      },
      {
        label: 'Circle 7', // Farthest circle
        size: 140,
        initialLeft: 65,
        initialTop: 2100,
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
            width: `${circle.size}px`,
            height: `${circle.size}px`,
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