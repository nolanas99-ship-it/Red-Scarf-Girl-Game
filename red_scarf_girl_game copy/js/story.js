'use strict';
// Story content: characters, glossary, chapters and their steps.
// Based on the events of Ji-li Jiang's memoir "Red Scarf Girl" (1997). All dialogue is original
// and simplified for the game; some events are combined or reordered.

const SK = '#f0c8a0', SK2 = '#e2b48c', PALE = '#ecd6b8', BLK = '#2a2228', GRY = '#9a9aa2', WHT = '#d8d8de';
const GREEN = '#5f7a3e', GREEN_D = '#4a6030';

const NPCS = {
  jili:        { name: 'Ji-li', voice: 520, pal: { H: BLK, S: SK, C: '#eeeae0', D: '#c9c3b5', P: '#3a4a72', R: '#d0312d' }, opt: { pig: true } },
  grandma:     { name: 'Grandma', voice: 300, pal: { H: GRY, S: SK2, C: '#3b4a6b', D: '#2c3852', P: '#2a2a33' }, opt: { bun: true } },
  mom:         { name: 'Mom', voice: 380, pal: { H: BLK, S: SK, C: '#8fb3d9', D: '#6f93b9', P: '#55586a' }, opt: { bun: true } },
  dad:         { name: 'Dad', voice: 220, pal: { H: BLK, S: SK, C: '#7d8088', D: '#62656c', P: '#4a4d55' }, opt: { glasses: true } },
  jiyong:      { name: 'Ji-yong', voice: 470, pal: { H: BLK, S: SK, C: '#e8e4d8', D: '#c8c2b2', P: '#4d5a3a', R: '#d0312d' }, opt: {}, fidget: true },
  jiyun:       { name: 'Ji-yun', voice: 600, pal: { H: BLK, S: SK, C: '#e8a0b0', D: '#c98090', P: '#3a4a72' }, opt: { pig: true }, fidget: true },
  songpopo:    { name: 'Song Po-po', voice: 280, pal: { H: GRY, S: SK2, C: '#4a4048', D: '#333038', P: '#333' }, opt: { bun: true, apron: true } },
  anyi:        { name: 'An Yi', voice: 560, pal: { H: BLK, S: SK, C: '#e8dcae', D: '#c8bc8e', P: '#5a6a8a', R: '#d0312d' }, opt: { pig: true } },
  teacherwei:  { name: 'Teacher Wei', voice: 360, pal: { H: BLK, S: SK, C: '#6a7a6a', D: '#5a6a5a', P: '#444' }, opt: { bun: true, glasses: true } },
  principal:   { name: 'Principal Long', voice: 240, pal: { H: GRY, S: SK2, C: '#5b6170', D: '#4b5160', P: '#4b5160' }, opt: { glasses: true } },
  comradeli:   { name: 'Comrade Li', voice: 440, pal: { H: BLK, S: SK, C: GREEN, D: GREEN_D, P: GREEN }, opt: { cap: '#5a7438', bun: true } },
  teachergu:   { name: 'Teacher Gu', voice: 400, pal: { H: BLK, S: SK, C: '#8a6a8a', D: '#6a4a6a', P: '#444' }, opt: { bun: true, glasses: true } },
  duhai:       { name: 'Du Hai', voice: 480, pal: { H: BLK, S: SK, C: '#6f8a4e', D: '#5a7340', P: '#3a3a3a' }, opt: {} },
  zhangjie:    { name: 'Zhang Jie', voice: 500, pal: { H: BLK, S: SK, C: '#d0d0d8', D: '#b0b0b8', P: '#3a4a72', R: '#d0312d' }, opt: {}, fidget: true },
  yinlanlan:   { name: 'Yin Lan-lan', voice: 580, pal: { H: BLK, S: SK, C: '#c06a4a', D: '#a05a3a', P: '#444' }, opt: { pig: true }, fidget: true },
  redguard1:   { name: 'Red Guard', voice: 330, pal: { H: BLK, S: SK, C: GREEN, D: GREEN_D, P: GREEN }, opt: { cap: '#5a7438', armband: true }, extra: true },
  redguard2:   { name: 'Red Guard', voice: 360, pal: { H: BLK, S: SK2, C: GREEN, D: GREEN_D, P: '#3a3a3a' }, opt: { armband: true }, extra: true },
  sixfingers:  { name: 'Six-Fingers', voice: 200, pal: { H: BLK, S: SK2, C: '#3d5a8a', D: '#2d4a7a', P: '#2d4a7a' }, opt: { armband: true } },
  grandpahong: { name: 'Grandpa Hong', voice: 250, pal: { H: WHT, S: SK2, C: '#6a5a4a', D: '#5a4a3a', P: '#444' }, opt: { glasses: true } },
  oldqian:     { name: 'Old Qian', voice: 230, pal: { H: WHT, S: SK2, C: '#4a4a4a', D: '#3a3a3a', P: '#333' }, opt: {} },
  auntie:      { name: 'Auntie Bao', voice: 400, pal: { H: BLK, S: SK, C: '#a07a5a', D: '#8a6a4a', P: '#444' }, opt: { bun: true }, fidget: true },
  xiaocheng:   { name: 'Xiao-cheng', voice: 520, pal: { H: BLK, S: SK, C: '#d8c070', D: '#b8a050', P: '#3a3a5a' }, opt: {}, fidget: true },
  mingming:    { name: 'Ming-ming', voice: 540, pal: { H: BLK, S: SK, C: '#80a0c0', D: '#6080a0', P: '#3a3a3a' }, opt: {}, fidget: true },
  changhong:   { name: 'Chang Hong', voice: 540, pal: { H: BLK, S: SK, C: GREEN, D: GREEN_D, P: '#3a4a72' }, opt: { pig: true, armband: true } },
  chairmanjin: { name: 'Chairman Jin', voice: 260, pal: { H: BLK, S: SK2, C: GREEN, D: GREEN_D, P: GREEN }, opt: { armband: true } },
  teacherzhang:{ name: 'Teacher Zhang', voice: 300, pal: { H: BLK, S: SK, C: '#e0e0e0', D: '#c0c0c0', P: '#333' }, opt: { glasses: true } },
  thinface:    { name: 'Thin-Face', voice: 180, pal: { H: BLK, S: PALE, C: '#6a6a70', D: '#55555a', P: '#55555a' }, opt: { armband: true } },
  uncletian:   { name: 'Uncle Tian', voice: 240, pal: { H: BLK, S: SK, C: '#5a4a3a', D: '#4a3a2a', P: '#444' }, opt: {} },
  farmer:      { name: 'Old Farmer', voice: 210, pal: { H: GRY, S: '#c89a70', C: '#4a6a8a', D: '#3a5a7a', P: '#3a3a3a' }, opt: { cap: '#c9a85a' } },
  vendor:      { name: 'Breakfast Seller', voice: 340, pal: { H: BLK, S: SK2, C: '#e8e4d8', D: '#c8c2b2', P: '#444' }, opt: { apron: true } },
  crowd1:      { name: 'Man in the crowd', voice: 260, pal: { H: BLK, S: SK2, C: '#5a6a7a', D: '#4a5a6a', P: '#333' }, opt: {}, extra: true },
  crowd2:      { name: 'Woman in the crowd', voice: 420, pal: { H: BLK, S: SK, C: '#8a7a6a', D: '#7a6a5a', P: '#444' }, opt: { bun: true }, extra: true },
};
for (const k in NPCS) NPCS[k].key = k;

// Plain-language glossary. Each word is explained the first time it comes up.
const WORDS = {
  red_scarf: { term: 'Red scarf', def: 'Worn by the Young Pioneers, a children\'s group of the Communist Party. A red scarf meant you were a good, loyal student. Ji-li was a student leader of the Young Pioneers at her school.' },
  class_background: { term: 'Family background', def: 'In the 1960s, every family in China had a "class" label based on what their parents or grandparents did before 1949. Workers and poor farmers were "red" (good). Landlords and rich business owners were "black" (bad). Children inherited the label.' },
  cultural_revolution: { term: 'The Cultural Revolution', def: 'A political campaign started by Chairman Mao in 1966. He called on young people to attack "old" and "capitalist" ideas. It lasted ten years. Millions of people were humiliated, jailed, or sent away to farms.' },
  four_olds: { term: 'The Four Olds', def: 'Old ideas, old culture, old customs, and old habits. Red Guards smashed temples, burned books, tore down shop signs, and took family treasures to "destroy the Four Olds."' },
  red_guards: { term: 'Red Guards', def: 'Students and young people who formed groups to carry out the Cultural Revolution. They wore red armbands. Some raided homes and attacked teachers and neighbors.' },
  dazibao: { term: 'Da-zi-bao', def: '"Big-character posters." Large handwritten posters pasted on walls. Anyone could write one. They were often used to accuse people in public: teachers, neighbors, even family members.' },
  red_successor: { term: 'Red Successor', def: 'An honor for students judged most loyal to the revolution, "successors" who would carry it on. Students from "black" families could not be chosen.' },
  landlord: { term: 'Landlord', def: 'Someone who owned farmland and rented it to farmers. After 1949 it became one of the worst political labels, and it was passed down to children and grandchildren.' },
  black_categories: { term: '"Black" families', def: 'Families labeled as enemies of the revolution: landlords, rich farmers, "counterrevolutionaries," "bad elements," and "rightists." Their children were bullied, shut out of honors and schools, and watched by neighbors.' },
  exhibition: { term: 'Class Education Exhibition', def: 'A school display showing how cruel life was before the revolution. Being chosen to present it was a sign that the school trusted you.' },
  rightist: { term: 'Rightist', def: 'A label for someone accused of opposing the Communist Party. It could be pinned on a person for a single remark, and it could ruin a whole family.' },
  study_session: { term: 'Study session', def: 'A meeting where people were questioned and pressured, sometimes for hours or days, to confess or to give information about others.' },
  draw_line: { term: 'Draw a clear line', def: 'To publicly cut yourself off from a family member who was labeled an enemy, often by speaking against them at a meeting. Many children were pushed to do this to their own parents.' },
  countryside: { term: 'Sent to the countryside', def: 'Millions of city students were sent to farms to "learn from the peasants." Some went for a few weeks. Many stayed for years.' },
};

const pick = (v, s) => {
  if (v == null) return null;
  if (typeof v === 'function') return v(s);
  if (typeof v === 'string' || Array.isArray(v)) return v;
  const ks = Object.keys(v).map(Number).filter(k => k <= s.ch).sort((a, b) => a - b);
  if (!ks.length) return null;
  const r = v[ks[ks.length - 1]];
  return typeof r === 'function' ? r(s) : r;
};
const has = k => !!G.state.flags[k];
const flag = (k, v = true) => { G.state.flags[k] = v; };
const say = (who, text) => G.say(who, text);
const narr = text => G.say(null, text);
const choose = (opts, prompt, who) => G.choose(opts, prompt, who);

// ---------- What people say when you talk to them outside the main story ----------
const TALK = {
  grandma: {
    0: ['Eat your breakfast before it gets cold.', 'Your grandfather loved books, you know. You get that from him.'],
    1: ['When I was a girl, people burned incense at the temple for luck. Now they burn the temples.', 'Shh. Forget I said that, little one.'],
    2: s => s.flags.raided ? ['They took my jade bracelet. It was my mother\'s.', 'Things are only things, Ji-li. As long as we have each other.'] : ['Help your mother. She is carrying more than she shows.'],
    3: ['A new school! Hold your head high, Ji-li.'],
    4: ['Your father will come home. I have lived through wars. I know how to wait.'],
    5: ['My back aches, but my heart is fine. Don\'t worry about me.'],
    6: ['Come, sit with Grandma a while.'],
  },
  mom: {
    0: ['Don\'t be late for school, Ji-li. And don\'t forget your handkerchief.'],
    1: ['If anyone asks you about the family, say you\'re just a student. That\'s all you are.'],
    2: ['We have to be careful now. More careful than ever.'],
    3: ['I\'m so glad you can go to school again.'],
    4: ['I went to the theater today. They would not even let me see him.'],
    5: ['We\'ll manage. We always manage.'],
    6: ['You\'ve carried so much, Ji-li. Thank you.'],
  },
  dad: {
    0: ['Did you finish your homework? Of course you did.', 'Someday I\'ll take you to see a real play at the theater.'],
    1: ['Be careful what you say outside, Ji-li. Words travel fast these days.'],
    2: ['I\'m sorry I can\'t protect you from all of this.'],
    3: ['I\'m proud of you for starting over. That takes courage.'],
  },
  jiyong: {
    0: ['Jie-jie! I\'m going to be a scientist. Or a pilot. Or both.'],
    1: ['Xiao-cheng and Ming-ming saw the Red Guards burning books! It was huge!', 'Mom told me not to go watch again.'],
    2: ['I\'m not scared. ...Okay, a little bit.'],
    4: ['Some kids at school said Dad is a bad man. I punched one.', 'Don\'t tell Mom.'],
    5: ['I can carry the water now. I\'m strong enough.'],
    6: ['Remember when the biggest problem was who ate your porridge?'],
  },
  jiyun: {
    0: ['I drew a cat on my schoolbag! Want to see?'],
    1: ['Why is everyone so angry outside?'],
    2: ['Jie-jie, can I sleep next to you tonight?'],
    3: ['A girl in my class won\'t sit next to me anymore.'],
    5: ['I didn\'t say anything about the letter. I promise I didn\'t.'],
    6: ['When I grow up I want to be just like you.'],
  },
  songpopo: {
    0: ['Scallion pancakes for breakfast! Don\'t tell Ji-yong I gave you the biggest one.'],
    1: ['These are strange days. Keep your head down, little one.'],
    2: ['I\'ve worked for this family since your father was a boy.'],
  },
  anyi: {
    0: ['Did you finish the reading? I only got halfway.', 'Let\'s share lunch on the bench again!'],
    1: ['I don\'t understand any of this, Ji-li.'],
    2: ['I keep thinking she\'ll walk back in the door.'],
    6: ['Remember when we used to signal each other with flashlights?'],
  },
  teacherwei: {
    0: ['Hello, Ji-li. An Yi talks about you all the time.'],
    2: ['Be careful, Ji-li. Be very careful.'],
    3: ['I am writing my self-criticism again. They say it is not "deep" enough.'],
  },
  principal: {
    0: ['Our school is proud of you, Ji-li.'],
    1: ['...I am very busy. Please excuse me.'],
  },
  comradeli: { 0: ['Practice your stretches every day!'] },
  teachergu: {
    0: ['Ji-li, your essay was excellent. Keep reading every day.'],
    1: ['Please, Ji-li. Do what you must. I understand.'],
  },
  duhai: {
    0: ['What are you looking at?'],
    1: s => s.flags.exposed ? ['Landlord\'s granddaughter. Stay away from me.'] : ['The teachers are all rotten. We\'ll show them.'],
  },
  zhangjie: {
    0: ['Rematch at ping-pong after school? I\'ll go easy on you.'],
    1: s => s.flags.exposed ? ['...I\'m not supposed to talk to you. Sorry.'] : ['Everyone has to write a poster. I don\'t know what to say in mine.'],
  },
  yinlanlan: {
    0: ['Everyone always says how great you are. It\'s so annoying.'],
    1: s => s.flags.exposed ? ['Not so perfect now, are you?'] : ['I wrote three posters already!'],
  },
  redguard1: { 1: ['Move along, little sister. Unless you want to join us?'], 2: ['We are searching this lane. Go home.'] },
  redguard2: { 1: ['Smash the old world! Build a new one!'], 5: ['Stand back.'] },
  sixfingers: {
    0: ['Hmph. Your family has the biggest apartment in the lane. Must be nice.'],
    1: ['The poor stood up! Now it\'s your kind\'s turn to bow.'],
    2: ['I\'m watching your family, landlord girl.'],
    4: ['A rightist father. I always knew.'],
    5: ['Your grandma had servants once. Now she sweeps. That\'s revolution!'],
    6: ['...What do you want? Leave me alone.'],
  },
  grandpahong: {
    0: ['Ah, the little bookworm! Today I have a new picture book about the Monkey King.'],
    1: ['Fifty years I\'ve sold books. Fifty years.'],
  },
  oldqian: {
    0: ['Good morning, little scholar! Off to school?'],
    1: ['My daughter\'s husband was labeled a counterrevolutionary. So now none of my family can hold their heads up.', 'Don\'t let it happen to you, child.'],
    2: ['I saw them come to your home last night. I\'m sorry I could do nothing.'],
    4: ['A wall of paper is still only paper, child.'],
    5: ['Your grandmother is the most dignified woman in this lane. Brooms or not.'],
    6: ['Still here. Still fanning myself. Some things don\'t change.'],
  },
  auntie: {
    0: ['Ji-li! Tell your grandma I have some fresh bamboo shoots for her.'],
    1: ['Did you hear? They searched the Rong family\'s house. Took everything.'],
    2: ['...Sorry, I have to go inside now.'],
    4: s => s.stats.standing < 30 ? ['...', '(She pretends she didn\'t see you.)'] : ['I\'m sorry about your father.'],
    6: ['You\'ve grown so tall, Ji-li.'],
  },
  xiaocheng: {
    0: ['We\'re playing Red Army versus enemies! You can be the enemy!'],
    1: ['Ji-yong said your family has a huge trunk full of gold. Is it true?'],
    4: ['My dad\'s been taken away too. I don\'t care.', '(He clearly does care.)'],
  },
  mingming: {
    0: ['Ji-yong is it! Run!'],
    1: ['My dad says the revolution is the best thing that ever happened.'],
    4: ['My dad got taken away too. Even Party secretaries aren\'t safe now.'],
  },
  changhong: {
    3: ['Want to study together after school?'],
    4: ['I believe in the revolution. I also believe in you. I don\'t think those have to be different.'],
    5: ['Write to me from the countryside!'],
    6: ['Friends don\'t abandon each other. That\'s what I always said.'],
  },
  chairmanjin: { 3: ['The Exhibition must be perfect. Perfect!'], 4: ['I have nothing to say to you.'] },
  teacherzhang: {
    3: ['Your English pronunciation is very good, Jiang Ji-li.', '(His handwriting on the blackboard is bold and strong, though his voice is quiet.)'],
    4: ['Keep studying, whatever happens. Knowledge cannot be confiscated.'],
  },
  thinface: { 4: ['We will talk soon, Jiang Ji-li.'] },
  uncletian: { 5: ['Your father is my oldest friend. I won\'t abandon him.'] },
  farmer: { 5: ['City girl. Bend your knees, not your back. You\'ll last longer.'] },
  vendor: {
    0: ['Fried dough sticks! Hot soy milk! Two fen!'],
    1: ['Business is bad. Nobody stops to eat on the street anymore.'],
    3: ['Ah, you\'re back! You look older.'],
  },
  crowd1: { 1: ['Down with the Four Olds!'] },
  crowd2: { 1: ['That sign has hung there since before I was born...', '(She says it very quietly.)'] },
};

// ---------- Chapters ----------
const CHAPTERS = [
  {
    title: 'The Red Scarf', when: 'Spring 1966',
    intro: [
      'Shanghai, China. Spring 1966.',
      'Jiang Ji-li is twelve years old. She is the best student in her class and proudly wears the red scarf of the Young Pioneers.',
      'She loves her family, her school, and Chairman Mao, the leader of China. She is sure her future will be bright.',
    ],
    start: { room: 'home_back', x: 4, y: 7, dir: 'down' },
    tint: null,
    summary: 'Ji-li was chosen to audition for the Liberation Army Arts Academy, and she passed. But Dad asked her to give it up. He said the academy would check the family\'s background, and that it "would not go well." Ji-li did not yet understand why.',
    cast: {
      home: [['grandma', 3, 9, 'right'], ['mom', 14, 5, 'down'], ['dad', 10, 10, 'up'], ['jiyong', 15, 10, 'left'], ['jiyun', 5, 11, 'up']],
      home_back: [['songpopo', 15, 5, 'up']],
      lane: [['auntie', 12, 5, 'down'], ['oldqian', 17, 11, 'up'], ['xiaocheng', 5, 8, 'right'], ['mingming', 8, 7, 'left'], ['sixfingers', 10, 4, 'down']],
      anyi: [['teacherwei', 11, 6, 'down']],
      street: [['grandpahong', 14, 3, 'down'], ['vendor', 26, 3, 'down'], ['crowd2', 20, 11, 'left']],
      schoolyard: [['principal', 10, 5, 'down'], ['anyi', 12, 10, 'left'], ['zhangjie', 6, 7, 'down'], ['yinlanlan', 3, 6, 'right']],
      classroom: [['comradeli', 13, 5, 'down'], ['teachergu', 10, 3, 'down'], ['duhai', 15, 7, 'left']],
    },
    steps: [
      {
        goal: 'Say good morning to Grandma', where: 'Living room: go out the door at the bottom', room: 'home', target: 'grandma',
        async run() {
          await say('grandma', 'There you are, Ji-li! Come here. Your red scarf is crooked.');
          await narr('Grandma straightens the red scarf around your neck. She always says it makes you look like a little leader.');
          await G.learn('red_scarf');
          await say('grandma', 'Your mother says Principal Long wants to see you today. Something special.');
          const c = await choose(['Tell her you\'ll make the family proud', 'Ask what Grandma was like at twelve']);
          if (c === 0) {
            await say('jili', 'I\'ll make all of you proud, Grandma!');
            await say('grandma', 'You already do. Just remember: being good matters more than being famous.');
            G.fx({ family: 3 });
          } else {
            await say('grandma', 'At twelve? Big houses, many servants, many rules. A different world.');
            await narr('She smiles, but she doesn\'t say anything more about it.');
            G.fx({ family: 5 }); flag('askedGrandma');
          }
          await say('grandma', 'Now go! Out the door, down the lane, then right along the street to school. Don\'t run!');
        },
      },
      {
        goal: 'Go to school and find Principal Long', where: 'Schoolyard: lane → street → keep going right', room: 'schoolyard', target: 'principal',
        async run() {
          await say('principal', 'Ah, Jiang Ji-li! Our best student, and the da-dui-zhang of our Young Pioneers.');
          await say('principal', 'I have wonderful news. A comrade from the Liberation Army Arts Academy is visiting. They are choosing a few children to train as performers.');
          await say('principal', 'I recommended you. Comrade Li is waiting in your classroom. Go! Make our school proud.');
          await narr('The Liberation Army Arts Academy! Only a handful of children in all of Shanghai are chosen.');
          const c = await choose(['"I\'m ready!"', '"Me? I\'ve never trained to dance..."']);
          if (c === 0) G.fx({ standing: 3 });
          else { await say('principal', 'Comrade Li saw you at the school show. She says you have something special.'); G.fx({ conscience: 2 }); }
        },
      },
      {
        goal: 'Audition for Comrade Li', where: 'Classroom: through the school doors', room: 'classroom', target: 'comradeli',
        async run() {
          await say('comradeli', 'So you are Ji-li. Let\'s see what you can do. Don\'t be nervous.');
          const moves = [
            ['Stretch up tall like a pine tree', 'Spin like a flag in the wind', 'Bow to the audience'],
            ['Leap across the room', 'Balance on one foot', 'March like a soldier'],
            ['Finish with a big smile', 'Finish with a salute', 'Finish with a graceful bow'],
          ];
          for (let i = 0; i < 3; i++) {
            const m = await choose(moves[i], ['First move:', 'Second move:', 'Final move:'][i], 'comradeli');
            await narr(['You feel the whole class watching. ', 'Your heart is pounding. ', 'You hold your pose. '][i] + ['Comrade Li writes something down.', 'Comrade Li nods slowly.', 'The room is silent. Then Comrade Li smiles.'][i]);
            if (i === 0 && m === 2) await say('duhai', '(whispering) Show-off.');
          }
          await say('comradeli', 'Excellent! You passed the first round. Very few children do.');
          await say('comradeli', 'There is just one more step: a political background check. We look into your family history. It is only routine.');
          await narr('You barely hear the last part. You passed!');
          flag('passedAudition'); G.fx({ standing: 8 });
        },
      },
      {
        goal: 'Go home and tell Dad the good news', where: 'Living room: back down the street, then the lane', room: 'home', target: 'dad',
        async run() {
          await say('jili', 'Dad! Dad! I passed the audition for the Liberation Army Arts Academy!');
          await narr('Dad doesn\'t smile. He looks at Mom. Mom looks at the floor.');
          await say('dad', 'Ji-li... I am proud of you. Truly. But I don\'t want you to go any further with it.');
          await say('jili', 'What? Why?!');
          await say('dad', 'They will check our family background. It will not... go well for us. I can\'t explain everything now.');
          await G.learn('class_background');
          const c = await choose([
            { t: 'Beg him to let you try', hint: 'Fight for your dream.' },
            { t: 'Ask what\'s wrong with the family', hint: 'Try to understand.' },
            { t: 'Quietly accept it', hint: 'Trust Dad, even though it hurts.' },
          ]);
          if (c === 0) {
            await say('jili', 'Please, Dad! I worked so hard. Just let me try!');
            await say('dad', 'If you go on, they will dig into our history, and the whole school will hear what they find. I\'m sorry, Ji-li.');
            G.fx({ family: -2, conscience: 2 });
          } else if (c === 1) {
            await say('jili', 'What\'s wrong with our family? We\'re good people!');
            await say('dad', 'We are good people. But these days, being good is not the same as being "red." Someday I will explain.');
            G.fx({ family: 3 }); flag('askedBackground');
          } else {
            await narr('You swallow your tears and nod. Dad rests his hand on your shoulder.');
            await say('dad', 'You are a good daughter.');
            G.fx({ family: 5, conscience: -1 });
          }
          await narr('The next day you tell Comrade Li that your parents won\'t allow it. She looks surprised. Your classmates whisper.');
          await narr('For the first time, you wonder what "family background" really means.');
        },
      },
    ],
  },

  {
    title: 'Destroy the Four Olds', when: 'June – August 1966',
    intro: [
      'Summer 1966. Chairman Mao has launched the Cultural Revolution.',
      'Students are told to destroy the "Four Olds": old ideas, old culture, old customs, and old habits.',
      'Regular classes stop. Teenagers called Red Guards march through the city. Everyone wants to prove they are loyal and "red."',
    ],
    words: ['cultural_revolution'],
    start: { room: 'home', x: 10, y: 11, dir: 'down' },
    tint: 'rgba(170,40,20,.07)',
    summary: s => `The Cultural Revolution began. Red Guards smashed "old" things, and students wrote posters attacking their teachers. ${s.flags.criticizedTeacher ? 'Ji-li wrote one too. ' : ''}At the Red Successor vote, Du Hai told the whole class that Ji-li's grandfather had been a landlord. Dad explained the truth: the family had a "black" background, and there was no way to wash it off.`,
    cast: {
      home: [['grandma', 3, 9, 'right'], ['mom', 14, 5, 'down'], ['jiyun', 5, 11, 'up'], ['jiyong', 15, 10, 'left']],
      home_back: [['songpopo', 15, 5, 'up']],
      lane: [['auntie', 12, 5, 'down'], ['oldqian', 17, 11, 'up'], ['xiaocheng', 5, 8, 'right'], ['mingming', 8, 7, 'left'], ['sixfingers', 10, 4, 'down']],
      anyi: [['teacherwei', 11, 6, 'down']],
      street: [['crowd1', 4, 4, 'up'], ['crowd2', 6, 4, 'up'], ['redguard1', 3, 3, 'up', s => !s.flags.signDown], ['grandpahong', 14, 3, 'down'], ['redguard2', 17, 4, 'left', s => !s.flags.stallClosed], ['vendor', 26, 3, 'down']],
      schoolyard: [['zhangjie', 6, 7, 'down'], ['yinlanlan', 15, 9, 'left']],
      classroom: [['teachergu', 10, 3, 'down'], ['duhai', 15, 7, 'left'], ['zhangjie', 5, 9, 'up'], ['yinlanlan', 13, 9, 'up']],
    },
    steps: [
      {
        goal: 'See why a crowd is gathering on the street', where: 'The street: out through the lane', room: 'street', target: 'crowd1',
        async run() {
          await narr('A crowd has gathered under the old tea shop sign. Two teenagers on a ladder are prying it loose. Its golden characters mean "Fortune and Long Life."');
          await say('redguard1', 'This sign is feudal! It belongs to the old society. Down with the Four Olds!');
          await G.learn('four_olds');
          await G.learn('red_guards');
          await narr('The sign cracks and crashes to the pavement. People cheer. The old shopkeeper stands in his doorway and says nothing.');
          const c = await choose([
            { t: 'Cheer with the crowd', hint: 'Everyone else is cheering.' },
            { t: 'Watch silently', hint: 'Keep your feelings to yourself.' },
            { t: 'Ask the old shopkeeper if he\'s okay', hint: 'People will notice.' },
          ]);
          if (c === 0) { await narr('You cheer. It feels exciting to be part of something so big. Everyone is cheering, so it must be right.'); G.fx({ standing: 5, conscience: -3 }); flag('cheeredSign'); }
          else if (c === 1) { await narr('Part of you is excited. Part of you feels strange, watching someone\'s sign be smashed.'); G.fx({ conscience: 1 }); }
          else {
            await narr('You step toward the shopkeeper...');
            await say('redguard1', 'Hey, Young Pioneer! Feeling sorry for the old society?');
            await narr('Your face burns. You hurry away.');
            G.fx({ standing: -4, conscience: 5 }); flag('pitiedShopkeeper');
          }
          flag('signDown'); G.removeNPC('redguard1');
        },
      },
      {
        goal: 'Check on Grandpa Hong\'s book stall', where: 'The middle of the street', room: 'street', target: 'grandpahong',
        async run() {
          await narr('You spent hundreds of afternoons at Grandpa Hong\'s stall, reading storybooks for one fen each. Today the books are dumped in a heap.');
          await say('grandpahong', 'Ah... the little bookworm. They say my storybooks are "poison." Old stories, old ideas. They will burn them tonight.');
          await say('redguard2', 'Move along, old man. And you, girl: don\'t touch those.');
          const c = await choose([
            { t: 'Slip one storybook under your shirt', hint: 'Risky, if you\'re caught.' },
            { t: 'Tell Grandpa Hong the Red Guards must be right', hint: 'Say what you\'ve been taught.' },
            { t: 'Help him stack the books without a word', hint: 'A small kindness.' },
          ]);
          if (c === 0) {
            await narr('When the Red Guard turns away, you slide a thin book of fairy tales under your shirt. Your heart pounds.');
            await say('grandpahong', '(very quietly) Keep it safe.');
            G.fx({ conscience: 6, standing: -2 }); flag('savedBook');
          } else if (c === 1) {
            await say('jili', 'Grandpa Hong... maybe the books really are bad?');
            await say('grandpahong', 'Maybe. You\'re young. You\'ll decide for yourself one day.');
            G.fx({ standing: 3, conscience: -4 });
          } else {
            await narr('You stack the books neatly. Grandpa Hong pats your hand. Neither of you says anything.');
            G.fx({ conscience: 3 });
          }
          flag('stallClosed'); G.removeNPC('redguard2');
        },
      },
      {
        goal: 'Go to class: everyone must write a da-zi-bao', where: 'Classroom: your desk in the middle', room: 'classroom', target: 'desk_jili',
        async run() {
          await narr('Teacher Gu stands at the front, looking tired. The blackboard says: WRITE DA-ZI-BAO! EXPOSE THE BAD ELEMENTS!');
          await G.learn('dazibao');
          await say('duhai', 'Everyone has to write one. Criticize the teachers. They fill our heads with old ideas!');
          await narr('Teacher Gu looks at the floor. She was always your favorite teacher. She taught you to love reading.');
          const c = await choose([
            { t: 'Criticize a teacher, like Du Hai says', hint: 'Your classmates will approve.' },
            { t: 'Praise the revolution without naming anyone', hint: 'A safe middle path.' },
            { t: 'Leave your paper blank', hint: 'People will notice.' },
          ], 'What will your poster say?');
          const topic = ['teacher', 'general', 'blank'][c];
          if (topic === 'blank') {
            await say('duhai', 'Blank? What, are you protecting the teachers?');
            await narr('Everyone stares at you. Teacher Gu doesn\'t look up, but her hands are trembling.');
            G.fx({ standing: -8, conscience: 6 }); flag('refusedPoster');
            return;
          }
          const prompts = {
            teacher: 'Write a poster criticizing a teacher. (This is what your class was told to do. Write it however you want: harsh, mild, or something else.)',
            general: 'Write a poster supporting the revolution without accusing anyone by name.',
          };
          const r = await UI.writer(prompts[topic]);
          G.state.posters.unshift({ title: r.title, text: r.text, published: r.published, topic, ch: 1 });
          G.journal(`Your da-zi-bao: ${r.title}`, r.text + (r.published ? '\n\n(Posted on the school wall.)' : '\n\n(Kept private.)'), 'YOUR WRITING');
          if (topic === 'teacher' && r.published) {
            await narr('You paste your poster onto the schoolyard wall. Du Hai reads it and nods. "Not bad, landlord— I mean, not bad."');
            G.fx({ standing: 10, conscience: -8 }); flag('criticizedTeacher');
          } else if (topic === 'teacher') {
            await narr('You fold the poster into your pocket instead of putting it up. Nobody notices. Probably.');
            G.fx({ standing: -2, conscience: 1 });
          } else if (r.published) {
            await narr('Your poster goes up on the wall with dozens of others. It is safe. Nobody will remember it.');
            G.fx({ standing: 4 });
          } else {
            await narr('You keep the poster to yourself.');
            G.fx({ standing: -2 });
          }
          if (r.published) flag('postedPoster');
        },
      },
      {
        goal: 'Find An Yi in the schoolyard', where: 'Schoolyard: by the poster wall', room: 'schoolyard', target: 'anyi',
        cast: { schoolyard: [['anyi', 4, 3, 'up']] },
        async run() {
          await narr('Your best friend An Yi is standing in front of the poster wall. She is very still.');
          await say('anyi', 'Look. They wrote posters about my mother.');
          await narr('One poster says that Teacher Wei, An Yi\'s mother, "poisons students with bourgeois ideas."');
          if (has('criticizedTeacher')) {
            await say('anyi', '...I saw yours too, Ji-li. I know everyone had to. But still.');
            const c = await choose(['"I\'m sorry."', '"I had no choice."']);
            if (c === 0) { await say('anyi', 'I know. It\'s okay. It\'s not okay. I don\'t know anything anymore.'); G.fx({ conscience: 3 }); }
            else { await say('anyi', 'Yes. Nobody has a choice anymore.'); G.fx({ conscience: -1 }); }
          } else {
            const c = await choose([
              { t: 'Hold her hand', hint: 'Be a friend, in front of everyone.' },
              { t: 'Tell her it will all blow over soon', hint: 'Hope for the best.' },
              { t: 'Glance around to see who\'s watching', hint: 'Protect yourself.' },
            ]);
            if (c === 0) { await say('anyi', 'Thanks, Ji-li. You\'re the only one still talking to me.'); G.fx({ conscience: 3, standing: -1 }); flag('supportedAnYi'); }
            else if (c === 1) { await say('anyi', 'Do you really think so?'); await narr('You want to believe it.'); }
            else { await narr('Du Hai is watching from across the yard. You step a little away from An Yi. She notices.'); G.fx({ standing: 2, conscience: -3 }); }
          }
          await say('anyi', 'You\'d better go in. They\'re about to vote for the Red Successors.');
        },
      },
      {
        goal: 'Return to class for the Red Successor vote', where: 'Classroom: talk to Teacher Gu', room: 'classroom', target: 'teachergu',
        async run() {
          await G.learn('red_successor');
          await narr('Today the class will choose its "Red Successors," the students most fit to carry the revolution forward.');
          await say('teachergu', 'Nominations, please.');
          await say('zhangjie', 'I nominate Jiang Ji-li! She\'s our da-dui-zhang and the best student in the school!');
          await narr('Hands shoot up. Your heart lifts. Then Du Hai stands.');
          await say('duhai', 'Wait! Jiang Ji-li can\'t be a Red Successor. My mother is the neighborhood Party secretary. She says Ji-li\'s grandfather was a LANDLORD!');
          await G.learn('landlord');
          await narr('The room goes silent. Every head turns toward you.');
          G.fx({ standing: -20 });
          const c = await choose(['"That\'s not true!"', 'Say nothing', '"I... I didn\'t know."']);
          if (c === 0) { await say('jili', 'That\'s not true! My family isn\'t like that!'); await say('duhai', 'Go ask your parents, then.'); }
          else if (c === 1) await narr('Your throat is too tight to say anything.');
          else { await say('jili', 'I... I didn\'t know.'); await say('teachergu', '(gently) Sit down, Ji-li. We will... move on.'); G.fx({ conscience: 2 }); }
          await narr('When the list is read out, your name is not on it.');
          flag('exposed');
        },
      },
      {
        goal: 'Go home and ask Dad the truth', where: 'Living room', room: 'home', target: 'dad',
        cast: { home: [['dad', 10, 10, 'up']] },
        async run() {
          await say('jili', 'Dad. Du Hai said Grandpa was a landlord. In front of the whole class. Is it true?');
          await say('dad', '...Sit down, Ji-li.');
          await say('dad', 'Your grandfather owned land in the countryside and rented it to farmers. Under the new government, that made him a "landlord," one of the worst labels there is.');
          await say('dad', 'He died when I was young. You never met him. But the label stays with the family, like a stain that won\'t wash out.');
          await G.learn('black_categories');
          await say('jili', 'So that\'s why you stopped the audition.');
          await say('dad', 'Yes. I didn\'t want you to find out like this.');
          const c = await choose(['"It\'s not fair! We didn\'t do anything!"', '"I\'ll work twice as hard to make up for it."', 'Hug Dad']);
          if (c === 0) { await say('dad', 'No, it isn\'t fair. But be careful who hears you say that.'); G.fx({ conscience: 4 }); }
          else if (c === 1) { await say('dad', 'Ji-li... you should never have to make up for who your grandfather was.'); G.fx({ standing: 2 }); }
          else { await narr('Dad holds you for a long time.'); G.fx({ family: 6 }); }
        },
      },
    ],
  },

  {
    title: 'The Searches', when: 'August – September 1966',
    intro: [
      'Late summer 1966. Red Guards are now raiding people\'s homes.',
      'They hunt for "Four Olds": old photos, books, jewelry, fine clothes, anything that looks rich or old-fashioned.',
      'Families with "black" backgrounds, like Ji-li\'s, are in the most danger.',
    ],
    start: { room: 'home_back', x: 4, y: 7, dir: 'down' },
    tint: 'rgba(40,40,60,.14)',
    summary: s => `Song Po-po, the family's longtime housekeeper, had to leave. An Yi's grandmother died after Red Guards raided her home. Ji-li's family burned their own photographs${s.flags.keptPhoto ? ', though Ji-li secretly saved one' : ''}. Then Red Guards led by a neighbor, Six-Fingers, searched the Jiang home in the night and took almost everything of value.`,
    cast: {
      home: [['grandma', 3, 9, 'right'], ['mom', 14, 5, 'down'], ['jiyun', 5, 11, 'up'], ['jiyong', 15, 10, 'left'], ['dad', 12, 10, 'up', s => s.flags.raided]],
      home_back: [['songpopo', 15, 5, 'up', s => !s.flags.popoLeft]],
      lane: [['sixfingers', 10, 6, 'down'], ['oldqian', 17, 11, 'up'], ['auntie', 12, 4, 'down']],
      anyi: [['anyi', 8, 9, 'down'], ['teacherwei', 12, 6, 'down']],
      street: [['redguard1', 10, 4, 'right'], ['redguard2', 20, 10, 'left'], ['vendor', 26, 3, 'down']],
      schoolyard: [],
      classroom: [],
    },
    steps: [
      {
        goal: 'Talk to Song Po-po in the kitchen', where: 'Kitchen corner of this room', room: 'home_back', target: 'songpopo',
        async run() {
          await narr('Song Po-po has cooked for your family since before you were born. Today her cloth bag is packed.');
          await say('songpopo', 'Ji-li. I have to go back to my own home.');
          await say('songpopo', 'Your parents are afraid. If the Red Guards see a family like yours with a housekeeper, they will say you are "exploiting a worker."');
          await say('songpopo', 'It is safer for everyone. Even for me.');
          const c = await choose(['Give her your favorite hair ribbon', 'Ask her to stay anyway', 'Thank her for everything']);
          if (c === 0) { await say('songpopo', 'Silly girl. I\'ll keep it always.'); G.fx({ family: 3, conscience: 2 }); flag('gaveRibbon'); }
          else if (c === 1) { await say('songpopo', 'I wish I could, little one. Wishing isn\'t enough these days.'); G.fx({ family: 1 }); }
          else { await say('songpopo', 'You were always a good child. Look after your grandma for me.'); G.fx({ family: 3 }); }
          await G.walkNPC('songpopo', [[16, 6], [16, 12], [16, 13]]);
          G.removeNPC('songpopo');
          await narr('When she is gone, the kitchen feels much bigger, and much colder.');
          flag('popoLeft');
        },
      },
      {
        goal: 'Visit An Yi\'s home', where: 'The other door in the lane (top right)', room: 'anyi', target: 'anyi',
        async run() {
          await narr('An Yi\'s home is a wreck. Drawers hang open. Books are torn. The Red Guards came yesterday.');
          await say('anyi', 'They took Grandma\'s things. Her wedding jewelry. Her old photos. They shouted at her for hours.');
          await say('anyi', 'Ji-li... Grandma died last night.');
          await narr('An Yi\'s grandmother was like a second grandmother to you. People whisper that the fear and shame were more than she could bear.');
          const c = await choose([
            { t: 'Sit beside An Yi in silence', hint: 'Sometimes there is nothing to say.' },
            { t: 'Promise you\'ll always be her friend', hint: 'Even when it\'s dangerous.' },
            { t: 'Say you need to get home before someone sees you', hint: 'Protect your own family.' },
          ]);
          if (c === 0) { await narr('You sit with her until the room grows dark.'); G.fx({ conscience: 4 }); flag('satWithAnYi'); }
          else if (c === 1) { await say('anyi', 'Promise? Even if they come after your family too?'); await say('jili', 'I promise.'); G.fx({ conscience: 5, standing: -2 }); flag('promisedAnYi'); }
          else { await say('anyi', '...Right. Go. It\'s okay.'); G.fx({ conscience: -4, standing: 1 }); }
          await say('teacherwei', 'Thank you for coming, Ji-li. Tell your family to be careful. Please.');
        },
      },
      {
        goal: 'Help the family go through the old trunk', where: 'Bedroom: the trunk against the wall', room: 'home_back', target: 'trunk',
        cast: { home_back: [['mom', 11, 5, 'up'], ['grandma', 9, 6, 'right']] },
        async run() {
          await narr('Mom has opened the old trunk. Inside are photo albums, letters, and Grandma\'s silk dresses.');
          await say('mom', 'If the Red Guards come, anything in here could be called "evidence." We have to burn what\'s dangerous.');
          await narr('One by one the photos go into the stove: your parents\' wedding. Grandfather in a Western suit. You as a baby, in a fancy dress.');
          await say('grandma', 'Burn it. Burn it all. Things are only things.');
          await narr('But her hands are shaking.');
          const c = await choose([
            { t: 'Secretly keep one small photo of the family', hint: 'If it\'s found, it could mean trouble.' },
            { t: 'Burn everything, as Mom says', hint: 'Keep the family safe.' },
            { t: 'Argue that it isn\'t fair', hint: 'Say what you feel.' },
          ]);
          if (c === 0) { await narr('You slip a tiny photo of the whole family into the lining of your shoe. If anyone finds it...'); flag('keptPhoto'); G.fx({ conscience: 3 }); }
          else if (c === 1) { await narr('You feed the photos to the flames. Your eyes sting from the smoke, or from something else.'); G.fx({ family: 3 }); }
          else { await say('jili', 'Why should we burn our own memories?'); await say('mom', 'Because memories can be used against us now, Ji-li!'); await narr('Mom\'s voice cracks. You stop arguing.'); G.fx({ family: -2, conscience: 3 }); }
          flag('burned');
        },
      },
      {
        goal: 'It\'s late. Go to bed.', where: 'Your bed, top left of this room', room: 'home_back', target: 'bed_jili',
        async run() {
          G.setNight(true);
          await narr('You lie awake for a long time. Finally, you drift off...');
          await narr('BANG. BANG. BANG. Someone is pounding on the door.');
          await say('sixfingers', 'Open up! Red Guards!');
          await G.teleport('home', 14, 10, 'down');
          G.addNPC('dad', 12, 9, 'down'); G.addNPC('mom', 15, 9, 'down'); G.addNPC('grandma', 4, 10, 'right');
          G.addNPC('jiyun', 14, 11, 'up'); G.addNPC('jiyong', 16, 10, 'left');
          G.addNPC('sixfingers', 9, 12, 'up'); G.addNPC('redguard1', 10, 12, 'up');
          await Promise.all([G.walkNPC('sixfingers', [[9, 10]]), G.walkNPC('redguard1', [[10, 11], [13, 11]])]);
          await say('sixfingers', 'We\'ve had a report. This family has landlord blood, and you\'re hiding Four Olds. Search everything!');
          G.addNPC('redguard2', 10, 12, 'up');
          await Promise.all([G.walkNPC('redguard1', [[13, 12], [6, 12], [6, 4], [2, 4]]), G.walkNPC('redguard2', [[10, 11], [17, 11], [17, 4]])]);
          await narr('They pull books off the shelves, empty every drawer, slash open the pillows, and knock on the walls listening for hidden spaces.');
          const c = await choose([
            { t: 'Stay very still and quiet', hint: 'The safest thing. Also the hardest.' },
            { t: 'Tell Six-Fingers to stop scaring Grandma', hint: 'Stand up to him.' },
            { t: 'Pull Ji-yun behind you', hint: 'Protect your little sister.' },
          ]);
          if (c === 0) await narr('You stand perfectly still. You count your breaths. One. Two. Three.');
          else if (c === 1) { await say('jili', 'Stop it! You\'re scaring my grandmother!'); await say('sixfingers', 'Watch your mouth, landlord brat, or we\'ll take you too.'); G.fx({ standing: -5, conscience: 6, family: 4 }); }
          else { await narr('You pull Ji-yun behind you. She grips your shirt with both hands.'); G.fx({ family: 5, conscience: 2 }); }
          if (has('keptPhoto')) { await narr('Nobody checks your shoes. The little photo stays hidden.'); flag('photoSurvived'); }
          await say('sixfingers', 'Take the silk, the clock, the books. This family won\'t be needing them.');
          await Promise.all([G.walkNPC('redguard1', [[3, 4], [6, 4], [6, 12], [9, 12], [9, 13]]), G.walkNPC('redguard2', [[17, 12], [10, 12], [10, 13]]), G.walkNPC('sixfingers', [[9, 13]])]);
          G.removeNPC('sixfingers'); G.removeNPC('redguard1'); G.removeNPC('redguard2');
          await narr('By dawn they are gone. So is almost everything your family owned.');
          G.fx({ standing: -10 }); flag('raided');
          G.setNight(false);
        },
      },
      {
        goal: 'Comfort Ji-yun', where: 'Living room', room: 'home', target: 'jiyun',
        async run() {
          await say('jiyun', 'Jie-jie... big sister... are they coming back?');
          const c = await choose(['"I don\'t know. But I\'m right here."', '"No. Never."', 'Make a silly face']);
          if (c === 0) { await say('jiyun', '...Okay. Stay close.'); G.fx({ conscience: 3, family: 3 }); }
          else if (c === 1) { await say('jiyun', 'Promise?'); await narr('You don\'t answer.'); G.fx({ family: 3 }); }
          else { await narr('You puff out your cheeks and cross your eyes. Ji-yun hiccups, then giggles.'); G.fx({ family: 5 }); }
          await say('grandma', 'Good girl. Now, everyone, let\'s clean up. A home is still a home.');
        },
      },
    ],
  },

  {
    title: 'A New School', when: '1967',
    intro: [
      '1967. After more than a year without classes, junior high schools open again.',
      'At Ji-li\'s new school, nobody knows about her grandfather. Maybe she can start over.',
      'Being an excellent student, and a loyal revolutionary, is still how she hopes to prove herself.',
    ],
    start: { room: 'home', x: 10, y: 11, dir: 'down' },
    tint: 'rgba(0,0,0,.04)',
    summary: 'At Xin-zha Junior High, Ji-li made a new friend, Chang Hong, and Chairman Jin chose her for the Class Education Exhibition. For a little while she felt like herself again. Then Dad didn\'t come home. People from his theater had detained him.',
    cast: {
      home: [['grandma', 3, 9, 'right'], ['mom', 14, 5, 'down'], ['dad', 12, 10, 'up', s => s.step < 3], ['jiyun', 5, 11, 'up'], ['jiyong', 15, 10, 'left']],
      lane: [['sixfingers', 10, 6, 'down'], ['oldqian', 17, 11, 'up'], ['auntie', 12, 4, 'down'], ['xiaocheng', 5, 8, 'right'], ['mingming', 7, 9, 'left']],
      anyi: [['anyi', 8, 9, 'down'], ['teacherwei', 10, 6, 'down']],
      street: [['vendor', 26, 3, 'down'], ['crowd1', 18, 10, 'left']],
      jhs: [['changhong', 6, 7, 'down'], ['chairmanjin', 10, 6, 'down'], ['teacherzhang', 16, 10, 'left']],
    },
    steps: [
      {
        goal: 'Go to your new junior high school', where: 'Street: the school door on the bottom side', room: 'jhs', target: 'changhong',
        async run() {
          await say('changhong', 'Hi! You\'re the new girl in our class, right? I\'m Chang Hong.');
          await narr('She wears a Red Guard armband. Her parents are factory workers, about as "red" as a family can be.');
          await say('changhong', 'Teacher Zhang says you have the best marks in the year. Want to study together?');
          const c = await choose(['"Yes! I\'d love to."', 'Ask why she wants to be your friend']);
          if (c === 0) { await say('changhong', 'Great! The revolution needs smart people too.'); G.fx({ standing: 3 }); }
          else { await say('changhong', 'Why not? I judge people by what they do.'); await narr('She doesn\'t know about your grandfather. Not yet.'); G.fx({ conscience: 2 }); }
          flag('metChangHong');
        },
      },
      {
        goal: 'Speak to Chairman Jin by the stage', where: 'Junior high hall', room: 'jhs', target: 'chairmanjin',
        async run() {
          await say('chairmanjin', 'Jiang Ji-li. Your teachers speak very highly of you.');
          await say('chairmanjin', 'Our school is preparing a Class Education Exhibition, to show how cruel the old society was and how the revolution saved the people.');
          await G.learn('exhibition');
          await say('chairmanjin', 'I want you to help prepare it and explain it to visitors. It is a great honor.');
          await narr('A great honor! For the first time in a year, you feel like the old Ji-li.');
          const c = await choose(['Accept proudly', 'Accept, but worry he\'ll find out about your family']);
          G.fx(c === 0 ? { standing: 6 } : { standing: 4, conscience: 2 });
        },
      },
      {
        goal: 'Prepare your exhibit panel', where: 'Junior high hall: the panel on the left', room: 'jhs', target: 'panel_jili',
        async run() {
          await narr('Your panel shows pictures of poor farmers suffering in the old society. You must write the words that explain it to visitors.');
          const c = await choose([
            { t: 'Write simply and honestly', hint: 'Say only what you believe is true.' },
            { t: 'Write the most fiery slogans you know', hint: 'Impress Chairman Jin.' },
            { t: 'Ask Chang Hong to help', hint: 'Work together.' },
          ]);
          if (c === 0) { await narr('You write clear, simple sentences. Teacher Zhang reads them and nods.'); G.fx({ conscience: 3, standing: 3 }); }
          else if (c === 1) { await narr('DOWN WITH THE EXPLOITERS! LONG LIVE THE REVOLUTION! Chairman Jin is very impressed.'); G.fx({ standing: 7, conscience: -3 }); }
          else { await say('changhong', 'Let\'s do it together!'); await narr('Working side by side, you almost forget to worry.'); G.fx({ standing: 4 }); flag('closeToChangHong'); }
          await narr('Visitors come all week. You explain the panels, and people praise you. You are good at this.');
          flag('inExhibition');
        },
      },
      {
        goal: 'Go home for dinner', where: 'Living room', room: 'home', target: 'mom',
        cast: { home: [['mom', 13, 9, 'left']] },
        async run() {
          await say('mom', 'Ji-li... sit down. Dad didn\'t come home today.');
          await say('mom', 'People at his theater are holding him there. They won\'t let him leave. They say he is a "rightist."');
          await narr('The bowl in your hands suddenly feels very heavy.');
          const c = await choose(['"When will he come back?"', '"What did Dad do?"']);
          if (c === 0) { await say('mom', 'I don\'t know. I don\'t know.'); G.fx({ family: 2 }); }
          else { await say('mom', 'Nothing. He did nothing wrong. Remember that, whatever anyone tells you.'); G.fx({ family: 3, conscience: 2 }); }
          flag('dadTaken');
        },
      },
    ],
  },

  {
    title: 'Draw a Clear Line', when: '1967 – 1968',
    intro: [
      'Dad is being held at his theater. The group holding him is led by a man the family calls "Thin-Face."',
      'Dad is accused of being a "rightist," an enemy of the revolution, and of listening to foreign radio.',
      'Families of the accused are pushed to "draw a clear line": to turn against them in public.',
    ],
    start: { room: 'home', x: 10, y: 11, dir: 'down' },
    tint: 'rgba(30,30,60,.16)',
    summary: s => s.flags.testified
      ? 'Thin-Face pressured Ji-li to testify against her father. Frightened, she agreed. She kept her place at the Exhibition, but something between her and her family broke.'
      : 'Thin-Face pressured Ji-li to testify against her father. She refused. Chairman Jin took away her place in the Exhibition, but she had stayed loyal to Dad.',
    cast: {
      home: [['grandma', 3, 9, 'right'], ['mom', 14, 5, 'down'], ['jiyun', 5, 11, 'up'], ['jiyong', 15, 10, 'left']],
      lane: [['sixfingers', 8, 11, 'up'], ['oldqian', 17, 11, 'up'], ['auntie', 12, 4, 'down'], ['xiaocheng', 5, 7, 'right'], ['mingming', 14, 7, 'left']],
      anyi: [['anyi', 8, 9, 'down'], ['teacherwei', 10, 6, 'down']],
      street: [['vendor', 26, 3, 'down'], ['redguard1', 12, 10, 'down']],
      jhs: [['changhong', 6, 7, 'down'], ['chairmanjin', 10, 6, 'down'], ['teacherzhang', 16, 10, 'left']],
      office: [['thinface', 10, 4, 'down'], ['chairmanjin', 12, 4, 'down', s => s.step === 3]],
    },
    steps: [
      {
        goal: 'Talk to Mom', where: 'Living room', room: 'home', target: 'mom',
        async run() {
          await say('mom', 'A newspaper article came out today. About us.');
          await narr('The article claims your family hoarded wealth and cruelly mistreated workers before the revolution.');
          await say('mom', 'It isn\'t true. But now anyone in Shanghai can read it.');
          await G.learn('rightist');
          await say('mom', 'They will question you at school. Answer carefully. Don\'t lie, but don\'t give them anything they can twist.');
          G.fx({ standing: -10 });
          const c = await choose(['"I\'ll protect Dad."', '"I\'m scared, Mom."']);
          if (c === 0) { await say('mom', 'Protect yourself first. That\'s what your father wants.'); G.fx({ family: 3 }); }
          else { await say('mom', 'So am I. We\'ll be scared together.'); G.fx({ family: 4 }); }
        },
      },
      {
        goal: 'Read the new posters in the lane', where: 'Lane: the noticeboard at the bottom', room: 'lane', target: 'lane_board',
        async run() {
          await narr('New posters cover the lane wall. Your father\'s name is written in huge black characters, crossed out with red X\'s.');
          await say('sixfingers', 'Look who it is. The rightist\'s daughter.');
          const c = await choose([
            { t: 'Tear down the poster', hint: 'Tearing a "revolutionary" poster is a crime.' },
            { t: 'Walk past with your head held high', hint: 'Don\'t let him see you\'re afraid.' },
            { t: 'Look down and hurry home', hint: 'Avoid trouble.' },
          ]);
          if (c === 0) {
            await narr('You rip the poster in half. Six-Fingers grabs your arm.');
            await say('sixfingers', 'Tearing a revolutionary poster? That\'s a crime!');
            await say('oldqian', 'Six-Fingers! Your wife is calling you! Something about the stove!');
            await narr('He lets go for a moment, and you pull free. Old Qian winks at you.');
            G.fx({ standing: -8, conscience: 6 }); flag('toreposter');
          } else if (c === 1) { await narr('You don\'t look at him. Your knees shake, but you keep walking.'); G.fx({ conscience: 3 }); await say('oldqian', 'Good girl. A wall of paper is still only paper.'); }
          else { await narr('You stare at the ground and walk fast. Six-Fingers laughs.'); G.fx({ standing: 1, conscience: -2 }); }
        },
      },
      {
        goal: 'Ask Chang Hong for advice at school', where: 'Junior high hall', room: 'jhs', target: 'changhong',
        async run() {
          await say('changhong', 'I heard about your father. I\'m sorry, Ji-li.');
          await say('changhong', 'Listen. I would never ask you to turn against your own family. But you have to show people you\'re loyal to the revolution, through your own actions.');
          await say('changhong', 'Chairman Jin wants you in the office. A man from your father\'s theater is there. Be careful.');
          const c = await choose(['"Thank you for not abandoning me."', '"What should I say to them?"']);
          if (c === 0) { await say('changhong', 'Friends don\'t abandon each other. I think that\'s what being "red" should really mean.'); G.fx({ conscience: 2 }); flag('trustChangHong'); }
          else { await say('changhong', 'The truth. Only the truth.'); G.fx({ conscience: 1 }); }
        },
      },
      {
        goal: 'Go to the "study session" in the office', where: 'Office: the door at the top right of the hall', room: 'office', target: 'thinface',
        async run() {
          await G.learn('study_session');
          await narr('A thin man with a narrow face sits behind the desk. This must be Thin-Face. Chairman Jin stands beside him.');
          await say('thinface', 'Sit. You\'re a smart girl, Jiang Ji-li. Smart enough to know your father is in serious trouble.');
          await say('thinface', 'We know he listened to foreign radio. We know he said things against the Party. We only need someone close to him to confirm it.');
          await say('thinface', 'Testify against him at the meeting, and you keep your place in the Exhibition. Draw a clear line between yourself and your rightist father.');
          await G.learn('draw_line');
          const first = await choose(['"My father is not a rightist."', '"I need time to think."', '"...What would I have to say?"']);
          if (first === 0) await say('thinface', 'Loyalty to a rightist is not loyalty. It is a crime. Think about your future.');
          else if (first === 1) await say('thinface', 'Think, then. But every day you wait, your father\'s case gets worse. And yours.');
          else await say('thinface', 'Only the truth. That he complained about the Party. That he listened to enemy radio. You have heard him, haven\'t you?');
          await say('chairmanjin', 'The school expects your answer, Jiang Ji-li.');
          const c = await choose([
            { t: 'Refuse to testify against Dad', hint: 'Stay loyal to your father, whatever it costs.' },
            { t: 'Agree to testify against Dad', hint: 'Save your place, and maybe your future.' },
          ], 'This is the hardest choice of your life.');
          if (c === 0) {
            await say('jili', 'No. My father is a good man. I won\'t say things that aren\'t true.');
            await say('thinface', '(coldly) Then you have chosen your side.');
            await say('chairmanjin', 'Jiang Ji-li, you are removed from the Exhibition. Effective today.');
            G.fx({ standing: -15, conscience: 12, family: 12 }); flag('refused');
          } else {
            await narr('The words come out of your mouth as if someone else were speaking them.');
            await say('jili', '...I\'ll testify.');
            await say('thinface', 'Good. Very good. You have a future after all.');
            G.fx({ standing: 12, conscience: -15, family: -20 }); flag('testified');
          }
        },
      },
      {
        goal: 'Go home and talk to Grandma', where: 'Living room', room: 'home', target: 'grandma',
        async run() {
          if (has('refused')) {
            await say('grandma', 'You said no? To all of them?');
            await say('grandma', 'Your father is the kindest man I know. You did right, Ji-li. Whatever it costs, you did right.');
            G.fx({ family: 3 });
          } else {
            await narr('At the meeting, you said what Thin-Face wanted. You did not look at Mom.');
            await say('grandma', '...You were frightened. No child should ever be asked to do such a thing.');
            await narr('Grandma doesn\'t scold you. Somehow that is worse.');
            G.fx({ conscience: 2 });
          }
        },
      },
    ],
  },

  {
    title: 'The Letter', when: '1968',
    intro: [
      '1968. To prove she is loyal, Ji-li volunteers to work on a farm in the countryside, as many students are urged to do.',
      'Back home, Mom and Dad\'s friend Uncle Tian decide to write a letter to the city government about how Thin-Face abuses his power.',
      'It is a brave thing to do. It is also very dangerous.',
    ],
    words: ['countryside'],
    start: { room: 'field', x: 4, y: 3, dir: 'down' },
    tint: 'rgba(60,45,30,.12)',
    summary: s => `In the countryside, Ji-li planted rice until Thin-Face called her back. Mom and Uncle Tian wrote a letter complaining about Thin-Face, but it was found. Mom and Grandma were forced to call themselves "landlords' wives" in front of the neighbors. Dad was sent away to do hard labor, and Grandma was ordered to sweep the lane every day${s.flags.sweptWithGrandma ? '. Ji-li swept beside her' : ''}.`,
    cast: {
      field: [['farmer', 12, 9, 'left'], ['changhong', 7, 9, 'up']],
      home: [['grandma', 3, 9, 'right'], ['mom', 13, 9, 'left'], ['uncletian', 11, 10, 'up', s => !s.flags.letterFound], ['jiyun', 5, 11, 'up'], ['jiyong', 15, 10, 'left']],
      lane: [['sixfingers', 13, 9, 'left'], ['oldqian', 17, 11, 'up'], ['auntie', 12, 4, 'down'], ['grandma', 8, 7, 'down', s => s.flags.letterFound]],
      anyi: [['anyi', 8, 9, 'down'], ['teacherwei', 10, 6, 'down']],
      street: [['vendor', 26, 3, 'down']],
      jhs: [['teacherzhang', 16, 10, 'left']],
    },
    steps: [
      {
        goal: 'Plant rice seedlings in the paddy', where: 'The field just below you', room: 'field', target: 'rice',
        async run() {
          await narr('The mud is cold and comes up to your knees. You push seedlings into the mud, row after row, until your back screams.');
          for (let i = 0; i < 3; i++) {
            await choose([['Push the seedling in gently', 'Push it in quickly', 'Count the seedlings left'][i], ['Straighten your aching back', 'Keep going', 'Wipe the sweat from your eyes'][i]], `Row ${i + 1} of 3`);
            G.state.flags.planted = i + 1;
            await narr(['One row done. Only a hundred more.', 'Your hands are blistered. A leech is stuck to your leg. You don\'t even scream anymore.', 'The sun sets over the paddies. It is beautiful, and you are too tired to care.'][i]);
          }
          await say('farmer', 'City girl works hard. Not bad. Not bad at all.');
          await narr('A few days later you come down with a fever. Then a message arrives from Shanghai: Thin-Face orders you home. He has more questions.');
          await G.teleport('home', 10, 11, 'up');
        },
      },
      {
        goal: 'Talk to Mom and Uncle Tian', where: 'Living room', room: 'home', target: 'uncletian',
        async run() {
          await say('uncletian', 'Ji-li! You\'re back. You look so thin.');
          await say('mom', 'Uncle Tian and I have written a letter to the Municipal Party Committee. It describes how Thin-Face beats and threatens the people he holds.');
          await say('uncletian', 'If someone above him reads it, maybe they\'ll stop him. Maybe your father comes home.');
          const c = await choose(['"That\'s so brave!"', '"What if Thin-Face finds it?"']);
          if (c === 0) { await say('uncletian', 'Brave or foolish. We\'ll find out.'); G.fx({ conscience: 2 }); }
          else { await say('mom', 'Then we\'ll be in even worse trouble. That\'s why it has to stay hidden until Uncle Tian can deliver it.'); G.fx({ family: 2 }); }
          await say('mom', 'Ji-li, hide this copy for me. Somewhere no one would think to look.');
          flag('hasLetter');
        },
      },
      {
        goal: 'Hide the letter in the bedroom', where: 'Bedroom: try the old trunk', room: 'home_back', target: 'trunk',
        async run() {
          await narr('Where can you hide it? Every corner of this apartment has already been searched once.');
          const c = await choose(['Inside the lining of the empty trunk', 'Under the ashes in the stove', 'Folded inside your old schoolbook']);
          flag('hideSpot', ['in the trunk lining', 'under the stove ashes', 'inside your schoolbook'][c]);
          await narr('You hide the letter and try to act normal. Your hands won\'t stop shaking.');
        },
      },
      {
        goal: 'Go back to the living room', where: 'Living room', room: 'home', target: '_auto', auto: true,
        async run() {
          G.addNPC('thinface', 9, 12, 'up'); G.addNPC('redguard1', 10, 12, 'up');
          G.placePlayer(14, 7, 'down');
          await narr('The door crashes open.');
          await Promise.all([G.walkNPC('thinface', [[9, 10]]), G.walkNPC('redguard1', [[10, 11]])]);
          await say('thinface', 'We\'ve had a report. A counterrevolutionary letter is hidden in this home.');
          await narr('Someone told. Maybe a neighbor\'s child overheard Ji-yun talking. You will never know for sure.');
          await G.walkNPC('redguard1', [[16, 11], [16, 4]]);
          G.removeNPC('redguard1');
          await narr('They tear the apartment apart again. Then a man walks out of the bedroom holding up the letter.');
          await narr(`They found it ${G.state.flags.hideSpot || 'in the bedroom'}.`);
          G.addNPC('redguard1', 16, 4, 'down');
          await G.walkNPC('redguard1', [[16, 9], [12, 9], [12, 11]]);
          await say('thinface', 'Attacking the revolution in writing! You, and you, old woman. Tonight you will stand in front of the neighbors and confess that you were landlords\' wives.');
          const c = await choose([
            { t: 'Stand in front of Grandma', hint: 'Shield her.' },
            { t: 'Beg Thin-Face to leave Grandma alone', hint: 'Plead with him.' },
            { t: 'Stay silent so they don\'t take you too', hint: 'Protect yourself.' },
          ]);
          if (c === 0) { await narr('You step between Thin-Face and Grandma. He pushes past you, but Grandma squeezes your hand.'); G.fx({ family: 6, conscience: 4, standing: -5 }); }
          else if (c === 1) { await say('thinface', 'Begging? Landlord habits die hard.'); G.fx({ family: 4, standing: -3 }); }
          else { await narr('You stay silent. It is what they want. You hate yourself a little for it.'); G.fx({ conscience: -3 }); }
          await Promise.all([G.walkNPC('thinface', [[9, 13]]), G.walkNPC('redguard1', [[10, 12], [10, 13]])]);
          G.removeNPC('thinface'); G.removeNPC('redguard1'); G.removeNPC('uncletian');
          await narr('That evening, Mom and Grandma stand in the lane while the neighbors watch. Now the family\'s "black" status is official.');
          await narr('Soon after, Dad is sent away to do hard labor in the countryside. And Grandma, who is over seventy, is ordered to sweep the lane every day.');
          G.fx({ standing: -10 }); flag('letterFound');
        },
      },
      {
        goal: 'Help Grandma sweep the lane', where: 'The lane', room: 'lane', target: 'grandma',
        async run() {
          await narr('Grandma sweeps slowly, bent almost double, while neighbors walk past.');
          await say('sixfingers', 'Sweep harder, landlord woman!');
          const c = await choose([
            { t: 'Take the other broom and sweep beside her', hint: 'Everyone will see.' },
            { t: 'Watch from the doorway', hint: 'There\'s nothing you can do... is there?' },
            { t: 'Bring her water and a stool', hint: 'Let her rest a moment.' },
          ]);
          if (c === 0) { await narr('You sweep beside her, side by side. Some neighbors stare. Old Qian nods at you.'); G.fx({ family: 8, conscience: 5, standing: -5 }); flag('sweptWithGrandma'); }
          else if (c === 1) { await narr('You watch from the doorway. You tell yourself there\'s nothing you can do.'); G.fx({ conscience: -3 }); }
          else { await narr('You bring a cup of water and make her sit for a moment. Six-Fingers grumbles, but he walks away.'); G.fx({ family: 6, conscience: 3, standing: -2 }); }
          await say('grandma', 'Don\'t be sad, Ji-li. Sweeping is honest work. I have never been ashamed of honest work.');
        },
      },
    ],
  },

  {
    title: 'What Remains', when: 'Years later',
    intro: [
      'The Cultural Revolution lasted ten years, until 1976.',
      'With Dad away, Ji-li held the family together: cooking, cleaning, and caring for Grandma, Ji-yong, and Ji-yun.',
      'Take one last walk. Talk to the people of this story.',
    ],
    start: { room: 'home', x: 10, y: 11, dir: 'down' },
    tint: 'rgba(255,200,120,.06)',
    summary: 'Ji-li took one last walk through the places of her childhood and wrote her final journal entry.',
    cast: {
      home: [['grandma', 3, 9, 'right'], ['mom', 14, 5, 'down'], ['jiyun', 5, 11, 'up'], ['jiyong', 15, 10, 'left']],
      lane: [['anyi', 14, 6, 'left'], ['oldqian', 17, 11, 'up'], ['auntie', 12, 4, 'down'], ['sixfingers', 6, 10, 'right']],
      street: [['vendor', 26, 3, 'down']],
      schoolyard: [['zhangjie', 12, 8, 'left']],
      jhs: [['changhong', 6, 7, 'down'], ['teacherzhang', 16, 10, 'left']],
      anyi: [['teacherwei', 10, 6, 'down']],
    },
    steps: [
      {
        goal: 'Talk to Grandma', where: 'Living room', room: 'home', target: 'grandma',
        async run() {
          await say('grandma', 'You\'ve grown up so fast, Ji-li. Too fast.');
          await say('grandma', 'When you were little, you wanted to be famous. A dancer. A leader. And now look at you, holding this whole family together.');
          const c = await choose(['"I\'m not the girl I was."', '"I still want a big future."']);
          if (c === 0) await say('grandma', 'No. You\'re someone even better.');
          else await say('grandma', 'Good. Never stop wanting it. Times change. They always do.');
        },
      },
      {
        goal: 'Find An Yi in the lane', where: 'The lane', room: 'lane', target: 'anyi',
        async run() {
          if (has('promisedAnYi') || has('satWithAnYi') || has('supportedAnYi')) await say('anyi', 'You kept coming to see me, even when it was dangerous for you. I\'ll never forget that.');
          else await say('anyi', 'We drifted apart, didn\'t we? Everyone did. It was hard to be anyone\'s friend back then.');
          await say('anyi', 'Do you ever wonder who we\'d be, if none of this had happened?');
          const c = await choose(['"Every day."', '"We\'d still be us."']);
          await say('anyi', c === 0 ? 'Me too.' : 'Maybe you\'re right. Maybe we still are.');
        },
      },
      {
        goal: 'Write your final journal entry', where: 'Bedroom: your desk', room: 'home_back', target: 'desk_home',
        async run() {
          await narr('You open your journal. Years of pages. What do you want to remember most?');
          const c = await choose([
            'Family comes first, whatever the world says',
            'The truth matters, even when it\'s dangerous',
            'I still don\'t understand all of it, and that\'s okay',
          ]);
          flag('finalThought', c);
          await narr(['You write about Grandma\'s broom, Ji-yun\'s hand in yours, and Dad\'s empty chair waiting for him.', 'You write about the posters, the meetings, and the words that people were forced to say.', 'You write down your questions. Maybe one day you will find the answers.'][c]);
        },
      },
    ],
  },
];

const STORY = {
  pick,
  cast(s, roomId) {
    const ch = CHAPTERS[s.ch];
    let list = (ch.cast[roomId] || []).filter(e => !e[4] || e[4](s));
    const st = s.ended ? null : ch.steps[s.step];
    if (st && st.cast && st.cast[roomId]) {
      for (const e of st.cast[roomId]) { list = list.filter(x => x[0] !== e[0]); list.push(e); }
    }
    return list;
  },
  npcLines(id, s) {
    const lines = pick(TALK[id], s);
    if (lines) return lines;
    return [[null, `${NPCS[id].name} doesn't seem to want to talk right now.`]];
  },
  schoolBoard(s) {
    const base = pick({
      0: 'The school noticeboard: the lunch menu, the class rankings (your name is at the top), and a poem by Zhang Jie.',
      1: 'Big-character posters cover the board, layer on layer. Many attack teachers by name.',
      2: 'The posters are torn and fading. School has been closed for months.',
      6: 'The noticeboard is empty, except for a timetable. Classes, at last.',
    }, s);
    const mine = s.posters.find(p => p.published);
    if (!mine || s.ch < 1) return base;
    return [base, `Your own poster is still here: "${mine.title}"`, mine.text.length > 220 ? mine.text.slice(0, 220) + '...' : mine.text];
  },
  ending(s) {
    const f = s.flags, st = s.stats;
    let id, title, lines;
    if (f.testified) {
      id = 'line'; title = 'The Line You Drew';
      lines = ['You testified against your father. Many people did. Across China, children were pushed to turn against their own parents.',
        'It kept you safe for a while. But it left a crack in your family that took years to heal.'];
    } else if (st.family >= 65 && st.conscience >= 60) {
      id = 'scarf'; title = 'Red Scarf, Steady Heart';
      lines = ['You lost your place at school, your family\'s things, and your good name. But you never turned your back on the people you loved.',
        'The red scarf is long gone. What it once meant to you, being good and brave and loyal, you kept.'];
    } else {
      id = 'storm'; title = 'Through the Storm';
      lines = ['You did not betray your father, but you made hard choices just to get through each day. Most people did.',
        'Your family survived the storm together, bruised but whole.'];
    }
    const notes = [];
    if (f.criticizedTeacher) notes.push('You once wrote a poster attacking a teacher. You have thought about it many times since.');
    if (f.refusedPoster) notes.push('You were one of the few students who refused to write a poster against a teacher.');
    if (f.savedBook) notes.push('Grandpa Hong\'s little book of fairy tales is still hidden in your desk.');
    if (f.photoSurvived) notes.push('The tiny family photo you saved from the fire is the only one left.');
    if (f.promisedAnYi || f.supportedAnYi) notes.push('You kept your friendship with An Yi when it was dangerous.');
    if (f.sweptWithGrandma) notes.push('You swept the lane beside Grandma while the whole lane watched.');
    if (f.toreposter) notes.push('You tore down a poster with your father\'s name on it.');
    return { id, title, lines: lines.concat(notes) };
  },
  history: [
    'The real Jiang Ji-li refused to denounce her father, even though it cost her a place she had worked hard for.',
    'Her father was eventually released, and in 1980 he was officially cleared. Ji-li became a teacher, and in 1984 she moved to the United States, where most of her family later joined her.',
    'In 1997 she published her memoir, "Red Scarf Girl," so that young readers would understand what happened.',
    'This game is a simplified, fictionalized adaptation. The dialogue is invented and some events are combined or reordered. Read the book for the real story.',
  ],
};
