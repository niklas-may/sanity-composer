import { Builder } from "src/library/builder";
import callToActionsFactory from "./call-to-action";
import galleryFactory from "./gallery";
import abstractWebPage from "./abstract-web-page";

export default new Builder()
  .mixin(abstractWebPage)
  .setSchema({
    type: "document",
    name: "page",
    fields: [
      {
        group: "content",
        name: "mainSection",
        type: "object",
        fields: [
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
          ${slots("mainSection")}
        },
        ${slots("mixin")}
        ${slots("page")}
      }
    `
  );
