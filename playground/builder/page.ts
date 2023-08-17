import { Builder } from "../../src/lib/builder";
import { callToActionsFactory } from "./call-to-action";
import { galleryFactory } from "./gallery";



export const document = new Builder()
  .setSchema({
    type: "document",
    name: "page",
    fields: [
      {
        type: "object",
        name: "mainSections",
        fields: [
          {
            name: "pageTitle",
            type: "string",
          },
          galleryFactory,
        ],
      },
      callToActionsFactory,
    ],
  })
  .setQuery(
    (slots) => /* groq */ `

      *[_id == 'home'] {
        mainSection {
          pageTitle,
          ${slots("mainSection")}
        },
        ${slots("home")}
      }

    `
  );
