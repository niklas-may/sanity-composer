type Schema = Record<string, any>;
type Query = (getSlots?: (name: string) => string | void) => string;

export class Builder {
  schema: Schema;
  query: Query;

  constructor() {
    return this;
  }

  get schemaType() {
    return this.schema.type;
  }

  get name() {
    return this.schema.name;
  }

  setSchema(schema: Schema) {
    this.schema = schema;
    return this;
  }

  setQuery(query: Query) {
    this.query = query;
    return this;
  }

  #walk(maybeSchema: Schema, onBuilder: (args: any) => any) {
    if (!maybeSchema) return;
    const res = {};
    const parent = maybeSchema.name;

    for (const [key, val] of Object.entries(maybeSchema)) {
      if (val instanceof Builder) {
        res[key] = onBuilder({ builder: val, key, parent });
      } else if (key === "fields" || key === "of") {
        res[key] = val.map((item) => {
          if (item instanceof Builder) {
            return onBuilder({ key, builder: item, parent });
          }
          return this.#walk(item, onBuilder);
        });
      } else {
        res[key] = val;
      }
    }
    return res;
  }

  getSchema() {
    return this.#walk(this.schema, ({ builder }) => {
      return builder.getSchema();
    });
  }

  getSchemaString() {
    return JSON.stringify(this.getSchema());
  }

  getQuery() {
    const slotContent = {};
    this.#walk(this.schema, ({ builder, parent }) => {
      slotContent[parent] = builder.getQuery();
    });

    function slots(name: string) {
      const res = slotContent[name];

      return res ? `${res},` : "";
    }

    return this.query(slots);
  }
}
