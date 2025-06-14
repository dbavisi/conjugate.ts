/*
** conjugate.ts
** A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
*/

import {
    IClass,
    IResolve,
    IConjugateBase,
    OpType,
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

            // Helper to resolve property across self, mixins, base, and prototypes
            // Overload signatures for resolveProperty

            function resolveProperty<
                THas extends boolean,
                TProp extends string | symbol,
            >(op: OpType.Has, prop: TProp, receiver: undefined, value: undefined): THas;
            function resolveProperty<
                TGet extends unknown,
                TProp extends string | symbol,
                R extends unknown,
            >(op: OpType.Get, prop: TProp, receiver: R, value: undefined): TGet | undefined;
            function resolveProperty<
                TSet extends unknown,
                TProp extends string | symbol,
                R extends unknown,
            >(op: OpType.Set, prop: TProp, receiver: R, value: TSet): boolean;
            /**
             * Resolve a property on the conjugated instance.
             * @param op - The operation type (OpType.Get, OpType.Set, OpType.Has).
             * @param prop - The property key to resolve.
             * @param receiver - Optional receiver for getter/setter context.
             * @param value - The value to set if the operation is OpType.Set.
             * @template THas - The type of the boolean for has operation.
             * @template TGet - The type of the value to get.
             * @template TSet - The type of the value to set.
             * @template TProp - The type of the property key.
             * @template R - The type of the receiver object.
             * @returns The resolved value or boolean indicating presence.
             */
            function resolveProperty<
                THas extends boolean,
                TGet extends unknown,
                TSet extends unknown,
                TProp extends string | symbol,
                R extends unknown,
            >(
                op: OpType,
                prop: TProp,
                receiver: R,
                value: TSet
            ) {
                // Overload checks
                switch (op) {
                    case OpType.Has: {
                        if (typeof prop !== 'string' && typeof prop !== 'symbol') {
                            throw new TypeError('Property key must be a string or symbol.');
                        }
                        break;
                    }
                    case OpType.Get: {
                        if (typeof prop !== 'string' && typeof prop !== 'symbol') {
                            throw new TypeError('Property key must be a string or symbol.');
                        }
                        if (receiver === undefined) {
                            throw new TypeError('Receiver must be provided for get operation.');
                        }
                        break;
                    }
                    case OpType.Set: {
                        if (typeof prop !== 'string' && typeof prop !== 'symbol') {
                            throw new TypeError('Property key must be a string or symbol.');
                        }
                        if (receiver === undefined) {
                            throw new TypeError('Receiver must be provided for set operation.');
                        }
                        if (value === undefined) {
                            throw new TypeError('Value must be provided for set operation.');
                        }
                        break;
                    }
                }

                // 1. self
                if (ConjugateBase.isObject(self) && self.hasOwnProperty(prop)) {
                    switch (op) {
                        case OpType.Has:
                            return true as THas;
                        case OpType.Get: {
                            const v = ConjugateBase.get(self, prop, receiver);
                            return ConjugateBase.bounded(v, receiver) as TGet;
                        }
                        case OpType.Set:
                            return ConjugateBase.set(self, prop, value, receiver);
                    }
                }

                // 2. mixin instances (reverse order)
                for (let i = mixins.length - 1; i >= 0; i -= 1) {
                    const mixin = mixins[i];
                    if (ConjugateBase.isObject(mixin) && mixin.hasOwnProperty(prop)) {
                        switch (op) {
                            case OpType.Has:
                                return true as THas;
                            case OpType.Get: {
                                const v = ConjugateBase.get(mixin, prop, receiver);
                                return ConjugateBase.bounded(v, receiver) as TGet;
                            }
                            case OpType.Set:
                                return ConjugateBase.set(mixin, prop, value, receiver);
                        }
                    }
                }

                // 3. base instance
                if (ConjugateBase.isObject(base) && base.hasOwnProperty(prop)) {
                    switch (op) {
                        case OpType.Has:
                            return true as THas;
                        case OpType.Get: {
                            const v = ConjugateBase.get(base, prop, receiver);
                            return ConjugateBase.bounded(v, receiver) as TGet;
                        }
                        case OpType.Set:
                            return ConjugateBase.set(base, prop, value, receiver);
                    }
                }

                // 4. Base.prototype
                if (ConjugateBase.has(Base.prototype, prop)) {
                    switch (op) {
                        case OpType.Has:
                            return true as THas;
                        case OpType.Get: {
                            const v = ConjugateBase.get(Base.prototype, prop, receiver);
                            return ConjugateBase.bounded(v, receiver) as TGet;
                        }
                        // case OpType.Set:
                        // Should we allow altering prototype properties?
                    }
                }

                // 5. Mixins.prototype
                for (let i = 0; i < Mixins.length; i += 1) {
                    const Mixin = Mixins[i];
                    if (ConjugateBase.has(Mixin.prototype, prop)) {
                        switch (op) {
                            case OpType.Has:
                                return true as THas;
                            case OpType.Get: {
                                const v = ConjugateBase.get(Mixin.prototype, prop, receiver);
                                return ConjugateBase.bounded(v, receiver) as TGet;
                            }
                            // case OpType.Set:
                            // Should we allow altering prototype properties?
                        }
                    }
                }

                // Not found
                switch (op) {
                    case OpType.Has:
                        return false as THas;
                    case OpType.Get:
                        return undefined;
                    case OpType.Set: {
                        /*
                        ** Design decision: If the property is not found,
                        ** - We can choose to throw an error,
                        ** - Or we ignore the set operation.
                        ** - Or we can allow it to be set on the prototype.
                        ** - Or we can allow it to be set on the target object.
                        */
                        return ConjugateBase.set(self, prop, value, receiver);
                    }
                }
            }

            // Proxy for deterministic property/method resolution.
            return new Proxy(self, {
                has(target, prop) {
                    return resolveProperty(OpType.Has, prop, undefined, undefined);
                },
                get(target, prop, receiver) {
                    return resolveProperty(OpType.Get, prop, receiver, undefined);
                },
                set(target, prop, value, receiver) {
                    return resolveProperty(OpType.Set, prop, receiver, value);
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
