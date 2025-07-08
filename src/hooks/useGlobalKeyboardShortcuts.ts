import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface GlobalKeyboardShortcutsOptions {
  onShowGlobalHelp: () => void;
}

/**
 * Pages that have their own help modals
 * These pages will handle F1 themselves instead of showing global help
 */
const PAGES_WITH_HELP = [
  '/products',
  '/products/create',
  '/products/', // Dynamic product pages
  '/orders',
  '/orders/create', 
  '/orders/', // Dynamic order pages
  '/inbound-orders',
  '/inbound-orders/create',
  '/inbound-orders/', // Dynamic inbound order pages
  '/supplier-bills',
  '/installment-payments',
  '/suppliers',
  '/suppliers/create',
  '/suppliers/', // Dynamic supplier pages
  '/customers',
  '/customers/create',
  '/customers/', // Dynamic customer pages
] as const;

/**
 * Helper function to detect if current page has its own help modal
 */
const hasPageSpecificHelp = (pathname: string): boolean => {
  return PAGES_WITH_HELP.some(pagePath => {
    // Handle dynamic routes (ending with /)
    if (pagePath.endsWith('/')) {
      return pathname.startsWith(pagePath);
    }
    // Handle exact matches
    return pathname === pagePath;
  });
};

export const useGlobalKeyboardShortcuts = (options: GlobalKeyboardShortcutsOptions) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onShowGlobalHelp } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    const isTextInput = (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    );

    // Allow global shortcuts (with Ctrl/Cmd) even in text inputs
    if (isTextInput && !(event.ctrlKey || event.metaKey)) {
      return;
    }

    // F1: Show global help (only if page doesn't have its own help)
    if (event.key === 'F1') {
      event.preventDefault();
      
      // Check if current page has its own help modal
      if (hasPageSpecificHelp(location.pathname)) {
        // Let the page-specific help handle F1
        return;
      }
      
      // Show global help for pages without their own help
      onShowGlobalHelp();
      return;
    }

    // Only handle global shortcuts with Ctrl/Cmd modifier
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }

    // Ctrl/Cmd + ,: Settings
    if (event.key === ',') {
      event.preventDefault();
      navigate('/settings');
      return;
    }

    // Ctrl/Cmd + H: Home
    if (event.key.toLowerCase() === 'h') {
      event.preventDefault();
      navigate('/');
      return;
    }

    // Ctrl/Cmd + 1-9: Navigation shortcuts
    const key = event.key;
    if (/^[1-9]$/.test(key)) {
      event.preventDefault();
      
      switch (key) {
        case '1':
          navigate('/products');
          break;
        case '2':
          navigate('/products/create');
          break;
        case '3':
          navigate('/orders');
          break;
        case '4':
          navigate('/orders/create');
          break;
        case '5':
          navigate('/inbound-orders');
          break;
        case '6':
          navigate('/inbound-orders/create');
          break;
        case '7':
          navigate('/supplier-bills');
          break;
        case '8':
          navigate('/installment-payments');
          break;
        case '9':
          // Reserved for future use
          break;
      }
    }
  }, [navigate, onShowGlobalHelp, location.pathname]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}; 