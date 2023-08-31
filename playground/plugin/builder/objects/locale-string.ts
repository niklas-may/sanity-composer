import { Builder } from "src/library/builder";

export default new Builder().setSchema({
  type: "globalObject",
  name: "localeString",
  fields: [
    {
      type: "string",
      name: "de",
    },
    {
      type: "string",
      name: "en",
    },
  ],
});
