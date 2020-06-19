import * as fs from "fs";

import { Store,  } from "./store";
import { DiscountOffer } from "./discountOffer";



export function simulate30DaysOldDiscounts(): DiscountOffer[][] {
  const discountOffers = [
    new DiscountOffer("Velib", 20, 30),
    new DiscountOffer("Naturalia", 10, 5),
    new DiscountOffer("Vinted", 5, 40),
    new DiscountOffer("Ilek", 15, 40)
  ];
  
  const store = new Store(discountOffers);

  const log: DiscountOffer[][] = [];

  for (let elapsedDays = 0; elapsedDays < 30; elapsedDays++) {
    log.push(JSON.parse(JSON.stringify(store.updateDiscounts()))); // poor man's reference breaker
  }
  return log;
}

export async function writeSimulationResult(simResult: DiscountOffer[][]): Promise<void> {
  /* tslint-disable no-console */
  fs.writeFile("output.txt", JSON.stringify(simResult), err => {
    if (err) {
      console.log("error");
      Promise.reject("Sum tin wong");
    } else {
      console.log("success");
      Promise.resolve();
    }
  });
  /* eslint-enable no-console */
}
