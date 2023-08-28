/* DO NOT CHANGE
 * Autogenerated with Sanity Composer via package script "dev"
 */

export default /* groq */`
*[_type == "page"] {
  mainSection {
    pageTitle,
    gallery[] {
      caption,
      _key,
      media {
        type,
        type == "image" => {
          "image": image.asset-> {
            url,
            "lqip": metadata.lqip,
            "ratio": metadata.dimensions.aspectRatio
          },
          hotspot,
          crop
        },
        type == "video" => {
          "player": player.asset-> {
            "playbackId": playbackId,
            "ratio": data.aspect_ratio,
            thumbTime
          },
          "mood": mood.asset-> {
            "playbackId": playbackId,
            "ratio": data.aspect_ratio
          }
        }
      }
    }
  },
  "seoTitle": coalesce(seoTitle[], seoTitle.en),
  "seoDescription": coalesce(seoDescription[], seoDescription.en),
  seoKeywords,
  callToActions {
    url,
    title
  }
}
`