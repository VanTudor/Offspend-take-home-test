import { IDiscountOffer } from "./types";

// have it implement a separate interface in Types.ts so we don't run into circular imports later
export class DiscountOffer implements IDiscountOffer {
  public partnerName: string;
  public expiresIn: number;
  public discountInPercent: number;

  constructor(partnerName: string, expiresIn: number, discountRateInPercent: number) {
    this.partnerName = partnerName;
    this.expiresIn = expiresIn;
    this.discountInPercent = discountRateInPercent;

    if (discountRateInPercent > 50) {
      throw new Error(`Cannot create new discount offer. discountRateInPercent should be lower than 50. ${this.getErrorDumpConstructorValues()}`)
    }
  }

  private getErrorDumpConstructorValues(): string {
    return `partnerName: ${this.partnerName}, expiresIn: ${this.expiresIn}, discountRateInPercent: ${this.discountInPercent}`;
  };
}
