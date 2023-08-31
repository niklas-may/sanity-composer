import { Builder } from "src/library/builder";
import galleryFactory from "./gallery";

export default new Builder()
  .setSchema({
    type: "document",
    name: "home",
    fields: [galleryFactory],
  })
  .setQuery(
    (slots) => /* groq */ `
      *[_type == 'home'] {
        "slug": slug.current,
        ${slots("home")}
      }

    `
  );
