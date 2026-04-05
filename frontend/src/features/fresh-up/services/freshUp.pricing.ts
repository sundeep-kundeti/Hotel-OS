import { FreshUpDurationHours, FreshUpPaxCount } from '../types/freshUp.types';

export function calculateFreshUpPrice(
  pax: FreshUpPaxCount,
  hours: FreshUpDurationHours
): number {
  if (pax === 1) {
    if (hours === 1) return 300;
    if (hours === 2) return 400;
    return 500;
  }

  if (hours === 1) return 300;
  if (hours === 2) return 450;
  return 600;
}
