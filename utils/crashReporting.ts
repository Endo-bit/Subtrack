import { track } from '@/utils/analytics';

type ErrorUtilsLike = {
  getGlobalHandler: () => (error: Error, isFatal?: boolean) => void;
  setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
};

/** Reports otherwise-unhandled JS errors (outside React render) via PostHog. */
export function installGlobalErrorHandler(): void {
  const errorUtils = (globalThis as unknown as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
  if (!errorUtils) return;

  const defaultHandler = errorUtils.getGlobalHandler();
  errorUtils.setGlobalHandler((error, isFatal) => {
    track.appCrashed(error.message, isFatal ? 'fatal' : 'non-fatal');
    defaultHandler(error, isFatal);
  });
}
