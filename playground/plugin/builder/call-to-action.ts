import { Builder } from "src/library/builder";

export default new Builder()
  .setSchema({
    type: "array",
    name: "callToAction",
    of: [
      {
        type: "object",
        name: "link",
        fields: [
          {
            name: "title",
            type: "string",
          },
          {
            name: "url",
            type: "url",
          },
        ],
      },
    ],
  })
  .setQuery(
    () => /* groq */ `
    callToActions[] {
        url,
        title,
    }
`
  );
