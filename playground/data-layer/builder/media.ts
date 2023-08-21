import { Builder } from "../../../src/lib/builder";

export const mediaFactory = new Builder()
  .setSchema({
    name: "media",
    type: "object",
    fields: [
      {
        name: "type",
        title: "Type",
        type: "string",
        options: {
          list: ["image", "video"],
          layout: "radio",
          direction: "horizontal",
        },
        initialValue: "image",
        validation: (Rule) => Rule.required(),
      },
      {
        name: "mood",
        title: "Mood Video",
        description: "Automatic playback without audio. Videos should be max. 10 seconds long.",
        type: "file",
        hidden: ({ parent }) => parent?.type !== "video",
      },
      {
        name: "player",
        title: "Video Player",
        description:
          "Video Player with all playback controls. If combined with a mood video, the mood video will replace the image poster.",
        type: "file",
        hidden: ({ parent }) => parent?.type !== "video",
      },
      {
        name: "image",
        type: "image",
        options: {
          hotspot: true,
        },
        hidden: ({ parent }) => parent?.type !== "image",
      },
    ],
    preview: {
      select: {
        type: "type",
        mood: "mood.asset.playbackId",
        player: "player.asset.playbackId",
        image: "image",
      },
      prepare(args) {
        if (args.type === "video") {
          const thumbnail = `https://image.mux.com/${args.mood || args.player}/thumbnail.jpg`;
          return {
            title: [args.mood && "Mood Video", args.player && "Video Player"].filter(Boolean).join(" and "),
          };
        } else {
          return {
            title: "Image",
            media: args.image,
          };
        }
      },
    },
  })
  .setQuery(
    () => /* groq */ ` 
    media {
      _type,
      type,
      type == 'image' => {
        'image': image.asset->{
        url,
        'lqip': metadata.lqip,
        'ratio': metadata.dimensions.aspectRatio
      },
      crop,
      hotspot
      },
      type == 'video' => {
        'player': player.asset->{
          'playbackId': playbackId,
          'ratio': data.aspect_ratio,
          thumbTime
      
        },
        'mood': mood.asset->{
        'playbackId': playbackId,
        'ratio': data.aspect_ratio
        }
      }
    }
    `
  );
