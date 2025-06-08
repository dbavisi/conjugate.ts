/*
** conjugate.ts
** A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
*/

import {
    IClass,
    IMixins,
    IResolve,
    IConjugateBase,
} from './typing.js';

/**
 * Base class for all conjugated classes.
 * Used for type branding and future extensibility.
 */
class ConjugateBase implements IConjugateBase { }

/**
 * Helper function to bind a value to an instance.
 * @param value - The value to bind, which can be a function or any other type.
 * @param instance - The instance to which the value should be bound.
 * @template V - The type of the value.
 * @template T - The type of the instance.
 * @returns The bound value if it's a function, or the original value otherwise.
 */
function _bounded<
    V extends unknown,
    T extends unknown,
>(value: V, instance: T): V {
    return (typeof value === 'function') ? value.bind(instance) : value;
}

/**
 * Delegates a property from an owner object to a target object.
 * @param prop - The property key to delegate.
 * @param target - The target object where the property will be defined.
 * @param owner - The owner object from which the property will be delegated.
 * @template K - The type of the property key.
 * @template T - The type of the target object.
 * @template O - The type of the owner object.
 */
function _delegate<
    K extends string | symbol,
    T extends unknown & Record<K, unknown>,
    O extends unknown & Record<K, unknown>,
>(prop: K, target: T, owner: O) {
    Object.defineProperty(target, prop, {
        get: () => _bounded(owner[prop], owner),
        set: (value: O[K]) => owner[prop] = value,
        enumerable: true,
        configurable: true,
    });
}

/**
 * A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
 * @template CBase - The base class type.
 * @template CMixins - Tuple of mixin class types.
 * @param Base - The primary base class.
 * @param Mixins - Additional mixin classes.
 * @returns A new class combining all behaviors.
 */
function Conjugate<
    CBase extends IClass<unknown>,
    CMixins extends IMixins<unknown[]>
>(
    Base: CBase,
    ...Mixins: CMixins
) {
    type IArgsBase = ConstructorParameters<CBase>;
    type IArgsMixins = {
        [K in keyof CMixins]: ConstructorParameters<CMixins[K]>;
    };

    class Conjugated extends ConjugateBase {
        constructor(argsBase: IArgsBase, ...argsMixins: IArgsMixins) {
            super();
            const self = this;

            // Instantiate base and mixins, save their instances for later use.
            const base = Reflect.construct(Base, argsBase, self.constructor);
            const mixins = Mixins.map(function (Mixin, index) {
                return Reflect.construct(Mixin, argsMixins[index], self.constructor);
            });

            const mroCache = new Map<
                string | symbol,
                typeof self | typeof base | typeof mixins[number]
            >();
            for (const prop of Reflect.ownKeys(self)) {
                mroCache.set(prop, self);
            }
            for (let i = mixins.length - 1; i >= 0; i -= 1) {
                const mixin = mixins[i];
                for (const prop of Reflect.ownKeys(mixin)) {
                    if (mroCache.has(prop)) {
                        const owner = mroCache.get(prop);
                        _delegate(prop, mixin, owner);
                    } else {
                        mroCache.set(prop, mixin);
                    }
                }
            }
            for (const prop of Reflect.ownKeys(base)) {
                if (mroCache.has(prop)) {
                    const owner = mroCache.get(prop);
                    _delegate(prop, base, owner);
                } else {
                    mroCache.set(prop, base);
                }
            }

            // Proxy for deterministic property/method resolution.
            return new Proxy(self, {
                has(target, prop) {
                    if (Reflect.has(target, prop)) return true;
                    for (let i = mixins.length - 1; i >= 0; i -= 1) {
                        if (Reflect.has(mixins[i], prop)) return true;
                    }
                    if (Reflect.has(base, prop)) return true;
                    if (Reflect.has(Base.prototype, prop)) return true;
                    for (let i = 0; i < Mixins.length; i += 1) {
                        if (Reflect.has(Mixins[i].prototype, prop)) return true;
                    }
                    return false;
                },
                get(target, prop, receiver) {
                    if (Reflect.has(target, prop)) {
                        const value = Reflect.get(target, prop, receiver);
                        return _bounded(value, receiver);
                    }
                    for (let i = mixins.length - 1; i >= 0; i -= 1) {
                        if (Reflect.has(mixins[i], prop)) {
                            const value = Reflect.get(mixins[i], prop, receiver);
                            return _bounded(value, receiver);
                        }
                    }
                    if (Reflect.has(base, prop)) {
                        const value = Reflect.get(base, prop, receiver);
                        return _bounded(value, receiver);
                    }
                    if (Reflect.has(Base.prototype, prop)) {
                        const value = Reflect.get(Base.prototype, prop, receiver);
                        return _bounded(value, receiver);
                    }
                    for (let i = 0; i < Mixins.length; i += 1) {
                        if (Reflect.has(Mixins[i].prototype, prop)) {
                            const value = Reflect.get(Mixins[i].prototype, prop, receiver);
                            return _bounded(value, receiver);
                        }
                    }
                    return undefined;
                },
                set(target, prop, value, receiver) {
                    if (mroCache.has(prop)) {
                        const instance = mroCache.get(prop)!;
                        return Reflect.set(instance, prop, value, receiver);
                    }
                    /*
                    ** Design decision: If the property is not found,
                    ** - We can choose to throw an error,
                    ** - Or we ignore the set operation.
                    ** - Or we can allow it to be set on the prototype.
                    ** - Or we can allow it to be set on the target object.
                    */
                    mroCache.set(prop, self);
                    return Reflect.set(target, prop, value, receiver);
                },
                ownKeys(target) {
                    return Array.from(mroCache.keys());
                },
            });
        }
    } // class Conjugated

    // Diagnostic information for debugging and type inference.
    Object.defineProperty(Conjugated, 'name', {
        value: `Conjugate<${Base.name}${(
            (Mixins.length === 0) ? '' : ',' + Mixins.map(m => m.name).join(',')
        )}>`,
        writable: false,
        enumerable: false,
        configurable: false
    });

    type ConjugatedType = IClass<
        IResolve<[CBase, ...CMixins]>,
        [IArgsBase, ...IArgsMixins]
    >;
    return Conjugated as ConjugatedType;
}

export {
    ConjugateBase,
    Conjugate,
    Conjugate as C,
};
