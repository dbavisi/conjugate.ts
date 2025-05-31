# conjugate.ts

A TypeScript utility for structured, reusable, and type-safe multiple class inheritance.

---

## Features

- **Multiple Class Composition:** Compose any number of classes into a unified class.
- **Type Safety:** Constructor arguments and resulting types are inferred and enforced by TypeScript.
- **Deterministic Method Resolution:** Properties and methods are resolved in a predictable, left-to-right order.
- **Proxy-Based Delegation:** Prototype changes after instantiation are reflected in instances.
- **Extensible:** Composed classes can be further subclassed.

---

## Installation

> **Note:** Not published to npm. Clone or reference via GitHub.

```sh
git clone https://github.com/dbavisi/conjugate.ts.git
cd conjugate.ts
npm install
npm run build
```

Or add as a dependency:

```json
{
  "dependencies": {
    "conjugate.ts": "github:dbavisi/conjugate.ts"
  }
}
```

---

## Usage

```typescript
import { C } from 'conjugate.ts';

class AClass {
  a = 'from A';
}
class BClass {
  sayB() { return 'B'; }
}
class CClass {
  sayC() { return 'C'; }
}

class ABC extends C(AClass, BClass, CClass) {
  constructor(argsA: [], argsB: [], argsC: []) {
    super(argsA, argsB, argsC);
  }
}

const instance = new ABC([], [], []);
console.log(instance.a);      // 'from A'
console.log(instance.sayB()); // 'B'
console.log(instance.sayC()); // 'C'
```

---

## API

```typescript
Conjugate(BaseClass, ...MixinClasses) => CombinedClass
```

- **BaseClass:** The primary class to inherit from.
- **MixinClasses:** Additional classes to compose.
- **Returns:** A class constructor that combines all behaviors and accepts an argument tuple per constructor.

---

## Design & Documentation

- [Design Document](./doc/readMe.md): Requirements, design decisions, and test coverage.
- API Reference: Inline documentation and type definitions.

---

## Testing

Tests are written with [Vitest](https://vitest.dev):

```sh
npm test
```

---

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements or bug fixes.

---