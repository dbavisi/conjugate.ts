# conjugate.ts — Design & Architecture

A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.

## Overview

`conjugate.ts` provides a robust, type-safe mechanism for composing multiple classes in TypeScript, simulating multiple inheritance with predictable method/property resolution and extensibility.

---

## Requirements

### Design Decisions

| Tag  | Description                                                                                   | Testability      |
|------|----------------------------------------------------------------------------------------------|------------------|
| DD0  | Proxy-based resolution for all property/method accesses.                                      | Automated        |
| DD1  | Each base/mixin receives its own argument tuple for clarity and type safety.                  | Automated        |
| DD2  | Advanced TypeScript types infer and resolve combined instance types.                          | Automated        |
| DD3  | JavaScript's single inheritance is safely circumvented via composition and proxy delegation.  | Manual           |

### Functional

| Tag  | Description                                                                                   | Testability      |
|------|----------------------------------------------------------------------------------------------|------------------|
| FR0  | Compose multiple classes, simulating multiple inheritance.                                    | Automated        |
| FR1  | Ensure type safety for constructor arguments and resulting instance types.                    | Automated        |
| FR2  | Provide predictable, deterministic property/method resolution order.                          | Automated        |
| FR3  | Use a Proxy for left-to-right resolution (instance → base → mixins).                          | Automated        |
| FR4  | Allow subclassing of composed classes.                                                        | Automated        |
| FR5  | Support dynamic prototype changes after instantiation.                                        | Automated        |

### Usability

| Tag  | Description                                                                                   | Testability      |
|------|----------------------------------------------------------------------------------------------|------------------|
| UR0  | Ergonomic, familiar API for TypeScript developers.                                            | Manual           |
| UR1  | Clear, documented method/property resolution order.                                           | Manual           |

### Limitations

| Tag  | Description                                                                                   |
|------|----------------------------------------------------------------------------------------------|
| L0   | Does not support super-calls across composed classes; method resolution is strictly left-to-right. |
| L1   | Classes must allow instantiation using the `new` operator; static methods are not supported. |

---

## Test Coverage


| Test Case | Description                                                                                   | Coverage |
|------|----------------------------------------------------------------------------------------------|----------|
| | Syntax & API | |
| | | |
| S&A0 | Test ergonomics of API, and import syntax | UR0 |
| S&A1 | Test argument passing, and type inference for composed classes | FR0, FR1 |
| | | |
| | Method Resolution Order | |
| | | |
| MRO0 | Tests method/property resolution order | FR2, FR3 |
| MRO1 | Validates subclassing and shadowing behavior | FR2, FR3, FR4 |
| MRO2 | Validates multi-class composition | FR0, FR1 |
| | | |
| | Dynamic Prototype Validation | |
| | | |
| DPV0 | Validates that prototype changes after instantiation are reflected in instances | FR5 |

---

## See Also

- [Project readMe](../readMe.md)
