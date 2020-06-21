import {
  IDiscountOffer,
  TPartnerMap,
  TDiscountModifier,
  TWrappedModifier,
  IWrappedDiscountModifierParams,
  IWrappedDiscountModifierParamsBase,
} from "../types";
import { restrictions } from "./restrictions";

const DAILY_AMOUNT: number = 1;
function getParametersOrDefaults(params: IWrappedDiscountModifierParams): IWrappedDiscountModifierParamsBase {
  return {
    amount: typeof params.amount === 'undefined' ? DAILY_AMOUNT : params.amount,
    firstDay: typeof params.firstDay === 'undefined' ? +Infinity : params.firstDay,
    lastDay: typeof params.lastDay === 'undefined' ? -Infinity : params.lastDay,
  };
}
// we'll run these through a proxy, so we don't repeat the min/max rules on each of them, hence the name
const wrappedModifiersBase: TPartnerMap<TWrappedModifier> = {
  // these run on all partners, unless explicitely specified they don't
  decreaseBy: (params: IWrappedDiscountModifierParams) => (discountOffer: IDiscountOffer) => {
    const { amount, firstDay, lastDay } = getParametersOrDefaults(params);
    if (firstDay >= discountOffer.expiresIn && lastDay <= discountOffer.expiresIn) {
      return discountOffer.discountInPercent - amount;
    }
    return discountOffer.discountInPercent;
  },
  increaseBy: (params: IWrappedDiscountModifierParams) => (discountOffer: IDiscountOffer) => {
    const { amount, firstDay, lastDay } = getParametersOrDefaults(params);
    if (firstDay >= discountOffer.expiresIn && lastDay <= discountOffer.expiresIn) {
      return discountOffer.discountInPercent + amount;
    }
    return discountOffer.discountInPercent;
  },
  setTo0: (params: IWrappedDiscountModifierParams) => (discountOffer: IDiscountOffer) => {
    const { firstDay, lastDay } = getParametersOrDefaults(params);
    if (firstDay >= discountOffer.expiresIn && lastDay <= discountOffer.expiresIn) {
      return 0;
    }
    return discountOffer.discountInPercent;
  },
};

/**
 * This acts as a central place to impose global restrictions on the values that modifiers return.
 * For now, it's used to impose min and max value restriction, but we can easily add more restrictions in
 * the deepest proxy.
 * It intercept all calls to the object containing wrapped modifiers, so that we can correct their returning values.
 */
const minMaxProxyHandler = {
  // intercept all calls to our object containing wrapped modifiers, so that we add proxies to them
  get(discountModifierMap: TPartnerMap<TWrappedModifier>, modifierName: string) {
    if (modifierName in discountModifierMap) {
      // intercept all calls to the wrapped function, so we can put a proxy before the returned function
      return new Proxy(discountModifierMap[modifierName], {
        apply(
          target: TWrappedModifier,
          thisArg: unknown,
          wrappedDiscountModifierParams: [IWrappedDiscountModifierParams]) {
            // wrapped function's proxy
          return new Proxy(target.apply(thisArg, wrappedDiscountModifierParams), {
            apply(target: TDiscountModifier, thisArg: unknown, discountOffer: [IDiscountOffer]) {
              const computedDiscount = target.apply(thisArg, discountOffer);
              discountOffer[0].discountInPercent = restrictions.reduce(
                (prevValue, restrict) => restrict(prevValue), computedDiscount);
              return discountOffer[0].discountInPercent;
            },
          });
        },
      });
    }
    throw new Error(`Tried to call a non-existing discount modifier. Recevied value: ${modifierName}. Available discount modifiers: ${Object.keys(discountModifierMap)}.`);
  },
};

export const discountModifiers: TPartnerMap<TWrappedModifier> = new Proxy(wrappedModifiersBase, minMaxProxyHandler);
