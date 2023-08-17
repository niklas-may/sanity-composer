import { mediaFactory } from "./media";
import { Builder } from "../../src/lib/builder";

export const galleryFactory = new Builder()
  .setSchema({
    type: "array",
    name: "gallery",
    of: [mediaFactory, { type: "caption", name: "caption" }],
  })
  .setQuery(
    (slots) => `
    gallery[] { 
      caption,
      ${slots("gallery")}
    }`
  );
