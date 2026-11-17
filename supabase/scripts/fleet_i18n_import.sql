-- Fleet i18n import: paste into Supabase SQL Editor and Run once.
-- Matches by id (text). Falls back to name_lv if needed.

begin;

drop table if exists public.fleet_i18n_import;

create table public.fleet_i18n_import (
  id text primary key,
  name_lv text,
  name_en text,
  name_fr text,
  name_ru text,
  summary_lv text,
  summary_en text,
  summary_fr text,
  summary_ru text,
  interior_color_lv text,
  interior_color_en text,
  interior_color_fr text,
  interior_color_ru text,
  body_color_lv text,
  body_color_en text,
  body_color_fr text,
  body_color_ru text,
  description_lv text,
  description_en text,
  description_fr text,
  description_ru text,
  extras_lv text,
  extras_en text,
  extras_fr text,
  extras_ru text,
  closing_notes_lv text,
  closing_notes_en text,
  closing_notes_fr text,
  closing_notes_ru text
);

insert into public.fleet_i18n_import (
  id,
  name_lv, name_en, name_fr, name_ru,
  summary_lv, summary_en, summary_fr, summary_ru,
  interior_color_lv, interior_color_en, interior_color_fr, interior_color_ru,
  body_color_lv, body_color_en, body_color_fr, body_color_ru,
  description_lv, description_en, description_fr, description_ru,
  extras_lv, extras_en, extras_fr, extras_ru,
  closing_notes_lv, closing_notes_en, closing_notes_fr, closing_notes_ru
)
values
(
  $q$12$q$,
  $q$MAN Lions$q$,
  $q$MAN Lions$q$,
  $q$MAN Lions$q$,
  $q$MAN Lions$q$,
  $q$Ietilpīgs MAN Lion’s tūrisma autobuss līdz 49 pasažieriem komfortabliem grupu ceļojumiem.$q$,
  $q$Spacious MAN Lion’s touring coach for up to 49 passengers on comfortable group trips.$q$,
  $q$Autocar de tourisme MAN Lion’s spacieux jusqu’à 49 passagers pour des voyages de groupe confortables.$q$,
  $q$Вместительный туристический автобус MAN Lion’s до 49 пассажиров для комфортных групповых поездок.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$MAN Lion’s ir piemērots lielākām ceļotāju grupām, kurām svarīgs komforts un pārdomāts aprīkojums. Pusādas sēdekļi, regulējamas atzveltnes un panorāmas logi ļauj ērti baudīt ceļojumu arī garākos maršrutos.
Gaisa kondicionieris, gida mikrofons, ledusskapis un bagāžas nodalījums ir noderīgi organizētām ekskursijām un tūrisma braucieniem. Laba izvēle uzņēmumu kolektīviem, pasākumu dalībniekiem un grupu transfēriem.$q$,
  $q$MAN Lion’s is suited to larger travel groups that need comfort and well-planned equipment. Semi-leather seats, adjustable backrests and panoramic windows make longer routes pleasant.
Air conditioning, a guide microphone, a fridge and a luggage compartment are useful for organised excursions and tourist trips. A good choice for company teams, event guests and group transfers.$q$,
  $q$Le MAN Lion’s convient aux plus grands groupes de voyageurs qui recherchent le confort et un équipement bien pensé. Sièges semi-cuir, dossiers réglables et fenêtres panoramiques rendent les longs trajets agréables.
Climatisation, micro guide, réfrigérateur et soute à bagages sont utiles pour les excursions organisées et les voyages touristiques. Un bon choix pour les collectifs d’entreprise, les participants à des événements et les transferts de groupe.$q$,
  $q$MAN Lion’s подходит для больших групп путешественников, которым важны комфорт и продуманное оснащение. Полукожаные сиденья, регулируемые спинки и панорамные окна позволяют удобно путешествовать и на длинных маршрутах.
Кондиционер, микрофон гида, холодильник и багажное отделение полезны для организованных экскурсий и туристических поездок. Хороший выбор для коллективов компаний, участников мероприятий и групповых трансферов.$q$,
  $q$Gaisa kondicionieris
Pusādas sēdekļi
LED apgaismojums
Radio
Jumta lūka
DVD
Gida mikrofons
Ledusskapis
Regulējami pasažieru sēdekļi
Roku balsti
Salokāmi galdiņi
Individuālais apgaismojums
Salona apkure
Panorāmas logi
USB uzlādes pieslēgvietas
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Semi-leather seats
LED lighting
Radio
Roof hatch
DVD
Guide microphone
Fridge
Adjustable passenger seats
Armrests
Folding tables
Individual lighting
Cabin heating
Panoramic windows
USB charging ports
Large luggage compartment$q$,
  $q$Climatisation
Sièges semi-cuir
Éclairage LED
Radio
Trappe de toit
DVD
Micro guide
Réfrigérateur
Sièges passagers réglables
Accoudoirs
Tables rabattables
Éclairage individuel
Chauffage de l’habitacle
Fenêtres panoramiques
Ports de charge USB
Grande soute à bagages$q$,
  $q$Кондиционер
Полукожаные сиденья
LED-освещение
Радио
Люк в крыше
DVD
Микрофон гида
Холодильник
Регулируемые пассажирские сиденья
Подлокотники
Складные столики
Индивидуальное освещение
Отопление салона
Панорамные окна
USB-разъёмы для зарядки
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$2$q$,
  $q$SCANIA Touring$q$,
  $q$SCANIA Touring$q$,
  $q$SCANIA Touring$q$,
  $q$SCANIA Touring$q$,
  $q$Komfortabls 49 pasažieru tūrisma autobuss grupu ekskursijām, izbraucieniem un tālākiem ceļojumiem.$q$,
  $q$Comfortable 49-passenger touring coach for group excursions, outings and longer journeys.$q$,
  $q$Autocar de tourisme confortable de 49 places pour excursions de groupe, sorties et voyages plus longs.$q$,
  $q$Комфортабельный туристический автобус на 49 пассажиров для групповых экскурсий, выездов и дальних поездок.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$SCANIA Touring ir ietilpīgs tūrisma autobuss, kas piemērots lielāku grupu pārvadājumiem Latvijā un ārvalstīs. Regulējami sēdekļi, panorāmas logi un plašs bagāžas nodalījums palīdz nodrošināt patīkamu braucienu gan īsākos, gan garākos maršrutos.
Gaisa kondicionieris, individuālais apgaismojums, gida mikrofons un citas salona ērtības padara to par praktisku izvēli organizētām ekskursijām, kolektīvu braucieniem un grupu transfēriem.$q$,
  $q$SCANIA Touring is a spacious touring coach for larger group transport in Latvia and abroad. Adjustable seats, panoramic windows and a large luggage compartment help make both short and long routes pleasant.
Air conditioning, individual lighting, a guide microphone and other cabin amenities make it a practical choice for organised excursions, company trips and group transfers.$q$,
  $q$Le SCANIA Touring est un autocar de tourisme spacieux pour le transport de grands groupes en Lettonie et à l’étranger. Sièges réglables, fenêtres panoramiques et grande soute à bagages rendent agréables les trajets courts comme les plus longs.
Climatisation, éclairage individuel, micro guide et autres équipements de bord en font un choix pratique pour les excursions organisées, les sorties d’entreprise et les transferts de groupe.$q$,
  $q$SCANIA Touring — вместительный туристический автобус для перевозки больших групп в Латвии и за рубежом. Регулируемые сиденья, панорамные окна и просторное багажное отделение помогают обеспечить приятную поездку на коротких и длинных маршрутах.
Кондиционер, индивидуальное освещение, микрофон гида и другие удобства салона делают его практичным выбором для организованных экскурсий, корпоративных поездок и групповых трансферов.$q$,
  $q$Gaisa kondicionieris
LED apgaismojums
Radio
Jumta lūka
DVD
Gida mikrofons
Ledusskapis
Regulējami pasažieru sēdekļi
Roku balsti
Salokāmi galdiņi
Individuālais apgaismojums
Salona apkure
Panorāmas logi
USB uzlādes pieslēgvietas
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
LED lighting
Radio
Roof hatch
DVD
Guide microphone
Fridge
Adjustable passenger seats
Armrests
Folding tables
Individual lighting
Cabin heating
Panoramic windows
USB charging ports
Large luggage compartment$q$,
  $q$Climatisation
Éclairage LED
Radio
Trappe de toit
DVD
Micro guide
Réfrigérateur
Sièges passagers réglables
Accoudoirs
Tables rabattables
Éclairage individuel
Chauffage de l’habitacle
Fenêtres panoramiques
Ports de charge USB
Grande soute à bagages$q$,
  $q$Кондиционер
LED-освещение
Радио
Люк в крыше
DVD
Микрофон гида
Холодильник
Регулируемые пассажирские сиденья
Подлокотники
Складные столики
Индивидуальное освещение
Отопление салона
Панорамные окна
USB-разъёмы для зарядки
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$9$q$,
  $q$Mercedes Benz S class$q$,
  $q$Mercedes-Benz S-Class$q$,
  $q$Mercedes-Benz Classe S$q$,
  $q$Mercedes-Benz S-Class$q$,
  $q$Mercedes-Benz S-Class luksusa sedans reprezentabliem biznesa braucieniem un VIP transfēriem.$q$,
  $q$Mercedes-Benz S-Class luxury sedan for prestigious business travel and VIP transfers.$q$,
  $q$Berline de luxe Mercedes-Benz Classe S pour trajets d’affaires représentatifs et transferts VIP.$q$,
  $q$Люксовый седан Mercedes-Benz S-Class для представительских деловых поездок и VIP-трансферов.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz S-Class ir elegants sedans klientiem, kuri novērtē privātumu, komfortu un reprezentablu transportu. Ādas sēdekļi, individuālais apgaismojums un pārdomāts salona iekārtojums rada patīkamu vidi brauciena laikā.
Gaisa kondicionieris, apsildāmi sēdekļi un USB uzlādes pieslēgvietas papildina ikdienas ērtības. Piemērots biznesa tikšanām, lidostas transfēriem un īpašu pasākumu viesu pārvadājumiem.$q$,
  $q$The Mercedes-Benz S-Class is an elegant sedan for clients who value privacy, comfort and prestigious transport. Leather seats, individual lighting and a thoughtfully arranged cabin create a pleasant environment on the road.
Air conditioning, heated seats and USB charging ports add everyday convenience. Suitable for business meetings, airport transfers and transporting guests to special events.$q$,
  $q$La Mercedes-Benz Classe S est une berline élégante pour les clients qui apprécient l’intimité, le confort et un transport représentatif. Sièges en cuir, éclairage individuel et habitacle soigné créent un cadre agréable pendant le trajet.
Climatisation, sièges chauffants et ports de charge USB complètent le confort au quotidien. Convient aux rendez-vous d’affaires, aux transferts aéroport et au transport d’invités pour des événements spéciaux.$q$,
  $q$Mercedes-Benz S-Class — элегантный седан для клиентов, которые ценят приватность, комфорт и представительский транспорт. Кожаные сиденья, индивидуальное освещение и продуманный салон создают приятную атмосферу в поездке.
Кондиционер, подогрев сидений и USB-разъёмы дополняют повседневный комфорт. Подходит для деловых встреч, аэропортовых трансферов и перевозки гостей на особые мероприятия.$q$,
  $q$Gaisa kondicionieris
Apsildāmi sēdekļi
Ādas sēdekļi
LED apgaismojums
Radio
Jumta lūka
Regulējami pasažieru sēdekļi
Roku balsti
Individuālais apgaismojums
USB uzlādes pieslēgvietas$q$,
  $q$Air conditioning
Heated seats
Leather seats
LED lighting
Radio
Roof hatch
Adjustable passenger seats
Armrests
Individual lighting
USB charging ports$q$,
  $q$Climatisation
Sièges chauffants
Sièges en cuir
Éclairage LED
Radio
Trappe de toit
Sièges passagers réglables
Accoudoirs
Éclairage individuel
Ports de charge USB$q$,
  $q$Кондиционер
Подогрев сидений
Кожаные сиденья
LED-освещение
Радио
Люк в крыше
Регулируемые пассажирские сиденья
Подлокотники
Индивидуальное освещение
USB-разъёмы для зарядки$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$6$q$,
  $q$Mercedes Benz Sprinter COMFORT$q$,
  $q$Mercedes-Benz Sprinter COMFORT$q$,
  $q$Mercedes-Benz Sprinter COMFORT$q$,
  $q$Mercedes-Benz Sprinter COMFORT$q$,
  $q$Komfortabls Mercedes-Benz Sprinter mikroautobuss līdz 19 pasažieriem organizētiem grupu braucieniem.$q$,
  $q$Comfortable Mercedes-Benz Sprinter minibus for up to 19 passengers on organised group trips.$q$,
  $q$Minibus Mercedes-Benz Sprinter confortable jusqu’à 19 passagers pour trajets de groupe organisés.$q$,
  $q$Комфортабельный микроавтобус Mercedes-Benz Sprinter до 19 пассажиров для организованных групповых поездок.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz Sprinter COMFORT ir ietilpīgs mikroautobuss, kas piemērots grupu ekskursijām, transfēriem un garākiem pārbraucieniem. Ādas sēdekļi, regulējamas atzveltnes un pārdomāts salona aprīkojums palīdz nodrošināt komfortu visā maršrutā.
Gaisa kondicionieris, gida mikrofons, ledusskapis un individuālais apgaismojums ir noderīgi gan organizētiem ceļojumiem, gan uzņēmumu izbraucieniem. Praktiska izvēle grupām, kurām svarīga ietilpība un ērtības.$q$,
  $q$Mercedes-Benz Sprinter COMFORT is a spacious minibus for group excursions, transfers and longer journeys. Leather seats, adjustable backrests and well-planned cabin equipment help keep everyone comfortable along the route.
Air conditioning, a guide microphone, a fridge and individual lighting are useful for organised trips and company outings. A practical choice for groups that need capacity and comfort.$q$,
  $q$Le Mercedes-Benz Sprinter COMFORT est un minibus spacieux pour excursions de groupe, transferts et trajets plus longs. Sièges en cuir, dossiers réglables et équipement de cabine bien pensé assurent le confort sur tout le parcours.
Climatisation, micro guide, réfrigérateur et éclairage individuel sont utiles pour les voyages organisés et les sorties d’entreprise. Un choix pratique pour les groupes qui recherchent capacité et confort.$q$,
  $q$Mercedes-Benz Sprinter COMFORT — вместительный микроавтобус для групповых экскурсий, трансферов и более длинных переездов. Кожаные сиденья, регулируемые спинки и продуманное оснащение салона помогают обеспечить комфорт на всём маршруте.
Кондиционер, микрофон гида, холодильник и индивидуальное освещение полезны для организованных поездок и корпоративных выездов. Практичный выбор для групп, которым важны вместимость и удобство.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
LED apgaismojums
Radio
Jumta lūka
Gida mikrofons
Ledusskapis
Regulējami pasažieru sēdekļi
Roku balsti
Salokāmi galdiņi
Individuālais apgaismojums
Salona apkure
Panorāmas logi
USB uzlādes pieslēgvietas
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Leather seats
LED lighting
Radio
Roof hatch
Guide microphone
Fridge
Adjustable passenger seats
Armrests
Folding tables
Individual lighting
Cabin heating
Panoramic windows
USB charging ports
Large luggage compartment$q$,
  $q$Climatisation
Sièges en cuir
Éclairage LED
Radio
Trappe de toit
Micro guide
Réfrigérateur
Sièges passagers réglables
Accoudoirs
Tables rabattables
Éclairage individuel
Chauffage de l’habitacle
Fenêtres panoramiques
Ports de charge USB
Grande soute à bagages$q$,
  $q$Кондиционер
Кожаные сиденья
LED-освещение
Радио
Люк в крыше
Микрофон гида
Холодильник
Регулируемые пассажирские сиденья
Подлокотники
Складные столики
Индивидуальное освещение
Отопление салона
Панорамные окна
USB-разъёмы для зарядки
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$4$q$,
  $q$Mercedes Benz Sprinter LUX$q$,
  $q$Mercedes-Benz Sprinter LUX$q$,
  $q$Mercedes-Benz Sprinter LUX$q$,
  $q$Mercedes-Benz Sprinter LUX$q$,
  $q$Izsmalcināts 8 pasažieru mikroautobuss privātiem transfēriem, biznesa braucieniem un nelielām grupām.$q$,
  $q$Refined 8-passenger minibus for private transfers, business travel and small groups.$q$,
  $q$Minibus raffiné de 8 places pour transferts privés, trajets d’affaires et petits groupes.$q$,
  $q$Изысканный микроавтобус на 8 пассажиров для частных трансферов, деловых поездок и небольших групп.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz Sprinter LUX ir piemērots ceļotājiem, kuri vēlas vairāk privātuma un komforta. Ādas sēdekļi, salona galds un pārdomāts sēdvietu izkārtojums veido patīkamu vidi nelielas grupas braucienam.
Gaisa kondicionieris, individuālais apgaismojums un USB uzlādes pieslēgvietas palīdz ērti pavadīt laiku ceļā. Laba izvēle lidostas transfēriem, biznesa tikšanām un individuāli plānotiem maršrutiem.$q$,
  $q$Mercedes-Benz Sprinter LUX is ideal for travellers who want more privacy and comfort. Leather seats, a cabin table and a thoughtful seating layout create a pleasant space for a small group.
Air conditioning, individual lighting and USB charging ports help make time on the road easier. A good choice for airport transfers, business meetings and individually planned routes.$q$,
  $q$Le Mercedes-Benz Sprinter LUX convient aux voyageurs qui souhaitent plus d’intimité et de confort. Sièges en cuir, table de salon et disposition soignée des places créent un cadre agréable pour un petit groupe.
Climatisation, éclairage individuel et ports de charge USB facilitent le temps passé en route. Un bon choix pour les transferts aéroport, les rendez-vous d’affaires et les itinéraires sur mesure.$q$,
  $q$Mercedes-Benz Sprinter LUX подходит путешественникам, которым нужно больше приватности и комфорта. Кожаные сиденья, салонный стол и продуманная рассадка создают приятную атмосферу для небольшой группы.
Кондиционер, индивидуальное освещение и USB-разъёмы помогают комфортно провести время в пути. Хороший выбор для аэропортовых трансферов, деловых встреч и индивидуально спланированных маршрутов.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
LED apgaismojums
Radio
Jumta lūka
Regulējami pasažieru sēdekļi
Roku balsti
Salokāms galds
Individuālais apgaismojums
Salona apkure
USB uzlādes pieslēgvietas
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Leather seats
LED lighting
Radio
Roof hatch
Adjustable passenger seats
Armrests
Folding table
Individual lighting
Cabin heating
USB charging ports
Large luggage compartment$q$,
  $q$Climatisation
Sièges en cuir
Éclairage LED
Radio
Trappe de toit
Sièges passagers réglables
Accoudoirs
Table rabattable
Éclairage individuel
Chauffage de l’habitacle
Ports de charge USB
Grande soute à bagages$q$,
  $q$Кондиционер
Кожаные сиденья
LED-освещение
Радио
Люк в крыше
Регулируемые пассажирские сиденья
Подлокотники
Складной стол
Индивидуальное освещение
Отопление салона
USB-разъёмы для зарядки
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$14$q$,
  $q$Mercedes Benz Sprinter LUX - 1$q$,
  $q$Mercedes-Benz Sprinter LUX - 1$q$,
  $q$Mercedes-Benz Sprinter LUX - 1$q$,
  $q$Mercedes-Benz Sprinter LUX - 1$q$,
  $q$Elegants Mercedes-Benz Sprinter LUX mikroautobuss līdz 16 pasažieriem ekskursijām un premium transfēriem.$q$,
  $q$Elegant Mercedes-Benz Sprinter LUX minibus for up to 16 passengers on excursions and premium transfers.$q$,
  $q$Élégant minibus Mercedes-Benz Sprinter LUX jusqu’à 16 passagers pour excursions et transferts premium.$q$,
  $q$Элегантный микроавтобус Mercedes-Benz Sprinter LUX до 16 пассажиров для экскурсий и премиум-трансферов.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz Sprinter LUX ir komfortabls mikroautobuss nelielām grupām, kas vēlas ceļot ērtā un pārdomāti aprīkotā salonā. Ādas sēdekļi, regulējamas atzveltnes un panorāmas logi rada patīkamu vidi dažāda garuma maršrutos.
Gaisa kondicionieris, gida mikrofons, ledusskapis un USB uzlādes pieslēgvietas papildina brauciena ērtības. Piemērots privātām ekskursijām, uzņēmumu izbraucieniem un grupu transfēriem.$q$,
  $q$Mercedes-Benz Sprinter LUX is a comfortable minibus for small groups that want to travel in a well-equipped cabin. Leather seats, adjustable backrests and panoramic windows create a pleasant setting on routes of any length.
Air conditioning, a guide microphone, a fridge and USB charging ports add convenience on the road. Suitable for private excursions, company outings and group transfers.$q$,
  $q$Le Mercedes-Benz Sprinter LUX est un minibus confortable pour les petits groupes qui souhaitent voyager dans un habitacle bien équipé. Sièges en cuir, dossiers réglables et fenêtres panoramiques créent un cadre agréable sur des trajets de toute durée.
Climatisation, micro guide, réfrigérateur et ports de charge USB ajoutent du confort en route. Convient aux excursions privées, aux sorties d’entreprise et aux transferts de groupe.$q$,
  $q$Mercedes-Benz Sprinter LUX — комфортабельный микроавтобус для небольших групп, которые хотят путешествовать в продуманно оснащённом салоне. Кожаные сиденья, регулируемые спинки и панорамные окна создают приятную атмосферу на маршрутах разной протяжённости.
Кондиционер, микрофон гида, холодильник и USB-разъёмы дополняют удобства в пути. Подходит для частных экскурсий, корпоративных выездов и групповых трансферов.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
LED apgaismojums
Radio
Jumta lūka
Gida mikrofons
Ledusskapis
Regulējami pasažieru sēdekļi
Roku balsti
Salokāmi galdiņi
Individuālais apgaismojums
Salona apkure
Panorāmas logi
USB uzlādes pieslēgvietas
Elegants salona galds
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Leather seats
LED lighting
Radio
Roof hatch
Guide microphone
Fridge
Adjustable passenger seats
Armrests
Folding tables
Individual lighting
Cabin heating
Panoramic windows
USB charging ports
Elegant cabin table
Large luggage compartment$q$,
  $q$Climatisation
Sièges en cuir
Éclairage LED
Radio
Trappe de toit
Micro guide
Réfrigérateur
Sièges passagers réglables
Accoudoirs
Tables rabattables
Éclairage individuel
Chauffage de l’habitacle
Fenêtres panoramiques
Ports de charge USB
Élégante table de salon
Grande soute à bagages$q$,
  $q$Кондиционер
Кожаные сиденья
LED-освещение
Радио
Люк в крыше
Микрофон гида
Холодильник
Регулируемые пассажирские сиденья
Подлокотники
Складные столики
Индивидуальное освещение
Отопление салона
Панорамные окна
USB-разъёмы для зарядки
Элегантный салонный стол
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$3$q$,
  $q$Mercedes Benz Sprinter LUX - 2$q$,
  $q$Mercedes-Benz Sprinter LUX - 2$q$,
  $q$Mercedes-Benz Sprinter LUX - 2$q$,
  $q$Mercedes-Benz Sprinter LUX - 2$q$,
  $q$Elegants premium klases mikroautobuss līdz 16 pasažieriem ar ērtu salonu privātiem un biznesa braucieniem.$q$,
  $q$Elegant premium minibus for up to 16 passengers with a comfortable cabin for private and business travel.$q$,
  $q$Élégant minibus premium jusqu’à 16 passagers avec un habitacle confortable pour trajets privés et d’affaires.$q$,
  $q$Элегантный премиум-микроавтобус до 16 пассажиров с комфортным салоном для частных и деловых поездок.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz Sprinter LUX apvieno reprezentablu interjeru ar ērtībām, kas piemērotas nelielu grupu ceļojumiem. Ādas sēdekļi, individuāli regulējamas sēdvietas un pārdomāts salona izkārtojums rada patīkamu vidi arī ilgākos pārbraucienos.
Gaisa kondicionieris, ledusskapis un USB uzlādes iespējas papildina komfortu ceļā. Mikroautobuss ir piemērots biznesa transfēriem, privātām ekskursijām un īpašu pasākumu viesu pārvadājumiem.$q$,
  $q$Mercedes-Benz Sprinter LUX combines a prestigious interior with amenities suited to small-group travel. Leather seats, individually adjustable places and a thoughtful cabin layout create a pleasant space even on longer journeys.
Air conditioning, a fridge and USB charging options add comfort on the road. The minibus suits business transfers, private excursions and guest transport for special events.$q$,
  $q$Le Mercedes-Benz Sprinter LUX associe un intérieur représentatif à des équipements adaptés aux petits groupes. Sièges en cuir, places réglables individuellement et disposition soignée de l’habitacle créent un cadre agréable même sur les longs trajets.
Climatisation, réfrigérateur et options de charge USB ajoutent du confort en route. Le minibus convient aux transferts d’affaires, aux excursions privées et au transport d’invités pour des événements spéciaux.$q$,
  $q$Mercedes-Benz Sprinter LUX сочетает представительский интерьер с удобствами для небольших групп. Кожаные сиденья, индивидуально регулируемые места и продуманная планировка салона создают приятную атмосферу даже в длительных поездках.
Кондиционер, холодильник и USB-зарядка дополняют комфорт в пути. Микроавтобус подходит для деловых трансферов, частных экскурсий и перевозки гостей на особые мероприятия.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
LED apgaismojums
Radio
Jumta lūka
Gida mikrofons
Ledusskapis
Individuāli regulējami pasažieru sēdekļi, tostarp 3 sēdvietas pretēji braukšanas virzienam
Roku balsti
Salokāmi galdiņi
Individuālais apgaismojums
Salona apkure
Panorāmas logi
USB uzlādes pieslēgvietas
Elegants salona galds
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Leather seats
LED lighting
Radio
Roof hatch
Guide microphone
Fridge
Individually adjustable passenger seats, including 3 facing opposite the direction of travel
Armrests
Folding tables
Individual lighting
Cabin heating
Panoramic windows
USB charging ports
Elegant cabin table
Large luggage compartment$q$,
  $q$Climatisation
Sièges en cuir
Éclairage LED
Radio
Trappe de toit
Micro guide
Réfrigérateur
Sièges passagers réglables individuellement, dont 3 places face à la route inverse
Accoudoirs
Tables rabattables
Éclairage individuel
Chauffage de l’habitacle
Fenêtres panoramiques
Ports de charge USB
Élégante table de salon
Grande soute à bagages$q$,
  $q$Кондиционер
Кожаные сиденья
LED-освещение
Радио
Люк в крыше
Микрофон гида
Холодильник
Индивидуально регулируемые пассажирские сиденья, в том числе 3 места против направления движения
Подлокотники
Складные столики
Индивидуальное освещение
Отопление салона
Панорамные окна
USB-разъёмы для зарядки
Элегантный салонный стол
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$1$q$,
  $q$Mercedes Benz Sprinter LUX - 3$q$,
  $q$Mercedes-Benz Sprinter LUX - 3$q$,
  $q$Mercedes-Benz Sprinter LUX - 3$q$,
  $q$Mercedes-Benz Sprinter LUX - 3$q$,
  $q$Premium klases mikroautobuss līdz 16 pasažieriem, piemērots biznesa braucieniem, ekskursijām un komfortabliem transfēriem.$q$,
  $q$Premium minibus for up to 16 passengers, suited to business travel, excursions and comfortable transfers.$q$,
  $q$Minibus premium jusqu’à 16 passagers, adapté aux trajets d’affaires, aux excursions et aux transferts confortables.$q$,
  $q$Премиум-микроавтобус до 16 пассажиров для деловых поездок, экскурсий и комфортных трансферов.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz Sprinter LUX piedāvā elegantu un pārdomātu vidi nelielu grupu ceļojumiem. Plašais salons ar ādas sēdekļiem, individuāli regulējamām sēdvietām un panorāmas logiem ļauj ērti pavadīt laiku arī garākos maršrutos.
Gaisa kondicionieris, USB uzlādes pieslēgvietas, ledusskapis un salona galds papildina brauciena komfortu. Piemērots privātām ekskursijām, uzņēmumu braucieniem un premium klases transfēriem.$q$,
  $q$Mercedes-Benz Sprinter LUX offers an elegant, well-planned environment for small-group travel. The spacious cabin with leather seats, individually adjustable places and panoramic windows makes longer routes comfortable too.
Air conditioning, USB charging ports, a fridge and a cabin table add comfort on the journey. Suitable for private excursions, company trips and premium transfers.$q$,
  $q$Le Mercedes-Benz Sprinter LUX offre un cadre élégant et bien pensé pour les voyages en petit groupe. L’habitacle spacieux avec sièges en cuir, places réglables individuellement et fenêtres panoramiques rend aussi les longs trajets confortables.
Climatisation, ports de charge USB, réfrigérateur et table de salon ajoutent du confort en voyage. Convient aux excursions privées, aux trajets d’entreprise et aux transferts premium.$q$,
  $q$Mercedes-Benz Sprinter LUX предлагает элегантную и продуманную среду для небольших групп. Просторный салон с кожаными сиденьями, индивидуально регулируемыми местами и панорамными окнами позволяет комфортно проводить время и на длинных маршрутах.
Кондиционер, USB-разъёмы, холодильник и салонный стол дополняют комфорт в поездке. Подходит для частных экскурсий, корпоративных поездок и премиум-трансферов.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
LED apgaismojums
Radio
Jumta lūka
Gida mikrofons
Ledusskapis
Individuāli regulējami pasažieru sēdekļi braukšanas virzienā
Roku balsti
Salokāmi galdiņi
Individuālais apgaismojums
Salona apkure
Panorāmas logi
USB uzlādes pieslēgvietas
Elegants salona galds
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Leather seats
LED lighting
Radio
Roof hatch
Guide microphone
Fridge
Individually adjustable passenger seats facing the direction of travel
Armrests
Folding tables
Individual lighting
Cabin heating
Panoramic windows
USB charging ports
Elegant cabin table
Large luggage compartment$q$,
  $q$Climatisation
Sièges en cuir
Éclairage LED
Radio
Trappe de toit
Micro guide
Réfrigérateur
Sièges passagers réglables individuellement dans le sens de la marche
Accoudoirs
Tables rabattables
Éclairage individuel
Chauffage de l’habitacle
Fenêtres panoramiques
Ports de charge USB
Élégante table de salon
Grande soute à bagages$q$,
  $q$Кондиционер
Кожаные сиденья
LED-освещение
Радио
Люк в крыше
Микрофон гида
Холодильник
Индивидуально регулируемые пассажирские сиденья по ходу движения
Подлокотники
Складные столики
Индивидуальное освещение
Отопление салона
Панорамные окна
USB-разъёмы для зарядки
Элегантный салонный стол
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$5$q$,
  $q$Mercedes Benz Sprinter LUX - 4$q$,
  $q$Mercedes-Benz Sprinter LUX - 4$q$,
  $q$Mercedes-Benz Sprinter LUX - 4$q$,
  $q$Mercedes-Benz Sprinter LUX - 4$q$,
  $q$Premium klases mikroautobuss līdz 16 pasažieriem komfortabliem transfēriem un grupu ceļojumiem.$q$,
  $q$Premium minibus for up to 16 passengers for comfortable transfers and group travel.$q$,
  $q$Minibus premium jusqu’à 16 passagers pour transferts confortables et voyages de groupe.$q$,
  $q$Премиум-микроавтобус до 16 пассажиров для комфортных трансферов и групповых поездок.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz Sprinter LUX piedāvā plašu salonu un elegantu interjeru, kas piemērots gan biznesa klientiem, gan privātām ceļotāju grupām. Ādas sēdekļi un individuāli regulējamas sēdvietas palīdz nodrošināt ērtu braucienu dažāda garuma maršrutos.
Salona aprīkojums, tostarp gaisa kondicionieris, ledusskapis un USB uzlādes pieslēgvietas, padara ceļošanu patīkamāku. Piemērots ekskursijām, korporatīviem braucieniem un premium transfēriem.$q$,
  $q$Mercedes-Benz Sprinter LUX offers a spacious cabin and elegant interior suited to both business clients and private travel groups. Leather seats and individually adjustable places help ensure a comfortable ride on routes of any length.
Cabin equipment including air conditioning, a fridge and USB charging ports makes travel more pleasant. Suitable for excursions, corporate trips and premium transfers.$q$,
  $q$Le Mercedes-Benz Sprinter LUX offre un habitacle spacieux et un intérieur élégant, adaptés aux clients d’affaires comme aux groupes privés. Sièges en cuir et places réglables individuellement assurent un trajet confortable sur des parcours de toute durée.
L’équipement de bord, dont climatisation, réfrigérateur et ports de charge USB, rend le voyage plus agréable. Convient aux excursions, trajets d’entreprise et transferts premium.$q$,
  $q$Mercedes-Benz Sprinter LUX предлагает просторный салон и элегантный интерьер для бизнес-клиентов и частных групп. Кожаные сиденья и индивидуально регулируемые места помогают обеспечить удобную поездку на маршрутах разной протяжённости.
Оснащение салона, включая кондиционер, холодильник и USB-разъёмы, делает путешествие приятнее. Подходит для экскурсий, корпоративных поездок и премиум-трансферов.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
LED apgaismojums
Radio
Jumta lūka
Gida mikrofons
Ledusskapis
Individuāli regulējami pasažieru sēdekļi, tostarp 3 sēdvietas pretēji braukšanas virzienam
Roku balsti
Salokāmi galdiņi
Individuālais apgaismojums
Salona apkure
Panorāmas logi
USB uzlādes pieslēgvietas
Elegants salona galds
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Leather seats
LED lighting
Radio
Roof hatch
Guide microphone
Fridge
Individually adjustable passenger seats, including 3 facing opposite the direction of travel
Armrests
Folding tables
Individual lighting
Cabin heating
Panoramic windows
USB charging ports
Elegant cabin table
Large luggage compartment$q$,
  $q$Climatisation
Sièges en cuir
Éclairage LED
Radio
Trappe de toit
Micro guide
Réfrigérateur
Sièges passagers réglables individuellement, dont 3 places face à la route inverse
Accoudoirs
Tables rabattables
Éclairage individuel
Chauffage de l’habitacle
Fenêtres panoramiques
Ports de charge USB
Élégante table de salon
Grande soute à bagages$q$,
  $q$Кондиционер
Кожаные сиденья
LED-освещение
Радио
Люк в крыше
Микрофон гида
Холодильник
Индивидуально регулируемые пассажирские сиденья, в том числе 3 места против направления движения
Подлокотники
Складные столики
Индивидуальное освещение
Отопление салона
Панорамные окна
USB-разъёмы для зарядки
Элегантный салонный стол
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$13$q$,
  $q$Mercedes Benz Sprinter mikroautobusa noma Denverā, Kolorādo / USA$q$,
  $q$Mercedes-Benz Sprinter minibus rental in Denver, Colorado / USA$q$,
  $q$Location de minibus Mercedes-Benz Sprinter à Denver, Colorado / USA$q$,
  $q$Аренда микроавтобуса Mercedes-Benz Sprinter в Денвере, Колорадо / США$q$,
  $q$Mercedes-Benz Sprinter mikroautobuss līdz 14 pasažieriem grupu transfēriem Denverā, ASV.$q$,
  $q$Mercedes-Benz Sprinter minibus for up to 14 passengers for group transfers in Denver, USA.$q$,
  $q$Minibus Mercedes-Benz Sprinter jusqu’à 14 passagers pour transferts de groupe à Denver, USA.$q$,
  $q$Микроавтобус Mercedes-Benz Sprinter до 14 пассажиров для групповых трансферов в Денвере, США.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz Sprinter ir ietilpīgs mikroautobuss nelielu grupu pārvadājumiem Denverā, Kolorādo. Komfortabli pasažieru sēdekļi un plašs bagāžas nodalījums padara to piemērotu gan lidostas transfēriem, gan individuāli organizētiem braucieniem.
Gaisa kondicionieris un salona aprīkojums palīdz nodrošināt patīkamu ceļošanas pieredzi. Praktiska izvēle tūristu grupām, biznesa viesiem un pasākumu dalībniekiem.$q$,
  $q$The Mercedes-Benz Sprinter is a spacious minibus for small-group transport in Denver, Colorado. Comfortable passenger seats and a large luggage compartment make it suitable for airport transfers and individually organised trips.
Air conditioning and cabin equipment help ensure a pleasant travel experience. A practical choice for tourist groups, business guests and event participants.$q$,
  $q$Le Mercedes-Benz Sprinter est un minibus spacieux pour le transport de petits groupes à Denver, Colorado. Sièges passagers confortables et grande soute à bagages le rendent adapté aux transferts aéroport et aux trajets organisés sur mesure.
Climatisation et équipement de bord aident à offrir une expérience de voyage agréable. Un choix pratique pour les groupes de touristes, les hôtes d’affaires et les participants à des événements.$q$,
  $q$Mercedes-Benz Sprinter — вместительный микроавтобус для небольших групп в Денвере, Колорадо. Удобные пассажирские сиденья и просторное багажное отделение делают его подходящим для аэропортовых трансферов и индивидуально организованных поездок.
Кондиционер и оснащение салона помогают обеспечить приятный опыт путешествия. Практичный выбор для туристических групп, бизнес-гостей и участников мероприятий.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
Salona apgaismojums
Radio un audio sistēma
Regulējami pasažieru sēdekļi
Roku balsti
Plašs bagāžas nodalījums koferiem un ceļojumu somām$q$,
  $q$Air conditioning
Leather seats
Cabin lighting
Radio and audio system
Adjustable passenger seats
Armrests
Large luggage compartment for suitcases and travel bags$q$,
  $q$Climatisation
Sièges en cuir
Éclairage de l’habitacle
Radio et système audio
Sièges passagers réglables
Accoudoirs
Grande soute à bagages pour valises et sacs de voyage$q$,
  $q$Кондиционер
Кожаные сиденья
Освещение салона
Радио и аудиосистема
Регулируемые пассажирские сиденья
Подлокотники
Просторное багажное отделение для чемоданов и дорожных сумок$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$10$q$,
  $q$Mercedes Benz Sprinter VIP$q$,
  $q$Mercedes-Benz Sprinter VIP$q$,
  $q$Mercedes-Benz Sprinter VIP$q$,
  $q$Mercedes-Benz Sprinter VIP$q$,
  $q$Premium klases Mercedes-Benz Sprinter VIP mikroautobuss līdz 19 pasažieriem grupu transfēriem un ekskursijām.$q$,
  $q$Premium Mercedes-Benz Sprinter VIP minibus for up to 19 passengers for group transfers and excursions.$q$,
  $q$Minibus premium Mercedes-Benz Sprinter VIP jusqu’à 19 passagers pour transferts de groupe et excursions.$q$,
  $q$Премиум-микроавтобус Mercedes-Benz Sprinter VIP до 19 пассажиров для групповых трансферов и экскурсий.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz Sprinter VIP piedāvā plašu salonu un komfortablu aprīkojumu organizētiem grupu braucieniem. Ādas sēdekļi, regulējamas atzveltnes un individuālais apgaismojums palīdz patīkami pavadīt laiku arī tālākos ceļojumos.
Gaisa kondicionieris, ledusskapis un gida mikrofons ir īpaši noderīgi ekskursiju grupām. Mikroautobuss piemērots korporatīviem izbraucieniem, tūrisma maršrutiem un augstāka komforta grupu transfēriem.$q$,
  $q$Mercedes-Benz Sprinter VIP offers a spacious cabin and comfortable equipment for organised group travel. Leather seats, adjustable backrests and individual lighting help make longer journeys pleasant too.
Air conditioning, a fridge and a guide microphone are especially useful for excursion groups. The minibus suits corporate outings, tourist routes and higher-comfort group transfers.$q$,
  $q$Le Mercedes-Benz Sprinter VIP offre un habitacle spacieux et un équipement confortable pour les voyages de groupe organisés. Sièges en cuir, dossiers réglables et éclairage individuel aident à rendre agréables aussi les trajets plus longs.
Climatisation, réfrigérateur et micro guide sont particulièrement utiles pour les groupes d’excursion. Le minibus convient aux sorties d’entreprise, aux circuits touristiques et aux transferts de groupe à confort élevé.$q$,
  $q$Mercedes-Benz Sprinter VIP предлагает просторный салон и комфортное оснащение для организованных групповых поездок. Кожаные сиденья, регулируемые спинки и индивидуальное освещение помогают приятно провести время и в более дальних путешествиях.
Кондиционер, холодильник и микрофон гида особенно полезны для экскурсионных групп. Микроавтобус подходит для корпоративных выездов, туристических маршрутов и групповых трансферов повышенного комфорта.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
LED apgaismojums
Radio
Jumta lūka
Gida mikrofons
Ledusskapis
Regulējami pasažieru sēdekļi
Roku balsti
Salokāmi galdiņi
Individuālais apgaismojums
Salona apkure
Panorāmas logi
USB uzlādes pieslēgvietas
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Leather seats
LED lighting
Radio
Roof hatch
Guide microphone
Fridge
Adjustable passenger seats
Armrests
Folding tables
Individual lighting
Cabin heating
Panoramic windows
USB charging ports
Large luggage compartment$q$,
  $q$Climatisation
Sièges en cuir
Éclairage LED
Radio
Trappe de toit
Micro guide
Réfrigérateur
Sièges passagers réglables
Accoudoirs
Tables rabattables
Éclairage individuel
Chauffage de l’habitacle
Fenêtres panoramiques
Ports de charge USB
Grande soute à bagages$q$,
  $q$Кондиционер
Кожаные сиденья
LED-освещение
Радио
Люк в крыше
Микрофон гида
Холодильник
Регулируемые пассажирские сиденья
Подлокотники
Складные столики
Индивидуальное освещение
Отопление салона
Панорамные окна
USB-разъёмы для зарядки
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$8$q$,
  $q$Mercedes Benz V Class$q$,
  $q$Mercedes-Benz V-Class$q$,
  $q$Mercedes-Benz Classe V$q$,
  $q$Mercedes-Benz V-Class$q$,
  $q$Elegants Mercedes-Benz V-Class minivens privātiem transfēriem un nelielu grupu braucieniem.$q$,
  $q$Elegant Mercedes-Benz V-Class minivan for private transfers and small-group travel.$q$,
  $q$Élégant monospace Mercedes-Benz Classe V pour transferts privés et trajets en petit groupe.$q$,
  $q$Элегантный минивэн Mercedes-Benz V-Class для частных трансферов и поездок небольших групп.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz V-Class apvieno komfortablu salonu ar diskrētu, reprezentablu dizainu. Ādas sēdekļi, roku balsti un salona galds veido ērtu vidi privātiem braucieniem un biznesa transfēriem.
Gaisa kondicionieris, salona apkure un USB uzlādes pieslēgvietas palīdz uzturēt komfortu dažādos gadalaikos. Piemērots lidostas transfēriem, viesu pārvadājumiem un individuāli plānotiem izbraucieniem.$q$,
  $q$The Mercedes-Benz V-Class combines a comfortable cabin with a discreet, prestigious design. Leather seats, armrests and a cabin table create a pleasant setting for private trips and business transfers.
Air conditioning, cabin heating and USB charging ports help maintain comfort in every season. Suitable for airport transfers, guest transport and individually planned outings.$q$,
  $q$La Mercedes-Benz Classe V associe un habitacle confortable à un design discret et représentatif. Sièges en cuir, accoudoirs et table de salon créent un cadre agréable pour les trajets privés et les transferts d’affaires.
Climatisation, chauffage de l’habitacle et ports de charge USB aident à maintenir le confort en toute saison. Convient aux transferts aéroport, au transport d’invités et aux sorties sur mesure.$q$,
  $q$Mercedes-Benz V-Class сочетает комфортный салон с сдержанным представительским дизайном. Кожаные сиденья, подлокотники и салонный стол создают удобную среду для частных поездок и деловых трансферов.
Кондиционер, отопление салона и USB-разъёмы помогают сохранять комфорт в любое время года. Подходит для аэропортовых трансферов, перевозки гостей и индивидуально спланированных выездов.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
Radio
Regulējami pasažieru sēdekļi
Roku balsti
Salokāms galds
Individuālais apgaismojums
Salona apkure
USB uzlādes pieslēgvietas
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Leather seats
Radio
Adjustable passenger seats
Armrests
Folding table
Individual lighting
Cabin heating
USB charging ports
Large luggage compartment$q$,
  $q$Climatisation
Sièges en cuir
Radio
Sièges passagers réglables
Accoudoirs
Table rabattable
Éclairage individuel
Chauffage de l’habitacle
Ports de charge USB
Grande soute à bagages$q$,
  $q$Кондиционер
Кожаные сиденья
Радио
Регулируемые пассажирские сиденья
Подлокотники
Складной стол
Индивидуальное освещение
Отопление салона
USB-разъёмы для зарядки
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$11$q$,
  $q$Mercedes Benz V class executive$q$,
  $q$Mercedes-Benz V-Class Executive$q$,
  $q$Mercedes-Benz Classe V Executive$q$,
  $q$Mercedes-Benz V-Class Executive$q$,
  $q$Mercedes-Benz V-Class Executive minivens komfortabliem biznesa braucieniem un privātiem transfēriem.$q$,
  $q$Mercedes-Benz V-Class Executive minivan for comfortable business travel and private transfers.$q$,
  $q$Monospace Mercedes-Benz Classe V Executive pour trajets d’affaires confortables et transferts privés.$q$,
  $q$Минивэн Mercedes-Benz V-Class Executive для комфортных деловых поездок и частных трансферов.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz V-Class Executive ir reprezentabls transportlīdzeklis nelielu grupu un biznesa klientu vajadzībām. Ādas sēdekļi, regulējamas atzveltnes un salokāmi galdiņi nodrošina ērtu vidi gan īsos, gan garākos braucienos.
Gaisa kondicionieris, LED apgaismojums un USB uzlādes pieslēgvietas papildina salona funkcionalitāti. Piemērots lidostas transfēriem, lietišķām tikšanām un privātiem braucieniem.$q$,
  $q$Mercedes-Benz V-Class Executive is a prestigious vehicle for small groups and business clients. Leather seats, adjustable backrests and folding tables provide a comfortable setting on both short and longer trips.
Air conditioning, LED lighting and USB charging ports add cabin functionality. Suitable for airport transfers, business meetings and private travel.$q$,
  $q$La Mercedes-Benz Classe V Executive est un véhicule représentatif pour les petits groupes et les clients d’affaires. Sièges en cuir, dossiers réglables et tables rabattables offrent un cadre confortable sur les trajets courts comme plus longs.
Climatisation, éclairage LED et ports de charge USB complètent la fonctionnalité de l’habitacle. Convient aux transferts aéroport, aux rendez-vous professionnels et aux trajets privés.$q$,
  $q$Mercedes-Benz V-Class Executive — представительский транспорт для небольших групп и бизнес-клиентов. Кожаные сиденья, регулируемые спинки и складные столики обеспечивают удобную среду в коротких и более длинных поездках.
Кондиционер, LED-освещение и USB-разъёмы дополняют функциональность салона. Подходит для аэропортовых трансферов, деловых встреч и частных поездок.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
LED apgaismojums
Radio
Regulējami pasažieru sēdekļi
Roku balsti
Salokāmi galdiņi
USB uzlādes pieslēgvietas
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Leather seats
LED lighting
Radio
Adjustable passenger seats
Armrests
Folding tables
USB charging ports
Large luggage compartment$q$,
  $q$Climatisation
Sièges en cuir
Éclairage LED
Radio
Sièges passagers réglables
Accoudoirs
Tables rabattables
Ports de charge USB
Grande soute à bagages$q$,
  $q$Кондиционер
Кожаные сиденья
LED-освещение
Радио
Регулируемые пассажирские сиденья
Подлокотники
Складные столики
USB-разъёмы для зарядки
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$15$q$,
  $q$Mercedes Benz Vito$q$,
  $q$Mercedes-Benz Vito$q$,
  $q$Mercedes-Benz Vito$q$,
  $q$Mercedes-Benz Vito$q$,
  $q$Praktisks Mercedes-Benz Vito mikroautobuss līdz 8 pasažieriem privātiem un grupu transfēriem.$q$,
  $q$Practical Mercedes-Benz Vito minibus for up to 8 passengers for private and group transfers.$q$,
  $q$Minibus Mercedes-Benz Vito pratique jusqu’à 8 passagers pour transferts privés et de groupe.$q$,
  $q$Практичный микроавтобус Mercedes-Benz Vito до 8 пассажиров для частных и групповых трансферов.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$Mercedes-Benz Vito piedāvā komfortablu un funkcionālu transportu nelielām ceļotāju grupām. Ādas sēdekļi, regulējamas atzveltnes un roku balsti palīdz ērti pavadīt laiku gan pilsētas maršrutos, gan garākos pārbraucienos.
Gaisa kondicionieris, USB uzlādes pieslēgvietas un plašs bagāžas nodalījums ir noderīgi ikdienas braucienos. Piemērots lidostas transfēriem, ģimenes izbraucieniem un nelielu grupu pārvadājumiem.$q$,
  $q$The Mercedes-Benz Vito offers comfortable, functional transport for small travel groups. Leather seats, adjustable backrests and armrests help make city routes and longer journeys easy.
Air conditioning, USB charging ports and a large luggage compartment are useful for everyday trips. Suitable for airport transfers, family outings and small-group transport.$q$,
  $q$Le Mercedes-Benz Vito offre un transport confortable et fonctionnel pour les petits groupes. Sièges en cuir, dossiers réglables et accoudoirs facilitent les trajets en ville comme les parcours plus longs.
Climatisation, ports de charge USB et grande soute à bagages sont utiles au quotidien. Convient aux transferts aéroport, aux sorties en famille et au transport de petits groupes.$q$,
  $q$Mercedes-Benz Vito предлагает комфортный и функциональный транспорт для небольших групп. Кожаные сиденья, регулируемые спинки и подлокотники помогают удобно провести время в городских маршрутах и более длинных переездах.
Кондиционер, USB-разъёмы и просторное багажное отделение полезны в повседневных поездках. Подходит для аэропортовых трансферов, семейных выездов и перевозки небольших групп.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
Radio
Regulējami pasažieru sēdekļi
Roku balsti
USB uzlādes pieslēgvietas
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Leather seats
Radio
Adjustable passenger seats
Armrests
USB charging ports
Large luggage compartment$q$,
  $q$Climatisation
Sièges en cuir
Radio
Sièges passagers réglables
Accoudoirs
Ports de charge USB
Grande soute à bagages$q$,
  $q$Кондиционер
Кожаные сиденья
Радио
Регулируемые пассажирские сиденья
Подлокотники
USB-разъёмы для зарядки
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
),
(
  $q$7$q$,
  $q$GMC Yukon XL Elite noma ar šoferi Denverā, Kolorādo / USA$q$,
  $q$GMC Yukon XL Elite chauffeur rental in Denver, Colorado / USA$q$,
  $q$Location avec chauffeur de GMC Yukon XL Elite à Denver, Colorado / USA$q$,
  $q$Аренда GMC Yukon XL Elite с водителем в Денвере, Колорадо / США$q$,
  $q$Premium klases GMC Yukon XL apvidus auto privātiem un biznesa transfēriem Denverā, ASV.$q$,
  $q$Premium GMC Yukon XL SUV for private and business transfers in Denver, USA.$q$,
  $q$SUV premium GMC Yukon XL pour transferts privés et d’affaires à Denver, USA.$q$,
  $q$Премиум-внедорожник GMC Yukon XL для частных и деловых трансферов в Денвере, США.$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$GMC Yukon XL Elite ir ietilpīgs premium klases SUV, kas piemērots individuāliem braucieniem un nelielām grupām Denverā, Kolorādo. Ādas sēdekļi un plašais salons nodrošina patīkamu vidi gan ikdienas transfēriem, gan biznesa vajadzībām.
Gaisa kondicionieris, USB uzlādes pieslēgvietas un bagāžas nodalījums papildina ceļošanas ērtības. Piemērots lidostas transfēriem, biznesa braucieniem un privātiem maršrutiem Denveras apkārtnē.$q$,
  $q$GMC Yukon XL Elite is a spacious premium SUV for individual trips and small groups in Denver, Colorado. Leather seats and a roomy cabin make a pleasant setting for everyday transfers and business needs.
Air conditioning, USB charging ports and a luggage compartment add travel convenience. Suitable for airport transfers, business travel and private routes around Denver.$q$,
  $q$Le GMC Yukon XL Elite est un SUV premium spacieux pour trajets individuels et petits groupes à Denver, Colorado. Sièges en cuir et habitacle généreux offrent un cadre agréable pour les transferts du quotidien et les besoins d’affaires.
Climatisation, ports de charge USB et soute à bagages ajoutent du confort de voyage. Convient aux transferts aéroport, aux trajets d’affaires et aux parcours privés dans la région de Denver.$q$,
  $q$GMC Yukon XL Elite — вместительный премиум-SUV для индивидуальных поездок и небольших групп в Денвере, Колорадо. Кожаные сиденья и просторный салон обеспечивают приятную атмосферу для повседневных трансферов и деловых нужд.
Кондиционер, USB-разъёмы и багажное отделение дополняют удобства в пути. Подходит для аэропортовых трансферов, деловых поездок и частных маршрутов в окрестностях Денвера.$q$,
  $q$Gaisa kondicionieris
Ādas sēdekļi
LED apgaismojums
Radio
USB uzlādes pieslēgvietas
Plašs bagāžas nodalījums$q$,
  $q$Air conditioning
Leather seats
LED lighting
Radio
USB charging ports
Large luggage compartment$q$,
  $q$Climatisation
Sièges en cuir
Éclairage LED
Radio
Ports de charge USB
Grande soute à bagages$q$,
  $q$Кондиционер
Кожаные сиденья
LED-освещение
Радио
USB-разъёмы для зарядки
Просторное багажное отделение$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$,
  $q$$q$
);

-- Rebuild jsonb text + line arrays, then merge into fleet_vehicles
update public.fleet_vehicles e
set
  name = jsonb_build_object(
    'lv', coalesce(i.name_lv, ''),
    'en', coalesce(i.name_en, ''),
    'fr', coalesce(i.name_fr, ''),
    'ru', coalesce(i.name_ru, '')
  ),
  summary = jsonb_build_object(
    'lv', coalesce(i.summary_lv, ''),
    'en', coalesce(i.summary_en, ''),
    'fr', coalesce(i.summary_fr, ''),
    'ru', coalesce(i.summary_ru, '')
  ),
  interior_color = jsonb_build_object(
    'lv', coalesce(i.interior_color_lv, ''),
    'en', coalesce(i.interior_color_en, ''),
    'fr', coalesce(i.interior_color_fr, ''),
    'ru', coalesce(i.interior_color_ru, '')
  ),
  body_color = jsonb_build_object(
    'lv', coalesce(i.body_color_lv, ''),
    'en', coalesce(i.body_color_en, ''),
    'fr', coalesce(i.body_color_fr, ''),
    'ru', coalesce(i.body_color_ru, '')
  ),
  description = jsonb_build_object(
    'lv', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.description_lv, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'en', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.description_en, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'fr', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.description_fr, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'ru', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.description_ru, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb)
  ),
  extras = jsonb_build_object(
    'lv', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.extras_lv, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'en', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.extras_en, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'fr', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.extras_fr, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'ru', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.extras_ru, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb)
  ),
  closing_notes = jsonb_build_object(
    'lv', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.closing_notes_lv, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'en', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.closing_notes_en, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'fr', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.closing_notes_fr, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'ru', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.closing_notes_ru, ''), E'\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb)
  )
from public.fleet_i18n_import i
where e.id = i.id
   or e.name->>'lv' = i.name_lv;

commit;
