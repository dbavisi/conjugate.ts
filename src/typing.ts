/*
** conjugate.ts
** A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
*/

/**
 * Generic class constructor interface.
 * @template T - The type of the instance created by the class.
 * @template IArgs - The types of the constructor arguments.
 */
interface IClass<
    T extends unknown,
    IArgs extends unknown[] = never[]
> {
    new(...args: IArgs): T;
}

/**
 * Merge two types, preferring properties from A over B.
 * @template A - The first type.
 * @template B - The second type.
 */
type IMix<A extends unknown, B extends unknown> = {
    [K in keyof (A & B)]: K extends keyof A ? A[K] : (
        K extends keyof B ? B[K] : never
    )
}

/**
 * Recursively expand a type to resolve nested structures.
 * This is useful for type hints during development and debugging.
 * @template T - The type to expand.
 */
type IExpand<T> = T extends infer O ? {
    [K in keyof O]: IExpand<O[K]>;
} : never;

/**
 * Recursively resolve the combined instance type for a tuple of classes.
 * @template C - The tuple of classes.
 */
type IResolve<C extends unknown[]> =
    C extends [infer CBase, ...infer CRest] ? (
        CBase extends IClass<infer Base> ? (
            CRest extends [infer _CSecond, ...infer _CRest] ? (
                IExpand<IMix<Base, IResolve<CRest>>>
            ) : Base
        ) : never
    ) : null;

/**
 * Interface for the conjugated class, for future extensibility.
 */
interface IConjugateBase { }

/**
 * Enum for property operation types in proxy traps.
 */
const enum OpType {
    Has = 'has',
    Get = 'get',
    Set = 'set',
}

export {
    IClass,
    IMix,
    IResolve,
    IConjugateBase,
    OpType,
};
