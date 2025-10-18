/**
 * Helper to get the correct API URL for both client and server-side requests
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Client-side: use relative URLs
  if (typeof window !== 'undefined') {
    return cleanPath;
  }
  
  // Server-side: use absolute URLs
  const baseUrl = 
    process.env.NEXT_PUBLIC_VERCEL_URL 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
  
  return `${baseUrl}${cleanPath}`;
}

