/*
** conjugate.ts
** A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
**
**
** Dynamic Prototype Validation Tests
** - Validates that prototype changes after instantiation are reflected in instances
*/

import { describe, test, expect } from 'vitest';
import { C } from '../src/conjugate.js';

describe('Dynamic Prototype Validation', () => {
    test('Prototype changes are reflected in instances', () => {
        class Base { baseMethod() { return 'base'; } }
        class Mixin { mixinMethod() { return 'mixin'; } }
        const A = C(Base, Mixin);
        const instance = new A([], []);

        expect(instance.baseMethod()).toBe('base');
        expect(instance.mixinMethod()).toBe('mixin');

        // Dynamically add method to Mixin prototype
        (Mixin.prototype as any).dynamicMethod = function () { return 'dynamic'; };
        // @ts-expect-error
        expect(instance.dynamicMethod()).toBe('dynamic');

        // Remove method from Mixin prototype
        delete (Mixin.prototype as any).mixinMethod;
        expect(instance.mixinMethod).toBeUndefined();

        // Add method to Base prototype after instance creation
        (Base.prototype as any).lateMethod = function () { return 'late'; };
        // @ts-expect-error
        expect(instance.lateMethod()).toBe('late');
    });

    test('Should be able to instantiate EventTarget with mixins', () => {
        // See #9 [bug] Illegal invocation with addEventListener

        class Base extends EventTarget { baseMethod() { return 'base'; } }
        class Mixin { mixinMethod() { return 'mixin'; } }
        const A = C(Base, Mixin);
        const instance = new A([], []);

        expect(instance.baseMethod()).toBe('base');
        expect(instance.mixinMethod()).toBe('mixin');

        // Try add event listener
        const future = new Promise<string>((resolve) => {
            instance.addEventListener('test-event', () => {
                console.log('Event received');
                resolve('event received');
            });
            instance.dispatchEvent(new Event('test-event'));
        });

        return future.then((result) => {
            expect(result).toBe('event received');
        });
    });

    test('Should be able to addEventListener with mixins', () => {
        // See #9 [bug] Illegal invocation with addEventListener

        class Base extends EventTarget { baseMethod() { return 'base'; } }
        class Mixin { mixinMethod() { return 'mixin'; } }
        const A = C(Mixin, Base);
        const instance = new A([], []);

        expect(instance.baseMethod()).toBe('base');
        expect(instance.mixinMethod()).toBe('mixin');

        // Try add event listener
        const future = new Promise<string>((resolve) => {
            instance.addEventListener('test-event', () => {
                console.log('Event received');
                resolve('event received');
            });
            instance.dispatchEvent(new Event('test-event'));
        });

        return future.then((result) => {
            expect(result).toBe('event received');
        });
    });
});
