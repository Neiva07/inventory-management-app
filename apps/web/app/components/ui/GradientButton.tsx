'use client';

import { Button } from '@tremor/react';
import { ReactNode } from 'react';

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export default function GradientButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false
}: GradientButtonProps) {
  const baseClasses = 'font-semibold transition-all duration-300 transform hover:scale-105 rounded-xl';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white',
    secondary: 'border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 bg-white',
    white: 'bg-white text-blue-600 hover:bg-gray-100'
  };

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <Button
      onClick={onClick}
      className={classes}
      disabled={disabled}
    >
      {children}
    </Button>
  );
} 