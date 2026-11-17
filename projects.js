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
    ["sensing", "interactive"], ["LiDAR", "TouchDesigner"], { featured: 1, sound: true, tools: ["TouchDesigner"], signal: ["LiDAR", "TouchDesigner", "LED wall"] }),
  P("virtual-tour", "3D virtual tour", "A touchscreen drives a 3D tour of a city and its towers on a wall display",
    ["interactive", "tools"], ["Unity"], { featured: 2, video: "media/virtual-tour.mp4?v=2", tools: ["Unity"], signal: ["Touchscreen", "Unity", "Wall display"] }),
  P("stage-laser", "Stage laser show", "A laser show with light bars and an LED screen in an event hall",
    ["interactive"], ["Laser", "TouchDesigner", "Pangolin Beyond"], { featured: 3, sound: true, tools: ["TouchDesigner", "Pangolin Beyond"], signal: ["Video", "TouchDesigner", "Pangolin Beyond", "Laser"],  dated: "2026-01-28" }),
  P("leap-fruit", "Leap Motion slicing game", "A Unity game played in mid-air: a Leap Motion tracker turns hand movement into slicing",
    ["games", "sensing"], ["Unity", "Leap Motion"], { featured: 4, portrait: true, video: "media/leap-fruit.mp4?v=2", signal: ["Leap Motion", "Unity", "Screen"] }),
  P("fluid-wall", "Fluid simulation wall", "A wall that answers touch with ripples from a fluid simulation, with logos appearing under the hand",
    ["sensing", "interactive"], ["LiDAR", "Unity"], { featured: 5, video: "media/fluid-wall.mp4?v=2", tools: ["Unity"], signal: ["LiDAR", "Unity", "LED wall"] }),
  P("space-room", "Space immersive room", "Planets, a space station and nebulae projected around the walls of a walk-in room",
    ["interactive"], ["Projection mapping", "Resolume Arena"], { tools: ["Resolume Arena"], featured: 6, video: "media/space-room.mp4?v=2", dated: "2025-07-23" }),
  P("wearable-shooter", "Hardware-based gun game", "A shooting game on a big screen, played with a hardware gun",
    ["games", "hardware"], ["Unity"], { featured: 7, video: "media/wearable-shooter.mp4?v=2", dated: "2026-10-21", tools: ["Unity"], signal: ["Hardware gun", "Unity", "LED screen"] }),
  P("curved-wall", "Curved touch wall", "A long curved projected wall: touch it to open photos, numbers and maps",
    ["interactive", "sensing"], ["Projection mapping", "Resolume Arena", "Unity"], { tools: ["Resolume Arena", "Unity"], featured: 8, dated: "2026-01-13" }),
  P("laser-video", "Laser and video show", "Laser beams sweep over a video wall and draw logos in light, in time with the video",
    ["interactive"], ["Laser", "TouchDesigner", "Pangolin Beyond"], { featured: 9, portrait: true, tools: ["TouchDesigner", "Pangolin Beyond"], signal: ["Video", "TouchDesigner", "Pangolin Beyond", "Laser"],  video: "media/laser-video.mp4?v=2" }),
  P("led-gesture", "Gesture-controlled LED tower", "Hand gestures control a tower of LED tubes, with sound",
    ["interactive", "sensing", "hardware"], ["TouchDesigner"], { featured: 10, portrait: true, sound: true, tools: ["TouchDesigner"], signal: ["Hand gestures", "TouchDesigner", "LED tubes"] }),

  P("leap-puzzle", "Leap Motion photo puzzle", "Pinch to pick up jigsaw pieces and place them, using hand tracking from a Leap Motion",
    ["games", "sensing"], ["Unity", "Leap Motion"], { video: "media/leap-puzzle.mp4?v=2", signal: ["Leap Motion", "Unity", "Screen"] }),
  P("td-hand-particles", "Hand-tracked particles", "Hand tracking from a webcam drives particle effects, built in TouchDesigner",
    ["sensing", "interactive"], ["TouchDesigner"], { dated: "2026-10-01", signal: ["Webcam", "TouchDesigner", "Screen"] }),
  P("td-audio-wave", "Audio-reactive wave visuals", "A wave visual with colour, speed and audio-reactivity controls, built in TouchDesigner",
    ["interactive"], ["TouchDesigner"], { sound: true, dated: "2026-10-14", signal: ["Audio", "TouchDesigner", "Screen"] }),
  P("fluid-floor", "Fluid simulation floor", "Ink-like colour swirls follow every step across the floor",
    ["sensing", "interactive"], ["LiDAR", "Unity"], { portrait: true, tools: ["Unity"], video: "media/fluid-floor.mp4?v=2", signal: ["LiDAR", "Unity", "Floor"] }),
  P("floor-lights", "Interactive floor", "Coloured light follows every step across the floor",
    ["sensing", "interactive"], ["LiDAR", "Unity"], { portrait: true, tools: ["Unity"], signal: ["LiDAR", "Unity", "Floor"] }),
  P("wall-map", "Interactive wall map", "An illustrated wall map that responds to touch",
    ["interactive"], ["Projection mapping", "Resolume Arena", "Unity"], { tools: ["Resolume Arena", "Unity"], dated: "2024-12-03" }),
  P("touch-story-wall", "Interactive wall story", "Touch a wide projected wall and cards of stories open and move",
    ["interactive", "sensing"], ["Projection mapping", "Resolume Arena", "Unity"], { tools: ["Resolume Arena", "Unity"], dated: "2025-11-04" }),
  P("wave-room", "Immersive application", "A walk-in room with waves across the wall and an interactive floor",
    ["interactive"], ["Unity"], { tools: ["Unity"], dated: "2026-02-07" }),
  P("desert-room", "Immersive projection mapping", "A three-wall projection room plays a journey through desert, old town and city scenes",
    ["interactive"], ["Projection mapping", "Resolume Arena"], { tools: ["Resolume Arena"], video: "media/desert-room.mp4?v=2", dated: "2025-02-19" }),
  P("exhibition-wall", "Projected exhibition wall", "Light and graphics projected across the walls of an exhibition stand, with screens set into the wall",
    ["interactive"], ["Projection mapping", "Resolume Arena", "Unity"], { tools: ["Resolume Arena", "Unity"], dated: "2025-10-29" }),
  P("head-projection", "Sculpture projection", "A sculpted head with glowing eyes, lit by projection in a dark room",
    ["interactive"], ["Projection mapping", "Resolume Arena"], { tools: ["Resolume Arena"], portrait: true, dated: "2025-10-03" }),
  P("laser-led", "Laser and LED screen", "Laser beams fan out over a large LED screen in a hall",
    ["interactive"], ["Laser", "TouchDesigner", "Pangolin Beyond"], { tools: ["TouchDesigner", "Pangolin Beyond"], signal: ["Video", "TouchDesigner", "Pangolin Beyond", "Laser"], dated: "2025-06-26" }),
  P("laser-drawing", "Laser drawing show", "Lasers draw a ring, constellations, numbers and a running figure on a dark stage",
    ["interactive"], ["Laser", "TouchDesigner", "Pangolin Beyond"], { portrait: true, tools: ["TouchDesigner", "Pangolin Beyond"], signal: ["Video", "TouchDesigner", "Pangolin Beyond", "Laser"], dated: "2025-12-31" }),
  P("green-ring", "Glowing ring display", "Green, smoke-like visuals swirl inside a round display",
    ["interactive"], ["TouchDesigner"], { portrait: true, tools: ["TouchDesigner"], dated: "2025-12-25" }),

  P("memory-game", "Touch memory game", "A card-matching memory game on an upright touch kiosk, from sign-up to the winning screen",
    ["games"], ["Unity"], { tools: ["Unity"], portrait: true, dated: "2026-02-07" }),
  P("prize-wheel", "Spin-the-wheel game", "A spin-the-wheel prize game on a tablet, used at a live event",
    ["games"], ["Unity"], { tools: ["Unity"], portrait: true, dated: "2026-02-11" }),
  P("quiz-kiosk", "Touch quiz kiosk", "An upright touch kiosk runs a multiple-choice quiz and shows each player's score",
    ["games", "interactive"], ["Unity"], { tools: ["Unity"], portrait: true, dated: "2024-11-20" }),
  P("quiz-wall", "Tablet quiz wall", "Quiz questions appear on a large wall while players answer on a tablet",
    ["games", "interactive"], ["Unity"], { tools: ["Unity"], dated: "2025-10-27" }),
  P("sports-booth", "Sports booth challenge", "An interactive sports booth: staff start the game on a touch screen and visitors play on the turf",
    ["games", "interactive"], ["Unity", "TouchDesigner"], { tools: ["Unity", "TouchDesigner"], dated: "2025-02-08" }),

  P("map-wall", "Interactive map wall", "A large video wall shows a map that opens facts and figures as it is explored",
    ["interactive"], ["Unity"], { tools: ["Unity"], dated: "2025-08-24" }),
  P("tablet-wall", "Tablet-controlled LED wall", "A tablet in the visitor's hands controls the content on a large LED wall",
    ["interactive"], ["Unity"], { tools: ["Unity"], dated: "2025-10-14" }),
  P("video-wall-control", "Touch-driven video wall", "Content cards float across a large video wall, steered from a small control screen below it",
    ["interactive"], ["Unity"], { tools: ["Unity"], dated: "2025-11-11" }),
  P("led-circuit-wall", "Interactive LED wall", "A large LED wall in an exhibition hall shows circuit-style visuals and menus",
    ["interactive"], ["Unity"], { tools: ["Unity"], portrait: true, video: "media/led-circuit-wall.mp4?v=2", dated: "2025-09-06" }),
  P("gesture-ring", "Gesture ring", "A hand held over a ring-shaped sensor controls the content on a tall LED display",
    ["sensing", "interactive", "hardware"], ["Unity"], { tools: ["Unity"], portrait: true, dated: "2025-09-08", signal: ["Ring sensor", "Unity", "LED display"] }),
  P("cube-trigger", "Place-the-cube trigger", "Placing a cube on a pedestal changes the content on the LED wall behind it",
    ["interactive", "hardware"], ["Unity"], { tools: ["Unity"], portrait: true, dated: "2026-10-29", signal: ["Cube on pedestal", "Unity", "LED wall"] }),
  P("display-cases", "Interactive display cases", "Visitors walk up to lit display cases in a showroom and interact with them",
    ["interactive"], ["Unity"], { tools: ["Unity"], portrait: true, video: "media/display-cases.mp4?v=2", dated: "2025-11-19" }),
];

/* The order of the fast-forward glimpse on the main page (media/glimpse.mp4). Built by tools\make-trailer.ps1 -Set all -NoCaptions.
   One glimpse per project, in this order; the line under the video names the project on screen. */
window.GLIMPSE = ["lidar-loom", "td-hand-particles", "laser-video", "fluid-wall", "leap-fruit", "virtual-tour", "stage-laser", "leap-puzzle", "desert-room", "led-gesture", "quiz-kiosk", "fluid-floor", "curved-wall", "td-audio-wave", "wearable-shooter", "laser-led", "space-room", "floor-lights", "quiz-wall", "touch-story-wall", "laser-drawing", "wave-room", "memory-game", "map-wall", "gesture-ring", "exhibition-wall", "sports-booth", "tablet-wall", "head-projection", "prize-wheel", "wall-map", "cube-trigger", "led-circuit-wall", "display-cases", "green-ring", "video-wall-control"];
