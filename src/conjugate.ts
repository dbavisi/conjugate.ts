/*
** conjugate.ts
** A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
*/

import {
    IClass,
    IResolve,
    IConjugateBase,
} from './typing.js';
import { ConjugateBase } from './base.js';

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
    T extends unknown[],
    CMixins extends {
        [K in keyof T]: IClass<T[K]>;
    }
>(
    Base: CBase,
    ...Mixins: CMixins
) {
    type IArgsBase = ConstructorParameters<CBase>;
    type IArgsMixins = {
        [K in keyof T]: ConstructorParameters<CMixins[K]>;
    };

    class Conjugated extends ConjugateBase {
        constructor(argsBase: IArgsBase, ...argsMixins: IArgsMixins) {
            super();
            const self = this;

            // Instantiate base and mixins, save their instances for later use.
            const base = ConjugateBase.construct(Base, argsBase);
            const mixins = (Mixins as {
                [K in keyof T]: CMixins[K];
            }).map(
                function <I extends number>(
                    Mixin: CMixins[I],
                    index: I,
                ): InstanceType<CMixins[I]> {
                    return ConjugateBase.construct(Mixin, argsMixins[index]);
                }
            );

            // Proxy for deterministic property/method resolution.
            return new Proxy(self, {
                has(target, prop) {
                    if (self.hasOwnProperty(prop)) return true;
                    for (let i = mixins.length - 1; i >= 0; i -= 1) {
                        const mixin = mixins[i];
                        if (typeof mixin === 'object' && mixin !== null)
                            if (mixin.hasOwnProperty(prop)) return true;
                    }
                    if (typeof base === 'object' && base !== null)
                        if (base.hasOwnProperty(prop)) return true;
                    if (ConjugateBase.has(Base.prototype, prop)) return true;
                    for (let i = 0; i < Mixins.length; i += 1) {
                        if (ConjugateBase.has(Mixins[i].prototype, prop)) return true;
                    }
                    return false;
                },
                get(target, prop, receiver) {
                    if (self.hasOwnProperty(prop)) {
                        const value = ConjugateBase.get(self, prop, receiver);
                        return ConjugateBase.bounded(value, receiver);
                    }
                    for (let i = mixins.length - 1; i >= 0; i -= 1) {
                        const mixin = mixins[i];
                        if (typeof mixin === 'object' && mixin !== null)
                            if (mixin.hasOwnProperty(prop)) {
                                const value = ConjugateBase.get(mixin, prop, receiver);
                                return ConjugateBase.bounded(value, receiver);
                            }
                    }
                    if (typeof base === 'object' && base !== null)
                        if (base.hasOwnProperty(prop)) {
                            const value = ConjugateBase.get(base, prop, receiver);
                            return ConjugateBase.bounded(value, receiver);
                        }
                    if (ConjugateBase.has(Base.prototype, prop)) {
                        const value = ConjugateBase.get(Base.prototype, prop, receiver);
                        return ConjugateBase.bounded(value, receiver);
                    }
                    for (let i = 0; i < Mixins.length; i += 1) {
                        const Mixin = Mixins[i];
                        if (ConjugateBase.has(Mixin.prototype, prop)) {
                            const value = ConjugateBase.get(Mixin.prototype, prop, receiver);
                            return ConjugateBase.bounded(value, receiver);
                        }
                    }
                    return undefined;
                },
                set(target, prop, value, receiver) {
                    if (self.hasOwnProperty(prop)) {
                        return ConjugateBase.set(self, prop, value, receiver);
                    }
                    for (let i = mixins.length - 1; i >= 0; i -= 1) {
                        const mixin = mixins[i];
                        if (typeof mixin === 'object' && mixin !== null)
                            if (mixin.hasOwnProperty(prop)) {
                                return ConjugateBase.set(mixin, prop, value, receiver);
                            }
                    }
                    if (typeof base === 'object' && base !== null)
                        if (base.hasOwnProperty(prop)) {
                            return ConjugateBase.set(base, prop, value, receiver);
                        }
                    /*
                    ** Design decision: If the property is not found,
                    ** - We can choose to throw an error,
                    ** - Or we ignore the set operation.
                    ** - Or we can allow it to be set on the prototype.
                    ** - Or we can allow it to be set on the target object.
                    */
                    return ConjugateBase.set(self, prop, value, receiver);
                },
                ownKeys(target) {
                    const keys = new Set<string | symbol>();
                    ConjugateBase.ownKeys(self).forEach(k => keys.add(k));
                    for (let i = mixins.length - 1; i >= 0; i -= 1) {
                        ConjugateBase.ownKeys(mixins[i]).forEach(k => keys.add(k));
                    }
                    ConjugateBase.ownKeys(base).forEach(k => keys.add(k));
                    return Array.from(keys);
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
    return Conjugated as unknown as ConjugatedType;
}

export {
    ConjugateBase,
    Conjugate,
    Conjugate as C,
};
