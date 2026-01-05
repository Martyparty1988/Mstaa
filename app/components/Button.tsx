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
  const baseStyles = "rounded-2xl font-bold transition-all duration-200 active:scale-[0.97] flex items-center justify-center relative overflow-hidden";
  
  const variants = {
    primary: "bg-solar-gradient text-white shadow-glow border border-white/10",
    secondary: "bg-white/5 text-white border border-white/10 backdrop-blur-md active:bg-white/10",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-900/20",
    ghost: "bg-transparent text-white/60 hover:text-white active:bg-white/5",
  };

  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-14 px-6 text-base tracking-wide", 
    lg: "h-16 px-8 text-lg tracking-wide",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {/* Shine effect overlay */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      )}
      {variant === 'primary' && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30 pointer-events-none" />
      )}
      
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};