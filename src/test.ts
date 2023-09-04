 type Primitive = null | undefined | string | number | boolean | symbol | bigint;
type ArrayKey = number;
type IsTuple<T extends readonly any[]> = number extends T['length'] ? false : true;
type TupleKeys<T extends readonly any[]> = Exclude<keyof T, keyof any[]>;
 type PathConcat<TKey extends string | number, TValue> = TValue extends Primitive ? `${TKey}` : `${TKey}` | `${TKey}.${Path<TValue>}`;
 
 type Path<T> = T extends readonly (infer V)[] ? IsTuple<T> extends true ? {
    [K in TupleKeys<T>]-?: PathConcat<K & string, T[K]>;
}[TupleKeys<T>] : PathConcat<ArrayKey, V> : {
    [K in keyof T]-?: PathConcat<K & string, T[K]>;
}[keyof T];


type ArrayPathConcat<TKey extends string | number, TValue> = TValue extends Primitive ? never : TValue extends readonly (infer U)[] ? U extends Primitive ? never : `${TKey}` | `${TKey}.${ArrayPath<TValue>}` : `${TKey}.${ArrayPath<TValue>}`;
 type ArrayPath<T> = T extends readonly (infer V)[] ? IsTuple<T> extends true ? {
    [K in TupleKeys<T>]-?: ArrayPathConcat<K & string, T[K]>;
}[TupleKeys<T>] : ArrayPathConcat<ArrayKey, V> : {
    [K in keyof T]-?: ArrayPathConcat<K & string, T[K]>;
}[keyof T];
 type PathValue<T, TPath extends Path<T> | ArrayPath<T>> = T extends any ? TPath extends `${infer K}.${infer R}` ? K extends keyof T ? R extends Path<T[K]> ? undefined extends T[K] ? PathValue<T[K], R> | undefined : PathValue<T[K], R> : never : K extends `${ArrayKey}` ? T extends readonly (infer V)[] ? PathValue<V, R & Path<V>> : never : never : TPath extends keyof T ? T[TPath] : TPath extends `${ArrayKey}` ? T extends readonly (infer V)[] ? V : never : never : never;

 

const obj2 = {
    a: {
      b: 'hello',
      x: 9,
      d: [
        {
          e: 'world',
          k: 12
        }
      ],
    },
  };

const p: Path<typeof obj2> = "a.b"