import React, { useState, useRef, MouseEvent } from 'react';

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  maxRotate?: number; // Maximum rotation in degrees
}

export default function Card3DTilt({ children, className = '', maxRotate = 10 }: Card3DTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    
    // Width and height of the card
    const w = rect.width;
    const h = rect.height;
    
    // Mouse coordinates relative to the card's top-left corner
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize coordinates: -0.5 to 0.5
    const x = mouseX / w - 0.5;
    const y = mouseY / h - 0.5;
    
    // Calculate rotation: mouse movements vertically tilt X-axis, mouse movements horizontally tilt Y-axis
    // Multiplying x by 2 * maxRotate gives rotation, we flip signs for intuitive movement
    const rotY = (x * 2 * maxRotate).toFixed(2);
    const rotX = (-y * 2 * maxRotate).toFixed(2);

    setTransformStyle(`perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    // Reset to flat
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.15s ease',
        transformStyle: 'preserve-3d',
      }}
      className={`relative will-change-transform ${className}`}
    >
      {/* 3D Inner translation for children */}
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  );
}
