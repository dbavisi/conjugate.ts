/*
** conjugate.ts
** A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
*/

/**
 * Generic class constructor interface.
 * @template IType - The type of the instance created by the class.
 * @template IArgs - The types of the constructor arguments.
 */
interface IClass<
    IType extends unknown,
    IArgs extends unknown[] = never[]
> {
    new(...args: IArgs): IType;
}

/**
 * Merge two types, preferring properties from A over B.
 * @template A - The first type.
 * @template B - The second type.
 */
type IMix<A extends unknown, B extends unknown> =
    // Properties: Prefer A, else B, else never
    { [K in keyof (A & B)]: (K extends keyof A
        ? A[K]
        : (K extends keyof B
            ? B[K]
            : never)) }
    // Call signature: prefer A, else B, else none
    & (A extends (...args: infer P) => infer R
        ? (...args: P) => R
        : (B extends (...args: infer P) => infer R
            ? (...args: P) => R
            : unknown))
    // Construct signature: prefer A, else B, else none
    & (A extends new (...args: infer P) => infer R
        ? new (...args: P) => R
        : (B extends new (...args: infer P) => infer R
            ? new (...args: P) => R
            : unknown));

/**
 * Recursively resolve the combined instance type for a tuple of classes.
 * @template CTypes - The tuple of classes.
 */
type IResolve<CTypes extends unknown[]> =
    CTypes extends [infer CBase, ...infer CRest] ? (
        CBase extends IClass<infer Base> ? (
            CRest extends [infer _CSecond, ...infer _CRest] ? (
                IMix<Base, IResolve<CRest>>
            ) : Base
        ) : never
    ) : null;

/**
 * Interface for the conjugated type, for future extensibility.
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
