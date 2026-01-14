"use client"

import React from 'react';

interface PWAProviderProps {
  children: React.ReactNode;
}

const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  // You can add PWA-related logic here, e.g., service worker registration
  // For now, it simply renders its children.
  return <>{children}</>;
};

export default PWAProvider;