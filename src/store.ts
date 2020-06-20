import { DiscountOffer } from "./discountOffer";
import { EPartners, TDiscountModifier, TPartnerMap } from "./types";
import { discountModifiers as dm } from "./discountTypes";

export class Store {
  public static partnerDiscountTypesMap: TPartnerMap<TDiscountModifier[]> = {
    [EPartners.NATURALIA]: [
      dm.increaseBy({amount: 1, endLeftDay: 0 }),
      dm.increaseBy({amount: 2, startLeftDay: -1 })
    ],
    [EPartners.VINTED]: [
      dm.decreaseBy({amount: 1, endLeftDay: 11 }),
      dm.increaseBy({amount: 2, startLeftDay: 10, endLeftDay: 6 }),
      dm.increaseBy({amount: 3, startLeftDay: 5, endLeftDay: 0 }),
      dm.setTo0({ startLeftDay: -1 })
    ],
    [EPartners.BACKMARKET]: [
      dm.decreaseBy({amount: 2, endLeftDay: 0 }),
      dm.decreaseBy({amount: 4, startLeftDay: -1 }),
    ],
    [EPartners.ILEK]: [],
  };
  public static defaultDiscounts: TDiscountModifier[] = [
    dm.decreaseBy({amount: 1, endLeftDay: 0 }),
    dm.decreaseBy({amount: 2, startLeftDay: -1 })];
  // prolly would've made more sense to use an array, but it's more efficient to ust do nonExpiring
  public static nonExpiringOffers: TPartnerMap<boolean> = {
    [EPartners.ILEK]: true
  };

  constructor(private discountOffers: DiscountOffer[] = []) {
    this.discountOffers = discountOffers;
  }

  public updateDiscounts(): DiscountOffer[] {
    this.discountOffers.forEach(discountOffer => {
      if (!Store.nonExpiringOffers[discountOffer.partnerName]) {
        discountOffer.expiresIn --;
      }
      const customOfferDiscountModifiers = Store.partnerDiscountTypesMap[discountOffer.partnerName];
      (customOfferDiscountModifiers || Store.defaultDiscounts).forEach(discountModifier => { 
        const res = discountModifier(discountOffer);
        return res;
      } );
    });

    return this.discountOffers;
  }
}
