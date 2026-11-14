/* All projects on the site. This is the one file to edit when you add or complete a project.

   Every field left empty ("" or []) is simply not shown on the site, so nothing is invented.
   Fill these in when you can:
     year      "2025"
     role      "Lead developer", "Sole developer", ...
     tools     ["Unity", "C#", "OSC", "Art-Net"]         tools and protocols, shown on the project page
     signal    ["LiDAR", "UDP", "Unity", "LED wall"]     the signal path, input first, output last
     problem   what the client or event needed
     built     what you built and how it worked
     outcome   what happened: where it ran, for how long, how many people used it
     images    ["media/photo-1.jpg"]                     extra photos or screenshots

   Already set from the footage: title, summary, categories, tech, video, poster.
     categories  any of: games, interactive, sensing, ai, networking, hardware, tools   (the archive filters)
     tech        the technology filter in the archive, e.g. "Unity", "Kinect", "OSC", "DMX"
     featured    a number puts the project in the Featured section, in that order
     portrait    true for clips filmed upright
   "dated" is only a hint for you: the date in the original video file name. It is never shown. */

window.CATEGORIES = [
  { id: "games", label: "Games" },
  { id: "interactive", label: "Interactive and installations" },
  { id: "sensing", label: "Sensing and vision" },
  { id: "ai", label: "AI" },
  { id: "networking", label: "Networking and protocols" },
  { id: "hardware", label: "Hardware and IoT" },
  { id: "tools", label: "Tools and applications" },
];

const P = (id, title, summary, categories, tech, extra = {}) => ({
  id, title, summary, categories, tech,
  year: "", role: "", tools: [], signal: [], problem: "", built: "", outcome: "", images: [],
  video: `media/${id}.mp4`, poster: `media/${id}.jpg`, portrait: false, sound: false,
  ...extra,
});

window.PROJECTS = [
  P("lidar-loom", "LiDAR touch wall", "Touch a large LED wall and its lines bend and change colour around your hand, with sound",
    ["sensing", "interactive"], ["LiDAR"], { featured: 1, sound: true, signal: ["LiDAR", "LED wall"] }),
  P("virtual-tour", "3D virtual tour", "A touchscreen drives a 3D tour of a city and its towers on a wall display",
    ["interactive", "tools"], [], { featured: 2, video: "media/virtual-tour.mp4?v=2", signal: ["Touchscreen", "Wall display"] }),
  P("stage-laser", "Stage laser show", "A laser show with light bars and an LED screen in an event hall",
    ["interactive"], ["Laser"], { featured: 3, sound: true, dated: "2026-01-28" }),
  P("leap-fruit", "Leap Motion slicing game", "A Unity game played in mid-air: a Leap Motion tracker turns hand movement into slicing",
    ["games", "sensing"], ["Unity", "Leap Motion"], { featured: 4, portrait: true, video: "media/leap-fruit.mp4?v=2", signal: ["Leap Motion", "Unity", "Screen"] }),
  P("fluid-wall", "Fluid simulation wall", "A wall that answers touch with ripples from a fluid simulation, with logos appearing under the hand",
    ["sensing", "interactive"], ["LiDAR"], { featured: 5, video: "media/fluid-wall.mp4?v=2", signal: ["LiDAR", "LED wall"] }),
  P("space-room", "Space immersive room", "Planets, a space station and nebulae projected around the walls of a walk-in room",
    ["interactive"], ["Projection mapping"], { featured: 6, video: "media/space-room.mp4?v=2", dated: "2025-07-23" }),
  P("wearable-shooter", "Wearable-controlled shooter", "A shooting game on a big screen, played with a controller worn on the wrist",
    ["games", "hardware"], [], { featured: 7, video: "media/wearable-shooter.mp4?v=2", dated: "2026-10-21", signal: ["Wrist controller", "Game", "LED screen"] }),
  P("curved-wall", "Curved touch wall", "A long curved projected wall: touch it to open photos, numbers and maps",
    ["interactive", "sensing"], ["Projection mapping"], { featured: 8, dated: "2026-01-13" }),
  P("laser-video", "Laser and video show", "Laser beams sweep over a video wall and draw logos in light, in time with the video",
    ["interactive"], ["Laser"], { featured: 9, portrait: true, video: "media/laser-video.mp4?v=2" }),
  P("led-gesture", "Gesture-controlled LED tower", "Hand gestures control a tower of LED tubes, with sound",
    ["interactive", "sensing", "hardware"], [], { featured: 10, portrait: true, sound: true, signal: ["Hand gestures", "LED tubes"] }),

  P("leap-puzzle", "Leap Motion photo puzzle", "Pinch to pick up jigsaw pieces and place them, using hand tracking from a Leap Motion",
    ["games", "sensing"], ["Unity", "Leap Motion"], { video: "media/leap-puzzle.mp4?v=2", signal: ["Leap Motion", "Unity", "Screen"] }),
  P("td-hand-particles", "Hand-tracked particles", "Hand tracking from a webcam drives particle effects, built in TouchDesigner",
    ["sensing", "interactive"], ["TouchDesigner"], { dated: "2026-10-01", signal: ["Webcam", "TouchDesigner", "Screen"] }),
  P("td-audio-wave", "Audio-reactive wave visuals", "A wave visual with colour, speed and audio-reactivity controls, built in TouchDesigner",
    ["interactive"], ["TouchDesigner"], { sound: true, dated: "2026-10-14", signal: ["Audio", "TouchDesigner", "Screen"] }),
  P("fluid-floor", "Fluid simulation floor", "Ink-like colour swirls follow every step across the floor",
    ["sensing", "interactive"], ["LiDAR"], { portrait: true, video: "media/fluid-floor.mp4?v=2", signal: ["LiDAR", "Floor"] }),
  P("floor-lights", "Interactive floor", "Coloured light follows every step across the floor",
    ["sensing", "interactive"], ["LiDAR"], { portrait: true, signal: ["LiDAR", "Floor"] }),
  P("wall-map", "Interactive wall map", "An illustrated wall map that responds to touch",
    ["interactive"], [], { dated: "2024-12-03" }),
  P("touch-story-wall", "Interactive wall story", "Touch a wide projected wall and cards of stories open and move",
    ["interactive", "sensing"], ["Projection mapping"], { dated: "2025-11-04" }),
  P("wave-room", "Immersive wave room", "A walk-in room with waves across the wall and an interactive floor",
    ["interactive"], ["Projection mapping"], { dated: "2026-02-07" }),
  P("desert-room", "Immersive desert room", "A three-wall projection room plays a journey through desert, old town and city scenes",
    ["interactive"], ["Projection mapping"], { video: "media/desert-room.mp4?v=2", dated: "2025-02-19" }),
  P("exhibition-wall", "Projected exhibition wall", "Light and graphics projected across the walls of an exhibition stand, with screens set into the wall",
    ["interactive"], ["Projection mapping"], { dated: "2025-10-29" }),
  P("head-projection", "Sculpture projection", "A sculpted head with glowing eyes, lit by projection in a dark room",
    ["interactive"], ["Projection mapping"], { portrait: true, dated: "2025-10-03" }),
  P("laser-led", "Laser and LED screen", "Laser beams fan out over a large LED screen in a hall",
    ["interactive"], ["Laser"], { dated: "2025-06-26" }),
  P("laser-drawing", "Laser drawing show", "Lasers draw a ring, constellations, numbers and a running figure on a dark stage",
    ["interactive"], ["Laser"], { portrait: true, dated: "2025-12-31" }),
  P("green-ring", "Glowing ring display", "Green, smoke-like visuals swirl inside a round display",
    ["interactive"], [], { portrait: true, dated: "2025-12-25" }),

  P("memory-game", "Touch memory game", "A card-matching memory game on an upright touch kiosk, from sign-up to the winning screen",
    ["games"], [], { portrait: true, dated: "2026-02-07" }),
  P("prize-wheel", "Spin-the-wheel game", "A spin-the-wheel prize game on a tablet, used at a live event",
    ["games"], [], { portrait: true, dated: "2026-02-11" }),
  P("quiz-kiosk", "Touch quiz kiosk", "An upright touch kiosk runs a multiple-choice quiz and shows each player's score",
    ["games", "interactive"], [], { portrait: true, dated: "2024-11-20" }),
  P("quiz-wall", "Tablet quiz wall", "Quiz questions appear on a large wall while players answer on a tablet",
    ["games", "interactive"], [], { dated: "2025-10-27" }),
  P("sports-booth", "Sports booth challenge", "An interactive sports booth: staff start the game on a touch screen and visitors play on the turf",
    ["games", "interactive"], [], { dated: "2025-02-08" }),

  P("map-wall", "Interactive map wall", "A large video wall shows a map that opens facts and figures as it is explored",
    ["interactive"], [], { dated: "2025-08-24" }),
  P("tablet-wall", "Tablet-controlled LED wall", "A tablet in the visitor's hands controls the content on a large LED wall",
    ["interactive"], [], { dated: "2025-10-14" }),
  P("video-wall-control", "Touch-driven video wall", "Content cards float across a large video wall, steered from a small control screen below it",
    ["interactive"], [], { dated: "2025-11-11" }),
  P("led-circuit-wall", "Interactive LED wall", "A large LED wall in an exhibition hall shows circuit-style visuals and menus",
    ["interactive"], [], { portrait: true, video: "media/led-circuit-wall.mp4?v=2", dated: "2025-09-06" }),
  P("gesture-ring", "Gesture ring", "A hand held over a ring-shaped sensor controls the content on a tall LED display",
    ["sensing", "interactive", "hardware"], [], { portrait: true, dated: "2025-09-08", signal: ["Ring sensor", "LED display"] }),
  P("cube-trigger", "Place-the-cube trigger", "Placing a cube on a pedestal changes the content on the LED wall behind it",
    ["interactive", "hardware"], [], { portrait: true, dated: "2026-10-29", signal: ["Cube on pedestal", "LED wall"] }),
  P("display-cases", "Interactive display cases", "Visitors walk up to lit display cases in a showroom and interact with them",
    ["interactive"], [], { portrait: true, video: "media/display-cases.mp4?v=2", dated: "2025-11-19" }),
];
