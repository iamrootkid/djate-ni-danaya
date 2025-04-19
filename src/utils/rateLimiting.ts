
const rateLimits: Record<string, number> = {};

export const shouldRateLimit = (operation: string, timeWindow = 2000): boolean => {
  const now = Date.now();
  const lastCall = rateLimits[operation] || 0;
  
  if (now - lastCall < timeWindow) {
    return true;
  }
  
  rateLimits[operation] = now;
  return false;
};
