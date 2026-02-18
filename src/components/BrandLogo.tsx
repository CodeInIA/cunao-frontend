import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  linkTo?: string;
  onClick?: () => void;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  linkTo = '/',
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const LogoComponent = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo de la marca */}
      <div className={`${sizeClasses[size]} relative shrink-0`}>
        <img 
          src="/logo-sin-letras.webp" 
          alt="Cuñadismo Ilustrado Logo" 
          className="w-full h-full object-contain filter drop-shadow-lg"
        />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-patriot font-bold text-white leading-tight`}>
            Cuñadismo
          </span>
          <span className={`${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'} font-patriot text-spanish-yellow leading-tight -mt-1`}>
            Ilustrado
          </span>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link 
        to={linkTo} 
        className="hover:opacity-80 transition-opacity"
        onClick={onClick}
      >
        <LogoComponent />
      </Link>
    );
  }

  return <LogoComponent />;
};

export default BrandLogo;
