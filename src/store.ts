import { DiscountOffer } from "./discounts/offer";
import { EPartners, TDiscountModifier, TPartnerMap } from "./types";
import { discountModifiers as dm } from "./discounts/types";

export class Store {
  public static partnerDiscountTypesMap: TPartnerMap<TDiscountModifier[]> = {
    [EPartners.NATURALIA]: [
      dm.increaseBy({ amount: 1, lastDay: 0 }),
      dm.increaseBy({ amount: 2, firstDay: -1 }),
    ],
    [EPartners.VINTED]: [
      dm.decreaseBy({ amount: 1, lastDay: 11 }),
      dm.increaseBy({ amount: 2, firstDay: 10, lastDay: 6 }),
      dm.increaseBy({ amount: 3, firstDay: 5, lastDay: 0 }),
      dm.setTo0({ firstDay: -1 }),
    ],
    [EPartners.BACKMARKET]: [
      dm.decreaseBy({ amount: 2, lastDay: 0 }),
      dm.decreaseBy({ amount: 4, firstDay: -1 }),
    ],
    [EPartners.ILEK]: [],
  };
  public static defaultDiscounts: TDiscountModifier[] = [
    dm.decreaseBy({ amount: 1, lastDay: 0 }),
    dm.decreaseBy({ amount: 2, firstDay: -1 })];
  // prolly would've made more sense to use an array, but it's more efficient to just
  // do nonExpiring[someKey] instead of filtering through an array
  public static nonExpiringOffers: TPartnerMap<boolean> = {
    [EPartners.ILEK]: true,
  };

  constructor(private discountOffers: DiscountOffer[] = []) {
    this.discountOffers = discountOffers;
  }

  public addDiscountOffers(discountOffers: DiscountOffer[]): void {
    this.discountOffers.push(...discountOffers);
  }

  public updateDiscounts(): DiscountOffer[] {
    this.discountOffers.forEach((discountOffer) => {
      if (!Store.nonExpiringOffers[discountOffer.partnerName]) {
        discountOffer.expiresIn --;
      }
      const customOfferDiscountModifiers = Store.partnerDiscountTypesMap[discountOffer.partnerName];
      // if the current discountOffer/market doesn't have a custom behaviour, just use the defaults
      const modifiersList = customOfferDiscountModifiers || Store.defaultDiscounts;
      modifiersList.forEach(discountModifier => discountModifier(discountOffer));
    });

    return this.discountOffers;
  }
}
