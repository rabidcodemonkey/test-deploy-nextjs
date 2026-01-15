// Base path for API routes and navigation
export const basePath = '/test-nextjs';

// Helper function to construct API URLs with base path
export function apiUrl(path: string): string {
  return `${basePath}${path}`;
}
