import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({});
  const resolver = useRef(null);

  const confirm = useCallback((opts) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolver.current) resolver.current(true);
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolver.current) resolver.current(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleCancel();
      } else if (e.key === 'Enter') {
        handleConfirm();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCancel, handleConfirm]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {isOpen && (
        <ConfirmDialog
          title={options.title || 'Confirm'}
          message={options.message || 'Are you sure?'}
          confirmText={options.confirmText || 'Confirm'}
          cancelText={options.cancelText || 'Cancel'}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
};
