import { useEffect } from 'react';

interface UseKeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onEnter,
  onEscape,
  onArrowUp,
  onArrowDown,
  enabled = true,
}: UseKeyboardNavigationOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && onEnter) {
        event.preventDefault();
        onEnter();
      } else if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
      } else if (event.key === 'ArrowUp' && onArrowUp) {
        event.preventDefault();
        onArrowUp();
      } else if (event.key === 'ArrowDown' && onArrowDown) {
        event.preventDefault();
        onArrowDown();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onEscape, onArrowUp, onArrowDown, enabled]);
}

