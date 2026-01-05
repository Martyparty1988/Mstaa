import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "rounded-2xl font-bold transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) active:scale-[0.97] flex items-center justify-center relative overflow-hidden";
  
  const variants = {
    primary: "bg-solar-gradient text-white shadow-[0_4px_16px_rgba(102,126,234,0.4),0_0_40px_rgba(118,75,162,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] border border-white/30 backdrop-blur-md",
    secondary: "bg-white/10 text-white border border-white/20 backdrop-blur-md active:bg-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.2)]",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-900/20 border border-white/20",
    ghost: "bg-transparent text-white/60 hover:text-white active:bg-white/5",
  };

  const sizes = {
    sm: "h-10 px-4 text-sm tracking-wide",
    md: "h-14 px-6 text-base tracking-wide", 
    lg: "h-16 px-8 text-lg tracking-wider",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {/* Glossy Reflection */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/10 pointer-events-none" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};