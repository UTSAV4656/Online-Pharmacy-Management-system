import React from 'react';
import { Heart, Shield, Plus } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'white' | 'compact';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  variant = 'default' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-lg', subtext: 'text-xs' };
      case 'lg':
        return { container: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-3xl', subtext: 'text-sm' };
      default:
        return { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-xl', subtext: 'text-sm' };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'white':
        return { bg: 'bg-white bg-opacity-20', text: 'text-white', subtext: 'text-white text-opacity-80' };
      case 'compact':
        return { bg: 'bg-teal-500', text: 'text-gray-900', subtext: 'text-gray-600' };
      default:
        return { 
          bg: 'bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 animate-gradient-slow', 
          text: 'text-gray-900', 
          subtext: 'text-gray-600' 
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <div className="flex items-center space-x-3 group cursor-pointer">
      {/* Logo Icon */}
      <div 
        className={`${sizeClasses.container} ${variantClasses.bg} rounded-2xl flex items-center justify-center relative shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
        
        <div className="relative">
          <Plus 
            className={`${sizeClasses.icon} text-white transform rotate-0 group-hover:rotate-90 transition-transform duration-500`} 
            strokeWidth={3} 
          />
          
          {/* Heart accent with pulse */}
          <Heart 
            className="absolute -top-1 -right-1 w-3 h-3 text-red-400 fill-current animate-pulse" 
            strokeWidth={0}
          />
          
          {/* Shield accent */}
          <Shield 
            className="absolute -bottom-1 -left-1 w-3 h-3 text-blue-300 opacity-60 group-hover:opacity-100 transition-opacity duration-300" 
            strokeWidth={2}
          />
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${sizeClasses.text} font-bold ${variantClasses.text} leading-tight`}>
            Pharma<span className="text-teal-600">Care</span>
          </h1>
          {size !== 'sm' && (
            <p className={`${sizeClasses.subtext} ${variantClasses.subtext} leading-tight opacity-80 group-hover:opacity-100 transition-opacity duration-500`}>
              Your Health, Our Priority
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
