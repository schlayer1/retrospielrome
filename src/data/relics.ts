// ============================================================
// ARCHÄOLOGISCHE RELIKTE – 5 Historische Fundstücke des Alten Rom
// Versteckte Schätze auf der Karte mit kulturhistorischem Mini-Quiz
// ============================================================

export interface RomanRelic {
  id: string;
  name: string;
  epoch: string;
  year: string;
  findLocation: string;
  icon: string;
  x: number;
  y: number;
  minChapter: number;
  historicalContext: string;
  significance: string;
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
}

export const ROMAN_RELICS: RomanRelic[] = [
  {
    id: 'relic_lupa',
    name: 'Bronzestatue der Kapitolinischen Wölfin (Lupa Romana)',
    epoch: 'Gründungsmythos & Königszeit',
    year: 'ca. 500 v. Chr. (Mythos: 753 v. Chr.)',
    findLocation: 'Lupercal-Höhle am Fuß des Palatin-Hügels',
    icon: '/assets/icons/relic_lupa.png',
    x: 24,
    y: 39,
    minChapter: 1,
    historicalContext:
      'Die berühmte Bronzefigur zeigt die Wölfin (Lupa), die der Sage nach die ausgesetzten Zwillingsbrüder Romulus und Remus am Ufer des Tiber säugte. Als Söhne des Kriegsgottes Mars sollten sie durch den grausamen König Amulius ertränkt werden, doch eine Wölfin und ein Specht retteten sie, bevor der Hirte Faustulus sie aufzog.',
    significance:
      'Die Lupa Romana wurde zum wichtigsten Identitätssymbol Roms: Sie verband die bäuerlich-hirtenhafte Frühzeit am Palatin mit göttlicher Abstammung von Mars und unbezwingbarer Wildheit.',
    question: 'Warum ließ die römische Gründungslegende Romulus und Remus von einer Wölfin säugen?',
    options: [
      'Weil Wölfe in Italien als friedliche Haustiere der Hirten gehalten wurden',
      'Der Wolf war das heilige Tier des Kriegsgottes Mars, des mythischen Vaters der Zwillinge',
      'Weil der erste König Roms ein verkleideter Wolfspriester aus Ägypten war',
    ],
    correctIndex: 1,
  },
  {
    id: 'relic_zwoelftafel',
    name: 'Erztafel des Zwölftafelgesetzes (Lex Duodecim Tabularum)',
    epoch: 'Frühe Römische Republik',
    year: '450 v. Chr.',
    findLocation: 'Rednertribüne (Rostra) auf dem Forum Romanum',
    icon: '/assets/icons/relic_zwoelftafel.png',
    x: 49,
    y: 34,
    minChapter: 3,
    historicalContext:
      'In der frühen Republik kannten nur die adligen Patrizier die ungeschriebenen Gesetze und legten sie oft willkürlich gegen die einfachen Plebejer aus. Erst durch den Streik der Plebejer (Auszug auf den Heiligen Berg) erzwang das Volk 450 v. Chr., dass das Recht auf zwölf Bronzetafeln öffentlich sichtbar auf dem Forum Romanum aufgestellt wurde.',
    significance:
      'Das Zwölftafelgesetz ist das Fundament des gesamten europäischen Rechtswesens: Zum ersten Mal galt in Rom geschriebenes Recht, auf das sich jeder Bürger – ob arm oder reich – vor Gericht berufen konnte.',
    question: 'Welchen entscheidenden Fortschritt brachte das Zwölftafelgesetz (450 v. Chr.) für die Plebejer?',
    options: [
      'Rechtssicherheit durch öffentlich lesbare Gesetze statt geheimer Willkür des Adels',
      'Die sofortige Abschaffung aller Steuern und Schulden im Römischen Reich',
      'Das Recht für jeden Plebejer, ohne Wahl lebenslanger König von Rom zu werden',
    ],
    correctIndex: 0,
  },
  {
    id: 'relic_caesar_denar',
    name: 'Silberdenar des Julius Caesar („Diktator auf Lebenszeit")',
    epoch: 'Krise der Späten Republik',
    year: '44 v. Chr.',
    findLocation: 'Stufen der Curia Iulia am Senatsplatz',
    icon: '/assets/icons/relic_caesar_denar.png',
    x: 58,
    y: 29,
    minChapter: 7,
    historicalContext:
      'Wenige Wochen vor seiner Ermordung an den Iden des März (15. März 44 v. Chr.) ließ Gaius Iulius Caesar Silbermünzen mit seinem eigenen Porträt und dem Titel „DICTATOR PERPETUO" (Diktator auf Lebenszeit) prägen. Zuvor durften auf römischen Münzen nur Götter und längst verstorbene Vorfahren abgebildet werden.',
    significance:
      'Das Münzporträt eines lebenden Politikers galt den republikanischen Senatoren um Brutus und Cassius als unerträglicher Beweis dafür, dass Caesar die Republik zerstören und sich zum König krönen wollte.',
    question: 'Warum löste dieser Silberdenar Caesars im Jahr 44 v. Chr. blankes Entsetzen bei vielen Senatoren aus?',
    options: [
      'Weil die Münze aus wertlosem Blei statt aus echtem Silber gefertigt war',
      'Weil erstmals ein lebender Römer wie ein König mit dem Titel „Diktator auf Lebenszeit" auf Münzen erschien',
      'Weil Caesar auf der Rückseite Karthago zur neuen Hauptstadt erklärte',
    ],
    correctIndex: 1,
  },
  {
    id: 'relic_augustus_statue',
    name: 'Marmorfragment des Augustus von Prima Porta',
    epoch: 'Frühe Kaiserzeit (Prinzipat & Pax Romana)',
    year: 'ca. 20 v. Chr.',
    findLocation: 'Friedensaltar (Ara Pacis) auf dem Marsfeld',
    icon: '/assets/icons/relic_augustus_statue.png',
    x: 76,
    y: 25,
    minChapter: 8,
    historicalContext:
      'Die berühmte Panzerstatue zeigt den ersten Kaiser Augustus in Feldherrenpose als Friedensbringer. Auf seinem Brustpanzer ist die friedliche Rückgabe der römischen Legionsadler durch die Parther dargestellt, während zu seinen Füßen der kleine Liebesgott Amor auf einem Delfin reitet – ein Hinweis auf die Göttin Venus als Stammutter der julischen Familie.',
    significance:
      'Meisterwerk der politischen Bildpropaganda: Augustus inszenierte sich gleichzeitig als unbesiegbarer Befehlshaber, göttlicher Nachfahre der Venus und Garant des Weltfriedens (Pax Romana).',
    question: 'Welche politische Botschaft verbreitete Kaiser Augustus mit seinen Statuen im gesamten Reich?',
    options: [
      'Dass seine Herrschaft göttlichen Segen, militärische Sicherheit und den Römerfrieden (Pax Romana) garantiert',
      'Dass er das Römische Reich freiwillig an die Griechen zurückgeben wollte',
      'Dass alle Bürger Roms künftig als Gladiatoren in der Arena kämpfen müssen',
    ],
    correctIndex: 0,
  },
  {
    id: 'relic_konstantin_medaillon',
    name: 'Christogramm-Medaillon Kaiser Konstantins (Chi-Rho)',
    epoch: 'Spätantike & Konstantinische Wende',
    year: '315 n. Chr.',
    findLocation: 'Konstantinsbasilika & Katakomben-Zugang',
    icon: '/assets/icons/relic_konstantin_medaillon.png',
    x: 86,
    y: 49,
    minChapter: 11,
    historicalContext:
      'Vor der Entscheidungsschlacht an der Milvischen Brücke (312 n. Chr.) vor den Toren Roms ließ Kaiser Konstantin das frühchristliche Zeichen Chi-Rho (die verschlungenen griechischen Anfangsbuchstaben Χ und Ρ für „Christus") auf die Schilde seiner Legionäre malen – unter der Losung „In hoc signo vinces" (In diesem Zeichen wirst du siegen).',
    significance:
      'Mit der Mailänder Vereinbarung (313 n. Chr.) beendete Konstantin die jahrhundertelange Christenverfolgung. Aus einer verfolgten Untergrundgemeinde in den Katakomben wurde binnen weniger Jahrzehnte die Staatskirche des Imperiums.',
    question: 'Was veränderte sich durch die „Konstantinische Wende" ab 312/313 n. Chr. grundlegend im Römischen Reich?',
    options: [
      'Das Christentum wurde von einer verfolgten Minderheit zur staatlich geförderten Religion der Kaiser',
      'Alle römischen Straßen und Aquädukte wurden auf Befehl des Kaisers abgerissen',
      'Latein wurde verboten und durch die ägyptische Hieroglyphenschrift ersetzt',
    ],
    correctIndex: 0,
  },
];
