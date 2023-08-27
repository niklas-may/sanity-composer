import { Builder } from "src/library/builder";
import galleryFactory from "./gallery";

export default new Builder()
  .setSchema({
    name: "home",
    type: "document",
    fields: [galleryFactory],
  })
  .setQuery(
    (slots) => /* groq */ `

      *[_type == 'home'] {
        _type,
        mainSection {
          pageTitle,
        },
        ${slots("home")}
      }

    `
  );
