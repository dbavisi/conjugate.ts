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
class ConjugateBase implements IConjugateBase {
    constructor() {
        // This constructor is intentionally empty.
        // It serves as a base for all conjugated classes.
    }
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

            // Instantiate base and mixins, merging their instance properties.
            Object.assign(this, Reflect.construct(Base, argsBase, this.constructor));
            for (let i = 0; i < Mixins.length; i += 1) {
                Object.assign(this, Reflect.construct(Mixins[i], argsMixins[i], this.constructor));
            }

            // Proxy for deterministic property/method resolution.
            return new Proxy(this, {
                has(target, prop) {
                    if (Reflect.has(target, prop)) return true;
                    if (Reflect.has(Base.prototype, prop)) return true;
                    for (let j = 0; j < Mixins.length; j += 1) {
                        if (Reflect.has(Mixins[j].prototype, prop)) return true;
                    }
                    return false;
                },
                get(target, prop, receiver) {
                    if (Reflect.has(target, prop)) {
                        return Reflect.get(target, prop, receiver);
                    }
                    if (Reflect.has(Base.prototype, prop)) {
                        return Reflect.get(Base.prototype, prop, receiver);
                    }
                    for (let j = 0; j < Mixins.length; j += 1) {
                        if (Reflect.has(Mixins[j].prototype, prop)) {
                            return Reflect.get(Mixins[j].prototype, prop, receiver);
                        }
                    }
                    return undefined;
                },
                set(target, prop, value, receiver) {
                    /*
                    ** Design decision: If the property is not found,
                    ** -    We can choose to throw an error,
                    ** - Or we ignore the set operation.
                    ** - Or we can allow it to be set on the prototype.
                    ** - Or we can allow it to be set on the target object.
                    */
                    return Reflect.set(target, prop, value, receiver);
                }
            });
        }
    }

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
