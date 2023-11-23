import { useState } from "react";

export const useLoadingFunction = <T, Args>(func: (...args: Args[]) => Promise<T>): {
  fn: (...args: Args[]) => Promise<T>,
  isLoading: boolean,
} => {

  const [isLoading, setIsLoading] = useState(false);

  const fn = async () => {
    setIsLoading(true);
    try {
      return await func();
    } finally {
      setIsLoading(false);
    }
  }

  return { fn, isLoading };
}
