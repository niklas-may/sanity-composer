import { Builder } from "../../../src/lib/builder";

export const callToActionsFactory = new Builder()
  .setSchema({
    type: "array",
    name: "callToAction",
    of: [
      {
        name: "link",
        type: "object",
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
    callToActions {
        title,
        url
    }
`
  );
