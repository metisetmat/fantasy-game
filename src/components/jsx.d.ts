declare namespace JSX {
  type Element = unknown;

  interface IntrinsicElements {
    readonly [elementName: string]: Record<string, unknown>;
  }
}
