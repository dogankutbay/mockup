/**
 * App Router Component
 * Handles routing and SEO for different phone model pages
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import App from './App';
import { SEOHead } from './components/SEOHead';
import { getRouteByPath, getModelFromRoute, DEFAULT_ROUTE } from './config/routes';
import { DEFAULT_PHONE_MODEL } from './config/phoneModels';

/**
 * Route wrapper component that handles SEO and model selection
 */
function RoutedApp() {
  const location = useLocation();
  const route = getRouteByPath(location.pathname) || DEFAULT_ROUTE;
  const model = getModelFromRoute(location.pathname) || DEFAULT_PHONE_MODEL;

  return (
    <>
      <SEOHead config={route} />
      <App initialModel={model} />
    </>
  );
}

/**
 * Main Router Component
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Specific model routes */}
        <Route path="/iphone-3d-mockup" element={<RoutedApp />} />
        <Route path="/android-3d-mockup" element={<RoutedApp />} />
        
        {/* Homepage - redirect to default or show default model */}
        <Route path="/" element={<RoutedApp />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

