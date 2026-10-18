# Profile selection motion

The original got GAME! logo, profile icons, card gradients and diagonal rays are preserved.
This is a silent montage of generated stills, animated SVG balls and CSS, not footage of
moving players. Original black/yellow light ribbons reveal the screen, a basketball
bounces with squash and shadow, and a football spins away from an animated boot.
It plays once per page load on the first profile selection entry. Cards remain visible and
clickable throughout. All animations share the same 3.5-second timeline, cleaned up at
3.6 seconds. Photos decode independently without restarting their animation. The ball's
flight, spin and trail use separate layers; the basketball's squash is limited to impact
instead of stretching through the flight. Temporary compositing hints apply only during
the intro and the ribbon layers avoid blur filters.
Returning to another screen cancels pending image work and timers. Reduced motion uses the
original static screen, without downloading these photos. Image loading failure does not
block navigation. The photos are loaded only when profile selection is first opened.

## Files

- `assets/profile-intro.js`: activation, image loading and cancellation.
- `assets/profile-intro.css`: montage, entrance timings and reduced motion.
- `assets/profile-intro-basketball.webp`: 720 × 1080 basketball still.
- `assets/profile-intro-football.webp`: 720 × 1080 football still.

Generated with the built-in image generation tool, then encoded as WebP using FFmpeg.
The same responsive screen is used by all profile choices and new-club onboarding.

## Generation prompts

Basketball: Use case: ads-marketing. Asset type: cinematic background still for a sports
club app onboarding motion montage, portrait 2:3 composition. Photorealistic editorial
sports action photograph: adult basketball player in an unbranded dark jersey driving
toward the hoop, three-quarter side profile, dynamic low angle, basketball clearly visible
in one hand, indoor court and hoop in upper background, restrained motion blur in
environment, dramatic side light. High-contrast black and white with only a restrained
warm golden-yellow rim light. Athlete and ball on right half, left half mostly soft shadow
and negative space for UI overlay. The whole image must be one coherent photograph with
no panels. No text, lettering, logos, brands or watermark. Natural plausible hands and
anatomy. Intended to be very softly faded behind cream UI and graphic diagonal stripes.

Football: Use case: ads-marketing. Asset type: cinematic background still for a sports
club app onboarding motion montage, portrait 2:3 composition matching an editorial
basketball campaign. Photorealistic editorial sports action photograph: adult football
player in plain unbranded kit striking a football on an outdoor pitch, three-quarter low
side view, full body and football visible, faint stadium floodlights, dramatic directional
light, restrained motion blur behind the action. High-contrast black and white with only
a restrained warm golden-yellow rim light. Player on right half, left half mostly
atmospheric shadow and negative space for UI overlay. One coherent photograph with no
panels. No text, lettering, logos, brands or watermark. Natural plausible hands, limbs
and anatomy. Intended to be very softly faded behind cream UI and graphic diagonal stripes.
