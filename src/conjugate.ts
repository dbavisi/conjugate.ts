/*
** conjugate.ts
** A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
*/

import { IClass, IResolve, OpType } from './typing.js';
import { ConjugateBase } from './base.js';

/**
 * A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
 * @param Classes - Array of mixin classes to combine.
 * @template ITypes - Tuple of instance types.
 * @template CTypes - Tuple of class types.
 * @returns A new class combining all behaviors.
 */
function Conjugate<
    ITypes extends unknown[],
    CTypes extends { [K in keyof ITypes]: IClass<ITypes[K]> }
>(
    ...Classes: CTypes
) {
    type IArgs = { [K in keyof ITypes]: ConstructorParameters<CTypes[K]> };

    class Conjugated extends ConjugateBase {
        constructor(...args: IArgs) {
            super();
            const self = this;

            // Instantiate all mixin classes, save their instances for later use.
            const instances = Classes.map((Cls, i) => ConjugateBase.construct(Cls, args[i]));

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
                switch (op) {
                    case OpType.Has:
                    case OpType.Get:
                    case OpType.Set:
                        if (typeof prop !== 'string' && typeof prop !== 'symbol') {
                            throw new TypeError('Property key must be a string or symbol.');
                        }
                        if ((op === OpType.Get || op === OpType.Set) && receiver === undefined) {
                            throw new TypeError('Receiver must be provided for get/set operation.');
                        }
                        if (op === OpType.Set && value === undefined) {
                            throw new TypeError('Value must be provided for set operation.');
                        }
                        break;
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
                for (let i = instances.length - 1; i >= 0; i -= 1) {
                    const inst = instances[i];
                    if (ConjugateBase.isObject(inst) && inst.hasOwnProperty(prop)) {
                        switch (op) {
                            case OpType.Has:
                                return true as THas;
                            case OpType.Get: {
                                const v = ConjugateBase.get(inst, prop, receiver);
                                return ConjugateBase.bounded(v, receiver) as TGet;
                            }
                            case OpType.Set:
                                return ConjugateBase.set(inst, prop, value, receiver);
                        }
                    }
                }

                // 3. mixin prototypes (in order)
                for (let i = 0; i < Classes.length; i += 1) {
                    const Proto = Classes[i].prototype;
                    if (ConjugateBase.has(Proto, prop)) {
                        switch (op) {
                            case OpType.Has:
                                return true as THas;
                            case OpType.Get: {
                                const v = ConjugateBase.get(Proto, prop, receiver);
                                return ConjugateBase.bounded(v, instances[i]) as TGet;
                            }
                        }
                    }
                }

                // Not found
                switch (op) {
                    case OpType.Has:
                        return false as THas;
                    case OpType.Get:
                        return undefined;
                    case OpType.Set:
                        return ConjugateBase.set(self, prop, value, receiver);
                }
            }

            // Proxy for deterministic property/method resolution.
            return new Proxy(self, {
                has(target, prop) {
                    return !!resolveProperty(OpType.Has, prop, undefined, undefined);
                },
                get(target, prop, receiver) {
                    return resolveProperty(OpType.Get, prop, receiver, undefined);
                },
                set(target, prop, value, receiver) {
                    return !!resolveProperty(OpType.Set, prop, receiver, value);
                },
                ownKeys(target) {
                    const keys = new Set<string | symbol>();
                    ConjugateBase.ownKeys(self).forEach(k => keys.add(k));
                    for (let i = instances.length - 1; i >= 0; i -= 1) {
                        ConjugateBase.ownKeys(instances[i]).forEach(k => keys.add(k));
                    }
                    return Array.from(keys);
                },
            });
        }
    }

    // Diagnostic information for debugging and type inference.
    Object.defineProperty(Conjugated, 'name', {
        value: `Conjugate<${Classes.map(c => c.name).join(',')}>`,
    });

    return Conjugated as unknown as IClass<IResolve<CTypes>, IArgs>;
}

export {
    ConjugateBase,
    Conjugate,
    Conjugate as C,
};
