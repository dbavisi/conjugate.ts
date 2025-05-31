/*
** conjugate.ts
** A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.
**
**
** Syntax & API Tests
** - Test ergonomics of API, and import syntax
** - Test argument passing, and type inference for composed classes
*/

import { describe, test, expect } from 'vitest';
import { Conjugate, C } from '../src/conjugate.js';

describe('Syntax & API', () => {
    test('Conjugate symbol is imported and defined', () => {
        expect(Conjugate).toBeTruthy();
    });

    test('C symbol is imported and defined', () => {
        expect(C).toBeTruthy();
    });

    test('Conjugate is a function', () => {
        expect(typeof Conjugate).toBe('function');
    });

    test('Works with only a base class', () => {
        class Base { get baseProperty() { return 'base'; } }
        class A extends C(Base) {
            constructor() { super([]); }
        }
        const instance = new A();
        expect(instance.baseProperty).toBe('base');
    });

    test('Composes multiple classes', () => {
        class Base { get baseProperty() { return 'base'; } }
        class Mixin1 { get mixin1Property() { return 'mixin1'; } }
        class Mixin2 { get mixin2Property() { return 'mixin2'; } }

        const A = Conjugate(Base, Mixin1, Mixin2);
        const instance = new A([], [], []);
        expect(instance.baseProperty).toBe('base');
        expect(instance.mixin1Property).toBe('mixin1');
        expect(instance.mixin2Property).toBe('mixin2');
    });

    test('Constructor arguments are mapped and inferred', () => {
        class Base {
            _baseProperty: number;
            constructor(value: number) { this._baseProperty = value; }
            get baseProperty() { return this._baseProperty; }
        }
        class Mixin1 {
            _mixin1Property: string;
            constructor(value: string) { this._mixin1Property = value; }
            get mixin1Property() { return this._mixin1Property; }
        }
        class Mixin2 {
            _mixin2Property: boolean;
            constructor(value: boolean) { this._mixin2Property = value; }
            get mixin2Property() { return this._mixin2Property; }
        }

        class A extends C(Base, Mixin1, Mixin2) {
            AProperty: string;
            constructor(
                baseValue: number,
                mixin1Value: string,
                mixin2Value: boolean
            ) {
                super([baseValue], [mixin1Value], [mixin2Value]);
                this.AProperty = 'A';
            }
        }

        const instance = new A(42, 'test', true);
        expect(instance.baseProperty).toBe(42);
        expect(instance.mixin1Property).toBe('test');
        expect(instance.mixin2Property).toBe(true);
        expect(instance.AProperty).toBe('A');
    });
});
