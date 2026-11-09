import type { Locale } from "@/lib/i18n/dictionary";

type Localized = Record<Locale, string>;

export type BlogBlock =
  | string
  | { heading: string }
  | { lead: string }
  | { before?: string; strong: string; text?: string }
  | { note: string };

export type BlogPost = {
  slug: string;
  date: string;
  image: string;
  title: Localized;
  excerpt: Localized;
  body: Record<Locale, BlogBlock[]>;
  planTripActions?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "bus-trip-planning",
    date: "2026-11-09",
    image: "/hero/luxembourg.jpg",
    planTripActions: true,
    title: {
      lv: "Ceļojums ar autobusu – kā saplānot visu bez lieka stresa?",
      en: "Travelling by coach: how to plan it all without the stress",
    },
    excerpt: {
      lv: "Labākie ceļojumi sākas ar labu plānu, bet neaizmirstamākie mirkļi rodas pa ceļam!",
      en: "The best trips start with a good plan, and the most memorable moments happen along the way!",
    },
    body: {
      lv: [
        { lead: "Labākie ceļojumi sākas ar labu plānu, bet neaizmirstamākie mirkļi rodas pa ceļam!" },
        "Vai plāno ģimenes izbraucienu, draugu piedzīvojumu vai kolektīva ekskursiju? Ceļojums ar autobusu ir lielisks veids, kā kopā atklāt jaunas vietas, baudīt ainavas un pavadīt laiku bez raizēm par braukšanu.",
        "Lūk, daži vienkārši padomi, kas palīdzēs ceļojumu padarīt patīkamu jau no pirmā kilometra!",
        { heading: "1. Izvēlies galamērķi, kas iedvesmo" },
        "Varbūt tās ir gleznainās Polijas kalnu ainavas, Berlīnes rosīgās ielas vai romantiska nedēļas nogale Parīzē? Izvēlies vietu, kas aizrauj visu ceļotāju kompāniju. Atceries – arī pieturas pa ceļam var kļūt par lieliskiem piedzīvojumiem!",
        { heading: "2. Plāno maršrutu, bet atstāj vietu spontanitātei" },
        "Labs maršruts nav pārpildīts grafiks. Ieplāno pietiekami daudz laika apskates objektiem, maltītēm un atpūtai. Labāk izbaudīt trīs skaistas vietas nekā steigā apskatīt desmit.",
        { heading: "3. Komforts ir svarīgāks, nekā šķiet" },
        "Ērti sēdekļi, pietiekami daudz vietas bagāžai un piemērots autobuss ceļotāju skaitam var būtiski mainīt ceļojuma pieredzi. Izvēloties autobusu ar šoferi, visa kompānija var atpūsties, sarunāties un baudīt ceļu.",
        { heading: "4. Vienojieties par izmaksām jau sākumā" },
        "Noskaidro transporta, naktsmītņu, ēdināšanas un apskates vietu izmaksas. Ja ceļojat grupā, kopīgs autobuss var būt gan ērts, gan ekonomiski izdevīgs risinājums.",
        { heading: "5. Ļauj ceļojumam sākties jau autobusā!" },
        "Mīļākā mūzika, sarunas, kopīgi smiekli un ainavas aiz loga – arī pats brauciens ir daļa no piedzīvojuma. Un tieši šie mazie mirkļi nereti paliek atmiņā visilgāk.",
        { heading: "Gatavs nākamajam piedzīvojumam?" },
        {
          strong: "Tev nav jāzina katrs maršruta pagrieziens, lai sāktu plānot lielisku ceļojumu.",
          text: "Pietiek ar ideju, labu kompāniju un piemērotu transportu.",
        },
        "Izvēlies savu galamērķi, sapulcē ceļabiedrus un uztici braucienu profesionāļiem.",
        { strong: "Tavs nākamais piedzīvojums ir tikai viena brauciena attālumā!" },
        { note: "Plāno ceļojumu ar mums – palīdzēsim izvēlēties piemērotāko autobusu Tavam maršrutam un ceļotāju skaitam." },
      ],
      en: [
        { lead: "The best trips start with a good plan, and the most memorable moments happen along the way!" },
        "Planning a family outing, an adventure with friends, or a team excursion? Travelling by coach is a great way to discover new places together, take in the scenery, and spend time without worrying about the driving.",
        "Here are a few simple tips to make the trip enjoyable from the very first kilometre!",
        { heading: "1. Choose a destination that inspires" },
        "Maybe it is the mountain scenery of Poland, the busy streets of Berlin, or a romantic weekend in Paris? Pick a place that excites the whole group. Remember, the stops along the way can become great adventures too!",
        { heading: "2. Plan the route, and leave room for spontaneity" },
        "A good route is not a packed schedule. Allow enough time for sights, meals, and rest. Better to enjoy three beautiful places than rush through ten.",
        { heading: "3. Comfort matters more than you think" },
        "Comfortable seats, plenty of luggage space, and a coach that fits the group can change the whole experience. With a coach and driver, everyone can relax, talk, and enjoy the road.",
        { heading: "4. Agree on costs from the start" },
        "Find out the costs of transport, accommodation, meals, and sights. When travelling as a group, a shared coach can be both comfortable and good value.",
        { heading: "5. Let the trip begin on the coach!" },
        "Favourite music, conversation, shared laughter, and the view from the window: the ride itself is part of the adventure. And these small moments are often the ones remembered longest.",
        { heading: "Ready for your next adventure?" },
        {
          strong: "You do not need to know every turn of the route to start planning a great trip.",
          text: "An idea, good company, and the right transport are enough.",
        },
        "Choose your destination, gather your travel companions, and leave the driving to the professionals.",
        { strong: "Your next adventure is just one ride away!" },
        { note: "Plan your trip with us, and we will help you choose the right coach for your route and group size." },
      ],
    },
  },
  {
    slug: "night-airport-transfers",
    date: "2026-10-14",
    image: "/hero/airport.jpg",
    title: {
      lv: "Transfērs uz lidostu bez stresa – ceļojums sākas jau pie mājas durvīm!",
      en: "Stress-free airport transfers: your trip starts at your front door",
    },
    excerpt: {
      lv: "Agrs rīta lidojums vai vēla atgriešanās? Ar iepriekš rezervētu lidostas transfēru Tev nav jāuztraucas par transportu.",
      en: "An early morning flight or a late return? With a pre-booked airport transfer, transport is taken care of.",
    },
    body: {
      lv: [
        {
          lead: "Agrs rīta lidojums vai vēla atgriešanās? Ar iepriekš rezervētu lidostas transfēru Tev nav jāuztraucas par transportu – neatkarīgi no izlidošanas vai ielidošanas laika.",
        },
        "Ceļojuma plānošana ir aizraujoša, taču nokļūšana lidostā un atgriešanās mājās nereti sagādā liekas rūpes. Kur novietot automašīnu? Vai taksometrs būs pieejams četros no rīta? Kā nogādāt visu grupu kopā ar bagāžu?",
        { before: "Labs risinājums ir", strong: "iepriekš rezervēts lidostas transfērs ar profesionālu šoferi." },
        { heading: "Agrs rīts vai vēls vakars? Nekādu problēmu!" },
        "Lidojumi ne vienmēr notiek ērtā laikā. Dažkārt lidostā jāierodas vēl pirms saullēkta, bet citreiz mājupceļš sākas krietni pēc pusnakts.",
        "Rezervējot privātu transfēru, brauciena laiks tiek pielāgots Tavam lidojumam. Nav jāpielāgojas sabiedriskā transporta kustības grafikam vai jāmeklē pēdējā brīža risinājumi.",
        { heading: "Ko darīt, ja lidmašīna kavējas?" },
        "Lidojumu kavēšanās gadās, taču tai nav jāsabojā ceļojuma noslēgums.",
        "Ja transfēra pakalpojumā ir iekļauta lidojuma uzraudzība, šoferis seko aktuālajam ielidošanas laikam un pielāgo sagaidīšanu. Tas nozīmē mazāk uztraukuma un vairāk pārliecības, ka transports būs pieejams arī tad, ja plāni mainās.",
        { heading: "Ceļojat grupā? Visi kopā, bez liekas gaidīšanas!" },
        "Ģimenes ceļojums, draugu kompānija vai uzņēmuma komandējums – grupas transfērs padara pārvietošanos daudz vienkāršāku.",
        "Iedomājies: pēc garā lidojuma Tevi sagaida ērts autobuss pie termināļa norunātajā vietā. Bagāža tiek ievietota autobusā, visi iekārtojas savās vietās, un ceļš var turpināties.",
        "Nav jāmeklē vairāki taksometri, jāsadala grupa vai jādomā, kurš ieradīsies galamērķī pirmais.",
        { heading: "Vairāk laika ceļojumam, mazāk – organizēšanai" },
        "Iepriekš organizēts transfērs palīdz ietaupīt laiku gan dodoties uz lidostu, gan atgriežoties. Īpaši vērtīgi tas ir lielākām grupām, ģimenēm ar bērniem un ceļotājiem ar apjomīgu bagāžu.",
        { strong: "Tavs uzdevums ir izbaudīt ceļojumu. Par nokļūšanu galamērķī parūpēsimies mēs!" },
        { heading: "Rezervē savu lidostas transfēru jau šodien!" },
        "Neatkarīgi no tā, vai ceļo viens, ar ģimeni vai lielā grupā, piemērots transports ļauj sākt un noslēgt ceļojumu ar patīkamu sajūtu.",
        { strong: "Pastāsti mums savu lidojuma laiku, pasažieru skaitu un galamērķi – mēs palīdzēsim noorganizēt ērtu transfēru." },
        { note: "Jo labs ceļojums sākas ar mierīgu prātu!" },
      ],
      en: [
        {
          lead: "An early morning flight or a late return? With a pre-booked airport transfer, transport is taken care of, whatever your departure or arrival time.",
        },
        "Planning a trip is exciting, but getting to the airport and back home often brings extra worries. Where do you park the car? Will a taxi be available at four in the morning? How do you get the whole group there with all the luggage?",
        { before: "A good answer is a", strong: "pre-booked airport transfer with a professional driver." },
        { heading: "Early morning or late night? No problem!" },
        "Flights do not always leave at a convenient time. Sometimes you need to be at the airport before sunrise, and sometimes the journey home starts well after midnight.",
        "With a private transfer, the pick-up time is set around your flight. No need to fit around public transport timetables or look for last-minute options.",
        { heading: "What if the flight is delayed?" },
        "Delays happen, but they do not have to spoil the end of a trip.",
        "When flight tracking is part of the transfer, the driver follows the actual arrival time and adjusts the pick-up. That means less worry and more confidence that transport will be there even when plans change.",
        { heading: "Travelling as a group? Everyone together, no waiting around" },
        "A family holiday, a group of friends or a business trip: a group transfer makes getting around much simpler.",
        "Picture it: after a long flight, a comfortable coach meets you at the agreed spot by the terminal. The luggage goes in, everyone takes a seat, and the journey continues.",
        "No hunting for several taxis, splitting up the group, or wondering who will reach the destination first.",
        { heading: "More time for the trip, less for organising" },
        "A pre-arranged transfer saves time on the way to the airport and on the way back. It is especially valuable for larger groups, families with children, and travellers with plenty of luggage.",
        { strong: "Your job is to enjoy the trip. We will take care of getting you there!" },
        { heading: "Book your airport transfer today!" },
        "Whether you travel alone, with family or in a large group, the right transport lets you start and end your trip feeling good.",
        { strong: "Tell us your flight time, number of passengers and destination, and we will help arrange a comfortable transfer." },
        { note: "Because a good trip starts with peace of mind!" },
      ],
    },
  },
  {
    slug: "paris-by-coach",
    date: "2026-09-30",
    image: "/hero/paris.jpg",
    title: {
      lv: "Uz Parīzi ar autobusu: sešas dienas, divi šoferi",
      en: "Paris by coach: six days, two drivers",
    },
    excerpt: {
      lv: "Kāpēc garajiem maršrutiem plānojam divus šoferus un nakts pieturu ceļā.",
      en: "Why long routes get two drivers and a night stop on the way.",
    },
    body: {
      lv: [
        "Rīga–Parīze ir vairāk nekā divi tūkstoši kilometru katrā virzienā. Ar diviem šoferiem autobuss var braukt ilgāk, un pasažieri ierodas atpūtušies.",
        "Nakts pietura Berlīnē sadala ceļu divās mierīgās dienās. Parīzē autobuss paliek grupas rīcībā ekskursijām pa pilsētu.",
      ],
      en: [
        "Riga to Paris is more than two thousand kilometres each way. With two drivers the coach can cover longer days, and passengers arrive rested.",
        "A night stop in Berlin splits the road into two calm days. In Paris the coach stays with the group for city outings.",
      ],
    },
  },
];

export function findPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}
