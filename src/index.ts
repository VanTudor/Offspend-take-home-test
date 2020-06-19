import { simulate30Days, writeSimulationResult } from "./simulate";

const simResult = simulate30Days();
writeSimulationResult(simResult);