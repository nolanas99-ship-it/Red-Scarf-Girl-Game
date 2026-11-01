RED SCARF GIRL
A top-down story game inspired by Ji-li Jiang's memoir "Red Scarf Girl: A Memoir of the Cultural Revolution" (1997)
Build 2

HOW TO RUN
Open index.html in Chrome, Edge, Firefox or Safari. Keep the css/ and js/ folders next to it.
(If your browser blocks local files, run a tiny local server in this folder, for example:
   python -m http.server 8765
 and open http://localhost:8765)

CONTROLS
  Arrow keys / WASD ...... walk
  Z / Enter / E .......... talk, examine, confirm
  Hold X / Shift ......... run, and skip text
  C / Esc / Tab .......... menu (goal, story so far, Ji-li's stats, words, journal, options)
On phones and tablets, on-screen buttons appear under the game.

HOW THE STORY IS EASY TO FOLLOW
- The current goal is always shown at the top of the screen, with where to go.
- A yellow arrow points at the door you need, or at the person/object you need.
- Each chapter opens with a title card that explains what is happening in plain words.
- New words (da-zi-bao, Four Olds, Red Guards, "black" families...) are explained the first
  time they appear and collected under WORDS in the menu.
- The menu's STORY tab has a summary of every finished chapter.
- Things that sparkle haven't been examined yet. Almost everything can be looked at, and what
  objects and people say changes from chapter to chapter.

THE SEVEN CHAPTERS
  1. The Red Scarf (Spring 1966): the army arts academy audition
  2. Destroy the Four Olds (Summer 1966): smashed signs, burned books, da-zi-bao, Du Hai's reveal
  3. The Searches (Aug-Sept 1966): Song Po-po leaves, An Yi's grandmother, burning photos, the raid
  4. A New School (1967): Chang Hong and the Class Education Exhibition; Dad is detained
  5. Draw a Clear Line (1967-68): Thin-Face pressures Ji-li to testify against Dad
  6. The Letter (1968): the countryside, Mom's letter, Grandma sweeping the lane
  7. What Remains: a last walk and the ending

PLACES
Bedroom & kitchen, living room, the lane, An Yi's home, the street, the schoolyard, the
classroom, the junior high hall, the school office, and the countryside.

CHOICES
Your choices change Standing (how people treat you in public), Family and Conscience, and the
game remembers specific things you did (the poster you wrote, the book you saved, the photo you
hid...). These are brought up later and change the ending. There are three endings, followed by
what really happened to Ji-li Jiang.

SAVING
The game saves automatically whenever you change rooms or finish a goal. Use the menu's
Options tab to download a save file or load one.

HISTORICAL NOTE
This is an original, simplified adaptation, not a reproduction of the book. The dialogue is
invented, and some events are combined or reordered for the game. The people and main events
(the audition, Du Hai's reveal, Song Po-po, the raids, Chang Hong, the Exhibition, Thin-Face,
Dad's detention, the letter, Grandma sweeping the lane) come from the memoir. Read the book for
the real story.

FILES
  index.html ...... page
  css/style.css ... look of the menus and dialogue box
  js/art.js ....... pixel-art drawing (tiles, characters, furniture)
  js/engine.js .... movement, rooms, dialogue, saving
  js/rooms.js ..... room maps, objects and what they say
  js/story.js ..... characters, chapters, choices, glossary, endings
  js/ui.js ........ title screen, menu, poster-writing desk
  old_build1/ ..... the previous version of the game
