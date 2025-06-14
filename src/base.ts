/*
** conjugate.ts
** A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
*/

import {
    IClass,
    IConjugateBase,
} from './typing.js';

/**
 * Base class for all conjugated classes and static typed helpers.
 */
class ConjugateBase implements IConjugateBase {
    /**
     * Generic typed version of Reflect.has for objects.
     * @param target - The object to check for the property.
     * @param key - The property key to check.
     * @template T - The type of the target object.
     * @template K - The key of the property to check.
     * @return True if the property exists, false otherwise.
     */
    static has<
        T extends unknown,
        K extends PropertyKey,
    >(target: T, key: K): K extends keyof T ? true : false {
        if (!ConjugateBase.isObject(target)) {
            throw new TypeError('Target must be a non-null object.');
        }
        return Reflect.has(target, key) as K extends keyof T ? true : false;
    }

    /**
     * Generic typed version of Reflect.get for objects.
     * @param target - The object to get the property from.
     * @param key - The property key.
     * @param receiver - Optional receiver for getter context.
     * @template T - The type of the target object.
     * @template K - The key of the property to get.
     * @template R - The type of the receiver object.
     * @return The value of the property, strictly typed.
     */
    static get<
        T extends unknown,
        K extends string | symbol,
        R extends unknown,
    >(target: T, key: K, receiver: R): K extends keyof T ? T[K] : never {
        if (!ConjugateBase.isObject(target)) {
            throw new TypeError('Target must be a non-null object.');
        }
        return Reflect.get(target, key, receiver) as K extends keyof T ? T[K] : never
    }

    /**
     * Generic typed version of Reflect.set for objects.
     * @param target - The object to set the property on.
     * @param key - The property key.
     * @param value - The value to set.
     * @param receiver - Optional receiver for setter context.
     * @template T - The type of the target object.
     * @template K - The key of the property to set.
     * @template V - The type of the value to set, which is inferred from the target object.
     * @template R - The type of the receiver object.
     * @return True if the property was set successfully, false otherwise.
     */
    static set<
        T extends unknown,
        K extends string | symbol,
        V extends unknown,
        R extends unknown,
    >(target: T, key: K, value: V, receiver: R): boolean {
        if (!ConjugateBase.isObject(target)) {
            throw new TypeError('Target must be a non-null object.');
        }
        return Reflect.set(target, key, value, receiver);
    }

    /**
     * Generic typed version of Reflect.ownKeys for objects.
     * @return An array of property keys of the target object.
     * @template T - The type of the target object.
     * @return An array of keys that are own properties of the target object.
     */
    static ownKeys<
        T extends unknown,
    >(target: T): (keyof T & (string | symbol))[] {
        if (!ConjugateBase.isObject(target)) {
            throw new TypeError('Target must be a non-null object.');
        }
        return Reflect.ownKeys(target) as (keyof T & (string | symbol))[];
    }

    /**
     * Generic typed version of Reflect.construct for classes.
     * @param ctor - The class constructor to instantiate.
     * @param args - The arguments to pass to the constructor.
     * @template Args - The argument types for the constructor.
     * @template C - The class type to instantiate.
     * @return An instance of the class created with the provided arguments.
     */
    static construct<
        Args extends unknown[],
        C extends IClass<unknown, Args>,
    >(
        ctor: C,
        args: Args,
    ): InstanceType<C> {
        return Reflect.construct(ctor, args) as InstanceType<C>;
    }

    /**
     * Generic function to bind a value to an instance, strictly typed.
     * @param value - The value to bind, which can be a function or any other type.
     * @param instance - The instance to which the value should be bound.
     * @template V - The type of the value to bind.
     * @template T - The type of the instance to bind to.
     * @return The bound value if it's a function, or the original value otherwise.
     */
    static bounded<
        V extends unknown,
        T extends unknown,
    >(value: V, instance: T): V {
        if (!ConjugateBase.isObject(instance)) {
            throw new TypeError('Instance must be a non-null object.');
        }
        return (typeof value === 'function') ? value.bind(instance) : value;
    }

    /**
     * Helper to check if a value is a non-null object, with generic typing.
     * @template T - The expected object type.
     * @param val - The value to check.
     * @returns True if val is a non-null object of type T, false otherwise.
     */
    static isObject<T extends object>(val: unknown): val is T {
        return typeof val === 'object' && val !== null;
    }
}

export {
    ConjugateBase,
};
