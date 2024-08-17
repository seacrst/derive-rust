import { eqType } from "./eq-type";
import { match, matches } from "./match";

export * from "./match";
export * from "./option";
export * from "./result";
export * from "./sync";
export * from "./range";
export * from "./boxed";
export * from "./clone";
export * from "./panking";
export * from "./eq-type";
export * from "./impl";

export type Self<S> = {
  [K in keyof S as S[K] extends Function ? never : K]: S[K];
};