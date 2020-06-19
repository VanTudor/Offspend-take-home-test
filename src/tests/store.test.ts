import { Store } from "../store";
import { DiscountOffer } from "../discountOffer";
import { simulate30DaysOldDiscounts } from "../simulate";

describe("Store", () => {
  it("should decrease the discount and expiresIn", () => {
    expect(new Store([new DiscountOffer("test", 2, 3)]).updateDiscounts()).toEqual(
      [new DiscountOffer("test", 1, 2)]
    );
  });

  it("should check the raw discount simulation is valid", async () => {
    const oldVersionOutput = JSON.stringify(require("./res/oldVersionOutput.json"));
    const simulationResString = JSON.stringify(simulate30DaysOldDiscounts()); // stringify it so we get rid of object naming (according to their class) when doing comparison  
    expect(simulationResString).toStrictEqual(oldVersionOutput);
  });

});
