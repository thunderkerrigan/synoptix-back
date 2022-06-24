export interface SPARQLResponse<T extends string | number | symbol> {
  head: { vars: T[] };
  results: {
    bindings: Record<T, { type: string; value: any }>[];
  };
}
