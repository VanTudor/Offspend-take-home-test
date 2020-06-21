import { Store } from "../store";
import { DiscountOffer } from "../discountOffer";
import { simulate30DaysOldDiscounts } from "../simulate";
import { EPartners } from "../types";

let store: Store;
let standardOffer: DiscountOffer;
let customOffers: DiscountOffer[];

function getOffersAfterDays(daysCount: number, store: Store): DiscountOffer[] {
  let res: DiscountOffer[] = [];
  for(let i = 0; i < daysCount; i++) {
    res = store.updateDiscounts();
  }
  return res;
}

describe("Store", () => {
  beforeEach(() => {
    store = new Store();
    standardOffer = new DiscountOffer("test", 1, 2);
    customOffers = [
      new DiscountOffer(EPartners.ILEK, 2, 3)
    ]
  });
  it("should test the default decrease of discount and expiresIn", () => {
    store.addDiscountOffers([standardOffer]);
    const offersBeforeExpiration = store.updateDiscounts();
    const expectedOffersBeforeExpiration = [new DiscountOffer("test", 0, 1)];
    expect(offersBeforeExpiration).toEqual(expectedOffersBeforeExpiration);

    // after expiration
    const offersAfterExpiration = store.updateDiscounts();
    const expectedOffersAfterExpiration = [new DiscountOffer("test", -1, 0)];
    expect(offersAfterExpiration).toEqual(expectedOffersAfterExpiration);
  });

  it("should test the maximum discount rate", () => {
    let discountTooBigErrThrown = false;
    try {
      store.addDiscountOffers([new DiscountOffer("test", 2, 52)]);
    } catch(err) {
      discountTooBigErrThrown = true;
    }
    expect(discountTooBigErrThrown).toEqual(true);
    
    const increasingOffer = new DiscountOffer(EPartners.NATURALIA, 0, 50);
    store.addDiscountOffers([increasingOffer]);
    const offersDiscountPossiblyOverMax = store.updateDiscounts();
    const offerDiscountEqualToMax = new DiscountOffer(EPartners.NATURALIA, -1, 50);
    expect(offersDiscountPossiblyOverMax).toEqual([offerDiscountEqualToMax]);
  });

  it("should test that custom discounts percentages don't go below minimum or above maximum", () => {
    const increasingOffers: DiscountOffer[] = [
      new DiscountOffer(EPartners.NATURALIA, 50, 49),
      new DiscountOffer(EPartners.VINTED, 10, 49)
    ];

    const decreasingOffers: DiscountOffer[] = [
      new DiscountOffer(EPartners.VINTED, 50, 1),
      new DiscountOffer(EPartners.BACKMARKET, 50, 1)
    ];

    const increasingOffersUnderMax: DiscountOffer[] = [
      new DiscountOffer(EPartners.NATURALIA, 47, 50),
      new DiscountOffer(EPartners.VINTED, 7, 50)
    ];

    const decreasingOffersAboveMin: DiscountOffer[] = [
      new DiscountOffer(EPartners.VINTED, 47, 0),
      new DiscountOffer(EPartners.BACKMARKET, 47, 0)
    ]

    store.addDiscountOffers([...increasingOffers, ...decreasingOffers]);
    const offersPossibleBeyondLimits = getOffersAfterDays(3, store);
    expect(offersPossibleBeyondLimits).toEqual([...increasingOffersUnderMax, ...decreasingOffersAboveMin]);
  });

  it("should test Naturalia's custom discount", () => {
    store.addDiscountOffers([new DiscountOffer(EPartners.NATURALIA, 2, 3)]);
    const offersAfterUpdate = store.updateDiscounts();
    const expectedOffersAfterUpdate = [new DiscountOffer(EPartners.NATURALIA, 1, 4)];
    expect(expectedOffersAfterUpdate).toEqual(offersAfterUpdate);

    const offersAfterExpiration = getOffersAfterDays(2, store);
    const expectedOffersAfterExpiration = [new DiscountOffer(EPartners.NATURALIA, -1, 7)];
    expect(offersAfterExpiration).toEqual(expectedOffersAfterExpiration);
  });

  it("should test Ilek's custom discount", () => {
    const ilekInitialOffer = new DiscountOffer(EPartners.ILEK, 1, 30);
    const ilekOffer = new DiscountOffer(EPartners.ILEK, 1, 30);
    store.addDiscountOffers([ilekOffer]);
    const offersAfterSomeDays = getOffersAfterDays(20, store);
    expect(offersAfterSomeDays).toEqual([ilekInitialOffer]);
  });

  it("sould test Vinted's custom discount", () => {
    const vintedOffer = new DiscountOffer(EPartners.VINTED, 13, 2);
    store.addDiscountOffers([vintedOffer]);
    const offersAfterFirstInterval = getOffersAfterDays(2, store);

    // decreases by 1 until there're 10 days left
    const expectedOfferAfterFirstInterval = new DiscountOffer(EPartners.VINTED, 11, 0);
    expect(offersAfterFirstInterval).toEqual([expectedOfferAfterFirstInterval]);

    // increase by 2 between 10 days, until the 6th day inclusive
    const offersAfterSecondInterval = getOffersAfterDays(5, store);
    const expectedOfferAfterSecondInterval = new DiscountOffer(EPartners.VINTED, 6, 10);
    expect(offersAfterSecondInterval).toEqual([expectedOfferAfterSecondInterval]);
  
    const offersAfterThirdInterval = getOffersAfterDays(6, store);
    const expectedOfferAfterThirdInterval = new DiscountOffer(EPartners.VINTED, 0, 28);
    expect(offersAfterThirdInterval).toEqual([expectedOfferAfterThirdInterval]);

    // drops to 0 after expiration
    const offersAfterExpiration = store.updateDiscounts();
    const expectedOfferAfterExpiration = new DiscountOffer(EPartners.VINTED, -1, 0);
    expect(offersAfterExpiration).toEqual([expectedOfferAfterExpiration]);

  });

  it("should check the raw discount simulation is valid", async () => {
    const oldVersionOutput = JSON.stringify(require("./res/oldVersionOutput.json"));
    const simulationResString = JSON.stringify(simulate30DaysOldDiscounts()); // stringify it so we get rid of object naming (according to their class) when doing comparison  
    expect(simulationResString).toStrictEqual(oldVersionOutput);
  });

});
