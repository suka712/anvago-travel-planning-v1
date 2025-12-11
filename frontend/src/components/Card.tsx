import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  static?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className = '', hoverable = true, static: isStatic = false, children, ...props },
    ref
  ) => {
    const baseStyles =
      'bg-white rounded-xl border-2 border-black p-5 shadow-[6px_6px_0px_#000]';
    
    const hoverStyles = hoverable && !isStatic
      ? 'transition-all duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_#000]'
      : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

