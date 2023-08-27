import { Builder } from "src/library/builder";

const contentGroup = { name: "content", title: "Content", default: true };
const seoGroup = { name: "seo", title: "SEO" };
const groups = [contentGroup, seoGroup];

export default new Builder()
  .setSchema({
    name: "page",
    groups,
    fields: [
      {
        type: "string",
        title: "Title (Open Graph)",
        name: "seoTitle",
        group: seoGroup.name,
        description: "Used for Open Graph previews implemented  by facebook, twitter, google etc.",
      },
      {
        name: "seoDescription",
        title: "Description (Open Graph)",
        type: "string",
        group: seoGroup.name,
      },
      {
        name: "seoKeywords",
        type: "array",
        group: seoGroup.name,
        options: {
          layout: "tags",
        },
        of: [{ name: "keyword", type: "string" }],
      },
      {
        name: "seoShareImage",
        title: "Image (Open Graph)",
        group: seoGroup.name,
        description: "1200x630px recommended",
        type: "image",
        options: {
          hotspot: true,
        },
      },
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
    () => /* groq */ `
      'seoTitle': coalesce(seoTitle[$lang], seoTitle.en),
      'seoDescription': coalesce(seoDescription[$lang], seoDescription.en),
       seoKeywords
    `
  );
