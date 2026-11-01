'use strict';
// Room layouts. Map legend:
//  X void   # wall   D door (walkable)   . floor   , rug
//  b brick facade   R roof   p paving   r road   d dirt   g grass   h hedge   w water   = fence
// Objects use tile coordinates for their footprint. `wall: true` objects hang on walls.
// `look` text can be a string, a list of lines, a function of state, or {chapter: text}
// where the highest chapter number not above the current chapter is used.
// Exits: walking into the rectangle moves you to `to` at (tx, ty). `dir` is the direction you walk to use it.
const ROOMS = {

  home: {
    name: 'Living room', floor: 'wood', wall: 'paper',
    map: [
      'XXXXXXXXXXXXXXXXXXXX',
      'X##################X',
      'X###############D##X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X.....,,,,,,,,.....X',
      'X.....,,,,,,,,.....X',
      'X.....,,,,,,,,.....X',
      'X.....,,,,,,,,.....X',
      'X..................X',
      'X..................X',
      'X..................X',
      'XXXXXXXXX..XXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXX',
    ],
    exits: [
      { x: 9, y: 13, w: 2, h: 1, to: 'lane', tx: 3, ty: 3, dir: 'down' },
      { x: 16, y: 2, w: 1, h: 1, to: 'home_back', tx: 16, ty: 12, dir: 'up' },
    ],
    objects: [
      { id: 'window', type: 'window', x: 3, y: 1, w: 2, h: 2, wall: true, look: {
        0: 'Morning light falls across the floor. Down in the lane, a neighbor is pinning up laundry.',
        1: 'Red flags hang from windows all along the lane. Somewhere, a loudspeaker plays the same song again and again.',
        2: 'You keep the curtains half-closed now. It feels safer not to be seen.',
        6: 'The lane looks the same as ever. You are the one who has changed.' } },
      { id: 'photo', type: 'photo', x: 7, y: 1, w: 1, h: 2, wall: true, gone: s => s.flags.burned, look: {
        0: "A photo of the whole family on Grandma's birthday. Everyone is smiling except Ji-yong, who blinked.",
        2: s => s.flags.burned ? 'An empty nail. The photo went into the stove before the Red Guards could find it.' : 'The family photo. Mom keeps looking at it, then looking away.',
        6: s => s.flags.photoSurvived ? 'You have put the tiny photo you saved from the fire back on the nail. The whole family, together.' : 'An empty nail where the family photo used to hang.' } },
      { id: 'portrait', type: 'portrait', x: 10, y: 1, w: 1, h: 2, wall: true, look: {
        0: 'A portrait of Chairman Mao, the leader of China. Almost every home has one. You believe he is the wisest man in the world.',
        1: 'Grandma dusts the portrait every single day now. Being seen to love Chairman Mao matters more than ever.' } },
      { id: 'clock', type: 'clock', x: 12, y: 1, w: 1, h: 2, wall: true, look: {
        0: 'Tick, tock. The clock was a wedding present to Grandma, many years ago.',
        2: s => s.flags.raided ? 'The clock is gone. A Red Guard called it a "bourgeois luxury." A clean square on the wall shows where it hung.' : 'Tick, tock. Mom wonders aloud if a fancy clock looks too "bourgeois."' } },
      { id: 'calendar', type: 'calendar', x: 14, y: 1, w: 1, h: 2, wall: true, look: {
        0: 'A calendar for 1966. Your exam days are circled in red.',
        1: 'Your exam days are still circled. There will be no exams this year. Classes have stopped for the revolution.',
        3: 'A calendar for 1967. Junior high finally starts this month!',
        4: 'Someone has circled the day Dad was taken. Nobody remembers doing it.',
        5: 'A calendar for 1968. Each day crossed off is one more day Dad is gone.' } },
      { id: 'shelf', type: 'bookshelf', x: 1, y: 3, w: 2, h: 1, look: {
        0: "Dad's books: plays, poems, and novels from all over the world. Dad works at a theater, so he loves stories.",
        1: 'Dad has quietly taken some books off the shelf and hidden them. "Just to be careful," he says.',
        2: s => s.flags.raided ? 'Almost empty. The Red Guards took nearly every book.' : 'Mom is sorting the books into two piles: safe and dangerous. The dangerous pile is bigger.' } },
      { id: 'radio', type: 'cabinet', radio: true, x: 5, y: 3, w: 2, h: 1, look: {
        0: 'The family radio. In the evenings Dad listens to music while Grandma knits.',
        1: 'The radio only plays revolutionary songs and news now.',
        4: 'Thin-Face claims Dad listened to foreign radio stations. Now nobody in the family touches the radio at all.' } },
      { id: 'wardrobe', type: 'wardrobe', x: 18, y: 3, w: 1, h: 1, look: {
        0: "Grandma's silk dresses are in here, wrapped in paper. She hasn't worn them in years.",
        2: s => s.flags.raided ? 'The wardrobe door hangs open. The silk dresses are gone.' : 'Mom has hidden the silk dresses under a pile of old cotton clothes.' } },
      { id: 'table', type: 'table', x: 8, y: 7, w: 4, h: 2, look: {
        0: 'Breakfast: rice porridge and pickled vegetables. Ji-yong has already eaten half of yours.',
        1: 'Dinner is quiet now. Nobody talks about what they saw in the street today.',
        2: s => s.flags.raided ? 'The table is bare. Even the good teacups were taken.' : 'Mom has put the good teacups away "for now."',
        3: 'The family eats quickly. Everyone is tired.',
        4: "Dad's place at the table is set every night, just in case.",
        6: 'The table where the whole family used to sit. One day, you hope, it will be full again.' } },
      { id: 'chairL', type: 'chair', x: 7, y: 8, w: 1, h: 1 },
      { id: 'chairR', type: 'chair', x: 12, y: 8, w: 1, h: 1, look: { 0: "Dad's chair.", 4: "Dad's chair. Nobody sits in it." } },
      { id: 'armchair', type: 'armchair', x: 2, y: 9, w: 1, h: 1, look: {
        0: "Grandma's favorite chair. It's the softest seat in the house, and everyone knows not to take it.",
        5: "Grandma's chair. She comes home from sweeping the lane and sits here without a word for a long time." } },
      { id: 'plant', type: 'plant', x: 18, y: 12, w: 1, h: 1, look: {
        0: 'A pot of orchids. Grandma says orchids need patience, not too much water.',
        2: 'The orchids are wilting. Nobody has had time to water them.',
        6: 'Somebody watered the orchids. A new bud is opening.' } },
      { id: 'bag', type: 'bag', x: 15, y: 11, w: 1, h: 1, solid: false, look: {
        0: "Ji-yun's schoolbag. She drew a cat on it in pencil.",
        1: "Ji-yun's schoolbag sits unused. There is no school this summer.",
        3: "Ji-yun's schoolbag. Her classmates have started calling her names because of the family." } },
    ],
  },

  home_back: {
    name: 'Bedroom & kitchen', floor: 'wood', wall: 'paper',
    map: [
      'XXXXXXXXXXXXXXXXXXXX',
      'X##################X',
      'X##################X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'XXXXXXXXXXXXXXXX.XXX',
      'XXXXXXXXXXXXXXXXXXXX',
    ],
    exits: [{ x: 16, y: 13, w: 1, h: 1, to: 'home', tx: 16, ty: 3, dir: 'down' }],
    objects: [
      { id: 'certs', type: 'certs', x: 2, y: 1, w: 2, h: 2, wall: true, look: {
        0: 'Your certificates: "Excellent Student," "Model Young Pioneer," "Top Marks in Mathematics." You are proud of every one.',
        1: 'Your certificates. A week ago they felt like proof of who you are. Now you are not so sure.',
        2: s => s.flags.raided ? 'One certificate is torn in half. A Red Guard laughed when he did it.' : 'Your certificates. Should you hide them? Are they "dangerous"? You don\'t know anymore.' } },
      { id: 'window2', type: 'window', x: 8, y: 1, w: 2, h: 2, wall: true, look: {
        0: 'From here you can see the rooftops of Shanghai, stretching all the way to the river.',
        2: 'At night you can hear trucks in the street, and sometimes shouting.' } },
      { id: 'bed_jili', type: 'bed', quilt: '#c86a8a', raidable: true, x: 2, y: 3, w: 2, h: 3, look: {
        0: 'Your bed. You share it with Ji-yun, who kicks in her sleep.',
        2: s => s.flags.raided ? 'The Red Guards slashed the pillows looking for hidden gold. There are still feathers between the floorboards.' : 'Your bed. You have not slept well in weeks.' } },
      { id: 'bed_parents', type: 'bed', quilt: '#4a6a9a', x: 5, y: 3, w: 3, h: 3, look: {
        0: "Mom and Dad's bed. Dad's reading glasses are on the pillow.",
        3: 'Mom sleeps on her side of the bed, as if Dad might walk in at any moment.' } },
      { id: 'trunk', type: 'trunk', x: 10, y: 3, w: 2, h: 1, look: {
        0: "An old leather trunk full of family treasures: photo albums, letters, Grandma's jewelry box.",
        2: s => s.flags.burned ? 'The trunk is nearly empty. It smells of smoke.' : 'Mom keeps glancing at the trunk. Everything in it could be called "Four Olds."',
        5: 'The empty trunk.' } },
      { id: 'stove', type: 'stove', x: 14, y: 3, w: 2, h: 1, look: {
        0: "Song Po-po's kitchen. Something always smells good here. Today: scallion pancakes.",
        2: s => s.flags.burned ? 'Gray ash is still in the stove: the last of the family photographs.' : s.flags.popoLeft ? 'The stove is cold. Mom tries to cook, but it is not the same.' : 'Song Po-po is cooking, but she keeps stopping to wipe her eyes.' } },
      { id: 'basin', type: 'basin', x: 17, y: 3, w: 1, h: 1, look: 'A wash basin. The water is always cold in the morning.' },
      { id: 'ktable', type: 'table', items: false, x: 14, y: 8, w: 2, h: 1, look: {
        0: 'The kitchen table where Song Po-po taught you to fold dumplings. Yours always fall apart.',
        2: s => s.flags.popoLeft ? 'The kitchen table. You try folding dumplings by yourself. They still fall apart.' : 'The kitchen table.' } },
      { id: 'kstool', type: 'stool', x: 13, y: 8, w: 1, h: 1 },
      { id: 'ricejar', type: 'crates', x: 18, y: 8, w: 1, h: 1, look: {
        0: 'The rice jar, full to the top.',
        4: "The rice jar is almost empty. Mom's pay has been cut since Dad was taken." } },
      { id: 'desk_home', type: 'desk', books: true, x: 2, y: 9, w: 2, h: 1, look: {
        0: 'Your desk. Your homework is finished, as always.',
        1: 'Your schoolbooks. No one knows when classes will start again.',
        3: 'Your new junior high books. You read them twice before the first day.',
        6: 'Your journal is on the desk.' } },
      { id: 'kbroom', type: 'broom', x: 18, y: 12, w: 1, h: 1, look: 'A broom. Since Song Po-po left, sweeping is your job.' },
    ],
  },

  lane: {
    name: 'The lane', outdoor: true, floor: 'paving',
    map: [
      'RRRRRRRRRRRRRRRRRRRR',
      'bbbbbbbbbbbbbbbbbbbb',
      'bbbDbbbbbbbbbbbDbbbb',
      'bppppppppppppppppppb',
      'bppppppppppppppppppb',
      'bppppppppppppppppppb',
      'bppppppppppppppppppp',
      'bppppppppppppppppppp',
      'bppppppppppppppppppp',
      'bppppppppppppppppppb',
      'bppppppppppppppppppb',
      'bppppppppppppppppppb',
      'bbbbbbbbbbbbbbbbbbbb',
      'RRRRRRRRRRRRRRRRRRRR',
      'RRRRRRRRRRRRRRRRRRRR',
    ],
    exits: [
      { x: 3, y: 2, w: 1, h: 1, to: 'home', tx: 9.5, ty: 12, dir: 'up' },
      { x: 15, y: 2, w: 1, h: 1, to: 'anyi', tx: 9.5, ty: 12, dir: 'up' },
      { x: 19, y: 6, w: 1, h: 3, to: 'street', tx: 1, ty: 4, dir: 'right' },
    ],
    objects: [
      { id: 'lwin1', type: 'fwindow', x: 6, y: 1, w: 2, h: 1, wall: true, look: {
        0: 'A neighbor\'s window. Someone inside is practicing the erhu, badly.',
        2: 'Every window in the lane is shut tight, even though it is hot.' } },
      { id: 'lwin2', type: 'fwindow', shutter: true, x: 10, y: 1, w: 2, h: 1, wall: true, look: {
        0: "Six-Fingers' window. He is a factory worker who lives at the end of the lane.",
        1: "Six-Fingers' window. A big red flag hangs from it now." } },
      { id: 'lwin3', type: 'fwindow', x: 17, y: 1, w: 2, h: 1, wall: true, look: {
        0: "An Yi's window. When you were little, you used to signal each other with a flashlight.",
        2: "An Yi's window. The curtains have not opened in days." } },
      { id: 'laundry', type: 'laundry', overhead: true, x: 4, y: 5, w: 8, h: 1 },
      { id: 'tap', type: 'tap', x: 11, y: 3, w: 1, h: 1, look: {
        0: 'The shared water tap. Everyone in the lane gets water here, so everyone hears everyone\'s news.',
        2: 'At the tap, the neighbors stop talking when you walk up.',
        5: 'Grandma fills her bucket here before she starts sweeping.' } },
      { id: 'bucket', type: 'bucket', x: 12, y: 3, w: 1, h: 1, look: 'A bucket, waiting for its turn at the tap.' },
      { id: 'bike', type: 'bicycle', x: 7, y: 3, w: 2, h: 1, look: {
        0: 'Dad\'s bicycle: a "Forever" brand, the best you can buy. He rides it to the theater every day.',
        3: 'Dad\'s bicycle. It has not moved since he was taken. Dust has settled on the seat.' } },
      { id: 'pot1', type: 'plant', x: 1, y: 3, w: 1, h: 1, look: "Old Qian's potted peppers. He says they're the hottest in Shanghai." },
      { id: 'pot2', type: 'plant', x: 18, y: 3, w: 1, h: 1 },
      { id: 'lane_board', type: 'board', x: 3, y: 12, w: 7, h: 1, wall: true,
        count: s => [1, 4, 6, 6, 8, 9, 3][s.ch], mark: s => s.ch >= 4,
        look: {
          0: 'The lane noticeboard: a cleaning schedule and a notice about vaccinations.',
          1: 'Big-character posters cover the noticeboard. One accuses a neighbor of hiding gold. Another says: "Smash the Four Olds!"',
          2: '"DOWN WITH THE LANDLORD CLASS!" Your family isn\'t named. Not yet.',
          4: s => s.flags.toreposter ? 'Someone has pasted a fresh poster over the one you tore. Your father\'s name is still there.' : 'Posters with your father\'s name, crossed out with red X\'s.',
          6: 'The old posters are faded and peeling. Rain has washed most of the words away.' } },
      { id: 'qian_door', type: 'door', x: 14, y: 12, w: 1, h: 1, wall: true, look: {
        0: "Old Qian's door. He has lived in this lane longer than anyone.",
        1: "Old Qian's door. His son-in-law was labeled a counterrevolutionary, so now his whole family is blacklisted." } },
      { id: 'stool', type: 'stool', x: 17, y: 10, w: 1, h: 1, look: "Old Qian's stool. He sits here every evening, fanning himself." },
      { id: 'cat', type: 'cat', x: 8, y: 10, w: 1, h: 1, look: {
        0: 'A ginger cat that belongs to nobody and everybody. It does not care about politics.',
        2: 'The ginger cat. It is the only one in the lane that is not afraid.',
        5: 'The ginger cat follows Grandma while she sweeps, as if keeping her company.' } },
      { id: 'lbroom', type: 'broom', x: 18, y: 11, w: 1, h: 1, show: s => s.ch >= 5, look: 'The broom Grandma must use to sweep the lane every day.' },
    ],
  },

  anyi: {
    name: "An Yi's home", floor: 'wood', wall: 'poor',
    map: [
      'XXXXXXXXXXXXXXXXXXXX',
      'XXXX############XXXX',
      'XXXX############XXXX',
      'XXXX............XXXX',
      'XXXX............XXXX',
      'XXXX............XXXX',
      'XXXX............XXXX',
      'XXXX............XXXX',
      'XXXX............XXXX',
      'XXXX............XXXX',
      'XXXX............XXXX',
      'XXXX............XXXX',
      'XXXX............XXXX',
      'XXXXXXXXX..XXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXX',
    ],
    exits: [{ x: 9, y: 13, w: 2, h: 1, to: 'lane', tx: 15, ty: 3, dir: 'down' }],
    objects: [
      { id: 'awin', type: 'window', x: 6, y: 1, w: 2, h: 2, wall: true, look: 'From here you can see straight into your own window across the lane.' },
      { id: 'aphoto', type: 'photo', x: 11, y: 1, w: 1, h: 2, wall: true, gone: s => s.ch >= 2, look: {
        0: "A photo of An Yi's grandmother as a young woman, in a beautiful qipao dress.",
        2: 'A pale square on the wall. The Red Guards took the photo away as "evidence."' } },
      { id: 'abed', type: 'bed', quilt: '#7a8a5a', x: 5, y: 3, w: 2, h: 3, look: {
        0: "An Yi's grandmother's bed, with a hand-stitched quilt.",
        2: 'The bed is neatly made. Nobody sleeps in it now.' } },
      { id: 'ashelf', type: 'bookshelf', x: 12, y: 3, w: 2, h: 1, look: {
        0: "Teacher Wei's books. She is a teacher, like her mother before her.",
        2: 'Most of the books are gone. A few torn pages are still on the floor.' } },
      { id: 'achair', type: 'armchair', x: 14, y: 5, w: 1, h: 1, look: {
        0: "An Yi's grandmother's chair. She always kept sweets in her pocket for you. She is like a second grandmother to you.",
        2: 'The empty chair. You can\'t look at it for long.' } },
      { id: 'atable', type: 'table', x: 9, y: 7, w: 3, h: 2, items: false, paper: true, look: {
        0: "Teacher Wei's table, covered in students' notebooks.",
        2: 'Torn notebooks and spilled ink. The Red Guards came through here.',
        3: 'Teacher Wei is writing a "self-criticism." She has been writing it for weeks.' } },
      { id: 'aplant', type: 'plant', x: 14, y: 11, w: 1, h: 1, look: 'A small plant on the windowsill. An Yi waters it every morning.' },
    ],
  },

  street: {
    name: 'The street', outdoor: true, floor: 'paving',
    map: [
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'pppppppppppppppppppppppppppppp',
      'pppppppppppppppppppppppppppppp',
      'pppppppppppppppppppppppppppppp',
      'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
      'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
      'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
      'rrrrrrrrrrrrrrrrrrrrrrrrrrrrrr',
      'pppppppppppppppppppppppppppppp',
      'pppppppppppppppppppppppppppppp',
      'pppppppppppppppppppppppppppppp',
      'bbbbbbbbbbbbbbbbbbbbbbDbbbbbbb',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRRRR',
    ],
    exits: [
      { x: 0, y: 3, w: 1, h: 10, to: 'lane', tx: 18, ty: 7, dir: 'left' },
      { x: 29, y: 3, w: 1, h: 10, to: 'schoolyard', tx: 1, ty: 7, dir: 'right' },
      { x: 22, y: 13, w: 1, h: 1, to: 'jhs', tx: 9.5, ty: 12, dir: 'down', face: 'up',
        locked: s => s.ch < 3 ? 'The junior high school is locked. A notice on the door says: "Classes suspended for the revolution."' : null },
    ],
    objects: [
      { id: 'shop_old', type: 'shop', x: 2, y: 1, w: 5, h: 2, wall: true,
        sign: s => s.flags.signDown ? { t: '红旗', bg: '#b8231e' } : { t: '福寿堂', bg: '#2a2a2a' },
        look: {
          0: 'A tea shop with a beautiful old sign: "Fortune and Long Life." Grandma buys her tea here.',
          1: s => s.flags.signDown ? 'Where the old sign hung, a new one says "Red Flag." The shop sells the same tea.' : 'The old sign: "Fortune and Long Life." A crowd is gathering beneath it.' } },
      { id: 'shop_barber', type: 'shop', x: 9, y: 1, w: 4, h: 2, wall: true, text: { t: '理发' }, look: {
        0: 'The barbershop. Dad gets his hair cut here every month.',
        1: 'The barbershop. Red Guards have been cutting off people\'s long braids right here on the street, calling them "bourgeois."' } },
      { id: 'shop_books', type: 'shop', x: 15, y: 1, w: 5, h: 2, wall: true, text: { t: '新华书店' }, look: {
        0: 'Xinhua Bookstore, the state bookshop. You could spend all day here.',
        1: 'The bookstore window now shows only one kind of book: the works of Chairman Mao.' } },
      { id: 'shop_food', type: 'shop', x: 23, y: 1, w: 5, h: 2, wall: true,
        sign: s => s.ch >= 3 ? { t: '东方红', bg: '#b8231e' } : { t: '饭店' },
        look: {
          0: 'A noodle restaurant. The smell of scallion oil drifts out the door.',
          3: 'The restaurant has a new revolutionary name: "The East Is Red."' } },
      { id: 'stall', type: 'stall', x: 13, y: 4, w: 3, h: 1, proxy: 'grandpahong', look: {
        0: "Grandpa Hong's book stall. Rent a storybook for one fen and read it right here on the little stools.",
        1: s => s.flags.stallClosed ? 'The stall is shut. A paper seal across it says: "Closed. Four Olds."' : "Grandpa Hong's books are piled in a heap.",
        6: 'The stall is gone. Only the marks of its legs are left on the pavement.' } },
      { id: 'speaker', type: 'speaker', x: 8, y: 4, w: 1, h: 1, look: {
        0: 'A loudspeaker. Every morning it plays exercise music and the news.',
        1: 'The loudspeaker blares from dawn until night: speeches, slogans, and songs about Chairman Mao.' } },
      { id: 'stand', type: 'stand', x: 25, y: 4, w: 2, h: 1, proxy: 'vendor', look: 'Fried dough sticks and hot soy milk. The best breakfast in Shanghai.' },
      { id: 'crates', type: 'crates', x: 22, y: 4, w: 1, h: 1, look: 'A crate of cabbages. It is cabbage season. It is always cabbage season.' },
      { id: 'tree1', type: 'tree', x: 1, y: 11, w: 1, h: 1, look: 'A plane tree. In summer its leaves shade the whole sidewalk.' },
      { id: 'tree2', type: 'tree', x: 11, y: 11, w: 1, h: 1 },
      { id: 'tree3', type: 'tree', x: 19, y: 11, w: 1, h: 1 },
      { id: 'sbike', type: 'bicycle', x: 5, y: 11, w: 2, h: 1, look: "Someone's bicycle, with a basket full of leeks." },
      { id: 'busstop', type: 'busstop', x: 16, y: 11, w: 1, h: 1, look: {
        0: 'A bus stop for Route 26.',
        1: 'Buses go by packed with Red Guards heading to Beijing, hoping to see Chairman Mao in person.' } },
      { id: 'bench', type: 'bench', x: 25, y: 11, w: 2, h: 1, look: {
        0: 'A bench. Old men usually play chess here in the afternoon.',
        1: 'Nobody sits on the bench anymore. Nobody wants to be seen relaxing.' } },
      { id: 'street_board', type: 'board', x: 3, y: 13, w: 6, h: 1, wall: true, count: s => [2, 7, 8, 7, 8, 8, 4][s.ch], look: {
        0: 'A board with movie posters and a notice about keeping the streets clean.',
        1: 'Big-character posters cover every inch. Some attack famous writers. Some attack your neighbors.',
        4: 'You find your family\'s name in the newspaper pasted on the board. You walk away fast.' } },
      { id: 'jhs_sign', type: 'plaque', text: '新闸中学', x: 23, y: 13, w: 3, h: 1, wall: true, look: {
        0: 'Xin-zha Junior High School. Next year you will go to a junior high... if everything goes to plan.',
        3: 'Xin-zha Junior High. Your new school! The door is just to the left.' } },
    ],
  },

  schoolyard: {
    name: 'Schoolyard', outdoor: true, floor: 'dirt',
    map: [
      'RRRRRRRRRRRRRRRRRRRR',
      'bbbbbbbbbbbbbbbbbbbb',
      'bbbbbbbbbDDbbbbbbbbb',
      '=dddddddddddddddddd=',
      '=dddddddddddddddddd=',
      'ddddddddddddddddddd=',
      'ddddddddddddddddddd=',
      'ddddddddddddddddddd=',
      'ddddddddddddddddddd=',
      'ddddddddddddddddddd=',
      '=dddddddddddddddddd=',
      '=dddddddddddddddddd=',
      '=dddddddddddddddddd=',
      '====================',
      'gggggggggggggggggggg',
    ],
    exits: [
      { x: 0, y: 5, w: 1, h: 5, to: 'street', tx: 28, ty: 7, dir: 'left' },
      { x: 9, y: 2, w: 2, h: 1, to: 'classroom', tx: 9.5, ty: 12, dir: 'up' },
    ],
    objects: [
      { id: 'banner', type: 'banner', x: 7, y: 1, w: 6, h: 1, wall: true, text: s => s.ch >= 1 ? '造反有理' : '好好学习', look: {
        0: 'A banner over the door: "Study hard and make progress every day."',
        1: 'The old banner is gone. The new one says: "To rebel is justified!"' } },
      { id: 'school_board', type: 'board', x: 1, y: 2, w: 5, h: 1, wall: true, count: s => [1, 6, 7, 5, 5, 5, 2][s.ch],
        look: s => STORY.schoolBoard(s) },
      { id: 'ywin1', type: 'fwindow', x: 13, y: 1, w: 2, h: 1, wall: true, look: 'The windows of your classroom. Someone has drawn a smiley face in the dust.' },
      { id: 'ywin2', type: 'fwindow', x: 16, y: 1, w: 2, h: 1, wall: true },
      { id: 'flag', type: 'flag', x: 15, y: 6, w: 1, h: 1, look: {
        0: 'The national flag. Every Monday the whole school salutes it, and you lead the Young Pioneers in the pledge.',
        1: 'The flag still flies, but no one gathers for the Monday ceremony anymore.' } },
      { id: 'pingpong', type: 'pingpong', x: 4, y: 8, w: 3, h: 2, look: {
        0: 'The ping-pong table. You always lose to Zhang Jie.',
        1: 'Nobody is playing. Someone has stuck a poster to the net.' } },
      { id: 'ytree', type: 'tree', x: 17, y: 10, w: 1, h: 1, look: 'The old camphor tree. Generations of students have carved their names into it.' },
      { id: 'ytree2', type: 'tree', x: 2, y: 11, w: 1, h: 1 },
      { id: 'ybench', type: 'bench', x: 11, y: 11, w: 2, h: 1, look: {
        0: 'The bench where you and An Yi share your lunch.',
        2: 'The bench where you and An Yi used to share lunch.' } },
    ],
  },

  classroom: {
    name: 'Classroom', floor: 'wood', wall: 'plaster',
    map: [
      'XXXXXXXXXXXXXXXXXXXX',
      'X##################X',
      'X##################X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'XXXXXXXXX..XXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXX',
    ],
    exits: [{ x: 9, y: 13, w: 2, h: 1, to: 'schoolyard', tx: 9.5, ty: 3, dir: 'down' }],
    objects: [
      { id: 'blackboard', type: 'blackboard', x: 6, y: 1, w: 8, h: 2, wall: true, lines: s => [3, 2, 1, 1, 1, 1, 0][s.ch], look: {
        0: 'Today\'s lesson: "Chairman Mao is the red sun in our hearts." Under it, the arithmetic results. Yours: 100.',
        1: 'Huge characters: "WRITE DA-ZI-BAO! EXPOSE THE BAD ELEMENTS!"',
        2: 'The blackboard has not been cleaned in weeks. No one is in charge anymore.' } },
      { id: 'cportrait', type: 'portrait', x: 3, y: 1, w: 1, h: 2, wall: true, look: 'A portrait of Chairman Mao hangs at the front of every classroom in China.' },
      { id: 'cwin', type: 'window', x: 16, y: 1, w: 2, h: 2, wall: true, look: 'Out the window you can see the schoolyard flagpole.' },
      { id: 'tdesk', type: 'tdesk', x: 8, y: 4, w: 4, h: 1, proxy: 'teachergu', look: {
        0: "Teacher Gu's desk. A stack of homework, all marked in neat red ink.",
        1: "Teacher Gu's desk. Someone has written \"BOURGEOIS\" on it in chalk." } },
      { id: 'ccab', type: 'cabinet', x: 18, y: 3, w: 1, h: 1, look: {
        0: 'A cabinet full of chalk and old textbooks.',
        1: 'The old textbooks have been thrown out. "Poisonous weeds," Du Hai called them.' } },
      ...[3, 7, 11, 15].flatMap(x => [6, 8, 10].map(y => ({ id: `cdesk${x}_${y}`, type: 'desk', x, y, w: 2, h: 1 }))).filter(d => d.id !== 'cdesk7_8'),
      { id: 'desk_jili', type: 'desk', paper: true, x: 7, y: 8, w: 2, h: 1, look: {
        0: 'Your desk, in the very middle of the room. Your pencil box is perfectly neat.',
        1: s => s.posters.length ? 'Your desk. Ink stains on it from writing your da-zi-bao.' : 'Your desk.' } },
      { id: 'cbroom', type: 'broom', x: 1, y: 12, w: 1, h: 1, look: "The class broom. Whoever is on duty sweeps after school." },
    ],
  },

  jhs: {
    name: 'Junior high hall', floor: 'tile', wall: 'hall',
    map: [
      'XXXXXXXXXXXXXXXXXXXX',
      'X##################X',
      'X###############D##X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'X..................X',
      'XXXXXXXXX..XXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXX',
    ],
    exits: [
      { x: 9, y: 13, w: 2, h: 1, to: 'street', tx: 22, ty: 12, dir: 'down', face: 'up' },
      { x: 16, y: 2, w: 1, h: 1, to: 'office', tx: 9.5, ty: 12, dir: 'up' },
    ],
    objects: [
      { id: 'jbanner', type: 'banner', x: 5, y: 1, w: 8, h: 1, wall: true, text: '阶级教育展览', look: 'A banner: "Class Education Exhibition." It teaches how hard life was for the poor before the revolution.' },
      { id: 'jportrait', type: 'portrait', x: 2, y: 1, w: 1, h: 2, wall: true, look: 'A giant portrait of Chairman Mao, bigger than the one at home.' },
      { id: 'jwin', type: 'window', x: 13, y: 1, w: 2, h: 2, wall: true, look: 'Through the window you can see students marching around the sports field.' },
      { id: 'stage', type: 'stage', x: 6, y: 3, w: 8, h: 2, look: 'The stage, where Chairman Jin of the school Revolutionary Committee gives speeches.' },
      { id: 'panel_jili', type: 'panel', x: 2, y: 8, w: 2, h: 1, look: {
        0: 'An empty display board.',
        3: s => s.flags.inExhibition ? 'Your panel. Visitors stop to read the words you wrote.' : 'An empty panel. This one is meant for you.',
        4: s => s.flags.refused ? 'Your panel. Someone else\'s name is on it now.' : 'Your panel. You don\'t feel proud looking at it anymore.' } },
      { id: 'panel2', type: 'panel', x: 16, y: 8, w: 2, h: 1, look: 'A panel about a cruel landlord who took grain from starving farmers. You think of Grandfather, whom you never met.' },
      { id: 'panel3', type: 'panel', x: 4, y: 11, w: 2, h: 1, look: 'A panel showing a poor farmer\'s worn-out straw sandals. "This is how the poor lived in the old society."' },
      { id: 'panel4', type: 'panel', x: 14, y: 11, w: 2, h: 1, look: 'Photographs of new factories and dams. "This is the bright new China."' },
    ],
  },

  office: {
    name: 'School office', floor: 'concrete', wall: 'office',
    map: [
      'XXXXXXXXXXXXXXXXXXXX',
      'XXXXX##########XXXXX',
      'XXXXX##########XXXXX',
      'XXXXX..........XXXXX',
      'XXXXX..........XXXXX',
      'XXXXX..........XXXXX',
      'XXXXX..........XXXXX',
      'XXXXX..........XXXXX',
      'XXXXX..........XXXXX',
      'XXXXX..........XXXXX',
      'XXXXX..........XXXXX',
      'XXXXX..........XXXXX',
      'XXXXX..........XXXXX',
      'XXXXXXXXX..XXXXXXXXX',
      'XXXXXXXXXXXXXXXXXXXX',
    ],
    exits: [{ x: 9, y: 13, w: 2, h: 1, to: 'jhs', tx: 16, ty: 3, dir: 'down' }],
    objects: [
      { id: 'oportrait', type: 'portrait', x: 9, y: 1, w: 1, h: 2, wall: true, look: 'Chairman Mao looks down from the wall.' },
      { id: 'owin', type: 'window', x: 12, y: 1, w: 2, h: 2, wall: true, look: 'The window is painted shut.' },
      { id: 'ocab', type: 'cabinet', x: 6, y: 3, w: 2, h: 1, look: 'Filing cabinets full of people\'s records. Everything anyone ever reported about you could be in there.' },
      { id: 'odesk', type: 'tdesk', x: 8, y: 5, w: 4, h: 1, proxy: 'thinface', look: {
        0: 'A desk covered in files.',
        4: 'A desk covered in files. One of them has your father\'s name on it.' } },
      { id: 'ochair', type: 'chair', x: 13, y: 8, w: 1, h: 1, look: 'A hard wooden chair. People sit here for hours during "study sessions."' },
    ],
  },

  field: {
    name: 'The countryside', outdoor: true, floor: 'grass',
    map: [
      'hhhhhhhhhhhhhhhhhhhh',
      'hggggggggggggggggggh',
      'hggggggggggggggggggh',
      'hddddddddddddddddddh',
      'hwwwwwwwwdwwwwwwwwwh',
      'hwwwwwwwwdwwwwwwwwwh',
      'hddddddddddddddddddh',
      'hwwwwwwwwdwwwwwwwwwh',
      'hwwwwwwwwdwwwwwwwwwh',
      'hddddddddddddddddddh',
      'hggggggggggggggggggh',
      'hggggggggggggggggggh',
      'hggggggggggggggggggh',
      'hhhhhhhhhhhhhhhhhhhh',
      'hhhhhhhhhhhhhhhhhhhh',
    ],
    exits: [],
    objects: [
      { id: 'rice', type: 'rice', x: 2, y: 4, w: 6, h: 2, solid: false, look: 'Rice seedlings in rows. Each one planted by hand.' },
      { id: 'rice2', type: 'rice', x: 10, y: 7, w: 8, h: 2, solid: false },
      { id: 'rice3', type: 'rice', x: 11, y: 4, w: 7, h: 2, solid: false },
      { id: 'hut', type: 'hut', x: 13, y: 10, w: 4, h: 2, look: 'A farmer\'s hut made of mud and straw. You sleep here with three other students from Shanghai.' },
      { id: 'hay', type: 'haystack', x: 3, y: 10, w: 2, h: 2, look: 'A haystack, warm from the sun. A good place to rest your aching back.' },
      { id: 'tools', type: 'tools', x: 8, y: 11, w: 1, h: 1, look: 'Hoes and baskets. Your hands are covered in blisters from them.' },
      { id: 'ftree', type: 'tree', x: 17, y: 2, w: 1, h: 1, look: 'A willow tree by the field. It reminds you of a painting Dad loved.' },
    ],
  },
};
