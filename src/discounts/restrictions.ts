export const MAXIMUM_DISCOUNT: number = 50;
export const MINIMUM_DISCOUNT: number = 0;

function minimum(value: number): number {
  return Math.max(value, MINIMUM_DISCOUNT);
}

function maximum(value: number): number {
  return Math.min(value, MAXIMUM_DISCOUNT);
}

export const restrictions = [
  minimum,
  maximum,
];
