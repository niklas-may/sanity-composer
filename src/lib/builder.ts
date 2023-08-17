type Schema = Record<string, any>;
type Query = (getSlots?: (name: string) => string | void) => string;

export class Builder {
  schema: Schema;
  mixinTemp: Builder;
  mixinQuery: string;
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

    if (this.mixinTemp) {
      this.mixin(this.mixinTemp);
    }
    return this;
  }

  setQuery(query: Query) {
    this.query = query;
    return this;
  }

  setGroup(group: string) {
    this.schema.group = group;
    return this;
  }

  mixin(thatSchema: Builder) {
    if (!this.schema) {
      this.mixinTemp = thatSchema;
      return this;
    }

    if (this.schema.type === "document") {
      const fields = [...thatSchema.schema.fields, ...this.schema.fields];
      const schema = { ...thatSchema.schema, ...this.schema, fields };

      this.schema = schema;
      this.mixinQuery = thatSchema.getQuery();
      delete this.mixinTemp;
    } else {
      console.warn("implement merg");
    }

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
    const slotContent = { mixin: this.mixinQuery };
    this.#walk(this.schema, ({ builder, parent }) => {
      slotContent[parent] = builder.getQuery();
    });

    const slots = (name: string) => {
      const res = slotContent[name];

      if (!res) {
        console.warn(`No content for slot "${name}" of "${this.name}" builder`);
      }

      return res ? `${res},` : "";
    };

    return this.query(slots);
  }
}
