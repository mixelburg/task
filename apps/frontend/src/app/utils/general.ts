import { MouseEventHandler } from "react";

export const stopPropagationWrapper = (fn: () => void): MouseEventHandler => (e: any) => {
  e.stopPropagation();
  fn();
};
