# Background footage

The methods section on the homepage plays a clip behind the stacked method list.
It is empty until you add one — the section falls back to a generated stitch
field and still looks finished, so nothing is broken while this is unfilled.

## To add it

1. Put the clip at `public/video/manufacturing.mp4` and a still frame at
   `public/video/manufacturing.jpg`.
2. Set both paths in `MEDIA` in `src/lib/site.ts`.

## What the clip needs to be

- **Short and silent.** 6–12 seconds, looping, no audio track. It autoplays
  muted (the only way autoplay is allowed) and is decorative.
- **Small.** Under ~4 MB. It sits behind text and is heavily darkened, so it can
  be compressed hard — encode at a lower bitrate than you would for a hero video.
- **Slow-moving.** A close, steady shot reads well under a scrim. Fast cuts or
  camera movement fight the type sitting on top.
- **Licensed for commercial use.** Free permissive sources include Pexels,
  Pixabay and Coverr; paid options include Adobe Stock, Artgrid, Envato and
  iStock. Check the licence covers commercial use on a company website, and keep
  a copy of it.

Useful search terms: *sewing machine close up*, *textile factory*, *embroidery
machine*, *screen printing press*, *garment production line*.

It is suppressed entirely for visitors who have asked for reduced motion; they
get the poster still instead.
