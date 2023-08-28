type Schema = Record<string, any>;
type Query = (slots: (name: string) => string | void) => string;

export class Builder {
  schema: Schema | undefined;
  mixinTemp: Builder | undefined;
  mixinQuery: string | undefined = "";
  groupTemp: string | undefined;
  query: Query = () => "";

  constructor() {
    return this;
  }

  get schemaType() {
    return this.schema?.type;
  }

  get name() {
    return this.schema?.name;
  }

  setSchema(schema: Schema) {
    this.schema = schema;

    if (this.mixinTemp) {
      this.mixin(this.mixinTemp);
    }
    if (this.groupTemp) {
      this.schema.group = this.groupTemp;
    }
    return this;
  }

  setQuery(query: Query) {
    this.query = query;
    return this;
  }

  setGroup(group: string) {
    if (this.schema) {
      this.schema.group = group;
    } else {
      this.groupTemp = group;
    }
    return this;
  }

  mixin(thatSchema: Builder) {
    if (!this.schema) {
      this.mixinTemp = thatSchema;
      return this;
    }

    if (this.schema.type === "document") {
      const fields = [...thatSchema.schema?.fields, ...this.schema.fields];
      const schema = { ...thatSchema.schema, ...this.schema, fields };

      this.schema = schema;
      this.mixinQuery = thatSchema.getQuery();
      delete this.mixinTemp;
    } else {
      console.warn(`implement merg for ${this.schema.type}`);
    }

    return this;
  }

  #walk(maybeSchema: Schema, onBuilder: (args: { key: string; builder: Builder; parent: string }) => any) {
    if (!maybeSchema) return;
    const res: Record<string, any> = {};
    const parent = maybeSchema.name;

    for (const [key, val] of Object.entries(maybeSchema)) {
      if (val instanceof Builder) {
        res[key] = onBuilder({ builder: val, key, parent });
      } else if (key === "fields" || key === "of") {
        res[key] = val.map((item: Schema | Builder) => {
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

  getSchema(): Schema | undefined {
    if (!this.schema) {
      console.warn("no schema");
      return;
    }
    return this.#walk(this.schema, ({ builder }) => {
      return builder.getSchema();
    });
  }

  getQuery() {
    if (!this.schema) {
      console.warn("no schema");
      return;
    }

    const slotContent: Record<string, Array<string | undefined>> = { mixin: [this.mixinQuery] };

    const slots = (name: string) => {
      let res = (slotContent[name] ?? []).filter(Boolean).join(",");

      if (!res) {
        console.warn(`No content for slot "${name}" of "${this.name}" builder`);
      }

      return res ? `${res},` : "";
    };

    this.#walk(this.schema, ({ builder, parent }) => {
      if (!Array.isArray(slotContent[parent])) {
        slotContent[parent] = [];
      }
      slotContent[parent].push(builder.getQuery());
    });

    return this.query(slots);
  }
}
