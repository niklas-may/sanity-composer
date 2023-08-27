import { Builder } from "src/library/builder";
import callToActionsFactory from "./call-to-action";
import galleryFactory from "./gallery";


export default new Builder()
  .setSchema({
    name: "page",
    type: "document",
    fields: [
      {
        name: "mainSection",
        group: "content",
        type: "object",
        fields: [
          {
            name: "pageTitle",
            type: "string",
          },
          galleryFactory,
        ],
      },
      callToActionsFactory.setGroup("content"),
    ],
    preview: {
      select: {
        title: "mainSection.pageTitle",
      },
      prepare(args) {
        return {
          title: args.title,
        };
      },
    },
  })
  .setQuery(
    (slots) => /* groq */ `

      *[_type == 'page'] {
        mainSection {
          pageTitle,
          ${slots("mainSection")}
        },
        ${slots("mixin")}
        ${slots("page")}
      }

    `
  );
