import { simulate30DaysOldDiscounts, writeSimulationResult } from "./simulate";

const simResult = simulate30DaysOldDiscounts();
writeSimulationResult(simResult);