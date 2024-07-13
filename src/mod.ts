export * from "./cmp";
export * from "./match";
export * from "./option";
export * from "./result";
export * from "./sync";
export * from "./range";
export * from "./boxed";
export * from "./clone";
export * from "./ex";
export * from "./panking";
export * from "./type-eq";
export * from "./ref";
export * from "./impl";

export interface Sized<T = null> {
  readonly $ref: [T];
}

export type Self<S> = { [K in keyof S as S[K] extends Function ? never : K]: S[K] }