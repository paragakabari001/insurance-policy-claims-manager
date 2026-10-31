import React from 'react';
import { Toaster } from './ui/toaster';
import { toast, useToast } from './ui/use-toast';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  text: string;
}

interface ToastProps {
  toasts?: ToastMessage[];
  onDismiss?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = () => {
  return <Toaster />;
};

export { toast, useToast, Toaster };
