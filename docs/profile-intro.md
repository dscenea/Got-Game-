# Profile selection motion

The original got GAME! logo, profile icons, gradients and static diagonal rays remain.
Only one desaturated sports photo appears per page visit, softly faded into the cream
background. Basketball and football alternate on successive visits in the same tab,
using sessionStorage; blocked storage falls back to a random choice. Returning from
registration keeps the same photo and does not repeat the intro.

The logo fades in, with small staggered entrances for the title and cards. The chosen
photo fades in and makes one slow 3.5% zoom over seven seconds, then stays still.
Animated bars, balls, boots, shadows, trails and their obsolete keyframes are removed.

All buttons remain visible and usable immediately. Leaving the screen cancels pending
visual work. One decoded image promise is reused, so rapid navigation cannot lose the
photo on returning. Reduced motion keeps the photo static. Image failure leaves the
original cream background and rays. Only the selected photo is downloaded.

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
