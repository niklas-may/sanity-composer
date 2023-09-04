import {Builder} from './../../../../../src/library/builder'

const contentGroup = { name: "content", title: "Content", default: true };
const seoGroup = { name: "seo", title: "SEO" };
const groups = [contentGroup, seoGroup];


export default new Builder()
  .setSchema({
    name: "webPage",
    groups,
    fields: [
      {
        type: "string",
        name: "pageTitle",
      },
      {
        type: "string",
        title: "Title (Open Graph)",
        group: seoGroup.name,
        name: "seoTitle",
        description: "Used for Open Graph previews implemented  by facebook, twitter, google etc.",
      },
      {
        title: "Description (Open Graph)",
        name: "seoDescription",
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
    (slots) => /* groq */ `
      'pageTitle': coalesce(pageTitle[$lang], pageTitle.en),
      'seoTitle': coalesce(seoTitle[$lang], seoTitle.en),
      'seoDescription': coalesce(seoDescription[$lang], seoDescription.en),
       seoKeywords
    `
  );
