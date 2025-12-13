/**
 * Route Configuration
 * Maps phone models to SEO-friendly URLs and metadata
 */

import type { PhoneModelConfig } from './phoneModels';
import { PHONE_MODELS } from './phoneModels';

export interface RouteConfig {
  path: string;
  modelId: string;
  title: string;
  description: string;
  keywords: string;
}

export const ROUTES: RouteConfig[] = [
  {
    path: '/iphone-3d-mockup',
    modelId: 'iphone-15-pro',
    title: 'iPhone 3D Mockup Generator - Create Professional iPhone Mockups',
    description: 'Create stunning 3D iPhone mockups and videos for your designs. Upload screenshots, customize colors, backgrounds, and camera angles. Perfect for presentations and marketing materials.',
    keywords: 'iphone mockup, 3d iphone, iphone mockup generator, iphone 15 pro mockup, apple mockup, phone mockup tool',
  },
  {
    path: '/android-3d-mockup',
    modelId: 'samsung-s21',
    title: 'Android 3D Mockup Generator - Create Professional Android Phone Mockups',
    description: 'Create stunning 3D Android phone mockups and videos for your designs. Upload screenshots, customize colors, backgrounds, and camera angles. Perfect for presentations and marketing materials.',
    keywords: 'android mockup, 3d android, android mockup generator, samsung mockup, android phone mockup, phone mockup tool',
  },
];

// Default route (homepage)
export const DEFAULT_ROUTE: RouteConfig = {
  path: '/',
  modelId: 'iphone-15-pro',
  title: '3D Mockup Generator - Create Professional Phone Mockups',
  description: 'Generate 3D mockups or videos for your designs with ease. Supports android and ios devices. Upload screenshots, customize colors, backgrounds, and camera angles.',
  keywords: 'mockup, phone, generator, 3d, don, kutbay, iphone mockup, android mockup',
};

/**
 * Get route config by path
 */
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return ROUTES.find(route => route.path === path) || (path === '/' ? DEFAULT_ROUTE : undefined);
};

/**
 * Get route config by model ID
 */
export const getRouteByModelId = (modelId: string): RouteConfig | undefined => {
  return ROUTES.find(route => route.modelId === modelId) || DEFAULT_ROUTE;
};

/**
 * Get phone model config from route
 */
export const getModelFromRoute = (path: string): PhoneModelConfig | undefined => {
  const route = getRouteByPath(path);
  if (!route) return undefined;
  
  return PHONE_MODELS.find(model => model.id === route.modelId);
};

