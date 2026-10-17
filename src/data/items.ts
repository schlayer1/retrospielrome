export type RomanItemId =
  | 'getreide'
  | 'puls_brei'
  | 'panis_brot'
  | 'oliven'
  | 'olivenoel'
  | 'weintrauben'
  | 'garum_fisch'
  | 'ziegenkaese'
  | 'wasser'
  | 'hacke'
  | 'sichel'
  | 'gladius'
  | 'scutum'
  | 'fasces'
  | 'corvus_enterbruecke'
  | 'gladiator_dreizack'
  | 'oellampe'
  | 'holz'
  | 'tuffstein'
  | 'marmor'
  | 'ziegel'
  | 'opus_caementicium'
  | 'eisenerz'
  | 'silbererz'
  | 'wolle'
  | 'samen'
  | 'zwoelftafeln'
  | 'toga_candida'
  | 'ackergesetz_rolle'
  | 'silber_denar'
  | 'legionsadler'
  | 'lorbeerkranz_rom'
  | 'meilenstein'
  | 'chi_rho_schild'
  | 'pergament_codex';

export type RomanItemCategory = 'tool' | 'food' | 'material' | 'culture';

export interface RomanItemDef {
  id: RomanItemId;
  name: string;
  category: RomanItemCategory;
  desc: string;
  description: string;
  historicalNote: string;
  icon: string;
  foodValue?: number;
  lore?: string;
}

export interface RomanBuildingDef {
  id: string;
  name: string;
  helperName: string;
  x: number;
  y: number;
  cost: Partial<Record<RomanItemId, number>>;
  desc: string;
  description: string;
  historicalNote: string;
  unlockedInChapter: number;
  minChapter: number;
}

export interface RomanRecipe {
  id: string;
  name: string;
  desc: string;
  category: 'economy' | 'republic' | 'empire';
  minChapter: number;
  cost: Partial<Record<RomanItemId, number>>;
  inputs: Partial<Record<RomanItemId, number>>;
  result: { item: RomanItemId; count: number };
  output: RomanItemId;
  outputCount: number;
  requiresBuilding?: string;
}

export interface RomanTradeOffer {
  id: string;
  name: string;
  merchant: string;
  desc: string;
  description: string;
  giveItem: RomanItemId;
  giveCount: number;
  receiveItem: RomanItemId;
  receiveCount: number;
}

const rawItems: Record<
  RomanItemId,
  {
    name: string;
    category: RomanItemCategory;
    desc: string;
    lore?: string;
    foodValue?: number;
  }
> = {
  getreide: {
    name: 'Emmer-Getreide (Far)',
    category: 'material',
    desc: 'Auf den fruchtbaren Äckern Latiums geerntetes Urkorn. Grundlage für den römischen Puls-Brei und das Panis-Brot.',
    lore: 'Getreide war in Rom so lebenswichtig, dass Kaiser später kostenlose Getreiderationen („Panem et circenses“) an hunderttausende Bürger verteilten.',
  },
  puls_brei: {
    name: 'Römischer Puls-Getreidebrei',
    category: 'food',
    foodValue: 40,
    desc: 'Der traditionelle nahrhafte Getreidebrei der frühen Römer, Bauern und Legionäre aus geschrotetem Emmer, Wasser und Salz.',
    lore: 'Bevor sich Bäckereien verbreiteten, war „Puls“ über Jahrhunderte das tägliche Hauptgericht jeder römischen Familie.',
  },
  panis_brot: {
    name: 'Römisches Rundbrot (Panis)',
    category: 'food',
    foodValue: 45,
    desc: 'Im Steinofen gebackener, in acht Stücke vorgeschnittener Brotlaib nach Vorbild der Funde aus Pompeji.',
    lore: 'Öffentliche Großbäckereien versorgten die wachsende Bevölkerung Roms täglich mit frischem Panis.',
  },
  oliven: {
    name: 'Sabiner Oliven',
    category: 'food',
    foodValue: 25,
    desc: 'Erntefrische Oliven von den Hügeln rund um das Tibertal. Direkt verzehrbar oder für Olivenöl nutzbar.',
    lore: 'Der Olivenbaum galt im gesamten Mittelmeerraum als Symbol für Frieden, Wohlstand und sesshafte Landwirtschaft.',
  },
  olivenoel: {
    name: 'Römisches Olivenöl',
    category: 'food',
    foodValue: 35,
    desc: 'Unverzichtbar für die römische Küche, die Körperpflege in den Thermen und als Brennstoff für Ton-Öllampen (Lucernae).',
    lore: 'In riesigen Tonamphoren wurde Olivenöl aus Italien, Hispanien und Nordafrika nach Rom verschifft.',
  },
  weintrauben: {
    name: 'Süße Weintrauben',
    category: 'food',
    foodValue: 28,
    desc: 'Sonnengereifte Trauben von den Rebhängen Latiums und Kampaniens.',
    lore: 'Römischer Wein wurde stets mit Wasser verdünnt und oft mit Honig oder Gewürzen (Mulsum) verfeinert.',
  },
  garum_fisch: {
    name: 'Tiberfisch & Garum-Würze',
    category: 'food',
    foodValue: 38,
    desc: 'Frischer Fisch aus dem Tiber und dem Hafen Ostia, verfeinert mit der berühmten römischen Fischsauce (Garum).',
    lore: 'Garum war das „Ketchup der Römer“: Nahezu jedes Gericht wurde mit dieser würzigen Sauce aus fermentiertem Fisch abgeschmeckt.',
  },
  ziegenkaese: {
    name: 'Palatin-Schafskäse (Caseus)',
    category: 'food',
    foodValue: 35,
    desc: 'Kräftiger Hirtenkäse der Siedler auf dem Palatin-Hügel – ideale Marschverpflegung für Bauern und Soldaten.',
    lore: 'Schon die Hirten zur Zeit des Romulus stellten haltbaren Schafs- und Ziegenkäse her.',
  },
  wasser: {
    name: 'Quell- & Aquäduktwasser',
    category: 'material',
    desc: 'Klares Wasser zum Backen, zum Mischen von römischem Beton (Opus Caementicium) und für die Thermen.',
    lore: 'Elf riesige Aquädukte versorgten die Millionenstadt Rom täglich mit frischem Gebirgswasser.',
  },
  hacke: {
    name: 'Römische Ackerhacke (Sarculum)',
    category: 'tool',
    desc: 'Eisernes Ackergerät der römischen Kleinbauern zum Lockern des Bodens vor der Aussaat.',
    lore: 'Wehrhafte Kleinbauern wie Cincinnatus bestellten ihre Felder in der frühen Republik eigenhändig.',
  },
  sichel: {
    name: 'Erntesichel (Falx)',
    category: 'tool',
    desc: 'Geschwungene eiserne Sichel zum Einbringen der reifen Getreideernte.',
    lore: 'Nach den Sommerfeldzügen kehrten die Bauern-Soldaten rechtzeitig zur Getreideernte auf ihre Höfe zurück.',
  },
  gladius: {
    name: 'Römisches Kurzschwert (Gladius)',
    category: 'tool',
    desc: 'Das beidseitig geschliffene Stich- und Hiebschwert der römischen Legionäre für den engen Formationskampf.',
    lore: 'Nach dem spanischen Vorbild („Gladius Hispaniensis“) geschmiedet, machte es die römische Infanterie im Nahkampf nahezu unbesiegbar.',
  },
  scutum: {
    name: 'Römischer Turmschild (Scutum)',
    category: 'tool',
    desc: 'Großer, halbrund gebogener Rechteckschild mit eisernem Schildbuckel (Umbo) und den goldenen Adlerschwingen Jupiters.',
    lore: 'Mit dem Scutum bildeten die Legionäre die berühmte „Schildkrötenformation“ (Testudo), an der jeder Pfeilhagel abprallte.',
  },
  fasces: {
    name: 'Rutenbündel der Liktoren (Fasces)',
    category: 'tool',
    desc: 'Aus Birkenruten mit roten Lederriemen gebundenes Amtszeichen der römischen Konsuln mit eingestecktem Beil.',
    lore: 'Die Liktoren schritten den gewählten Beamten (Magistraten) voran und symbolisierten deren rechtmäßige Amtsgewalt (Imperium).',
  },
  corvus_enterbruecke: {
    name: 'Enterbrücke (Corvus / Rabenschnabel)',
    category: 'tool',
    desc: 'Schwenkbare Holzbrücke mit schwerem Eisendorn an der Unterseite, mit der die Landmacht Rom Karthagos Kriegsschiffe enterte.',
    lore: 'Durch den „Corvus“ verwandelten die Römer in den Punischen Kriegen die Seeschlacht kurzerhand in einen Landkampf auf den Schiffsdecks!',
  },
  gladiator_dreizack: {
    name: 'Gladiatoren-Dreizack (Fuscina)',
    category: 'tool',
    desc: 'Waffe des Retiarius-Gladiators in der Arena und Symbol für den großen Freiheitskampf unter Spartacus (73–71 v. Chr.).',
    lore: 'Über 70.000 entflohene Sklaven schlossen sich Spartacus im Kampf gegen die Unterdrückung an.',
  },
  oellampe: {
    name: 'Römische Ton-Öllampe (Lucerna)',
    category: 'tool',
    desc: 'Gebrannte Terrakotta-Lampe, gefüllt mit Olivenöl. Spendet Licht in den dunklen Mietskasernen (Insulae) und den unterirdischen Katakomben.',
    lore: 'Frühe Christen verzierten ihre Öllampen oft mit dem geheimen Fischsymbol (Ichthys).',
  },
  holz: {
    name: 'Zypressen- & Eichenholz',
    category: 'material',
    desc: 'Wichtiges Bauholz für Schiffsdecks, Katapulte, Dachstühle und Palisaden der Legionslager.',
    lore: 'Die Wälder Latiums und des Apennin lieferten das Holz für Roms Flotten und Baugerüste.',
  },
  tuffstein: {
    name: 'Römischer Tuff- & Travertinstein',
    category: 'material',
    desc: 'Vulkanischer Baustein aus Latium für Grundmauern, Pflasterstraßen (Via Appia), Aquäduktpfeiler und das Kolosseum.',
    lore: 'In den weichen Tuffstein vor den Stadtmauern gruben die frühen Christen auch ihre unterirdischen Katakomben.',
  },
  marmor: {
    name: 'Carrara-Marmor',
    category: 'material',
    desc: 'Strahlend weißer Marmor für Tempel, Triumphbögen, Kaiserstatuen und den Friedensaltar (Ara Pacis).',
    lore: 'Kaiser Augustus rühmte sich am Ende seines Lebens: „Ich fand Rom als eine Stadt aus Ziegeln vor und hinterließ sie als eine Stadt aus Marmor.“',
  },
  ziegel: {
    name: 'Römische Tonziegel (Tegulae)',
    category: 'material',
    desc: 'Feuerfest gebrannte rote Lehmziegel für Dächer, Thermen, Basiliken und mehrstöckige Wohnhäuser.',
    lore: 'Römische Ziegel trugen oft den Stempel der Ziegelei oder der Legion, die sie gebrannt hatte.',
  },
  opus_caementicium: {
    name: 'Römischer Beton (Opus Caementicium)',
    category: 'material',
    desc: 'Revolutionärer römischer Gussmörtel aus Vulkanasche (Puzzolane), Kalk, Wasser und Gesteinsbrocken – härtet sogar unter Wasser aus!',
    lore: 'Dank Opus Caementicium konnten die Römer riesige Kuppeln (wie das Pantheon), Hafenmolen und kilometerlange Aquäduktbögen errichten, die bis heute stehen.',
  },
  eisenerz: {
    name: 'Etruskisches Eisenerz',
    category: 'material',
    desc: 'Von der Insel Elba und aus den Sabiner Bergen gewonnenes Erz für Schwerter, Rüstungen und Werkzeuge.',
    lore: 'Die Eisenverarbeitung übernahmen die Römer früh von ihren nördlichen Nachbarn, den Etruskern.',
  },
  silbererz: {
    name: 'Hispanisches Silbererz',
    category: 'material',
    desc: 'Wertvolles Silbererz zur Prägung des römischen Denars, der einheitlichen Reichswährung.',
    lore: 'Nach dem Sieg über Karthago fielen die reichen Silberminen Spaniens (Hispania) an Rom.',
  },
  wolle: {
    name: 'Schafwolle aus Latium',
    category: 'material',
    desc: 'Weiche weiße Wolle zum Weben der Tunika und der feierlichen Bürger-Toga.',
    lore: 'Das Spinnen und Weben von Wolle galt im alten Rom als höchste Tugend des Hauses.',
  },
  samen: {
    name: 'Emmer-Saatgut',
    category: 'material',
    desc: 'Körner für die Aussaat auf den römischen Ackerparzellen.',
    lore: 'Jedes Frühjahr baten die Bauern die Göttin Ceres um reiche Ernte.',
  },
  zwoelftafeln: {
    name: 'Zwölftafelgesetze aus Bronze',
    category: 'culture',
    desc: 'Auf zwölf Bronzetafeln eingegossenes erstes geschriebenes Recht Roms (450 v. Chr.), öffentlich auf dem Forum Romanum aufgestellt.',
    lore: 'Durch das Zwölftafelgesetz erkämpften die Plebejer im Ständekampf Rechtssicherheit gegen die Willkür patrizischer Richter.',
  },
  toga_candida: {
    name: 'Weiße Bürger-Toga (Toga Virilis)',
    category: 'culture',
    desc: 'Das mit Kalk strahlend weiß gebleichte Ehrengewand freier römischer Bürger und Senatoren (mit Purpurstreifen).',
    lore: 'Amtsbewerber trugen eine besonders strahlend weiße „Toga candida“ – davon leitet sich unser heutiges Wort „Kandidat“ ab!',
  },
  ackergesetz_rolle: {
    name: 'Ackergesetz-Rolle (Lex Agraria)',
    category: 'culture',
    desc: 'Gesetzesentwurf des Volkstribuns Tiberius Gracchus (133 v. Chr.) zur gerechten Verteilung von Staatsland an verarmte Kleinbauern.',
    lore: 'Gracchus wollte den Besitz an Staatsland (Ager Publicus) begrenzen, um den freien Bauernstand gegen die Sklaven-Latifundien zu retten.',
  },
  silber_denar: {
    name: 'Römischer Silber-Denar',
    category: 'culture',
    desc: 'Die wichtigste Silbermünze des Römischen Reiches. Gaius Iulius Caesar ließ als erster Römer schon zu Lebzeiten sein eigenes Porträt darauf prägen!',
    lore: 'Eine einheitliche Währung vom Atlantik bis zum Euphrat erleichterte den Fernhandel enorm.',
  },
  legionsadler: {
    name: 'Goldener Legionsadler (Aquila)',
    category: 'culture',
    desc: 'Das heiligste Feldzeichen jeder römischen Legion mit dem goldenen Adler Jupiters und dem Schriftzug SPQR.',
    lore: 'Der Verlust des Legionsadlers in der Schlacht galt als größte Schande Roms; der Adlerträger (Aquilifer) verteidigte ihn mit seinem Leben.',
  },
  lorbeerkranz_rom: {
    name: 'Kaiserlicher Lorbeerkranz (Corona Triumphalis)',
    category: 'culture',
    desc: 'Ehrenkranz der Triumphatoren und römischen Kaiser als Zeichen des Sieges und der Pax Romana.',
    lore: 'Bei Triumphzügen und im Kaiserkult trugen Caesar und Augustus den Lorbeerkranz Apollons.',
  },
  meilenstein: {
    name: 'Römischer Meilenstein (Miliarium)',
    category: 'culture',
    desc: 'Steinerne Straßensäule, die alle 1.000 Doppelschritte („mille passus“ = ca. 1,48 km) die Entfernung bis zum Forum Romanum angab.',
    lore: 'Über 80.000 Kilometer gepflasterte Fernstraßen verbanden alle Provinzen mit Rom („Alle Wege führen nach Rom“).',
  },
  chi_rho_schild: {
    name: 'Konstantinischer Chi-Rho-Schild (☧)',
    category: 'culture',
    desc: 'Mit den griechischen Anfangsbuchstaben Χ (Chi) und Ρ (Rho) für „Christus“ geschmücktes Feldzeichen Kaiser Konstantins (312 n. Chr.).',
    lore: 'Unter dem Zeichen Chi-Rho siegte Konstantin 312 n. Chr. an der Milvischen Brücke und leitete die Konstantinische Wende ein.',
  },
  pergament_codex: {
    name: 'Spätantiker Pergament-Codex (Vivarium)',
    category: 'culture',
    desc: 'Gebundenes Buch aus haltbarem Pergament, in dem Mönche wie Cassiodor beim Untergang Westroms (476 n. Chr.) das Wissen der Antike für Europa retteten.',
    lore: 'In der Spätantike löste der gebundene Pergament-Codex die empfindliche Papyrusrolle ab.',
  },
};

export const ITEMS: Record<RomanItemId, RomanItemDef> = Object.fromEntries(
  Object.entries(rawItems).map(([id, val]) => [
    id,
    {
      id: id as RomanItemId,
      name: val.name,
      category: val.category,
      desc: val.desc,
      description: val.desc,
      historicalNote: val.lore || val.desc,
      lore: val.lore,
      foodValue: val.foodValue,
      icon: `/assets/icons/${id}.png`,
    },
  ])
) as Record<RomanItemId, RomanItemDef>;

export const BUILDINGS: RomanBuildingDef[] = [
  {
    id: 'vesta_herd',
    name: 'Heiliger Herd der Vesta & Horreum',
    helperName: 'Vestalin Aemilia',
    x: 33,
    y: 40,
    cost: { holz: 2, tuffstein: 1 },
    desc: 'Rundtempel des ewigen Herdfeuers und Getreidespeicher für die junge Siedlung auf dem Palatin-Hügel (Kapitel 1).',
    description: 'Rundtempel des ewigen Herdfeuers und Getreidespeicher für die junge Siedlung auf dem Palatin-Hügel.',
    historicalNote: 'Solange das heilige Feuer der Göttin Vesta brannte, stand Rom unter dem Schutz der Götter.',
    unlockedInChapter: 1,
    minChapter: 1,
  },
  {
    id: 'curia_senat',
    name: 'Curia Hostilia (Senatshaus am Forum)',
    helperName: 'Senator Valerius',
    x: 54,
    y: 28,
    cost: { tuffstein: 2, holz: 2 },
    desc: 'Versammlungsort des Römischen Senats und Rednerbühne (Rostra) für die Republik „SPQR“ (Kapitel 2).',
    description: 'Versammlungsort des Römischen Senats für die Republik „Senatus Populusque Romanus“.',
    historicalNote: 'In der Curia am Forum Romanum berieten 300 Senatoren über Gesetze, Krieg und Frieden.',
    unlockedInChapter: 2,
    minChapter: 2,
  },
  {
    id: 'legion_schmiede',
    name: 'Republikanische Legionsschmiede & Kastell',
    helperName: 'Waffenschmied Marcus',
    x: 66,
    y: 21,
    cost: { tuffstein: 2, eisenerz: 2 },
    desc: 'Heereswerkstatt und Lager auf dem Marsfeld für Gladius-Schwerter, Scutum-Schilde und Legionsadler (Kapitel 3).',
    description: 'Heereswerkstatt und Kastell auf dem Marsfeld für die Ausrüstung der römischen Bürgerlegionen.',
    historicalNote: 'Auf dem Marsfeld (Campus Martius) außerhalb des Pomeriums musterten und übten die römischen Heere.',
    unlockedInChapter: 3,
    minChapter: 3,
  },
  {
    id: 'ostia_werft',
    name: 'Flottenarsenal & Hafen von Ostia',
    helperName: 'Navarch Gaius Duilius',
    x: 19,
    y: 55,
    cost: { holz: 2, eisenerz: 1 },
    desc: 'Kriegs- und Handelshafen an der Tibermündung für den Kampf gegen Karthago und den Mittelmeerhandel (Kapitel 4).',
    description: 'Kriegs- und Handelshafen an der Tibermündung für die Punischen Kriege und den Seehandel.',
    historicalNote: 'In den Punischen Kriegen baute Rom binnen kürzester Zeit eine Kriegsflotte mit Enterbrücken (Corvus) gegen Karthago.',
    unlockedInChapter: 4,
    minChapter: 4,
  },
  {
    id: 'aqua_romana',
    name: 'Römischer Aquädukt & Thermenbrunnen',
    helperName: 'Baumeister Vitruv',
    x: 62,
    y: 33,
    cost: { tuffstein: 2, opus_caementicium: 1 },
    desc: 'Monumentale Bogenwasserleitung der Pax Romana, die täglich Millionen Liter frisches Quellwasser in die Stadt leitet (Kapitel 8).',
    description: 'Monumentale Bogenwasserleitung der Pax Romana unter Kaiser Augustus.',
    historicalNote: 'Mit präzisem Gefälle führten die Aquädukte Gebirgswasser über Täler hinweg direkt in Roms Brunnen und Thermen.',
    unlockedInChapter: 8,
    minChapter: 8,
  },
  {
    id: 'kolosseum_bau',
    name: 'Amphitheatrum Flavium (Kolosseum)',
    helperName: 'Spielleiter Flavio',
    x: 71,
    y: 36,
    cost: { tuffstein: 2, marmor: 2 },
    desc: 'Das größte Amphitheater der Welt für 50.000 Zuschauer – Schauplatz von „Brot und Spielen“ auf dem Höhepunkt der Kaiserzeit (Kapitel 10).',
    description: 'Das weltberühmte Amphitheater für 50.000 Zuschauer im Zentrum des kaiserlichen Roms.',
    historicalNote: '80 n. Chr. eingeweiht, besaß das Kolosseum 80 Eingänge, ein Sonnensegel (Velarium) und unterirdische Hebebühnen.',
    unlockedInChapter: 10,
    minChapter: 10,
  },
  {
    id: 'basilika_bau',
    name: 'Konstantinsbasilika & Kloster-Skriptorium',
    helperName: 'Schreiber Bruder Lukas',
    x: 83,
    y: 40,
    cost: { marmor: 2, ziegel: 2 },
    desc: 'Spätantike Hallenkirche und Schreibstube, in der das Christentum zur Staatsreligion aufsteigt und antike Schriften bewahrt werden (Kapitel 11 & 12).',
    description: 'Spätantike christliche Basilika und klösterliche Schreibstube (Skriptorium).',
    historicalNote: 'Nach der Konstantinischen Wende (312/313 n. Chr.) wurden monumentale Basiliken zum Vorbild des europäischen Kirchenbaus.',
    unlockedInChapter: 11,
    minChapter: 11,
  },
];

interface RawRecipe {
  id: string;
  name: string;
  desc: string;
  category: 'economy' | 'republic' | 'empire';
  minChapter: number;
  cost: Partial<Record<RomanItemId, number>>;
  result: { item: RomanItemId; count: number };
}

const rawRecipes: RawRecipe[] = [
  {
    id: 'puls_brei',
    name: 'Römischen Puls-Getreidebrei kochen',
    desc: 'Kocht aus geerntetem Emmer-Getreide den nahrhaften Brei der frühen Römer am Palatin (Kapitel 1).',
    category: 'economy',
    minChapter: 1,
    cost: { getreide: 2 },
    result: { item: 'puls_brei', count: 2 },
  },
  {
    id: 'panis_brot',
    name: 'Panis-Rundbrot backen',
    desc: 'Backt knuspriges römisches Acht-Stücke-Brot im Steinofen (Kapitel 5).',
    category: 'economy',
    minChapter: 1,
    cost: { getreide: 2, wasser: 1 },
    result: { item: 'panis_brot', count: 2 },
  },
  {
    id: 'olivenoel',
    name: 'Römisches Olivenöl pressen',
    desc: 'Presst frische Sabiner Oliven zu feinem Öl für Küche, Thermen und Katakomben-Öllampen.',
    category: 'economy',
    minChapter: 1,
    cost: { oliven: 2 },
    result: { item: 'olivenoel', count: 1 },
  },
  {
    id: 'ziegel',
    name: 'Römische Tonziegel (Tegulae) brennen',
    desc: 'Formt und brennt feuerfeste Dach- und Mauerziegel aus Tuffstein-Lehm.',
    category: 'economy',
    minChapter: 1,
    cost: { tuffstein: 2 },
    result: { item: 'ziegel', count: 2 },
  },
  {
    id: 'hacke',
    name: 'Römische Ackerhacke (Sarculum) schmieden',
    desc: 'Schmiedet das eiserne Ackergerät der wehrhaften Kleinbauern.',
    category: 'economy',
    minChapter: 1,
    cost: { holz: 1, eisenerz: 1 },
    result: { item: 'hacke', count: 1 },
  },
  {
    id: 'sichel',
    name: 'Erntesichel (Falx) schmieden',
    desc: 'Schmiedet eine geschwungene eiserne Sichel für die Getreideernte.',
    category: 'economy',
    minChapter: 1,
    cost: { holz: 1, eisenerz: 1 },
    result: { item: 'sichel', count: 1 },
  },
  {
    id: 'fasces',
    name: 'Rutenbündel der Liktoren (Fasces) binden',
    desc: 'Bindet Birkenruten und Beil zum Amtszeichen der Republikanischen Konsuln (Kapitel 2).',
    category: 'republic',
    minChapter: 2,
    cost: { holz: 2, eisenerz: 1 },
    result: { item: 'fasces', count: 1 },
  },
  {
    id: 'zwoelftafeln',
    name: 'Zwölftafelgesetze in Bronze gießen',
    desc: 'Verewigt das für Patrizier und Plebejer gleichermaßen gültige Recht auf zwölf Tafeln (Kapitel 3).',
    category: 'republic',
    minChapter: 3,
    cost: { eisenerz: 1, tuffstein: 1 },
    result: { item: 'zwoelftafeln', count: 1 },
  },
  {
    id: 'toga_candida',
    name: 'Weiße Bürger-Toga weben',
    desc: 'Webt aus feiner Latium-Wolle das würdevolle Ehrengewand römischer Bürger (Kapitel 3).',
    category: 'republic',
    minChapter: 3,
    cost: { wolle: 2 },
    result: { item: 'toga_candida', count: 1 },
  },
  {
    id: 'scutum',
    name: 'Legionärsschild (Scutum) fertigen',
    desc: 'Baut den gebogenen Rechteckschild mit Eisenbuckel für die Schildkrötenformation (Kapitel 4).',
    category: 'republic',
    minChapter: 4,
    cost: { holz: 2, eisenerz: 1 },
    result: { item: 'scutum', count: 1 },
  },
  {
    id: 'corvus_enterbruecke',
    name: 'Enterbrücke (Corvus) konstruieren',
    desc: 'Baut die schwenkbare Enterbrücke mit Eisendorn gegen Karthagos Flotte (Kapitel 4).',
    category: 'republic',
    minChapter: 4,
    cost: { holz: 2, eisenerz: 2 },
    result: { item: 'corvus_enterbruecke', count: 1 },
  },
  {
    id: 'ackergesetz_rolle',
    name: 'Ackergesetz-Rolle (Lex Agraria) verfassen',
    desc: 'Schreibt die Landreform des Volkstribuns Tiberius Gracchus für die Kleinbauern nieder (Kapitel 5).',
    category: 'republic',
    minChapter: 5,
    cost: { olivenoel: 1, getreide: 1 },
    result: { item: 'ackergesetz_rolle', count: 1 },
  },
  {
    id: 'gladiator_dreizack',
    name: 'Gladiatoren-Dreizack (Fuscina) schmieden',
    desc: 'Schmiedet die Arena-Waffe für den Freiheitskampf unter Spartacus (Kapitel 6).',
    category: 'republic',
    minChapter: 6,
    cost: { eisenerz: 2, holz: 1 },
    result: { item: 'gladiator_dreizack', count: 1 },
  },
  {
    id: 'gladius',
    name: 'Römisches Kurzschwert (Gladius) schmieden',
    desc: 'Schmiedet das gefürchtete Kurzschwert der römischen Legionen (Kapitel 6).',
    category: 'republic',
    minChapter: 6,
    cost: { eisenerz: 2, holz: 1 },
    result: { item: 'gladius', count: 1 },
  },
  {
    id: 'silber_denar',
    name: 'Römischen Silber-Denar prägen',
    desc: 'Prägt Silbermünzen für Sold, Handel und Caesars Triumph (Kapitel 7).',
    category: 'republic',
    minChapter: 7,
    cost: { silbererz: 2 },
    result: { item: 'silber_denar', count: 2 },
  },
  {
    id: 'legionsadler',
    name: 'Goldenen Legionsadler (Aquila) schmieden',
    desc: 'Fertigt das heilige SPQR-Feldzeichen für Caesars Marsch über den Rubikon (Kapitel 7).',
    category: 'republic',
    minChapter: 7,
    cost: { silber_denar: 1, eisenerz: 1 },
    result: { item: 'legionsadler', count: 1 },
  },
  {
    id: 'opus_caementicium',
    name: 'Römischen Beton (Opus Caementicium) mischen',
    desc: 'Mischt Vulkanasche, Tuffstein und Wasser zum unverwüstlichen römischen Gussbeton (Kapitel 8).',
    category: 'empire',
    minChapter: 8,
    cost: { tuffstein: 2, wasser: 1 },
    result: { item: 'opus_caementicium', count: 1 },
  },
  {
    id: 'lorbeerkranz_rom',
    name: 'Kaiserlichen Lorbeerkranz flechten',
    desc: 'Windet den Ehrenkranz für Kaiser Augustus und die Pax Romana (Kapitel 8).',
    category: 'empire',
    minChapter: 8,
    cost: { oliven: 2 },
    result: { item: 'lorbeerkranz_rom', count: 1 },
  },
  {
    id: 'oellampe',
    name: 'Römische Ton-Öllampe (Lucerna) fertigen',
    desc: 'Füllt eine gebrannte Tonlampe mit Olivenöl für den Abstieg in die Katakomben (Kapitel 9).',
    category: 'empire',
    minChapter: 9,
    cost: { ziegel: 1, olivenoel: 1 },
    result: { item: 'oellampe', count: 1 },
  },
  {
    id: 'meilenstein',
    name: 'Römischen Meilenstein (Miliarium) meißeln',
    desc: 'Haut eine Entfernungsstele für das 80.000 km lange Straßennetz unter Kaiser Trajan (Kapitel 10).',
    category: 'empire',
    minChapter: 10,
    cost: { tuffstein: 2, marmor: 1 },
    result: { item: 'meilenstein', count: 1 },
  },
  {
    id: 'chi_rho_schild',
    name: 'Konstantinischen Chi-Rho-Schild (☧) fertigen',
    desc: 'Bemalt einen Legionsschild mit dem Christusmonogramm für die Schlacht an der Milvischen Brücke (Kapitel 11).',
    category: 'empire',
    minChapter: 11,
    cost: { holz: 1, eisenerz: 1 },
    result: { item: 'chi_rho_schild', count: 1 },
  },
  {
    id: 'pergament_codex',
    name: 'Spätantiken Pergament-Codex binden',
    desc: 'Bindet einen beständigen Codex zur Rettung des antiken Wissens ins Mittelalter (Kapitel 12).',
    category: 'empire',
    minChapter: 12,
    cost: { wolle: 1, olivenoel: 1 },
    result: { item: 'pergament_codex', count: 1 },
  },
];

export const RECIPES: RomanRecipe[] = rawRecipes.map((r) => ({
  ...r,
  inputs: r.cost,
  output: r.result.item,
  outputCount: r.result.count,
}));

export const TRADES: RomanTradeOffer[] = [
  {
    id: 'trade_marmor',
    name: 'Carrara-Marmor aus Etrurien',
    merchant: 'Marmorhändler aus Luna (Carrara)',
    desc: 'Tausche 1× Silber-Denar gegen 2× Blöcke edlen weißen Carrara-Marmor.',
    description: 'Tausche 1× Silber-Denar gegen 2× Blöcke edlen weißen Carrara-Marmor.',
    giveItem: 'silber_denar',
    giveCount: 1,
    receiveItem: 'marmor',
    receiveCount: 2,
  },
  {
    id: 'trade_korn_aegypten',
    name: 'Ägyptische Kornflotte in Ostia',
    merchant: 'Kapitän der Alexandria-Kornflotte',
    desc: 'Tausche 1× Römisches Olivenöl gegen 3× Emmer-Getreide aus der Kornkammer Ägyptens.',
    description: 'Tausche 1× Römisches Olivenöl gegen 3× Emmer-Getreide aus der Kornkammer Ägyptens.',
    giveItem: 'olivenoel',
    giveCount: 1,
    receiveItem: 'getreide',
    receiveCount: 3,
  },
  {
    id: 'trade_silber_hispania',
    name: 'Silberlieferung aus Hispania',
    merchant: 'Fernhändler aus Carthago Nova',
    desc: 'Exportiere 2× Römische Tonziegel und erhalte 2× Hispanisches Silbererz.',
    description: 'Exportiere 2× Römische Tonziegel und erhalte 2× Hispanisches Silbererz.',
    giveItem: 'ziegel',
    giveCount: 2,
    receiveItem: 'silbererz',
    receiveCount: 2,
  },
  {
    id: 'trade_eisen_elba',
    name: 'Eisenerz von der Insel Ilva (Elba)',
    merchant: 'Etruskischer Erzschiffer',
    desc: 'Tausche 2× Weintrauben gegen 2× Etruskisches Eisenerz für die Legionsschmiede.',
    description: 'Tausche 2× Weintrauben gegen 2× Etruskisches Eisenerz für die Legionsschmiede.',
    giveItem: 'weintrauben',
    giveCount: 2,
    receiveItem: 'eisenerz',
    receiveCount: 2,
  },
  {
    id: 'trade_kaese_sabiner',
    name: 'Sabinischer Hirtenkäse',
    merchant: 'Hirtenhändler vom Palatin',
    desc: 'Tausche 2× Oliven gegen 2× nahrhaften Palatin-Schafskäse.',
    description: 'Tausche 2× Oliven gegen 2× nahrhaften Palatin-Schafskäse.',
    giveItem: 'oliven',
    giveCount: 2,
    receiveItem: 'ziegenkaese',
    receiveCount: 2,
  },
];
