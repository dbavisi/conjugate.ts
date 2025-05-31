/*
** conjugate.ts
** A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
**
**
** Method Resolution Order Tests
** - Tests method/property resolution order
** - Validates subclassing and shadowing behavior
** - Validates multi-class composition
*/

import { describe, test, expect } from 'vitest';
import { C } from '../src/conjugate.js';

describe('Method Resolution Order', () => {
    test('Resolves methods in left-to-right order', () => {
        class Base { who?() { return 'Base'; } }
        class Mixin1 { who?() { return 'Mixin1'; } }
        class Mixin2 { who?() { return 'Mixin2'; } }

        const A = C(Base, Mixin1, Mixin2);
        const instance = new A([], [], []);

        expect(instance.who?.()).toBe('Base');
        delete (Base.prototype.who);
        expect(instance.who?.()).toBe('Mixin1');
        delete (Mixin1.prototype.who);
        expect(instance.who?.()).toBe('Mixin2');
    });

    test('Subclass overrides all methods', () => {
        class Base { who() { return 'Base'; } }
        class Mixin1 { who() { return 'Mixin1'; } }
        class Mixin2 { who() { return 'Mixin2'; } }

        class A extends C(Base, Mixin1, Mixin2) {
            who = () => 'A';
        }
        const instance = new A([], [], []);
        expect(instance.who()).toBe('A');
    });

    test('Resolution order follows class argument order', () => {
        class Base { who?() { return 'Base' + this.where() } where() { return 'Base'; } }
        class Mixin1 { who?() { return 'Mixin1' + this.where() } where() { return 'Mixin1'; } }
        class Mixin2 { who() { return 'Mixin2' + this.where() } where() { return 'Mixin2'; } }

        const A = C(Mixin1, Base, Mixin2);
        const instance = new A([], [], []);
        expect(instance.who?.()).toBe('Mixin1Mixin1');
        delete (Mixin1.prototype.who);
        expect(instance.who?.()).toBe('BaseMixin1');
        delete (Base.prototype.who);
        expect(instance.who?.()).toBe('Mixin2Mixin1');
    });

    test('Method only in last mixin is accessible', () => {
        class Base { }
        class Mixin1 { }
        class Mixin2 { onlyInMixin2() { return 'ok'; } }
        const A = C(Base, Mixin1, Mixin2);
        const instance = new A([], [], []);
        expect(instance.onlyInMixin2()).toBe('ok');
    });

    test('Subclass property shadows base/mixin properties', () => {
        class Base { foo = 'base'; bar = 'base-bar'; }
        class Mixin1 { foo = 'mixin1'; bar = 'mixin1-bar'; foobar = 'mixin1-foobar'; }
        const A = C(Base, Mixin1);
        class Sub extends A { foo = 'sub'; }
        const instance = new Sub([], []);
        expect(instance.foo).toBe('sub');
        expect(instance.bar).toBe('mixin1-bar');
        expect(instance.foobar).toBe('mixin1-foobar');
    });
});
