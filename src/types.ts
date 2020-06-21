export enum EPartners {
  NATURALIA = 'Naturalia',
  ILEK = 'Ilek',
  VINTED = 'Vinted',
  BACKMARKET = 'Backmkarket',
}

export interface IDiscountOffer {
  partnerName: string;
  expiresIn: number;
  discountInPercent: number;
}

export interface IDiscountOfferWithModifiers extends IDiscountOffer {
  modifiers: TDiscountModifier[];
}

export type TPartial<T> = {
  [P in keyof T]?: T[P];
};

export interface IWrappedDiscountModifierParamsBase {
  amount: number;
  firstDay: number;
  lastDay: number;
}
export type IWrappedDiscountModifierParams = TPartial<IWrappedDiscountModifierParamsBase>;

export type TDiscountModifier = (discountOffer: IDiscountOffer) => number;
export type TWrappedModifier =  (params: IWrappedDiscountModifierParams) => TDiscountModifier;
export type TPartnerNameOrString =  string | keyof typeof EPartners;

export type TPartnerMap<T> = { [k in TPartnerNameOrString]: T};
export type TMap<T> = {[k: string]: T};
