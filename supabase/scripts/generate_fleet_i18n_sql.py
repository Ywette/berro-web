# -*- coding: utf-8 -*-
"""Generate fleet_i18n_import.sql from CSV + EN/FR/RU translations."""
from __future__ import annotations

import csv
from pathlib import Path

CSV_PATH = Path(
    r"c:\Users\iveta\.cursor\projects\c-Users-iveta-Documents-Builds-berro-web\attachments\d3a882f4-642f-4e15-9f07-8f569a7bfb30\Supabase_Snippet_Untitled_query__1_.csv"
)
OUT_PATH = Path(__file__).with_name("fleet_i18n_import.sql")

# Translations keyed by vehicle id. LV comes from CSV; only EN/FR/RU here.
# name stays brand-like; Denver listings get localized titles.
TRANSLATIONS: dict[str, dict[str, dict[str, str]]] = {
    "12": {
        "name": {
            "en": "MAN Lions",
            "fr": "MAN Lions",
            "ru": "MAN Lions",
        },
        "summary": {
            "en": "Spacious MAN Lion’s touring coach for up to 49 passengers on comfortable group trips.",
            "fr": "Autocar de tourisme MAN Lion’s spacieux jusqu’à 49 passagers pour des voyages de groupe confortables.",
            "ru": "Вместительный туристический автобус MAN Lion’s до 49 пассажиров для комфортных групповых поездок.",
        },
        "description": {
            "en": "MAN Lion’s is suited to larger travel groups that need comfort and well-planned equipment. Semi-leather seats, adjustable backrests and panoramic windows make longer routes pleasant.\nAir conditioning, a guide microphone, a fridge and a luggage compartment are useful for organised excursions and tourist trips. A good choice for company teams, event guests and group transfers.",
            "fr": "Le MAN Lion’s convient aux plus grands groupes de voyageurs qui recherchent le confort et un équipement bien pensé. Sièges semi-cuir, dossiers réglables et fenêtres panoramiques rendent les longs trajets agréables.\nClimatisation, micro guide, réfrigérateur et soute à bagages sont utiles pour les excursions organisées et les voyages touristiques. Un bon choix pour les collectifs d’entreprise, les participants à des événements et les transferts de groupe.",
            "ru": "MAN Lion’s подходит для больших групп путешественников, которым важны комфорт и продуманное оснащение. Полукожаные сиденья, регулируемые спинки и панорамные окна позволяют удобно путешествовать и на длинных маршрутах.\nКондиционер, микрофон гида, холодильник и багажное отделение полезны для организованных экскурсий и туристических поездок. Хороший выбор для коллективов компаний, участников мероприятий и групповых трансферов.",
        },
        "extras": {
            "en": "Air conditioning\nSemi-leather seats\nLED lighting\nRadio\nRoof hatch\nDVD\nGuide microphone\nFridge\nAdjustable passenger seats\nArmrests\nFolding tables\nIndividual lighting\nCabin heating\nPanoramic windows\nUSB charging ports\nLarge luggage compartment",
            "fr": "Climatisation\nSièges semi-cuir\nÉclairage LED\nRadio\nTrappe de toit\nDVD\nMicro guide\nRéfrigérateur\nSièges passagers réglables\nAccoudoirs\nTables rabattables\nÉclairage individuel\nChauffage de l’habitacle\nFenêtres panoramiques\nPorts de charge USB\nGrande soute à bagages",
            "ru": "Кондиционер\nПолукожаные сиденья\nLED-освещение\nРадио\nЛюк в крыше\nDVD\nМикрофон гида\nХолодильник\nРегулируемые пассажирские сиденья\nПодлокотники\nСкладные столики\nИндивидуальное освещение\nОтопление салона\nПанорамные окна\nUSB-разъёмы для зарядки\nПросторное багажное отделение",
        },
    },
    "2": {
        "name": {"en": "SCANIA Touring", "fr": "SCANIA Touring", "ru": "SCANIA Touring"},
        "summary": {
            "en": "Comfortable 49-passenger touring coach for group excursions, outings and longer journeys.",
            "fr": "Autocar de tourisme confortable de 49 places pour excursions de groupe, sorties et voyages plus longs.",
            "ru": "Комфортабельный туристический автобус на 49 пассажиров для групповых экскурсий, выездов и дальних поездок.",
        },
        "description": {
            "en": "SCANIA Touring is a spacious touring coach for larger group transport in Latvia and abroad. Adjustable seats, panoramic windows and a large luggage compartment help make both short and long routes pleasant.\nAir conditioning, individual lighting, a guide microphone and other cabin amenities make it a practical choice for organised excursions, company trips and group transfers.",
            "fr": "Le SCANIA Touring est un autocar de tourisme spacieux pour le transport de grands groupes en Lettonie et à l’étranger. Sièges réglables, fenêtres panoramiques et grande soute à bagages rendent agréables les trajets courts comme les plus longs.\nClimatisation, éclairage individuel, micro guide et autres équipements de bord en font un choix pratique pour les excursions organisées, les sorties d’entreprise et les transferts de groupe.",
            "ru": "SCANIA Touring — вместительный туристический автобус для перевозки больших групп в Латвии и за рубежом. Регулируемые сиденья, панорамные окна и просторное багажное отделение помогают обеспечить приятную поездку на коротких и длинных маршрутах.\nКондиционер, индивидуальное освещение, микрофон гида и другие удобства салона делают его практичным выбором для организованных экскурсий, корпоративных поездок и групповых трансферов.",
        },
        "extras": {
            "en": "Air conditioning\nLED lighting\nRadio\nRoof hatch\nDVD\nGuide microphone\nFridge\nAdjustable passenger seats\nArmrests\nFolding tables\nIndividual lighting\nCabin heating\nPanoramic windows\nUSB charging ports\nLarge luggage compartment",
            "fr": "Climatisation\nÉclairage LED\nRadio\nTrappe de toit\nDVD\nMicro guide\nRéfrigérateur\nSièges passagers réglables\nAccoudoirs\nTables rabattables\nÉclairage individuel\nChauffage de l’habitacle\nFenêtres panoramiques\nPorts de charge USB\nGrande soute à bagages",
            "ru": "Кондиционер\nLED-освещение\nРадио\nЛюк в крыше\nDVD\nМикрофон гида\nХолодильник\nРегулируемые пассажирские сиденья\nПодлокотники\nСкладные столики\nИндивидуальное освещение\nОтопление салона\nПанорамные окна\nUSB-разъёмы для зарядки\nПросторное багажное отделение",
        },
    },
    "9": {
        "name": {
            "en": "Mercedes-Benz S-Class",
            "fr": "Mercedes-Benz Classe S",
            "ru": "Mercedes-Benz S-Class",
        },
        "summary": {
            "en": "Mercedes-Benz S-Class luxury sedan for prestigious business travel and VIP transfers.",
            "fr": "Berline de luxe Mercedes-Benz Classe S pour trajets d’affaires représentatifs et transferts VIP.",
            "ru": "Люксовый седан Mercedes-Benz S-Class для представительских деловых поездок и VIP-трансферов.",
        },
        "description": {
            "en": "The Mercedes-Benz S-Class is an elegant sedan for clients who value privacy, comfort and prestigious transport. Leather seats, individual lighting and a thoughtfully arranged cabin create a pleasant environment on the road.\nAir conditioning, heated seats and USB charging ports add everyday convenience. Suitable for business meetings, airport transfers and transporting guests to special events.",
            "fr": "La Mercedes-Benz Classe S est une berline élégante pour les clients qui apprécient l’intimité, le confort et un transport représentatif. Sièges en cuir, éclairage individuel et habitacle soigné créent un cadre agréable pendant le trajet.\nClimatisation, sièges chauffants et ports de charge USB complètent le confort au quotidien. Convient aux rendez-vous d’affaires, aux transferts aéroport et au transport d’invités pour des événements spéciaux.",
            "ru": "Mercedes-Benz S-Class — элегантный седан для клиентов, которые ценят приватность, комфорт и представительский транспорт. Кожаные сиденья, индивидуальное освещение и продуманный салон создают приятную атмосферу в поездке.\nКондиционер, подогрев сидений и USB-разъёмы дополняют повседневный комфорт. Подходит для деловых встреч, аэропортовых трансферов и перевозки гостей на особые мероприятия.",
        },
        "extras": {
            "en": "Air conditioning\nHeated seats\nLeather seats\nLED lighting\nRadio\nRoof hatch\nAdjustable passenger seats\nArmrests\nIndividual lighting\nUSB charging ports",
            "fr": "Climatisation\nSièges chauffants\nSièges en cuir\nÉclairage LED\nRadio\nTrappe de toit\nSièges passagers réglables\nAccoudoirs\nÉclairage individuel\nPorts de charge USB",
            "ru": "Кондиционер\nПодогрев сидений\nКожаные сиденья\nLED-освещение\nРадио\nЛюк в крыше\nРегулируемые пассажирские сиденья\nПодлокотники\nИндивидуальное освещение\nUSB-разъёмы для зарядки",
        },
    },
    "6": {
        "name": {
            "en": "Mercedes-Benz Sprinter COMFORT",
            "fr": "Mercedes-Benz Sprinter COMFORT",
            "ru": "Mercedes-Benz Sprinter COMFORT",
        },
        "summary": {
            "en": "Comfortable Mercedes-Benz Sprinter minibus for up to 19 passengers on organised group trips.",
            "fr": "Minibus Mercedes-Benz Sprinter confortable jusqu’à 19 passagers pour trajets de groupe organisés.",
            "ru": "Комфортабельный микроавтобус Mercedes-Benz Sprinter до 19 пассажиров для организованных групповых поездок.",
        },
        "description": {
            "en": "Mercedes-Benz Sprinter COMFORT is a spacious minibus for group excursions, transfers and longer journeys. Leather seats, adjustable backrests and well-planned cabin equipment help keep everyone comfortable along the route.\nAir conditioning, a guide microphone, a fridge and individual lighting are useful for organised trips and company outings. A practical choice for groups that need capacity and comfort.",
            "fr": "Le Mercedes-Benz Sprinter COMFORT est un minibus spacieux pour excursions de groupe, transferts et trajets plus longs. Sièges en cuir, dossiers réglables et équipement de cabine bien pensé assurent le confort sur tout le parcours.\nClimatisation, micro guide, réfrigérateur et éclairage individuel sont utiles pour les voyages organisés et les sorties d’entreprise. Un choix pratique pour les groupes qui recherchent capacité et confort.",
            "ru": "Mercedes-Benz Sprinter COMFORT — вместительный микроавтобус для групповых экскурсий, трансферов и более длинных переездов. Кожаные сиденья, регулируемые спинки и продуманное оснащение салона помогают обеспечить комфорт на всём маршруте.\nКондиционер, микрофон гида, холодильник и индивидуальное освещение полезны для организованных поездок и корпоративных выездов. Практичный выбор для групп, которым важны вместимость и удобство.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nLED lighting\nRadio\nRoof hatch\nGuide microphone\nFridge\nAdjustable passenger seats\nArmrests\nFolding tables\nIndividual lighting\nCabin heating\nPanoramic windows\nUSB charging ports\nLarge luggage compartment",
            "fr": "Climatisation\nSièges en cuir\nÉclairage LED\nRadio\nTrappe de toit\nMicro guide\nRéfrigérateur\nSièges passagers réglables\nAccoudoirs\nTables rabattables\nÉclairage individuel\nChauffage de l’habitacle\nFenêtres panoramiques\nPorts de charge USB\nGrande soute à bagages",
            "ru": "Кондиционер\nКожаные сиденья\nLED-освещение\nРадио\nЛюк в крыше\nМикрофон гида\nХолодильник\nРегулируемые пассажирские сиденья\nПодлокотники\nСкладные столики\nИндивидуальное освещение\nОтопление салона\nПанорамные окна\nUSB-разъёмы для зарядки\nПросторное багажное отделение",
        },
    },
    "4": {
        "name": {
            "en": "Mercedes-Benz Sprinter LUX",
            "fr": "Mercedes-Benz Sprinter LUX",
            "ru": "Mercedes-Benz Sprinter LUX",
        },
        "summary": {
            "en": "Refined 8-passenger minibus for private transfers, business travel and small groups.",
            "fr": "Minibus raffiné de 8 places pour transferts privés, trajets d’affaires et petits groupes.",
            "ru": "Изысканный микроавтобус на 8 пассажиров для частных трансферов, деловых поездок и небольших групп.",
        },
        "description": {
            "en": "Mercedes-Benz Sprinter LUX is ideal for travellers who want more privacy and comfort. Leather seats, a cabin table and a thoughtful seating layout create a pleasant space for a small group.\nAir conditioning, individual lighting and USB charging ports help make time on the road easier. A good choice for airport transfers, business meetings and individually planned routes.",
            "fr": "Le Mercedes-Benz Sprinter LUX convient aux voyageurs qui souhaitent plus d’intimité et de confort. Sièges en cuir, table de salon et disposition soignée des places créent un cadre agréable pour un petit groupe.\nClimatisation, éclairage individuel et ports de charge USB facilitent le temps passé en route. Un bon choix pour les transferts aéroport, les rendez-vous d’affaires et les itinéraires sur mesure.",
            "ru": "Mercedes-Benz Sprinter LUX подходит путешественникам, которым нужно больше приватности и комфорта. Кожаные сиденья, салонный стол и продуманная рассадка создают приятную атмосферу для небольшой группы.\nКондиционер, индивидуальное освещение и USB-разъёмы помогают комфортно провести время в пути. Хороший выбор для аэропортовых трансферов, деловых встреч и индивидуально спланированных маршрутов.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nLED lighting\nRadio\nRoof hatch\nAdjustable passenger seats\nArmrests\nFolding table\nIndividual lighting\nCabin heating\nUSB charging ports\nLarge luggage compartment",
            "fr": "Climatisation\nSièges en cuir\nÉclairage LED\nRadio\nTrappe de toit\nSièges passagers réglables\nAccoudoirs\nTable rabattable\nÉclairage individuel\nChauffage de l’habitacle\nPorts de charge USB\nGrande soute à bagages",
            "ru": "Кондиционер\nКожаные сиденья\nLED-освещение\nРадио\nЛюк в крыше\nРегулируемые пассажирские сиденья\nПодлокотники\nСкладной стол\nИндивидуальное освещение\nОтопление салона\nUSB-разъёмы для зарядки\nПросторное багажное отделение",
        },
    },
    "14": {
        "name": {
            "en": "Mercedes-Benz Sprinter LUX - 1",
            "fr": "Mercedes-Benz Sprinter LUX - 1",
            "ru": "Mercedes-Benz Sprinter LUX - 1",
        },
        "summary": {
            "en": "Elegant Mercedes-Benz Sprinter LUX minibus for up to 16 passengers on excursions and premium transfers.",
            "fr": "Élégant minibus Mercedes-Benz Sprinter LUX jusqu’à 16 passagers pour excursions et transferts premium.",
            "ru": "Элегантный микроавтобус Mercedes-Benz Sprinter LUX до 16 пассажиров для экскурсий и премиум-трансферов.",
        },
        "description": {
            "en": "Mercedes-Benz Sprinter LUX is a comfortable minibus for small groups that want to travel in a well-equipped cabin. Leather seats, adjustable backrests and panoramic windows create a pleasant setting on routes of any length.\nAir conditioning, a guide microphone, a fridge and USB charging ports add convenience on the road. Suitable for private excursions, company outings and group transfers.",
            "fr": "Le Mercedes-Benz Sprinter LUX est un minibus confortable pour les petits groupes qui souhaitent voyager dans un habitacle bien équipé. Sièges en cuir, dossiers réglables et fenêtres panoramiques créent un cadre agréable sur des trajets de toute durée.\nClimatisation, micro guide, réfrigérateur et ports de charge USB ajoutent du confort en route. Convient aux excursions privées, aux sorties d’entreprise et aux transferts de groupe.",
            "ru": "Mercedes-Benz Sprinter LUX — комфортабельный микроавтобус для небольших групп, которые хотят путешествовать в продуманно оснащённом салоне. Кожаные сиденья, регулируемые спинки и панорамные окна создают приятную атмосферу на маршрутах разной протяжённости.\nКондиционер, микрофон гида, холодильник и USB-разъёмы дополняют удобства в пути. Подходит для частных экскурсий, корпоративных выездов и групповых трансферов.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nLED lighting\nRadio\nRoof hatch\nGuide microphone\nFridge\nAdjustable passenger seats\nArmrests\nFolding tables\nIndividual lighting\nCabin heating\nPanoramic windows\nUSB charging ports\nElegant cabin table\nLarge luggage compartment",
            "fr": "Climatisation\nSièges en cuir\nÉclairage LED\nRadio\nTrappe de toit\nMicro guide\nRéfrigérateur\nSièges passagers réglables\nAccoudoirs\nTables rabattables\nÉclairage individuel\nChauffage de l’habitacle\nFenêtres panoramiques\nPorts de charge USB\nÉlégante table de salon\nGrande soute à bagages",
            "ru": "Кондиционер\nКожаные сиденья\nLED-освещение\nРадио\nЛюк в крыше\nМикрофон гида\nХолодильник\nРегулируемые пассажирские сиденья\nПодлокотники\nСкладные столики\nИндивидуальное освещение\nОтопление салона\nПанорамные окна\nUSB-разъёмы для зарядки\nЭлегантный салонный стол\nПросторное багажное отделение",
        },
    },
    "3": {
        "name": {
            "en": "Mercedes-Benz Sprinter LUX - 2",
            "fr": "Mercedes-Benz Sprinter LUX - 2",
            "ru": "Mercedes-Benz Sprinter LUX - 2",
        },
        "summary": {
            "en": "Elegant premium minibus for up to 16 passengers with a comfortable cabin for private and business travel.",
            "fr": "Élégant minibus premium jusqu’à 16 passagers avec un habitacle confortable pour trajets privés et d’affaires.",
            "ru": "Элегантный премиум-микроавтобус до 16 пассажиров с комфортным салоном для частных и деловых поездок.",
        },
        "description": {
            "en": "Mercedes-Benz Sprinter LUX combines a prestigious interior with amenities suited to small-group travel. Leather seats, individually adjustable places and a thoughtful cabin layout create a pleasant space even on longer journeys.\nAir conditioning, a fridge and USB charging options add comfort on the road. The minibus suits business transfers, private excursions and guest transport for special events.",
            "fr": "Le Mercedes-Benz Sprinter LUX associe un intérieur représentatif à des équipements adaptés aux petits groupes. Sièges en cuir, places réglables individuellement et disposition soignée de l’habitacle créent un cadre agréable même sur les longs trajets.\nClimatisation, réfrigérateur et options de charge USB ajoutent du confort en route. Le minibus convient aux transferts d’affaires, aux excursions privées et au transport d’invités pour des événements spéciaux.",
            "ru": "Mercedes-Benz Sprinter LUX сочетает представительский интерьер с удобствами для небольших групп. Кожаные сиденья, индивидуально регулируемые места и продуманная планировка салона создают приятную атмосферу даже в длительных поездках.\nКондиционер, холодильник и USB-зарядка дополняют комфорт в пути. Микроавтобус подходит для деловых трансферов, частных экскурсий и перевозки гостей на особые мероприятия.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nLED lighting\nRadio\nRoof hatch\nGuide microphone\nFridge\nIndividually adjustable passenger seats, including 3 facing opposite the direction of travel\nArmrests\nFolding tables\nIndividual lighting\nCabin heating\nPanoramic windows\nUSB charging ports\nElegant cabin table\nLarge luggage compartment",
            "fr": "Climatisation\nSièges en cuir\nÉclairage LED\nRadio\nTrappe de toit\nMicro guide\nRéfrigérateur\nSièges passagers réglables individuellement, dont 3 places face à la route inverse\nAccoudoirs\nTables rabattables\nÉclairage individuel\nChauffage de l’habitacle\nFenêtres panoramiques\nPorts de charge USB\nÉlégante table de salon\nGrande soute à bagages",
            "ru": "Кондиционер\nКожаные сиденья\nLED-освещение\nРадио\nЛюк в крыше\nМикрофон гида\nХолодильник\nИндивидуально регулируемые пассажирские сиденья, в том числе 3 места против направления движения\nПодлокотники\nСкладные столики\nИндивидуальное освещение\nОтопление салона\nПанорамные окна\nUSB-разъёмы для зарядки\nЭлегантный салонный стол\nПросторное багажное отделение",
        },
    },
    "1": {
        "name": {
            "en": "Mercedes-Benz Sprinter LUX - 3",
            "fr": "Mercedes-Benz Sprinter LUX - 3",
            "ru": "Mercedes-Benz Sprinter LUX - 3",
        },
        "summary": {
            "en": "Premium minibus for up to 16 passengers, suited to business travel, excursions and comfortable transfers.",
            "fr": "Minibus premium jusqu’à 16 passagers, adapté aux trajets d’affaires, aux excursions et aux transferts confortables.",
            "ru": "Премиум-микроавтобус до 16 пассажиров для деловых поездок, экскурсий и комфортных трансферов.",
        },
        "description": {
            "en": "Mercedes-Benz Sprinter LUX offers an elegant, well-planned environment for small-group travel. The spacious cabin with leather seats, individually adjustable places and panoramic windows makes longer routes comfortable too.\nAir conditioning, USB charging ports, a fridge and a cabin table add comfort on the journey. Suitable for private excursions, company trips and premium transfers.",
            "fr": "Le Mercedes-Benz Sprinter LUX offre un cadre élégant et bien pensé pour les voyages en petit groupe. L’habitacle spacieux avec sièges en cuir, places réglables individuellement et fenêtres panoramiques rend aussi les longs trajets confortables.\nClimatisation, ports de charge USB, réfrigérateur et table de salon ajoutent du confort en voyage. Convient aux excursions privées, aux trajets d’entreprise et aux transferts premium.",
            "ru": "Mercedes-Benz Sprinter LUX предлагает элегантную и продуманную среду для небольших групп. Просторный салон с кожаными сиденьями, индивидуально регулируемыми местами и панорамными окнами позволяет комфортно проводить время и на длинных маршрутах.\nКондиционер, USB-разъёмы, холодильник и салонный стол дополняют комфорт в поездке. Подходит для частных экскурсий, корпоративных поездок и премиум-трансферов.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nLED lighting\nRadio\nRoof hatch\nGuide microphone\nFridge\nIndividually adjustable passenger seats facing the direction of travel\nArmrests\nFolding tables\nIndividual lighting\nCabin heating\nPanoramic windows\nUSB charging ports\nElegant cabin table\nLarge luggage compartment",
            "fr": "Climatisation\nSièges en cuir\nÉclairage LED\nRadio\nTrappe de toit\nMicro guide\nRéfrigérateur\nSièges passagers réglables individuellement dans le sens de la marche\nAccoudoirs\nTables rabattables\nÉclairage individuel\nChauffage de l’habitacle\nFenêtres panoramiques\nPorts de charge USB\nÉlégante table de salon\nGrande soute à bagages",
            "ru": "Кондиционер\nКожаные сиденья\nLED-освещение\nРадио\nЛюк в крыше\nМикрофон гида\nХолодильник\nИндивидуально регулируемые пассажирские сиденья по ходу движения\nПодлокотники\nСкладные столики\nИндивидуальное освещение\nОтопление салона\nПанорамные окна\nUSB-разъёмы для зарядки\nЭлегантный салонный стол\nПросторное багажное отделение",
        },
    },
    "5": {
        "name": {
            "en": "Mercedes-Benz Sprinter LUX - 4",
            "fr": "Mercedes-Benz Sprinter LUX - 4",
            "ru": "Mercedes-Benz Sprinter LUX - 4",
        },
        "summary": {
            "en": "Premium minibus for up to 16 passengers for comfortable transfers and group travel.",
            "fr": "Minibus premium jusqu’à 16 passagers pour transferts confortables et voyages de groupe.",
            "ru": "Премиум-микроавтобус до 16 пассажиров для комфортных трансферов и групповых поездок.",
        },
        "description": {
            "en": "Mercedes-Benz Sprinter LUX offers a spacious cabin and elegant interior suited to both business clients and private travel groups. Leather seats and individually adjustable places help ensure a comfortable ride on routes of any length.\nCabin equipment including air conditioning, a fridge and USB charging ports makes travel more pleasant. Suitable for excursions, corporate trips and premium transfers.",
            "fr": "Le Mercedes-Benz Sprinter LUX offre un habitacle spacieux et un intérieur élégant, adaptés aux clients d’affaires comme aux groupes privés. Sièges en cuir et places réglables individuellement assurent un trajet confortable sur des parcours de toute durée.\nL’équipement de bord, dont climatisation, réfrigérateur et ports de charge USB, rend le voyage plus agréable. Convient aux excursions, trajets d’entreprise et transferts premium.",
            "ru": "Mercedes-Benz Sprinter LUX предлагает просторный салон и элегантный интерьер для бизнес-клиентов и частных групп. Кожаные сиденья и индивидуально регулируемые места помогают обеспечить удобную поездку на маршрутах разной протяжённости.\nОснащение салона, включая кондиционер, холодильник и USB-разъёмы, делает путешествие приятнее. Подходит для экскурсий, корпоративных поездок и премиум-трансферов.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nLED lighting\nRadio\nRoof hatch\nGuide microphone\nFridge\nIndividually adjustable passenger seats, including 3 facing opposite the direction of travel\nArmrests\nFolding tables\nIndividual lighting\nCabin heating\nPanoramic windows\nUSB charging ports\nElegant cabin table\nLarge luggage compartment",
            "fr": "Climatisation\nSièges en cuir\nÉclairage LED\nRadio\nTrappe de toit\nMicro guide\nRéfrigérateur\nSièges passagers réglables individuellement, dont 3 places face à la route inverse\nAccoudoirs\nTables rabattables\nÉclairage individuel\nChauffage de l’habitacle\nFenêtres panoramiques\nPorts de charge USB\nÉlégante table de salon\nGrande soute à bagages",
            "ru": "Кондиционер\nКожаные сиденья\nLED-освещение\nРадио\nЛюк в крыше\nМикрофон гида\nХолодильник\nИндивидуально регулируемые пассажирские сиденья, в том числе 3 места против направления движения\nПодлокотники\nСкладные столики\nИндивидуальное освещение\nОтопление салона\nПанорамные окна\nUSB-разъёмы для зарядки\nЭлегантный салонный стол\nПросторное багажное отделение",
        },
    },
    "13": {
        "name": {
            "en": "Mercedes-Benz Sprinter minibus rental in Denver, Colorado / USA",
            "fr": "Location de minibus Mercedes-Benz Sprinter à Denver, Colorado / USA",
            "ru": "Аренда микроавтобуса Mercedes-Benz Sprinter в Денвере, Колорадо / США",
        },
        "summary": {
            "en": "Mercedes-Benz Sprinter minibus for up to 14 passengers for group transfers in Denver, USA.",
            "fr": "Minibus Mercedes-Benz Sprinter jusqu’à 14 passagers pour transferts de groupe à Denver, USA.",
            "ru": "Микроавтобус Mercedes-Benz Sprinter до 14 пассажиров для групповых трансферов в Денвере, США.",
        },
        "description": {
            "en": "The Mercedes-Benz Sprinter is a spacious minibus for small-group transport in Denver, Colorado. Comfortable passenger seats and a large luggage compartment make it suitable for airport transfers and individually organised trips.\nAir conditioning and cabin equipment help ensure a pleasant travel experience. A practical choice for tourist groups, business guests and event participants.",
            "fr": "Le Mercedes-Benz Sprinter est un minibus spacieux pour le transport de petits groupes à Denver, Colorado. Sièges passagers confortables et grande soute à bagages le rendent adapté aux transferts aéroport et aux trajets organisés sur mesure.\nClimatisation et équipement de bord aident à offrir une expérience de voyage agréable. Un choix pratique pour les groupes de touristes, les hôtes d’affaires et les participants à des événements.",
            "ru": "Mercedes-Benz Sprinter — вместительный микроавтобус для небольших групп в Денвере, Колорадо. Удобные пассажирские сиденья и просторное багажное отделение делают его подходящим для аэропортовых трансферов и индивидуально организованных поездок.\nКондиционер и оснащение салона помогают обеспечить приятный опыт путешествия. Практичный выбор для туристических групп, бизнес-гостей и участников мероприятий.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nCabin lighting\nRadio and audio system\nAdjustable passenger seats\nArmrests\nLarge luggage compartment for suitcases and travel bags",
            "fr": "Climatisation\nSièges en cuir\nÉclairage de l’habitacle\nRadio et système audio\nSièges passagers réglables\nAccoudoirs\nGrande soute à bagages pour valises et sacs de voyage",
            "ru": "Кондиционер\nКожаные сиденья\nОсвещение салона\nРадио и аудиосистема\nРегулируемые пассажирские сиденья\nПодлокотники\nПросторное багажное отделение для чемоданов и дорожных сумок",
        },
    },
    "10": {
        "name": {
            "en": "Mercedes-Benz Sprinter VIP",
            "fr": "Mercedes-Benz Sprinter VIP",
            "ru": "Mercedes-Benz Sprinter VIP",
        },
        "summary": {
            "en": "Premium Mercedes-Benz Sprinter VIP minibus for up to 19 passengers for group transfers and excursions.",
            "fr": "Minibus premium Mercedes-Benz Sprinter VIP jusqu’à 19 passagers pour transferts de groupe et excursions.",
            "ru": "Премиум-микроавтобус Mercedes-Benz Sprinter VIP до 19 пассажиров для групповых трансферов и экскурсий.",
        },
        "description": {
            "en": "Mercedes-Benz Sprinter VIP offers a spacious cabin and comfortable equipment for organised group travel. Leather seats, adjustable backrests and individual lighting help make longer journeys pleasant too.\nAir conditioning, a fridge and a guide microphone are especially useful for excursion groups. The minibus suits corporate outings, tourist routes and higher-comfort group transfers.",
            "fr": "Le Mercedes-Benz Sprinter VIP offre un habitacle spacieux et un équipement confortable pour les voyages de groupe organisés. Sièges en cuir, dossiers réglables et éclairage individuel aident à rendre agréables aussi les trajets plus longs.\nClimatisation, réfrigérateur et micro guide sont particulièrement utiles pour les groupes d’excursion. Le minibus convient aux sorties d’entreprise, aux circuits touristiques et aux transferts de groupe à confort élevé.",
            "ru": "Mercedes-Benz Sprinter VIP предлагает просторный салон и комфортное оснащение для организованных групповых поездок. Кожаные сиденья, регулируемые спинки и индивидуальное освещение помогают приятно провести время и в более дальних путешествиях.\nКондиционер, холодильник и микрофон гида особенно полезны для экскурсионных групп. Микроавтобус подходит для корпоративных выездов, туристических маршрутов и групповых трансферов повышенного комфорта.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nLED lighting\nRadio\nRoof hatch\nGuide microphone\nFridge\nAdjustable passenger seats\nArmrests\nFolding tables\nIndividual lighting\nCabin heating\nPanoramic windows\nUSB charging ports\nLarge luggage compartment",
            "fr": "Climatisation\nSièges en cuir\nÉclairage LED\nRadio\nTrappe de toit\nMicro guide\nRéfrigérateur\nSièges passagers réglables\nAccoudoirs\nTables rabattables\nÉclairage individuel\nChauffage de l’habitacle\nFenêtres panoramiques\nPorts de charge USB\nGrande soute à bagages",
            "ru": "Кондиционер\nКожаные сиденья\nLED-освещение\nРадио\nЛюк в крыше\nМикрофон гида\nХолодильник\nРегулируемые пассажирские сиденья\nПодлокотники\nСкладные столики\nИндивидуальное освещение\nОтопление салона\nПанорамные окна\nUSB-разъёмы для зарядки\nПросторное багажное отделение",
        },
    },
    "8": {
        "name": {
            "en": "Mercedes-Benz V-Class",
            "fr": "Mercedes-Benz Classe V",
            "ru": "Mercedes-Benz V-Class",
        },
        "summary": {
            "en": "Elegant Mercedes-Benz V-Class minivan for private transfers and small-group travel.",
            "fr": "Élégant monospace Mercedes-Benz Classe V pour transferts privés et trajets en petit groupe.",
            "ru": "Элегантный минивэн Mercedes-Benz V-Class для частных трансферов и поездок небольших групп.",
        },
        "description": {
            "en": "The Mercedes-Benz V-Class combines a comfortable cabin with a discreet, prestigious design. Leather seats, armrests and a cabin table create a pleasant setting for private trips and business transfers.\nAir conditioning, cabin heating and USB charging ports help maintain comfort in every season. Suitable for airport transfers, guest transport and individually planned outings.",
            "fr": "La Mercedes-Benz Classe V associe un habitacle confortable à un design discret et représentatif. Sièges en cuir, accoudoirs et table de salon créent un cadre agréable pour les trajets privés et les transferts d’affaires.\nClimatisation, chauffage de l’habitacle et ports de charge USB aident à maintenir le confort en toute saison. Convient aux transferts aéroport, au transport d’invités et aux sorties sur mesure.",
            "ru": "Mercedes-Benz V-Class сочетает комфортный салон с сдержанным представительским дизайном. Кожаные сиденья, подлокотники и салонный стол создают удобную среду для частных поездок и деловых трансферов.\nКондиционер, отопление салона и USB-разъёмы помогают сохранять комфорт в любое время года. Подходит для аэропортовых трансферов, перевозки гостей и индивидуально спланированных выездов.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nRadio\nAdjustable passenger seats\nArmrests\nFolding table\nIndividual lighting\nCabin heating\nUSB charging ports\nLarge luggage compartment",
            "fr": "Climatisation\nSièges en cuir\nRadio\nSièges passagers réglables\nAccoudoirs\nTable rabattable\nÉclairage individuel\nChauffage de l’habitacle\nPorts de charge USB\nGrande soute à bagages",
            "ru": "Кондиционер\nКожаные сиденья\nРадио\nРегулируемые пассажирские сиденья\nПодлокотники\nСкладной стол\nИндивидуальное освещение\nОтопление салона\nUSB-разъёмы для зарядки\nПросторное багажное отделение",
        },
    },
    "11": {
        "name": {
            "en": "Mercedes-Benz V-Class Executive",
            "fr": "Mercedes-Benz Classe V Executive",
            "ru": "Mercedes-Benz V-Class Executive",
        },
        "summary": {
            "en": "Mercedes-Benz V-Class Executive minivan for comfortable business travel and private transfers.",
            "fr": "Monospace Mercedes-Benz Classe V Executive pour trajets d’affaires confortables et transferts privés.",
            "ru": "Минивэн Mercedes-Benz V-Class Executive для комфортных деловых поездок и частных трансферов.",
        },
        "description": {
            "en": "Mercedes-Benz V-Class Executive is a prestigious vehicle for small groups and business clients. Leather seats, adjustable backrests and folding tables provide a comfortable setting on both short and longer trips.\nAir conditioning, LED lighting and USB charging ports add cabin functionality. Suitable for airport transfers, business meetings and private travel.",
            "fr": "La Mercedes-Benz Classe V Executive est un véhicule représentatif pour les petits groupes et les clients d’affaires. Sièges en cuir, dossiers réglables et tables rabattables offrent un cadre confortable sur les trajets courts comme plus longs.\nClimatisation, éclairage LED et ports de charge USB complètent la fonctionnalité de l’habitacle. Convient aux transferts aéroport, aux rendez-vous professionnels et aux trajets privés.",
            "ru": "Mercedes-Benz V-Class Executive — представительский транспорт для небольших групп и бизнес-клиентов. Кожаные сиденья, регулируемые спинки и складные столики обеспечивают удобную среду в коротких и более длинных поездках.\nКондиционер, LED-освещение и USB-разъёмы дополняют функциональность салона. Подходит для аэропортовых трансферов, деловых встреч и частных поездок.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nLED lighting\nRadio\nAdjustable passenger seats\nArmrests\nFolding tables\nUSB charging ports\nLarge luggage compartment",
            "fr": "Climatisation\nSièges en cuir\nÉclairage LED\nRadio\nSièges passagers réglables\nAccoudoirs\nTables rabattables\nPorts de charge USB\nGrande soute à bagages",
            "ru": "Кондиционер\nКожаные сиденья\nLED-освещение\nРадио\nРегулируемые пассажирские сиденья\nПодлокотники\nСкладные столики\nUSB-разъёмы для зарядки\nПросторное багажное отделение",
        },
    },
    "15": {
        "name": {
            "en": "Mercedes-Benz Vito",
            "fr": "Mercedes-Benz Vito",
            "ru": "Mercedes-Benz Vito",
        },
        "summary": {
            "en": "Practical Mercedes-Benz Vito minibus for up to 8 passengers for private and group transfers.",
            "fr": "Minibus Mercedes-Benz Vito pratique jusqu’à 8 passagers pour transferts privés et de groupe.",
            "ru": "Практичный микроавтобус Mercedes-Benz Vito до 8 пассажиров для частных и групповых трансферов.",
        },
        "description": {
            "en": "The Mercedes-Benz Vito offers comfortable, functional transport for small travel groups. Leather seats, adjustable backrests and armrests help make city routes and longer journeys easy.\nAir conditioning, USB charging ports and a large luggage compartment are useful for everyday trips. Suitable for airport transfers, family outings and small-group transport.",
            "fr": "Le Mercedes-Benz Vito offre un transport confortable et fonctionnel pour les petits groupes. Sièges en cuir, dossiers réglables et accoudoirs facilitent les trajets en ville comme les parcours plus longs.\nClimatisation, ports de charge USB et grande soute à bagages sont utiles au quotidien. Convient aux transferts aéroport, aux sorties en famille et au transport de petits groupes.",
            "ru": "Mercedes-Benz Vito предлагает комфортный и функциональный транспорт для небольших групп. Кожаные сиденья, регулируемые спинки и подлокотники помогают удобно провести время в городских маршрутах и более длинных переездах.\nКондиционер, USB-разъёмы и просторное багажное отделение полезны в повседневных поездках. Подходит для аэропортовых трансферов, семейных выездов и перевозки небольших групп.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nRadio\nAdjustable passenger seats\nArmrests\nUSB charging ports\nLarge luggage compartment",
            "fr": "Climatisation\nSièges en cuir\nRadio\nSièges passagers réglables\nAccoudoirs\nPorts de charge USB\nGrande soute à bagages",
            "ru": "Кондиционер\nКожаные сиденья\nРадио\nРегулируемые пассажирские сиденья\nПодлокотники\nUSB-разъёмы для зарядки\nПросторное багажное отделение",
        },
    },
    "7": {
        "name": {
            "en": "GMC Yukon XL Elite chauffeur rental in Denver, Colorado / USA",
            "fr": "Location avec chauffeur de GMC Yukon XL Elite à Denver, Colorado / USA",
            "ru": "Аренда GMC Yukon XL Elite с водителем в Денвере, Колорадо / США",
        },
        "summary": {
            "en": "Premium GMC Yukon XL SUV for private and business transfers in Denver, USA.",
            "fr": "SUV premium GMC Yukon XL pour transferts privés et d’affaires à Denver, USA.",
            "ru": "Премиум-внедорожник GMC Yukon XL для частных и деловых трансферов в Денвере, США.",
        },
        "description": {
            "en": "GMC Yukon XL Elite is a spacious premium SUV for individual trips and small groups in Denver, Colorado. Leather seats and a roomy cabin make a pleasant setting for everyday transfers and business needs.\nAir conditioning, USB charging ports and a luggage compartment add travel convenience. Suitable for airport transfers, business travel and private routes around Denver.",
            "fr": "Le GMC Yukon XL Elite est un SUV premium spacieux pour trajets individuels et petits groupes à Denver, Colorado. Sièges en cuir et habitacle généreux offrent un cadre agréable pour les transferts du quotidien et les besoins d’affaires.\nClimatisation, ports de charge USB et soute à bagages ajoutent du confort de voyage. Convient aux transferts aéroport, aux trajets d’affaires et aux parcours privés dans la région de Denver.",
            "ru": "GMC Yukon XL Elite — вместительный премиум-SUV для индивидуальных поездок и небольших групп в Денвере, Колорадо. Кожаные сиденья и просторный салон обеспечивают приятную атмосферу для повседневных трансферов и деловых нужд.\nКондиционер, USB-разъёмы и багажное отделение дополняют удобства в пути. Подходит для аэропортовых трансферов, деловых поездок и частных маршрутов в окрестностях Денвера.",
        },
        "extras": {
            "en": "Air conditioning\nLeather seats\nLED lighting\nRadio\nUSB charging ports\nLarge luggage compartment",
            "fr": "Climatisation\nSièges en cuir\nÉclairage LED\nRadio\nPorts de charge USB\nGrande soute à bagages",
            "ru": "Кондиционер\nКожаные сиденья\nLED-освещение\nРадио\nUSB-разъёмы для зарядки\nПросторное багажное отделение",
        },
    },
}


def q(value: str | None) -> str:
    text = "" if value is None or value == "null" else str(value)
    return f"$q${text}$q$"


def clean_cell(value: str | None) -> str:
    if value is None or value == "null":
        return ""
    return value.replace("\r\n", "\n").replace("\r", "\n").strip()


def main() -> None:
    with CSV_PATH.open(encoding="utf-8-sig", newline="") as fh:
        rows = list(csv.DictReader(fh))

    missing = [row["id"] for row in rows if row["id"] not in TRANSLATIONS]
    if missing:
        raise SystemExit(f"Missing translations for ids: {missing}")

    parts: list[str] = []
    parts.append(
        """-- Fleet i18n import: paste into Supabase SQL Editor and Run once.
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
"""
    )

    value_blocks: list[str] = []
    for row in rows:
        vid = row["id"]
        tr = TRANSLATIONS[vid]
        block = f"""(
  {q(vid)},
  {q(clean_cell(row.get("name_lv")))},
  {q(tr["name"]["en"])},
  {q(tr["name"]["fr"])},
  {q(tr["name"]["ru"])},
  {q(clean_cell(row.get("summary_lv")))},
  {q(tr["summary"]["en"])},
  {q(tr["summary"]["fr"])},
  {q(tr["summary"]["ru"])},
  {q(clean_cell(row.get("interior_color_lv")))},
  {q(clean_cell(row.get("interior_color_en")))},
  {q(clean_cell(row.get("interior_color_fr")))},
  {q(clean_cell(row.get("interior_color_ru")))},
  {q(clean_cell(row.get("body_color_lv")))},
  {q(clean_cell(row.get("body_color_en")))},
  {q(clean_cell(row.get("body_color_fr")))},
  {q(clean_cell(row.get("body_color_ru")))},
  {q(clean_cell(row.get("description_lv")))},
  {q(tr["description"]["en"])},
  {q(tr["description"]["fr"])},
  {q(tr["description"]["ru"])},
  {q(clean_cell(row.get("extras_lv")))},
  {q(tr["extras"]["en"])},
  {q(tr["extras"]["fr"])},
  {q(tr["extras"]["ru"])},
  {q(clean_cell(row.get("closing_notes_lv")))},
  {q("")},
  {q("")},
  {q("")}
)"""
        value_blocks.append(block)

    parts.append(",\n".join(value_blocks))
    parts.append(
        """;

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
      from unnest(string_to_array(coalesce(i.description_lv, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'en', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.description_en, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'fr', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.description_fr, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'ru', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.description_ru, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb)
  ),
  extras = jsonb_build_object(
    'lv', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.extras_lv, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'en', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.extras_en, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'fr', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.extras_fr, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'ru', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.extras_ru, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb)
  ),
  closing_notes = jsonb_build_object(
    'lv', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.closing_notes_lv, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'en', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.closing_notes_en, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'fr', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.closing_notes_fr, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb),
    'ru', coalesce((
      select jsonb_agg(trim(x) order by ord)
      from unnest(string_to_array(coalesce(i.closing_notes_ru, ''), E'\\n')) with ordinality as t(x, ord)
      where trim(x) <> ''
    ), '[]'::jsonb)
  )
from public.fleet_i18n_import i
where e.id = i.id
   or e.name->>'lv' = i.name_lv;

commit;
"""
    )

    OUT_PATH.write_text("".join(parts), encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
