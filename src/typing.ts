/*
** conjugate.ts
** A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
*/

/**
 * Generic class constructor interface.
 */
interface IClass<
    T extends unknown,
    IArgs extends unknown[] = never[]
> {
    new(...args: IArgs): T;
}

/**
 * Tuple of class constructors for mixins.
 */
type IMixins<T extends unknown[]> = {
    [K in keyof T]: IClass<T[K]>;
}

/**
 * Merge two types, preferring properties from A over B.
 */
type IMix<A extends unknown, B extends unknown> = {
    [K in keyof (A & B)]: K extends keyof A ? A[K] : (
        K extends keyof B ? B[K] : never
    )
}

/**
 * Recursively resolve the combined instance type for a tuple of classes.
 */
type IResolve<C extends unknown[]> =
    C extends [infer CBase, ...infer CRest] ? (
        CBase extends IClass<infer Base> ? (
            CRest extends [infer _CSecond, ...infer _CRest] ? (
                IMix<Base, IResolve<CRest>>
            ) : Base
        ) : never
    ) : null;


/**
 * Interface for the conjugated class, for future extensibility.
 */
interface IConjugateBase { }

export {
    IClass,
    IMixins,
    IMix,
    IResolve,
    IConjugateBase,
};
