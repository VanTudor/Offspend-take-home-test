export class DiscountOffer {
  public partnerName: string;
  public expiresIn: number;
  public discountInPercent: number;

  constructor(partnerName: string, expiresIn: number, discountRateInPercent: number) {
    this.partnerName = partnerName;
    this.expiresIn = expiresIn;
    this.discountInPercent = discountRateInPercent;
  }
}
