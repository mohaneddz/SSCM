// src/components/bento-card.tsx
import React from "react";

interface BentoCardProps {
  Icon: React.ElementType;
  name: string;
  description: string;
  href: string;
  cta: string;
  className?: string;
  background?: React.ReactNode;
}

const BentoCard: React.FC<BentoCardProps> = ({
  Icon,
  name,
  description,
  href,
  cta,
  className = "",
  background,
}) => {
  return (
    <a
      href={href}
      className={`relative flex flex-col justify-between p-6 border rounded-xl shadow-sm hover:shadow-md transition bg-white ${className}`}
    >
      {background && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">{background}</div>
      )}
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-bold">{name}</h3>
      </div>
      <p className="text-sm text-gray-600 mt-2">{description}</p>
      <span className="mt-4 text-sm text-green-700 font-medium">{cta}</span>
    </a>
  );
};

export default BentoCard;
