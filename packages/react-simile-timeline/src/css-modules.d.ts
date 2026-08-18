// TypeScript 6 rejects side-effect imports of modules it cannot resolve to a
// type. The library imports its stylesheet for its build side effect only
// (`import './styles/timeline.css'`); this ambient declaration types those
// imports as `void` so tsc accepts them. It affects type-checking only and is
// not part of the emitted declarations.
declare module '*.css';
