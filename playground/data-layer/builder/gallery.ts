import { mediaFactory } from "./media";
import { Builder } from "../../../src/lib/builder";

export const galleryFactory = new Builder()
  .setSchema({
    type: "array",
    name: "gallery",
    of: [mediaFactory],
  })
  .setQuery(
    (slots) => `
    gallery[] { 
      caption,
      ${slots("gallery")}
    }`
  );
