import { useAtom, atom } from "jotai";
import { atomWithStorage, RESET } from "jotai/utils";

const pricingPlanAtom = atomWithStorage("pricing_plan", "");
const updatePricingPlanAtom = atom(
  get => get(pricingPlanAtom),
  (_get, set, newPlan: string) => set(pricingPlanAtom, newPlan)
);
export const usePricingPlanAtom = () => useAtom(updatePricingPlanAtom);
export const useDeletePricingPlanFromStorage = () => {
  const [, setPricingPlanAtom] = useAtom(pricingPlanAtom);
  return setPricingPlanAtom(RESET);
};
