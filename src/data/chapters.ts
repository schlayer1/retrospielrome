export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChapterData {
  id: number;
  title: string;
  subtitle: string;
  year: string;
  mentorId: string;
  mentorName: string;
  mentorRole: string;
  introDialog: string[];
  questDescription: string;
  hints: string[];
  quiz: QuizQuestion[];
  summary: string;
  unlocksText: string;
}

// ============================================================
// INTERAKTIVE FACHBEGRIFF-HERVORHEBUNG (für Dialog-Tooltips)
// ============================================================
export const HIGHLIGHT_TERMS: Record<string, string> = {
  'Pomerium': 'pomerium',
  'Lupa Romana': 'lupa_romana',
  'Senat': 'senat',
  'Senats': 'senat',
  'Senatoren': 'senat',
  'Res Publica': 'res_publica',
  'Republik': 'res_publica',
  'Konsul': 'konsul',
  'Konsuln': 'konsul',
  'Patrizier': 'patrizier',
  'Patriziern': 'patrizier',
  'Plebejer': 'plebejer',
  'Plebejern': 'plebejer',
  'Diktator': 'diktator',
  'Mos Maiorum': 'mos_maiorum',
  'Zwölftafelgesetz': 'zwoelftafelgesetz',
  'Punische Kriege': 'punische_kriege',
  'Hannibal': 'punische_kriege',
  'Volkstribun': 'volkstribun',
  'Volkstribunen': 'volkstribun',
  'Latifundien': 'latifundien',
  'Ager Publicus': 'latifundien',
  'Optimaten': 'optimaten_popularen',
  'Popularen': 'optimaten_popularen',
  'Gladiatoren': 'gladiatoren',
  'Gladiator': 'gladiatoren',
  'Sklaven': 'sklaverei',
  'Sklaverei': 'sklaverei',
  'Rubikon': 'rubikon',
  'Triumvirat': 'rubikon',
  'Brot und Spiele': 'panem_et_circenses',
  'Panem et circenses': 'panem_et_circenses',
  'Prinzipat': 'prinzipat',
  'Princeps': 'prinzipat',
  'Pax Romana': 'pax_romana',
  'Kaiserkult': 'kaiserkult',
  'Aquädukt': 'aquaedukt',
  'Aquädukte': 'aquaedukt',
  'Insulae': 'insulae',
  'Insula': 'insulae',
  'Katakomben': 'katakomben',
  'Ichthys': 'katakomben',
  'Limes': 'limes',
  'Romanisierung': 'romanisierung',
  'Mithras': 'mithraskult',
  'Mithraskult': 'mithraskult',
  'Konstantinische Wende': 'konstantinische_wende',
  'Chi-Rho': 'konstantinische_wende',
  'Reichsteilung': 'reichsteilung',
  'Völkerwanderung': 'voelkerwanderung',
  'Skriptorium': 'klosterkultur',
};

// ============================================================
// EPOCHEN- & PHASENVERGLEICH (Taste Z) – Entwicklung des Alten Rom
// ============================================================
export interface EpochComparisonRow {
  dimension: string;
  earlyPeriod: string;
  middlePeriod: string;
  latePeriod: string;
}

export const EPOCH_COMPARISON: EpochComparisonRow[] = [
  {
    dimension: 'Staatsform & Herrschaft',
    earlyPeriod: 'Königszeit & Frühe Republik (753–264 v. Chr.): Sturz des Königs (509 v. Chr.), Annuität & Kollegialität zweier Konsuln, Ständekämpfe zwischen Patriziern und Plebejern.',
    middlePeriod: 'Späte Republik & Weltmacht (264–27 v. Chr.): Herrschaft der Senatsaristokratie (Nobilität), Krise durch Bürgerkriege, Heeresklientel und Caesars Diktatur auf Lebenszeit.',
    latePeriod: 'Kaiserzeit & Spätantike (27 v. Chr.–476 n. Chr.): Prinzipat des Augustus (Scheinrepublik), später absolutes Dominat, Tetrarchie und Teilung in West- und Ostrom.',
  },
  {
    dimension: 'Gesellschaft & Wirtschaft',
    earlyPeriod: 'Bäuerliche Subsistenzwirtschaft am Tiber: Wehrhafte Kleinbauern bestellen ihre Felder selbst (Ideal des Cincinnatus); Schuldknechtschaft wird durch das Zwölftafelgesetz begrenzt.',
    middlePeriod: 'Sklavenhaltergesellschaft & Großgrundbesitz: Eroberungskriege spülen Millionen Sklaven nach Italien; Kleinbauern verarmen durch Latifundien und strömen als Proletariat nach Rom.',
    latePeriod: 'Urbanisierung, „Brot und Spiele" & Spätantike Krise: Millionenmetropole Rom mit Mietskasernen (Insulae), Fernhandel im gesamten Mittelmeerraum, ab dem 3. Jh. Münzverschlechterung und Stadtflucht.',
  },
  {
    dimension: 'Militär & Reichsgrenzen',
    earlyPeriod: 'Bürgeraufgebot (Milizheer): Bauern rüsten sich für kurze Sommerfeldzüge in Mittelitalien selbst aus und kehren zur Ernte auf ihre Höfe zurück.',
    middlePeriod: 'Berufsarmee & Mittelmeer-Imperium: Sieg über Karthago (Hannibal) und Eroberung Griechenlands, Galliens und des Ostens; Legionäre sind auf ihren Feldherrn statt auf den Senat eingeschworen.',
    latePeriod: 'Stehendes Grenzheer am Limes: Sicherung der Reichsgrenzen an Rhein, Donau und Euphrat (117 n. Chr. größte Ausdehnung unter Trajan); in der Spätantike Anwerbung germanischer Foederati.',
  },
  {
    dimension: 'Religion & Weltbild',
    earlyPeriod: 'Bäuerliche Frühreligion & Staatskult: Verehrung von Hausgeistern (Laren/Penaten), Mars, Jupiter und dem heiligen Herdfeuer der Vesta nach dem Grundsatz „do ut des" (Ich gebe, damit du gibst).',
    middlePeriod: 'Hellenisierung & Mysterienkulte: Übernahme griechischer Götter und Philosophie; in den Sklaven- und Soldatenlagern verbreiten sich orientalische Erlösungskulte (Isis, Bacchus).',
    latePeriod: 'Kaiserkult, Katakomben & Christentum: Göttliche Verehrung der Kaiser, Verfolgung der frühen Christen im Untergrund, Soldatenkult des Mithras und ab 312/380 n. Chr. Aufstieg des Christentums zur Staatsreligion.',
  },
  {
    dimension: 'Recht, Architektur & Erbe',
    earlyPeriod: 'Lehmhütten am Palatin, Cloaca Maxima (etruskische Entwässerung) und das Zwölftafelgesetz (450 v. Chr.) als Beginn des geschriebenen europäischen Rechts.',
    middlePeriod: 'Fernstraßen (Via Appia), erste steinerne Theater, repräsentative Foren und Triumphbögen der siegreichen Feldherren.',
    latePeriod: 'Monumentalbauten aus Opus Caementicium (Beton): Kolosseum, Pantheon, Aquädukte und Thermen; ab dem 5. Jh. Rettung des antiken Wissens in christlichen Klöstern (Cassiodor).',
  },
];

// ============================================================
// LEXIKON – Exakt 27 Einträge für das Alte Rom (753 v. Chr. – 476 n. Chr.)
// Progressives Freischalt-System nach SKILL 1.5
// ============================================================
export interface LexiconEntry {
  id: string;
  term: string;
  category: string;
  era: string;
  minChapter: number;
  unlockHint: string;
  icon: string;
  definition: string;
  merksatz: string;
  unlockCraftId?: string;
  unlockRelicId?: string;
  unlockBuildingId?: string;
}

export const LEXICON: LexiconEntry[] = [
  {
    id: 'lupa_romana',
    term: 'Lupa Romana (Kapitolinische Wölfin)',
    category: 'Mythos & Gründung',
    era: 'Frühes Rom & Königszeit',
    minChapter: 1,
    unlockHint: 'Sprich zu Beginn von Kapitel 1 mit Romulus (E) oder finde das 1. Relikt.',
    icon: 'relic_lupa',
    unlockRelicId: 'relic_lupa',
    definition:
      'Nach dem römischen Gründungsmythos setzte König Amulius die Zwillingsbrüder Romulus und Remus (Söhne des Kriegsgottes Mars) in einem Korb auf dem Tiber aus. Eine Wölfin (lateinisch: lupa) säugte die Kinder in der Lupercal-Höhle am Fuß des Palatin, bevor der Hirte Faustulus sie aufzog. Am 21. April 753 v. Chr. gründete Romulus der Sage nach die Stadt Rom.',
    merksatz: 'Die Wölfin symbolisiert Roms mythische Herkunft und den göttlichen Schutz des Mars.',
  },
  {
    id: 'pomerium',
    term: 'Pomerium (Heilige Stadtgrenze)',
    category: 'Religion & Stadtbau',
    era: 'Frühes Rom & Königszeit',
    minChapter: 1,
    unlockHint: 'Errichte den Herd der Vesta im Baumenü [B] in Kapitel 1.',
    icon: 'tuffstein',
    unlockBuildingId: 'vesta_herd',
    definition:
      'Das Pomerium war die mit einem bronzenen Pflug gezogene, religiös geweihte Grenze der Stadt Rom. Innerhalb des Pomeriums durfte kein Feldherr Waffen tragen oder sein militärisches Kommando (Imperium) ausüben. Als Remus spöttisch über Romulus’ gezogene Grenzfurche sprang, erschlug Romulus ihn mit den Worten: „So soll jeder sterben, der über meine Mauern springt!"',
    merksatz: 'Das Pomerium trennte die heilige zivile Sphäre der Stadt vom militärischen Außenraum.',
  },
  {
    id: 'res_publica',
    term: 'Res Publica (Römische Republik)',
    category: 'Politik & Staat',
    era: 'Frühe Republik',
    minChapter: 2,
    unlockHint: 'Errichte die Curia Hostilia [B] oder binde Fasces [C] in Kapitel 2.',
    icon: 'fasces',
    unlockBuildingId: 'curia_senat',
    definition:
      'Nach dem Sturz des letzten etruskischen Königs Tarquinius Superbus im Jahr 509 v. Chr. gründeten die Römer die „Res Publica" (wörtlich: „die öffentliche Sache"). Alle Bürger schworen den heiligen Eid, niemals wieder einen König (Rex) in Rom zu dulden. Um Machtmissbrauch zu verhindern, wurden alle Staatsämter zeitlich begrenzt (Annuität) und doppelt besetzt (Kollegialität).',
    merksatz: 'Freiheit durch geteilte Macht: Niemals wieder durfte ein Einzelner über Rom herrschen.',
  },
  {
    id: 'senat',
    term: 'Senat (Ältestenrat & SPQR)',
    category: 'Politik & Staat',
    era: 'Frühe Republik',
    minChapter: 2,
    unlockHint: 'Binde die Fasces der Liktoren [C] in Kapitel 2.',
    icon: 'toga_candida',
    unlockCraftId: 'fasces',
    definition:
      'Der Senat (von lat. senex = „der Alte") war das mächtigste politische Gremium der Römischen Republik. In ihm saßen 300 (später 600) ehemalige Beamte auf Lebenszeit, die über Außenpolitik, Krieg und Staatsfinanzen entschieden. Das Hoheitszeichen Roms lautete „S.P.Q.R." – Senatus Populusque Romanus („Senat und Volk von Rom").',
    merksatz: 'Der Senat war das autoritäre Rückgrat und das Gedächtnis der römischen Republik.',
  },
  {
    id: 'konsul',
    term: 'Konsuln (Annuität & Kollegialität)',
    category: 'Politik & Staat',
    era: 'Frühe Republik',
    minChapter: 2,
    unlockHint: 'Meistere das Kapitel-Quiz mit Brutus in Kapitel 2.',
    icon: 'fasces',
    definition:
      'An der Spitze der Republik standen zwei Konsuln als höchste Staatsbeamte und Heeresführer. Sie regierten nur für genau ein Jahr (Annuität) und konnten Entscheidungen des jeweils anderen durch ihr Vetorecht blockieren (Kollegialität). Vor ihnen schritten zwölf Amtsdiener (Liktoren) mit Rutenbündeln (Fasces) als Zeichen der Strafgewalt.',
    merksatz: 'Annuität (1 Jahr) und Kollegialität (zu zweit) schützten vor monarchischer Willkür.',
  },
  {
    id: 'patrizier',
    term: 'Patrizier (Geburtsadel)',
    category: 'Gesellschaft',
    era: 'Frühe Republik',
    minChapter: 2,
    unlockHint: 'Webe eine Toga Candida [C] oder sprich mit Brutus auf dem Forum.',
    icon: 'toga_candida',
    definition:
      'Die Patrizier (von lat. patres = „Väter") bildeten den alteingesessenen Geburtsadel Roms. Sie führten ihre Familien auf die Gefährten des Romulus zurück, besaßen die größten Ländereien und hielten in der frühen Republik das Monopol auf alle Priesterämter, Konsulate und Sitze im Senat.',
    merksatz: 'Die Patrizier leiteten ihren Herrschaftsanspruch aus Tradition und großem Landbesitz her.',
  },
  {
    id: 'plebejer',
    term: 'Plebejer & Ständekämpfe',
    category: 'Gesellschaft',
    era: 'Frühe Republik',
    minChapter: 3,
    unlockHint: 'Sprich zu Beginn von Kapitel 3 mit Bauer Cincinnatus [E].',
    icon: 'hacke',
    definition:
      'Die Plebejer (das „einfache Volk" aus Bauern, Handwerkern und Händlern) stellten zwar die Masse der Soldaten im römischen Heer, waren aber anfangs von allen Staatsämtern ausgeschlossen. Durch den „Auszug auf den Heiligen Berg" (Streik und Verweigerung des Kriegsdienstes) erkämpften sie sich in den Ständekämpfen (ca. 500–287 v. Chr.) politische Gleichberechtigung.',
    merksatz: 'Durch Kriegsdienstverweigerung erkämpften die Plebejer Volkstribunen und Gesetzesgleichheit.',
  },
  {
    id: 'diktator',
    term: 'Diktator & das Ideal des Cincinnatus',
    category: 'Politik & Militär',
    era: 'Frühe Republik',
    minChapter: 3,
    unlockHint: 'Baue die Legionsschmiede [B] in Kapitel 3.',
    icon: 'scutum',
    unlockBuildingId: 'legion_schmiede',
    definition:
      'In höchster militärischer Not konnte der Senat für maximal sechs Monate einen Diktator mit unbeschränkter Befehlsgewalt ernennen. Als leuchtendes Vorbild römischer Bürgertugend galt Lucius Quinctius Cincinnatus (458 v. Chr.): Er wurde direkt hinter seinem Pflug auf dem Acker zum Diktator berufen, rettete das eingeschlossene Heer in 16 Tagen und gab seine Macht sofort wieder ab, um weiterzupflügen.',
    merksatz: 'Cincinnatus verkörperte Bürgersinn: Unbegrenzte Macht annehmen, retten, und sofort abtreten.',
  },
  {
    id: 'mos_maiorum',
    term: 'Mos Maiorum (Sitte der Vorfahren)',
    category: 'Kultur & Werte',
    era: 'Frühe Republik',
    minChapter: 3,
    unlockHint: 'Webe eine weiße Toga Candida [C] in Kapitel 3.',
    icon: 'zwoelftafeln',
    unlockCraftId: 'toga_candida',
    definition:
      'Als „Mos Maiorum" bezeichneten die Römer den ungeschriebenen Wertekanon ihrer Vorfahren. Zu den wichtigsten römischen Kardinaltugenden zählten Virtus (Tapferkeit und Tatkraft), Pietas (Pflichtgefühl gegenüber Göttern, Staat und Familie), Fides (Vertragstreue und Verlässlichkeit) sowie Gravitas (Würde und Ernsthaftigkeit).',
    merksatz: 'Mos Maiorum band jeden Römer an Frömmigkeit, Vertragstreue und strenge Selbstdisziplin.',
  },
  {
    id: 'zwoelftafelgesetz',
    term: 'Zwölftafelgesetz (450 v. Chr.)',
    category: 'Recht & Gesetz',
    era: 'Frühe Republik',
    minChapter: 3,
    unlockHint: 'Gieße die Zwölftafelgesetze im Handwerk [C] in Kapitel 3.',
    icon: 'relic_zwoelftafel',
    unlockCraftId: 'zwoelftafeln',
    unlockRelicId: 'relic_zwoelftafel',
    definition:
      'Um die Willkür patrizischer Richter zu beenden, wurden 450 v. Chr. erstmals die geltenden Gesetze Roms auf zwölf Bronzetafeln eingemeißelt und auf dem Forum Romanum für jeden lesbar aufgestellt. Es regelte Eigentumsrecht, Schuldenwesen und Strafrecht und legte den Grundstein für das gesamte spätere europäische Rechtssystem.',
    merksatz: 'Schriftliches Recht schützte Bürger vor Willkür und begründete europäische Rechtskultur.',
  },
  {
    id: 'punische_kriege',
    term: 'Punische Kriege & Hannibal',
    category: 'Militär & Expansion',
    era: 'Späte Republik',
    minChapter: 4,
    unlockHint: 'Baue die Enterbrücke Corvus [C] an der Flottenwerft von Ostia.',
    icon: 'corvus_enterbruecke',
    unlockCraftId: 'corvus_enterbruecke',
    unlockBuildingId: 'ostia_werft',
    definition:
      'In drei gewaltigen Kriegen (264–146 v. Chr.) rang Rom mit der nordafrikanischen Handelsmetropole Karthago (lateinisch: Punier) um die Vorherrschaft im Mittelmeer. Im Zweiten Punischen Krieg überquerte der karthagische Feldherr Hannibal 218 v. Chr. mit Kriegselefanten die Alpen und vernichtete bei Cannae (216 v. Chr.) 50.000 Römer, bevor Scipio Africanus ihn 202 v. Chr. bei Zama besiegte.',
    merksatz: 'Der Sieg über Karthago machte Rom zur unangefochtenen Seemacht im Mittelmeer.',
  },
  {
    id: 'volkstribun',
    term: 'Volkstribun & Vetorecht',
    category: 'Politik & Staat',
    era: 'Späte Republik',
    minChapter: 5,
    unlockHint: 'Verfasse die Ackergesetz-Rolle [C] in Kapitel 5.',
    icon: 'ackergesetz_rolle',
    unlockCraftId: 'ackergesetz_rolle',
    definition:
      'Die Volkstribunen waren die gewählten Schutzbeamten der Plebejer. Ihre Person galt als heilig und unantastbar (sacrosanctus). Mit dem Ruf „Veto!" („Ich verbiete!") konnten sie jeden Gesetzesvorschlag des Senats oder eines Konsuls sofort stoppen, wenn dieser das einfache Volk benachteiligte.',
    merksatz: 'Das Vetorecht war die wirksamste Waffe des Volkes gegen senatorische Übermacht.',
  },
  {
    id: 'latifundien',
    term: 'Latifundien & die Agrarkrise (Gracchen)',
    category: 'Wirtschaft & Krise',
    era: 'Späte Republik',
    minChapter: 5,
    unlockHint: 'Backe Panis-Rundbrot [C] für das verarmte Stadtvolk.',
    icon: 'getreide',
    unlockCraftId: 'panis_brot',
    definition:
      'Während die römischen Kleinbauern jahrelang in Übersee kämpften, verfielen ihre Höfe. Reiche Senatoren kauften das Land sowie das eigentlich dem Staat gehörende Gemeindeland (Ager Publicus) auf und bewirtschafteten riesige Großgüter (Latifundien) mit billigen Kriegssklaven. Als der Volkstribun Tiberius Gracchus 133 v. Chr. Land an verarmte Bauern umverteilen wollte, wurde er von Senatoren erschlagen.',
    merksatz: 'Die Verarmung der Bauernschaft und Großgrundbesitz zerstörten das soziale Fundament der Republik.',
  },
  {
    id: 'optimaten_popularen',
    term: 'Optimaten und Popularen',
    category: 'Politik & Krise',
    era: 'Späte Republik',
    minChapter: 5,
    unlockHint: 'Schließe das Kapitel-Quiz mit Tiberius Gracchus in Kapitel 5 ab.',
    icon: 'silber_denar',
    definition:
      'Im letzten Jahrhundert der Republik spaltete sich die römische Politik in zwei verfeindete Lager: Die konservativen „Optimaten" („die Besten", z. B. Sulla, Cato, Cicero) verteidigten die traditionelle Alleinherrschaft des Senats. Die „Popularen" (z. B. die Brüder Gracchus, Marius, Caesar) nutzten hingegen die Volksversammlung und die Volkstribunen, um Gesetze am Senat vorbei durchzusetzen.',
    merksatz: 'Der Parteienstreit endete in blutigen Bürgerkriegen und dem Zusammenbruch der Republik.',
  },
  {
    id: 'sklaverei',
    term: 'Sklaverei in der Römischen Welt',
    category: 'Gesellschaft & Wirtschaft',
    era: 'Späte Republik',
    minChapter: 6,
    unlockHint: 'Schmiede ein römisches Kurzschwert (Gladius) [C] in Kapitel 6.',
    icon: 'ziegel',
    unlockCraftId: 'gladius',
    definition:
      'Sklaven galten im römischen Recht nicht als Personen, sondern als „sprechende Werkzeuge" (instrumentum vocale). Während gebildete griechische Haussklaven oft als Lehrer, Ärzte oder Verwalter arbeiteten und freigelassen werden konnten, vegetierten Feld- und Bergwerkssklaven unter unmenschlichen Bedingungen dahin.',
    merksatz: 'Die antike Hochkultur basierte ökonomisch auf millionenfacher Ausbeutung Unfreier.',
  },
  {
    id: 'gladiatoren',
    term: 'Gladiatoren & der Spartacus-Aufstand',
    category: 'Gesellschaft & Alltag',
    era: 'Späte Republik',
    minChapter: 6,
    unlockHint: 'Schmiede den Gladiatoren-Dreizack (Fuscina) [C] in Kapitel 6.',
    icon: 'gladiator_dreizack',
    unlockCraftId: 'gladiator_dreizack',
    definition:
      'Gladiatoren (von lat. gladius = „Schwert") waren meist Kriegsgefangene oder Sklaven, die in streng bewachten Kampfschulen (Ludi) ausgebildet wurden, um zur Unterhaltung des Publikums in Arenen zu kämpfen. 73 v. Chr. brach der Thraker Spartacus mit 70 Gefährten aus einer Gladiatorenschule in Capua aus und führte ein Befreiungsheer von über 70.000 Sklaven gegen Rom an.',
    merksatz: 'Spartacus bewies, dass selbst die mächtigste Militärmacht der Welt von Verzweifelten erschüttert werden konnte.',
  },
  {
    id: 'rubikon',
    term: 'Überschreitung des Rubikon (49 v. Chr.)',
    category: 'Politik & Militär',
    era: 'Späte Republik',
    minChapter: 7,
    unlockHint: 'Präge einen römischen Silber-Denar [C] in Kapitel 7.',
    icon: 'gladius',
    unlockCraftId: 'silber_denar',
    unlockRelicId: 'relic_caesar_denar',
    definition:
      'Der kleine Grenzfluss Rubikon trennte die Provinz Oberitalien vom eigentlichen Kernland Italien. Als Gaius Iulius Caesar am 10. Januar 49 v. Chr. mit seiner 13. Legion bewaffnet den Rubikon überschritt, brach er das höchste Gesetz der Republik und eröffnete den Bürgerkrieg mit den berühmten Worten „Alea iacta est" („Der Würfel ist gefallen").',
    merksatz: 'Mit Caesars Grenzübertritt trat Rom in das Zeitalter der Militärdiktatur ein.',
  },
  {
    id: 'panem_et_circenses',
    term: 'Panem et circenses („Brot und Spiele")',
    category: 'Gesellschaft & Politik',
    era: 'Kaiserzeit',
    minChapter: 7,
    unlockHint: 'Fertige den goldenen Legionsadler (Aquila) [C] in Kapitel 7.',
    icon: 'panis_brot',
    unlockCraftId: 'legionsadler',
    definition:
      'Der vom Dichter Juvenal geprägte Begriff beschreibt die Strategie römischer Politiker und Kaiser, die hunderttausenden arbeitslosen Bürger der Hauptstadt durch kostenlose Getreidespenden (Annona) sowie spektakuläre Wagenrennen im Circus Maximus und Gladiatorenkämpfe im Kolosseum bei Laune zu halten und von politischem Protest abzulenken.',
    merksatz: 'Soziale Ruhigstellung durch Spektakel und Kornspenden ersetzte politische Mitbestimmung.',
  },
  {
    id: 'prinzipat',
    term: 'Prinzipat (Alleinherrschaft des Augustus)',
    category: 'Kaiserzeit',
    era: 'Kaiserzeit',
    minChapter: 8,
    unlockHint: 'Flechte den kaiserlichen Lorbeerkranz [C] in Kapitel 8.',
    icon: 'lorbeerkranz_rom',
    unlockCraftId: 'lorbeerkranz_rom',
    definition:
      'Nach dem Ende der Bürgerkriege begründete Caesars Adoptivsohn Octavian unter dem Ehrennamen Augustus („der Erhabene") im Jahr 27 v. Chr. das Prinzipat. Um nicht wie Caesar ermordet zu werden, ließ Augustus die Fassade der Republik (Senat, Konsuln) bestehen, vereinte aber als „Princeps" („Erster Bürger") das Oberkommando über alle Legionen und das Vetorecht der Volkstribunen in seiner Hand.',
    merksatz: 'Augustus tarnte die Alleinherrschaft genial als angebliche „Wiederherstellung der Republik".',
  },
  {
    id: 'pax_romana',
    term: 'Pax Romana (Der Römische Frieden)',
    category: 'Kaiserzeit',
    era: 'Kaiserzeit',
    minChapter: 8,
    unlockHint: 'Finde die Panzerstatue des Augustus (4. Relikt) nahe der Ara Pacis.',
    icon: 'relic_augustus_statue',
    unlockRelicId: 'relic_augustus_statue',
    definition:
      'Als „Pax Romana" (oder Pax Augusta) wird die rund 200-jährige Blütezeit des Römischen Reiches unter Augustus und seinen Nachfolgern (1. und 2. Jh. n. Chr.) bezeichnet. Im Inneren des gewaltigen Mittelmeer-Imperiums herrschten Frieden, sichere Handelswege, eine einheitliche Währung und gleiches Recht – erkauft durch militärische Unterwerfung an den Außengrenzen.',
    merksatz: '200 Jahre Stabilität ermöglichten antike Globalisierung und wirtschaftliche Blüte.',
  },
  {
    id: 'kaiserkult',
    term: 'Kaiserkult & Vergöttlichung (Divus)',
    category: 'Religion & Kaiserzeit',
    era: 'Kaiserzeit',
    minChapter: 8,
    unlockHint: 'Erreiche Kapitel 8 und sprich mit Kaiser Augustus.',
    icon: 'relic_caesar_denar',
    definition:
      'Beginnend mit der Erhebung des ermordeten Julius Caesar zum „Divus Iulius" (göttlicher Julius) wurden verstorbene Kaiser durch Senatsbeschluss unter die Staatsgötter aufgenommen. In den östlichen Provinzen wurden auch lebende Kaiser und der Genius des Herrschers in eigenen Tempeln mit Weihrauchopfern als religiöse Loyalitätsbekundung verehrt.',
    merksatz: 'Der Kaiserkult diente als politisches Bindeglied zur Festigung der kaiserlichen Herrschaft.',
  },
  {
    id: 'aquaedukt',
    term: 'Aquädukte & Römische Ingenieurskunst',
    category: 'Technik & Architektur',
    era: 'Kaiserzeit',
    minChapter: 8,
    unlockHint: 'Errichte das Aquädukt der Kaiserzeit im Baumenü [B] in Kapitel 8.',
    icon: 'opus_caementicium',
    unlockBuildingId: 'aqua_romana',
    definition:
      'Römische Ingenieure perfektionierten den Bogenbau und den wasserfesten römischen Beton (Opus Caementicium). Elf riesige Wasserleitungen (Aquädukte) leiteten täglich rund eine Million Kubikmeter frisches Quellwasser mit minimalem Gefälle aus den Bergen in die Brunnen, Latrinen und öffentlichen Badeanlagen (Thermen) der Metropole Rom.',
    merksatz: 'Bogenarchitektur und Opus Caementicium sicherten die hygienische Versorgung der Millionenstadt.',
  },
  {
    id: 'insulae',
    term: 'Insulae (Römische Mietskasernen)',
    category: 'Gesellschaft & Alltag',
    era: 'Kaiserzeit',
    minChapter: 9,
    unlockHint: 'Fertige eine römische Ton-Öllampe (Lucerna) [C] in Kapitel 9.',
    icon: 'oellampe',
    unlockCraftId: 'oellampe',
    definition:
      'Während reiche Senatoren in weitläufigen Stadtvillen (Domus) mit Innenhof lebten, drängten sich über 90 Prozent der Einwohner Roms in mehrstöckigen Mietskasernen (Insulae = „Wohninseln"). Die oberen Stockwerke bestanden aus billigem Fachwerk ohne Wasseranschluss oder Küche, weshalb Einstürze und verheerende Großbrände – wie der Große Brand Roms unter Kaiser Nero 64 n. Chr. – zum Alltag gehörten.',
    merksatz: 'Enge, feuergefährdete Mietskasernen prägten das prekäre Alltagsleben der einfachen Bevölkerung.',
  },
  {
    id: 'katakomben',
    term: 'Katakomben & Frühes Christentum (Ichthys)',
    category: 'Religion & Spätantike',
    era: 'Spätantike',
    minChapter: 9,
    unlockHint: 'Steige in die Katakomben hinab und besuche den Ichthys-Altar [E].',
    icon: 'oellampe',
    definition:
      'Da Christen das Opfer vor den Götter- und Kaiserstatuen verweigerten, galten sie den römischen Behörden als illoyale Staatsfeinde und wurden (u. a. unter Kaiser Nero 64 n. Chr. und Diokletian) grausam verfolgt. In den unterirdischen Tuffstein-Gängen vor den Stadtmauern Roms (Katakomben) bestatteten sie ihre Toten und nutzten den Fisch (griech. Ichthys) als geheimes Erkennungszeichen.',
    merksatz: 'Die Katakomben bezeugen die Standhaftigkeit der Christen vor der Konstantinischen Wende.',
  },
  {
    id: 'limes',
    term: 'Limes, Romanisierung & Mithraskult',
    category: 'Militär & Provinzen',
    era: 'Kaiserzeit',
    minChapter: 10,
    unlockHint: 'Errichte das Kolosseum [B] oder meißle einen Meilenstein [C] in Kapitel 10.',
    icon: 'meilenstein',
    unlockCraftId: 'meilenstein',
    unlockBuildingId: 'kolosseum_bau',
    definition:
      'Unter Kaiser Trajan erreichte das Imperium 117 n. Chr. seine größte Ausdehnung von Schottland bis zum Persischen Golf. Befestigte Grenzen mit Wachtürmen und Kastellen (Limes) sicherten das Reich. In den Provinzen verbreiteten sich lateinische Sprache, Thermen und Stadtrecht (Romanisierung), während die Legionäre in unterirdischen Höhlentempeln (Mithräen) den persischen Lichtgott Mithras verehrten.',
    merksatz: 'Der Limes war Grenz- und Kontrolllinie, an der Romanisierung und Kulturaustausch blühten.',
  },
  {
    id: 'konstantinische_wende',
    term: 'Konstantinische Wende (312/313 n. Chr.)',
    category: 'Religion & Spätantike',
    era: 'Spätantike',
    minChapter: 11,
    unlockHint: 'Fertige den Chi-Rho-Schild [C] oder baue die Basilika [B] in Kapitel 11.',
    icon: 'chi_rho_schild',
    unlockCraftId: 'chi_rho_schild',
    unlockBuildingId: 'basilika_bau',
    unlockRelicId: 'relic_konstantin_medaillon',
    definition:
      'Nach seinem Sieg an der Milvischen Brücke 312 n. Chr. unter dem christlichen Zeichen Chi-Rho (☧) gewährte Kaiser Konstantin der Große den Christen 313 n. Chr. in der Mailänder Vereinbarung volle Religionsfreiheit. Er förderte den Bau monumentaler Kirchen (Basiliken) und verlegte 330 n. Chr. die Hauptstadt nach Konstantinopel. 380 n. Chr. wurde das Christentum unter Theodosius I. alleinige Staatsreligion.',
    merksatz: 'Die Konstantinische Wende machte das Christentum vom Verfolgten zur bestimmenden Weltmacht.',
  },
  {
    id: 'voelkerwanderung',
    term: 'Reichsteilung, Untergang Westroms (476 n. Chr.) & Klosterkultur',
    category: 'Spätantike & Erbe',
    era: 'Spätantike & Erbe',
    minChapter: 12,
    unlockHint: 'Binde den spätantiken Pergament-Codex [C] bei Cassiodor in Kapitel 12.',
    icon: 'pergament_codex',
    unlockCraftId: 'pergament_codex',
    definition:
      'Im Jahr 395 n. Chr. wurde das Imperium endgültig in ein Weströmisches und ein Oströmisches Reich geteilt. Durch den Druck der Völkerwanderung (Hunnen, Goten, Vandalen) zerfiel die weströmische Zentralmacht, bis der germanische Heerführer Odoaker 476 n. Chr. den letzten jugendlichen Westkaiser Romulus Augustulus absetzte. Während Ostrom (Byzanz) noch 1.000 Jahre fortbestand, retteten christliche Mönche wie Cassiodor in ihren Schreibstuben (Skriptorien) die Schriften der Antike für Europa.',
    merksatz: 'Während das weströmische Kaisertum 476 endete, bewahrten Klöster Sprache, Recht und Wissen.',
  },
];

// ============================================================
// 12 KAPITEL: VON DER GRÜNDUNG ROMS (753 v. Chr.) BIS ZUM ENDE WESTROMS (476 n. Chr.)
// ============================================================
export const CHAPTERS: ChapterData[] = [
  {
    id: 1,
    title: 'Kapitel 1: Die Wiege der Wölfe',
    subtitle: 'Mythos, Brudermord, bäuerliches Fundament und Frühreligion am Palatin',
    year: '753 v. Chr.',
    mentorId: 'npc_romulus',
    mentorName: 'Romulus',
    mentorRole: 'Mythischer Stadtgründer am Palatin',
    introDialog: [
      'Salve, Wanderer am Ufer des Tiber! Ich bin Romulus, Sohn des Kriegsgottes Mars. Hier in der feuchten Wildnis am Fuß des Palatin-Hügels hat uns einst die heilige Wölfin – die Lupa Romana – vor dem sicheren Tod im Fluss gerettet.',
      'Heute, am 21. April des Jahres 753 v. Chr., gründe ich aus unseren einfachen Lehmhütten der Hirten und Bauern eine heilige Stadt! Doch mein Zwillingsbruder Remus verhöhnte die heilige Grenzfurche – das Pomerium –, die ich mit dem Pflug gezogen habe. Im Zorn erschlug ich ihn: Niemand darf ungestraft Roms heilige Mauern überschreiten!',
      'Rom entsteht nicht aus Gold, sondern aus harter Bauernarbeit und tiefer Ehrfurcht vor den Göttern. Sammle zuerst Lehm am Tiberufer, Eichenholz im Hain und Dinkelkorn auf den Feldern, und entzünde dann die Opferflamme am heiligen Herd der Göttin Vesta!',
    ],
    questDescription:
      'Sammle Tuffstein (am Felsen), Holz (im Eichenhain) und Emmer-Getreide (auf dem Feld) mit [E]. Errichte im Baumenü [B] den „Heiligen Herd der Vesta & Horreum", koche im Handwerk [C] den „Römischen Puls-Getreidebrei" und kehre zu Romulus zurück.',
    hints: [
      'Laufe nach Westen zum Tuffstein-Fels am Palatin und nach Südosten zum Eichenhain und Emmer-Ackerfeld [E].',
      'Öffne mit [B] das Baumenü und errichte den „Heiligen Herd der Vesta & Horreum" (2x Holz, 1x Tuffstein).',
      'Koche mit [C] den „Römischen Puls-Getreidebrei" (2x Emmer-Getreide) und sprich mit Romulus [E]. (Tipp: Suche an der Lupercal-Höhle auch nach dem ersten Relikt!)',
    ],
    quiz: [
      {
        question: 'Welche Bedeutung hatte das „Pomerium" bei der mythischen Gründung Roms (753 v. Chr.)?',
        options: [
          'Es war ein riesiger Goldschatz aus Ägypten, den Romulus im Tiber versenkte.',
          'Es war die mit dem Pflug gezogene, religiös geweihte Stadtgrenze, innerhalb derer keine Waffen getragen werden durften.',
          'Es war der Name des ersten römischen Kriegsschiffes im Mittelmeer.',
        ],
        correctIndex: 1,
        explanation:
          'Das Pomerium bildete die heilige Friedens- und Rechtsgrenze der Stadt Rom. Als Remus spöttisch darüber sprang, verletzte er den göttlichen Schutz der Stadt.',
      },
      {
        question: 'Wie lebten die ersten Römer auf den Hügeln am Tiber tatsächlich in der Frühzeit (8. Jahrhundert v. Chr.)?',
        options: [
          'In einfachen Lehm- und Schilfhütten als Hirten und Kleinbauern an einer strategischen Furt über den Tiber.',
          'In zwanzigstöckigen Glaspalästen mit elektrischer Beleuchtung.',
          'Als reine Seefahrer auf schwimmenden Inseln im Ozean.',
        ],
        correctIndex: 0,
        explanation:
          'Archäologische Ausgrabungen auf dem Palatin bestätigen Pfostenlöcher einfacher Hirtenhütten aus Lehm und Holz nahe der Salzstraße (Via Salaria) an der Tiberinsel.',
      },
      {
        question: 'Warum hüteten die Priesterinnen der Göttin Vesta (Vestalinnen) ein niemals erlöschendes Herdfeuer?',
        options: [
          'Damit die Römer nachts im Winter keine Fackeln kaufen mussten.',
          'Das ewige Herdfeuer symbolisierte den göttlichen Schutz und den Fortbestand der gesamten Stadtgemeinschaft.',
          'Um damit feindliche Schiffe aus Karthago in Brand zu setzen.',
        ],
        correctIndex: 1,
        explanation:
          'In der römischen Frühreligion war der Herd (Vesta) das heilige Zentrum jeder Familie und des Staates. Erlosch das Staatsfeuer, galt dies als Vorzeichen einer Katastrophe.',
      },
    ],
    summary:
      'Rom entstand um 753 v. Chr. aus Hirten- und Bauerndörfern an einer günstigen Furt des Tiber. Der Gründungsmythos von Romulus, Remus und der Wölfin (Lupa Romana) erklärte Roms wehrhaften Charakter als Kinder des Kriegsgottes Mars, während das Pomerium und das Herdfeuer der Vesta die Stadt unter göttlichen Schutz stellten.',
    unlocksText: 'Freigeschaltet: Kapitel 2 (509 v. Chr. – Der Sturz der Tyrannen) & Bauplan: Curia Hostilia!',
  },
  {
    id: 2,
    title: 'Kapitel 2: Der Sturz der Tyrannen',
    subtitle: 'Etruskischer Einfluss, Revolution gegen den König und der republikanische Bürgereid',
    year: '509 v. Chr.',
    mentorId: 'npc_brutus',
    mentorName: 'Lucius Iunius Brutus',
    mentorRole: 'Befreier Roms & Erster Konsul der Republik',
    introDialog: [
      'Hört mich an, Bürger Roms! Jahrhundertelang haben etruskische Könige unsere Stadt regiert. Sie bauten zwar die Cloaca Maxima zur Trockenlegung unseres Sumpfes, doch König Tarquinius Superbus – „der Hochmütige" – knechtete das Volk wie Sklaven und trat jedes Recht mit Füßen!',
      'Heute, im Jahr 509 v. Chr., haben wir den Tyrannen verjagt! Wir gründen die Res Publica – die „öffentliche Sache"! Schwört mit mir den heiligen Bürgereid: Niemals wieder soll ein König über Rom herrschen! Stattdessen wählen wir zwei Konsuln, die nur ein einziges Jahr regieren und sich gegenseitig kontrollieren.',
      'Baue im Baumenü [B] die „Curia Hostilia (Senatshaus am Forum)" und binde im Handwerk [C] aus Eichenholz und Eisenerz die „Rutenbündel der Liktoren (Fasces)" – das stolze Zeichen unserer neuen republikanischen Amtsgewalt!',
    ],
    questDescription:
      'Errichte im Baumenü [B] die „Curia Hostilia (Senatshaus am Forum)" (2x Tuffstein, 2x Holz). Binde außerdem im Handwerk [C] die „Rutenbündel der Liktoren (Fasces)" (2x Holz, 1x Eisenerz) und melde dich bei Konsul Brutus.',
    hints: [
      'Tuffstein brichst du am Felsen am Palatin [E], Eichenholz im Hain und Eisenerz an der Etruskischen Eisenmine im Nordosten [E].',
      'Drücke [B], um die „Curia Hostilia (Senatshaus am Forum)" für den Senat zu errichten.',
      'Öffne danach [C], fertige unter „Republik & Militär" die „Rutenbündel der Liktoren (Fasces)" und sprich mit Brutus [E].',
    ],
    quiz: [
      {
        question: 'Durch welche zwei Grundprinzipien verhinderte die Römische Republik ab 509 v. Chr., dass ein Beamter wieder zum Alleinherrscher (König) wurde?',
        options: [
          'Annuität (Begrenzung der Amtszeit auf ein Jahr) und Kollegialität (mindestens zwei gleichberechtigte Amtsinhaber mit Vetorecht).',
          'Alle Beamten wurden jedes Jahr durch ein Würfelspiel unter Kindern ausgelost.',
          'Regieren durften nur noch ausländische Kaufleute aus Ägypten.',
        ],
        correctIndex: 0,
        explanation:
          'Durch das Jahresprinzip (Annuität) und die Doppelbesetzung (Kollegialität) der zwei Konsuln kontrollierten sich die höchsten Beamten gegenseitig.',
      },
      {
        question: 'Was bedeutet die lateinische Bezeichnung „Res Publica", aus der unser heutiges Wort „Republik" stammt?',
        options: [
          '„Herrschaft des reichsten Kriegers"',
          '„Die öffentliche Sache" – der Staat gehört nicht mehr einem König, sondern ist Angelegenheit der Bürgerschaft und des Senats.',
          '„Das geheime Priesterreich"',
        ],
        correctIndex: 1,
        explanation:
          'Im Gegensatz zum Königreich (Regnum), das als Privatbesitz des Monarchen galt, war die Res Publica die gemeinsame Angelegenheit von Senat und Volk (SPQR).',
      },
      {
        question: 'Welchen wichtigen zivilisatorischen Beitrag leisteten die etruskischen Könige vor ihrem Sturz 509 v. Chr. für Rom?',
        options: [
          'Sie legten durch den Bau des Abwasserkanals (Cloaca Maxima) das sumpfige Tal zwischen den Hügeln trocken, sodass dort das Forum Romanum entstehen konnte.',
          'Sie erfanden das Schießpulver und die Dampfmaschine.',
          'Sie verlegten die Stadt Rom vorübergehend auf die Insel Sizilien.',
        ],
        correctIndex: 0,
        explanation:
          'Unter etruskischem Einfluss wuchsen die getrennten Hügeldörfer durch Entwässerung (Cloaca Maxima), Pflasterung des Forums und den Bau des Jupitertempels zu einer echten Stadt zusammen.',
      },
    ],
    summary:
      '509 v. Chr. stürzten die Römer den letzten etruskischen König Tarquinius Superbus und gründeten die Republik (Res Publica). Um eine neue Tyrannei zu verhindern, teilten sich zwei jährlich gewählte Konsuln (Annuität & Kollegialität) die Macht mit dem Senat.',
    unlocksText: 'Freigeschaltet: Kapitel 3 (458 v. Chr. – Der Mut der Wenigen) & Relikt am Forum Romanum!',
  },
  {
    id: 3,
    title: 'Kapitel 3: Der Mut der Wenigen',
    subtitle: 'Pflichtbewusstsein, Agraralltag der Kleinbauern, Ständekämpfe und republikanische Tugenden',
    year: '458 v. Chr.',
    mentorId: 'npc_cincinnatus',
    mentorName: 'Lucius Quinctius Cincinnatus',
    mentorRole: 'Kleinbauer & Berufener Diktator Roms',
    introDialog: [
      'Wisch dir den Schweiß von der Stirn, Bürger! Du findest mich hier barfuß hinter meinem Pflug auf einem kleinen Acker jenseits des Tiber. Doch soeben sind Boten des Senats herbeigeeilt: Das Bergvolk der Äquer hat unser Konsularheer eingeschlossen – Rom schwebt in tödlicher Gefahr!',
      'In höchster Not hat mich der Senat zum Diktator auf sechs Monate ernannt. Doch merke dir die Sitte unserer Vorfahren – den Mos Maiorum: Wahre Größe liegt nicht in Gold oder Machtgier, sondern in Pflichtbewusstsein (Pietas) und Bescheidenheit! Sobald das Vaterland gerettet ist, gebe ich die Diktatur sofort zurück.',
      'Auch im Inneren braucht Rom Wehrkraft und gleiches Recht zwischen adligen Patriziern und einfachen Plebejern! Errichte im Baumenü [B] die „Republikanische Legionsschmiede & Kastell", gieße im Handwerk [C] die „Zwölftafelgesetze aus Bronze" und webe die „Weiße Bürger-Toga"!',
    ],
    questDescription:
      'Errichte im Baumenü [B] die „Republikanische Legionsschmiede & Kastell" (2x Tuffstein, 2x Eisenerz). Gieße im Handwerk [C] die „Zwölftafelgesetze in Bronze" (1x Eisenerz, 1x Tuffstein) und webe die „Weiße Bürger-Toga" (2x Schafwolle). Sprich danach mit Cincinnatus.',
    hints: [
      'Eisenerz findest du an der Eisenmine im Nordosten [E], Tuffstein am Palatin und Schafwolle auf der Schafweide im Südosten [E].',
      'Baue zuerst mit [B] die „Republikanische Legionsschmiede & Kastell" auf dem Marsfeld.',
      'Fertige anschließend in [C] unter „Republik & Militär" die „Zwölftafelgesetze" sowie die „Weiße Bürger-Toga" und kehre zu Cincinnatus zurück. (Untersuche auch das Relikt am Forum Romanum!)',
    ],
    quiz: [
      {
        question: 'Warum wurde Lucius Quinctius Cincinnatus (458 v. Chr.) zum berühmtesten Vorbild römischer Tugend (Mos Maiorum)?',
        options: [
          'Weil er als Diktator in nur 16 Tagen das römische Heer rettete und danach sofort freiwillig seine absolute Macht abgab, um auf seinen Bauernhof zurückzukehren.',
          'Weil er die größte Goldstatue der Antike für seinen eigenen Garten bauen ließ.',
          'Weil er als erster Römer ganz allein hundert Kriegselefanten besiegte.',
        ],
        correctIndex: 0,
        explanation:
          'Cincinnatus verkörperte das republikanische Ideal des wehrhaften Bauern, der dem Staat selbstlos dient und nach erfüllter Pflicht ohne Machthunger ins einfache Leben zurückkehrt.',
      },
      {
        question: 'Wie erkämpften sich die einfachen Bürger (Plebejer) in den Ständekämpfen politische Rechte gegenüber dem Adel (Patrizier)?',
        options: [
          'Durch den „Auszug auf den Heiligen Berg" (Streik und Verweigerung des Kriegsdienstes), woraufhin die Patrizier Volkstribunen und geschriebene Gesetze zulassen mussten.',
          'Indem sie alle Patrizier mit Zaubertränken in Schlaf versetzten.',
          'Indem sie den König von Persien um militärische Hilfe baten.',
        ],
        correctIndex: 0,
        explanation:
          'Da das römische Bürgerheer auf die Bauern-Fußsoldaten der Plebejer angewiesen war, war der Militärstreik (secessio plebis) ein äußerst wirksames Druckmittel.',
      },
      {
        question: 'Warum war die Aufstellung des Zwölftafelgesetzes (450 v. Chr.) auf dem Forum Romanum ein Meilenstein?',
        options: [
          'Weil dort zum ersten Mal Kochrezepte aus dem gesamten Mittelmeerraum verzeichnet waren.',
          'Weil das Recht nun öffentlich schriftlich fixiert war und Patrizier die Gesetze nicht mehr geheim und willkürlich auslegen konnten.',
          'Weil damit alle Steuern für die nächsten tausend Jahre abgeschafft wurden.',
        ],
        correctIndex: 1,
        explanation:
          'Öffentlich lesbares Recht schuf Rechtssicherheit und schützte einfache Bürger vor Richterwillkür.',
      },
    ],
    summary:
      'In der frühen Republik bildeten wehrhafte Kleinbauern das Rückgrat des Staates. Cincinnatus (458 v. Chr.) stand für die altrömischen Tugenden (Mos Maiorum) aus Pflichtgefühl und Verzicht auf Machtmissbrauch, während die Plebejer im Ständekampf das Amt des Volkstribunen und das Zwölftafelgesetz (450 v. Chr.) errangen.',
    unlocksText: 'Freigeschaltet: Kapitel 4 (216–202 v. Chr. – Der Schatten von Karthago) & Bauplan: Flottenarsenal von Ostia!',
  },
  {
    id: 4,
    title: 'Kapitel 4: Der Schatten von Karthago',
    subtitle: 'Existenzangst nach Cannae, strategisches Durchhaltevermögen und der Sieg über Hannibal',
    year: '216 – 202 v. Chr.',
    mentorId: 'npc_scipio',
    mentorName: 'Publius Cornelius Scipio Africanus',
    mentorRole: 'Römischer Feldherr im Zweiten Punischen Krieg',
    introDialog: [
      'Bürger, der Schrecken geht um in den Gassen Roms: „Hannibal ad portas!" – Hannibal steht vor den Toren! Der karthagische Feldherr hat mit seinen Kriegselefanten die eisigen Alpen überquert und bei Cannae (216 v. Chr.) acht unserer Legionen – fast 50.000 Römer – an einem einzigen Tag eingekesselt und vernichtet!',
      'Jedes andere Reich hätte nach einer solchen Katastrophe kapituliert. Doch der römische Senat verbot sogar das Weinen auf den Straßen, befragte die heiligen Sibyllinischen Bücher und hob neue Legionen aus! Und ich, Scipio, werde den Krieg nun übers Meer direkt nach Nordafrika tragen, um Hannibal bei Zama (202 v. Chr.) zu schlagen!',
      'Errichte im Baumenü [B] das „Flottenarsenal & Hafen von Ostia" und konstruiere im Handwerk [C] die schwenkbare „Enterbrücke (Corvus)" für unsere Kriegsschiffe gegen Karthago!',
    ],
    questDescription:
      'Baue im Baumenü [B] das „Flottenarsenal & Hafen von Ostia" (2x Holz, 1x Eisenerz). Konstruiere außerdem im Handwerk [C] die „Enterbrücke (Corvus)" (2x Holz, 2x Eisenerz) und berichte Feldherr Scipio.',
    hints: [
      'Eichenholz sammelst du im Hain am Palatin [E], Eisenerz in der Etruskischen Eisenmine im Nordosten [E].',
      'Öffne [B] und errichte das „Flottenarsenal & Hafen von Ostia" an der Tibermündung im Südwesten.',
      'Stelle danach in [C] unter „Republik & Militär" die „Enterbrücke (Corvus)" her und sprich mit Scipio [E].',
    ],
    quiz: [
      {
        question: 'Warum gilt die Schlacht von Cannae (216 v. Chr.) im Zweiten Punischen Krieg als schwerste militärische Niederlage der römischen Geschichte?',
        options: [
          'Weil Hannibals karthagisches Heer trotz zahlenmäßiger Unterlegenheit acht römische Legionen (rund 50.000 Mann) vollständig einkesselte und vernichtete.',
          'Weil die römische Flotte versehentlich in einen Vulkan segelte.',
          'Weil die römischen Soldaten vergaßen, ihre Schwerter mitzunehmen.',
        ],
        correctIndex: 0,
        explanation:
          'Hannibals Einkesselungstaktik bei Cannae wurde zum Lehrbeispiel der Militärgeschichte. Dennoch weigerte sich Rom zu kapitulieren.',
      },
      {
        question: 'Mit welcher Strategie gelang es Scipio Africanus schließlich im Jahr 202 v. Chr., Hannibal zu besiegen?',
        options: [
          'Er mauerte ganz Italien mit einer zehn Meter hohen Steinwand ein.',
          'Er griff Karthago direkt in Nordafrika an, zwang Hannibal zur Rückkehr aus Italien und besiegte ihn in der Entscheidungsschlacht bei Zama.',
          'Er kaufte Hannibal alle Kriegselefanten mit Silbermünzen ab.',
        ],
        correctIndex: 1,
        explanation:
          'Durch den Gegenangriff auf Nordafrika musste Hannibal Italien nach 15 Jahren verlassen und unterlag Scipio 202 v. Chr. bei Zama.',
      },
      {
        question: 'Welche weitreichende Folge hatte der Sieg über Karthago in den Punischen Kriegen für Rom?',
        options: [
          'Rom stieg zur unangefochtenen Weltmacht im gesamten westlichen und bald auch östlichen Mittelmeerraum („Mare Nostrum") auf.',
          'Rom löste sein gesamtes Heer auf und verzichtete auf alle Provinzen.',
          'Karthago und Rom schlossen sich zu einem friedlichen Bauernstaat ohne Städte zusammen.',
        ],
        correctIndex: 0,
        explanation:
          'Mit der Entmachtung (202 v. Chr.) und späteren Zerstörung Karthagos (146 v. Chr.) wurde das Mittelmeer zum römischen Binnenmeer („Mare Nostrum").',
      },
    ],
    summary:
      'In den Punischen Kriegen rang Rom mit Karthago um die Vorherrschaft im Mittelmeer. Trotz Hannibals Alpenüberquerung und der verheerenden Niederlage bei Cannae (216 v. Chr.) hielt Rom durch, bis Scipio Africanus 202 v. Chr. bei Zama siegte und Rom zur Weltmacht aufstieg.',
    unlocksText: 'Freigeschaltet: Kapitel 5 (133 v. Chr. – Das Blut der Reformer)!',
  },
  {
    id: 5,
    title: 'Kapitel 5: Das Blut der Reformer',
    subtitle: 'Schere zwischen Arm und Reich, Latifundien, Agrarkrise und der Beginn politischer Gewalt',
    year: '133 v. Chr.',
    mentorId: 'npc_gracchus',
    mentorName: 'Tiberius Sempronius Gracchus',
    mentorRole: 'Volkstribun & Sozialreformer der Plebejer',
    introDialog: [
      'Sieh dir die Bettler auf den Straßen Roms an, Bürger! Es sind unsere eigenen Legionäre, die Karthago und Griechenland besiegt haben! Doch während sie jahrelang in der Ferne kämpften, verfielen ihre kleinen Bauernhöfe daheim.',
      'Gierige Senatoren haben das Staatsland – den Ager Publicus – an sich gerissen und bewirtschaften riesige Großgüter, sogenannte Latifundien, mit hunderttausenden billigen Kriegssklaven. Die wilden Tiere Italiens haben ihre Höhlen, aber die Männer, die für Rom kämpfen und sterben, besitzen nichts als Luft und Licht!',
      'Als gewählter Volkstribun bringe ich heute im Jahr 133 v. Chr. mein Ackergesetz (Lex Sempronia Agraria) ein: Kein Reicher darf mehr als 500 Joch Staatsland besitzen, der Rest wird an landlose Kleinbauern verteilt! Hilf mir, die „Ackergesetz-Rolle (Lex Agraria)" zu verfassen und das Volk mit frischem „Panis-Rundbrot" zu stärken, bevor die radikalen Optimaten im Senat zu Gewalt greifen!',
    ],
    questDescription:
      'Backe im Handwerk [C] „Panis-Rundbrot" (2x Emmer-Getreide, 1x Tiber-Quellwasser) und verfasse unter „Republik & Militär" die „Ackergesetz-Rolle (Lex Agraria)" (1x Römisches Olivenöl, 1x Emmer-Getreide). Überbringe beides an Volkstribun Tiberius Gracchus.',
    hints: [
      'Emmer-Getreide erntest du auf dem Ackerfeld, Quellwasser schöpfst du am Tiberbrunnen und Olivenöl presst du in [C] aus 2x Sabiner Oliven.',
      'Backe zuerst unter „Alltag & Wirtschaft" das „Panis-Rundbrot" (2x Emmer-Getreide, 1x Wasser).',
      'Fertige danach unter „Republik & Militär" die „Ackergesetz-Rolle (Lex Agraria)" (1x Olivenöl, 1x Getreide) und sprich mit Tiberius Gracchus [E].',
    ],
    quiz: [
      {
        question: 'Warum verarmten im 2. Jahrhundert v. Chr. ausgerechnet viele römische Kleinbauern, obwohl Rom zur reichen Weltmacht aufgestiegen war?',
        options: [
          'Weil die Bauern durch jahrelange Kriege in Übersee ihre Höfe nicht bestellen konnten und gegen die billig produzierenden Sklaven-Großgüter (Latifundien) der Senatoren chancenlos waren.',
          'Weil es in Italien plötzlich fünfzig Jahre lang keinen einzigen Regentropfen mehr gab.',
          'Weil der Senat den Anbau von Getreide gesetzlich verboten hatte.',
        ],
        correctIndex: 0,
        explanation:
          'Reiche Senatoren investierten Kriegsbeute in riesige Latifundien mit Sklavenarbeit. Verschuldete Kleinbauern verloren ihr Land und zogen als besitzloses Proletariat in die Hauptstadt.',
      },
      {
        question: 'Was forderte der Volkstribun Tiberius Gracchus im Jahr 133 v. Chr. mit seiner Ackerreform (Lex Sempronia Agraria)?',
        options: [
          'Dass alle Senatoren als einfache Bauern nach Afrika auswandern müssen.',
          'Dass der Besitz an staatlichem Gemeindeland (Ager Publicus) pro Familie begrenzt und das überschüssige Land an verarmte Bürger verteilt wird, um den Bauernstand und das Heer zu retten.',
          'Dass alle Sklaven sofort zu Konsuln ernannt werden.',
        ],
        correctIndex: 1,
        explanation:
          'Da nur Landbesitzer im römischen Heer dienen durften, wollte Gracchus durch die Landverteilung sowohl die soziale Not lindern als auch die Wehrkraft Roms sichern.',
      },
      {
        question: 'Warum gilt die Ermordung des Tiberius Gracchus (133 v. Chr.) durch wütende Senatoren als verhängnisvoller Wendepunkt der Römischen Republik?',
        options: [
          'Weil damit zum ersten Mal der politische Kompromiss durch blutige Straßengewalt und Mord (selbst an einem unantastbaren Volkstribunen) ersetzt wurde – der Beginn der hundertjährigen Republikkrise.',
          'Weil danach sofort die Etrusker Rom wieder eroberten.',
          'Weil der Senat sich aus Scham für immer auflöste.',
        ],
        correctIndex: 0,
        explanation:
          'Obwohl ein Volkstribun als religiös unantastbar (sacrosanctus) galt, erschlugen konservative Senatoren (Optimaten) Gracchus und 300 seiner Anhänger mit Stuhlbeinen – der Auftakt zu den römischen Bürgerkriegen.',
      },
    ],
    summary:
      'Durch die Eroberungskriege verdrängten riesige Sklavengüter (Latifundien) der reichen Oberschicht die freien Kleinbauern. Als Volkstribun Tiberius Gracchus 133 v. Chr. Staatsland an Arme umverteilen wollte, wurde er von Senatoren ermordet – der Beginn der blutigen Spaltung zwischen Optimaten und Popularen.',
    unlocksText: 'Freigeschaltet: Kapitel 6 (73–71 v. Chr. – Der Schrei nach Freiheit)!',
  },
  {
    id: 6,
    title: 'Kapitel 6: Der Schrei nach Freiheit',
    subtitle: 'Unterdrückung, Alltagsleben der Sklaven, Gladiatorenkämpfe und der Aufstand des Spartacus',
    year: '73 – 71 v. Chr.',
    mentorId: 'npc_spartacus',
    mentorName: 'Spartacus',
    mentorRole: 'Thrakischer Gladiator & Anführer des Sklavenaufstands',
    introDialog: [
      'Sie nennen uns „instrumentum vocale" – sprechendes Werkzeug! Ich bin Spartacus aus Thrakien. In der Gladiatorenschule des Lentulus Batiatus in Capua sollten wir mit unserem Blut im Sand der Arena den römischen Pöbel belustigen!',
      'Doch im Jahr 73 v. Chr. haben wir siebzig Gladiatoren uns mit Küchenmessern und Bratspießen befreit! Aus den Latifundien und Bergwerken strömen zehntausende geschundene Sklaven aus Thrakien, Gallien, Syrien und Germanien in unser Lager am Vesuv. Wir beten zu unseren Heimatgöttern und zur Göttin der Freiheit!',
      'Wer für seine Freiheit kämpft, zerbricht jede Kette! Schmiede im Handwerk [C] aus Eisenerz und Eichenholz den „Gladiatoren-Dreizack (Fuscina)" und das „Römische Kurzschwert (Gladius)", damit unsere Brüder und Schwestern sich gegen die Legionen des Crassus verteidigen können!',
    ],
    questDescription:
      'Schmiede im Handwerk [C] unter „Republik & Militär" den „Gladiatoren-Dreizack (Fuscina)" (2x Eisenerz, 1x Holz) sowie das „Römische Kurzschwert (Gladius)" (2x Eisenerz, 1x Holz). Kehre dann zu Spartacus zurück.',
    hints: [
      'Etruskisches Eisenerz baust du an der Eisenmine im Nordosten ab [E] (oder ertauschst es am Hafen [H] gegen Weintrauben), Eichenholz im Hain.',
      'Öffne [C] und wechsle zum Reiter „Republik & Militär".',
      'Schmiede dort den „Gladiatoren-Dreizack (Fuscina)" und das „Römische Kurzschwert (Gladius)" und sprich mit Spartacus [E].',
    ],
    quiz: [
      {
        question: 'Welche rechtliche Stellung hatten Sklaven in der römischen Gesellschaft?',
        options: [
          'Sie galten rechtlich nicht als Personen, sondern als Eigentum („sprechende Werkzeuge"), über das der Herr uneingeschränkt verfügen konnte.',
          'Sie durften jedes Jahr an den Konsulwahlen teilnehmen, mussten aber doppelte Steuern zahlen.',
          'Sie waren nur für drei Jahre verpflichtet und wurden danach automatisch Senatoren.',
        ],
        correctIndex: 0,
        explanation:
          'Im römischen Recht waren Sklaven rechtlose Sachen, auch wenn ihre tatsächlichen Lebensbedingungen stark zwischen gebildeten Haussklaven in der Stadt und ausgebeuteten Arbeits- oder Gladiatorensklaven schwankten.',
      },
      {
        question: 'Warum versetzte der Aufstand des Gladiators Spartacus (73–71 v. Chr.) die römische Republik in tiefe Panik?',
        options: [
          'Weil Spartacus ein Heer von über 70.000 entflohenen Sklaven anführte und mehrere reguläre römische Konsularheere in Italien besiegte, bevor Marcus Licinius Crassus den Aufstand blutig niederschlug.',
          'Weil Spartacus den Tiber austrinken ließ.',
          'Weil sich alle römischen Senatoren freiwillig Spartacus anschlossen.',
        ],
        correctIndex: 0,
        explanation:
          'Über zwei Jahre lang beherrschte das Sklavenheer weite Teile Süditaliens. Nach dem Sieg ließ Crassus zur Abschreckung 6.000 gefangene Sklaven entlang der Via Appia kreuzigen.',
      },
      {
        question: 'Welche religiöse Vielfalt herrschte unter den Sklaven und einfachen Schichten im wachsenden Römischen Reich?',
        options: [
          'Da die Versklavten aus dem gesamten Mittelmeerraum stammten, brachten sie multikulturelle Kulte (wie den ägyptischen Isis-Kult oder den thrakischen Dionysos/Bacchus-Kult) nach Italien, die allen Menschen – auch Sklaven – Trost und Erlösung versprachen.',
          'Sklaven war es physisch unmöglich, an irgendwelche Götter zu glauben.',
          'Alle Sklaven stammten ausschließlich aus der Stadt Rom selbst.',
        ],
        correctIndex: 0,
        explanation:
          'Östliche Mysterienkulte machten keinen Unterschied zwischen Freien und Sklaven und gewannen deshalb in der Unterschicht Roms enormen Zulauf.',
      },
    ],
    summary:
      'Die römische Wirtschaft basierte auf der Ausbeutung von Millionen Sklaven. Während Haussklaven oft besser gestellt waren, litten Feld-, Bergwerks- und Gladiatorensklaven unter extremer Gewalt, die sich 73–71 v. Chr. im großen Sklavenaufstand unter Spartacus entlud.',
    unlocksText: 'Freigeschaltet: Kapitel 7 (49–44 v. Chr. – Der Würfel ist gefallen) & Relikt an der Curia!',
  },
  {
    id: 7,
    title: 'Kapitel 7: Der Würfel ist gefallen',
    subtitle: 'Überschreitung des Rubikon, „Brot und Spiele", Diktatur auf Lebenszeit und die Iden des März',
    year: '49 – 44 v. Chr.',
    mentorId: 'npc_caesar',
    mentorName: 'Gaius Iulius Caesar',
    mentorRole: 'Triumphator & Diktator auf Lebenszeit (Dictator Perpetuo)',
    introDialog: [
      'Alea iacta est – Der Würfel ist gefallen! Ich bin Gaius Iulius Caesar. Zehn Jahre lang habe ich ganz Gallien bis an den Rhein für Rom unterworfen, doch die missgünstigen Optimaten im Senat wollten mich entwaffnen und vor Gericht stellen. Also überschritt ich 49 v. Chr. mit meiner treuen 13. Legion den Grenzfluss Rubikon!',
      'Die alte Republik ist morsch und korrupt. Das Volk von Rom liebt mich, denn ich gebe ihm Arbeit, erlasse Schulden, reformiere den Kalender und schenke den Hunderttausenden in der Stadt „Brot und Spiele" – kostenlose Getreidespenden und prächtige Triumphzüge! Nun hat mich der Senat zum „Dictator perpetuo" – zum Diktator auf Lebenszeit – ernannt.',
      'Doch vor den Iden des März (15. März 44 v. Chr.) tuscheln Verschwörer wie Brutus und Cassius in den Schatten der Curia... Präge im Handwerk [C] den „Römischen Silber-Denar" mit meinem Bildnis und schmiede den „Goldenen Legionsadler (Aquila)", um meinen unsterblichen Ruhm zu besiegeln!',
    ],
    questDescription:
      'Präge im Handwerk [C] unter „Republik & Militär" den „Römischen Silber-Denar" (2x Hispanisches Silbererz) und schmiede anschließend den „Goldenen Legionsadler (Aquila)" (1x Silber-Denar, 1x Eisenerz). Sprich dann mit Caesar.',
    hints: [
      'Hispanisches Silbererz baust du an der Silbermine im Osten ab [E] (oder ertauschst es am Hafen [H] gegen Tonziegel), Eisenerz an der Eisenmine im Nordosten.',
      'Präge zuerst in [C] unter „Republik & Militär" den „Römischen Silber-Denar" (ergibt 2 Münzen).',
      'Schmiede danach mit 1x Silber-Denar und 1x Eisenerz den „Goldenen Legionsadler (Aquila)" und kehre zu Julius Caesar zurück [E]. (Suche an der Curia auch nach Caesars Silberdenar-Relikt!)',
    ],
    quiz: [
      {
        question: 'Was bedeutete Caesars Überschreitung des Flusses Rubikon im Januar 49 v. Chr. („Der Würfel ist gefallen")?',
        options: [
          'Indem Caesar mit seinen Legionen bewaffnet die Grenze nach Italien überschritt, brach er das Gesetz des Senats und eröffnete bewusst den Bürgerkrieg um die Macht in Rom.',
          'Er eröffnete dort das erste öffentliche Schwimmbad für seine Soldaten.',
          'Er trat freiwillig von allen Ämtern zurück, um Schriftsteller zu werden.',
        ],
        correctIndex: 0,
        explanation:
          'Kein Statthalter durfte seine Provinz an der Spitze einer Armee Richtung Rom verlassen. Das Überschreiten des Rubikon war eine offene Kriegserklärung an den Senat.',
      },
      {
        question: 'Warum ermordeten rund 60 Senatoren unter Führung von Brutus und Cassius Julius Caesar an den „Iden des März" (15. März 44 v. Chr.)?',
        options: [
          'Weil Caesar sich zum „Diktator auf Lebenszeit" (Dictator perpetuo) ernennen ließ und damit die zeitliche Begrenzung der Ämter – das Herzstück der Republik – endgültig abschaffte.',
          'Weil Caesar Gallien an die Kelten zurückschenken wollte.',
          'Weil Caesar das Tragen der Toga verboten hatte.',
        ],
        correctIndex: 0,
        explanation:
          'Eine Diktatur auf Lebenszeit widersprach dem Prinzip der Annuität fundamental und kam in den Augen der Republikaner einer verhassten Königsherrschaft gleich.',
      },
      {
        question: 'Warum scheiterte der Plan der Caesarmörder, durch das Attentat die alte Republik wiederherzustellen?',
        options: [
          'Weil Caesars Veteranen und das einfache Stadtvolk, das von Caesars „Brot und Spielen" sowie Landgesetzen profitiert hatte, sich gegen die Verschwörer stellten und Caesars Erben (Octavian und Marcus Antonius) unterstützten.',
          'Weil Caesar das Attentat unverletzt überlebte und noch dreißig Jahre regierte.',
          'Weil alle Senatoren am nächsten Tag nach Britannien auswanderten.',
        ],
        correctIndex: 0,
        explanation:
          'Die Verschwörer hatten keinen Plan für die Zeit nach der Tat. Statt der alten Republik folgten 14 weitere Jahre Bürgerkrieg, aus denen Caesars Adoptivsohn Octavian (Augustus) als erster Kaiser hervorging.',
      },
    ],
    summary:
      'Im 1. Jh. v. Chr. waren die Legionen ihren Feldherren treuer als dem Senat. Nach der Eroberung Galliens überschritt Julius Caesar 49 v. Chr. den Rubikon, besiegte seine Gegner im Bürgerkrieg und wurde „Diktator auf Lebenszeit". Seine Ermordung am 15. März 44 v. Chr. konnte die Republik nicht mehr retten.',
    unlocksText: 'Freigeschaltet: Kapitel 8 (27 v. Chr.–14 n. Chr. – Pax Romana) & Bauplan: Römischer Aquädukt!',
  },
  {
    id: 8,
    title: 'Kapitel 8: Pax Romana',
    subtitle: 'Prinzipat des Augustus, Goldene Ära der Architektur, Infrastruktur und der Kaiserkult',
    year: '27 v. Chr. – 14 n. Chr.',
    mentorId: 'npc_augustus',
    mentorName: 'Kaiser Augustus (Octavian)',
    mentorRole: 'Erster Kaiser Roms (Princeps Civitatis)',
    introDialog: [
      'Friede sei mit dir, Bürger! Hundert Jahre Bürgerkrieg haben Rom ausgeblutet. Ich, Caesars Adoptivsohn Octavian, habe den letzten Rivalen Marcus Antonius und Kleopatra besiegt. Im Jahr 27 v. Chr. verlieh mir der Senat den Ehrennamen Augustus – „der Erhabene"!',
      'Ich mache nicht den Fehler meines Adoptivvaters Caesar: Ich nenne mich niemals König oder Diktator, sondern bescheiden „Princeps" – der Erste Bürger! Der Senat und die Konsuln tagen weiter, doch ich allein befehlige alle Legionen und besitze das Vetorecht der Volkstribunen. So habe ich das Prinzipat und die Pax Romana – den großen Römerfrieden – begründet!',
      'Ich fand eine Stadt aus Ziegeln vor und hinterlasse euch eine Stadt aus glänzendem Marmor! Mische im Handwerk [C] den wasserfesten „Römischen Beton (Opus Caementicium)", errichte im Baumenü [B] den „Römischen Aquädukt & Thermenbrunnen" und flechte den „Kaiserlichen Lorbeerkranz"!',
    ],
    questDescription:
      'Mische im Handwerk [C] unter „Kaiserzeit & Spätantike" den „Römischen Beton (Opus Caementicium)" (2x Tuffstein, 1x Wasser) und baue im Baumenü [B] den „Römischen Aquädukt & Thermenbrunnen" (2x Tuffstein, 1x Römischer Beton). Flechte außerdem in [C] den „Kaiserlichen Lorbeerkranz" (2x Oliven) und kehre zu Kaiser Augustus zurück.',
    hints: [
      'Tuffstein brichst du am Felsen am Palatin [E], Quellwasser schöpfst du am Tiberbrunnen und Oliven erntest du im Olivenhain.',
      'Mische zuerst in [C] unter „Kaiserzeit & Spätantike" den „Römischen Beton" und errichte dann mit [B] den „Römischen Aquädukt & Thermenbrunnen".',
      'Flechte danach in [C] den „Kaiserlichen Lorbeerkranz" (2x Oliven) und sprich mit Augustus [E]. (Untersuche auch das Augustus-Relikt!)',
    ],
    quiz: [
      {
        question: 'Wie gelang es Augustus ab 27 v. Chr., im „Prinzipat" als Alleinherrscher (Kaiser) zu regieren, ohne wie Caesar von Republikanern ermordet zu werden?',
        options: [
          'Er ließ die republikanischen Ämter und den Senat äußerlich bestehen („wiederhergestellte Republik"), vereinte aber als „Princeps" (Erster Bürger) den Oberbefehl über das Heer und die Gewalt des Volkstribunen in seiner Hand.',
          'Er versteckte sich vierzig Jahre lang in einer unterirdischen Höhle.',
          'Er schaffte das Militär komplett ab und regierte nur durch Gedichte.',
        ],
        correctIndex: 0,
        explanation:
          'Das Prinzipat war eine geschickt getarnte Monarchie hinter republikanischer Fassade: Der Senat behielt sein gesellschaftliches Ansehen, während die reale militärische und politische Macht beim Kaiser lag.',
      },
      {
        question: 'Was versteht man unter der „Pax Romana" (Römischer Frieden), die unter Augustus begann?',
        options: [
          'Eine rund 200-jährige Epoche innerer Stabilität, sicherer Straßen, blühenden Fernhandels und einheitlicher Rechtsprechung im gesamten Mittelmeerraum.',
          'Einen Friedensvertrag zwischen Rom und China über die Aufteilung Amerikas.',
          'Das Verbot jeglicher Waffenschmieden im gesamten Römischen Reich.',
        ],
        correctIndex: 0,
        explanation:
          'Nach den verheerenden Bürgerkriegen brachte die Pax Romana den rund 50–70 Millionen Einwohnern des Imperiums inneren Frieden und wirtschaftlichen Wohlstand.',
      },
      {
        question: 'Welche Funktion erfüllten die gewaltigen Aquädukte und gepflasterten Römerstraßen für das Imperium?',
        options: [
          'Sie dienten nur als schöne Dekoration für Maler und Dichter.',
          'Straßen ermöglichten schnelle Truppenbewegungen, Postverkehr und Handel bis in die Provinzen, während Aquädukte die Millionenstädte mit sauberem Trinkwasser für Brunnen und Thermen versorgten.',
          'Auf den Aquädukten fuhren die römischen Kriegsschiffe über die Berge.',
        ],
        correctIndex: 1,
        explanation:
          'Die hochentwickelte römische Infrastruktur (Opus Caementicium, Bogenbrücken, Fernstraßen) band die weit entfernten Provinzen eng an das Reichszentrum.',
      },
    ],
    summary:
      '27 v. Chr. begründete Augustus das römische Kaisertum (Prinzipat): Hinter der Fassade der Republik herrschte er als „Erster Bürger" (Princeps) über Armee und Staat. Es begann die rund 200-jährige Blütezeit der Pax Romana mit monumentalem Marmorausbau und Aquädukten.',
    unlocksText: 'Freigeschaltet: Kapitel 9 (64 n. Chr. – Der Wahnsinn auf dem Thron) & Zugang zu den Katakomben!',
  },
  {
    id: 9,
    title: 'Kapitel 9: Der Wahnsinn auf dem Thron',
    subtitle: 'Kaiserliche Tyrannei unter Nero, Leben in den Mietskasernen (Insulae) & Christen in den Katakomben',
    year: '64 n. Chr.',
    mentorId: 'npc_claudia',
    mentorName: 'Claudia von Trastevere',
    mentorRole: 'Bewohnerin einer Mietskaserne & frühe Christin im Untergrund',
    introDialog: [
      'Pst, sprich leise, Freund! Wir schreiben das Jahr 64 n. Chr., und über den Ruinen Roms hängt noch immer der beißende Rauch des Großen Brandes! Neun Tage lang fraßen die Flammen unsere engen, sechsstöckigen Mietskasernen – die Insulae –, in denen wir einfachen Leute ohne fließendes Wasser zusammengepfercht leben.',
      'Auf dem Thron sitzt Kaiser Nero, der sich lieber als Sänger und Wagenlenker feiern lässt und mitten in der abgebrannten Stadt seinen gigantischen „Goldenen Palast" (Domus Aurea) baut! Um vom Gerücht abzulenken, er habe das Feuer selbst legen lassen, hat Nero uns Christen zu Sündenböcken erklärt!',
      'Weil wir nur an einen einzigen Gott glauben und nicht vor den Kaiserstatuen opfern, werden meine Brüder und Schwestern in der Arena den wilden Tieren vorgeworfen! Wir treffen uns heimlich tief unter der Erde in den Katakomben. Fertige im Handwerk [C] eine „Römische Ton-Öllampe (Lucerna)" und steige hinab in die Katakomben im Südosten, um am frühchristlichen Ichthys-Altar zu beten!',
    ],
    questDescription:
      'Fertige im Handwerk [C] unter „Kaiserzeit & Spätantike" die „Römische Ton-Öllampe (Lucerna)" (1x Römische Tonziegel, 1x Römisches Olivenöl) und betrete den Katakomben-Eingang an der Via Appia im Südosten [E], um am frühchristlichen Ichthys-Altar zu beten. Sprich danach mit Claudia.',
    hints: [
      'Tonziegel brennst du in [C] aus 2x Tuffstein, Olivenöl presst du in [C] aus 2x Sabiner Oliven.',
      'Stelle in [C] unter „Kaiserzeit & Spätantike" die „Römische Ton-Öllampe (Lucerna)" her.',
      'Laufe dann nach Südosten zum „Katakomben-Eingang an der Via Appia" (x: 82, y: 48), drücke [E], betrete die unterirdischen Katakomben und interagiere links im Gewölbe mit dem frühchristlichen Ichthys-Altar [E]!',
    ],
    quiz: [
      {
        question: 'Wie wohnte die überwältigende Mehrheit (über 90 %) der rund eine Million Einwohner im kaiserzeitlichen Rom?',
        options: [
          'In mehrstöckigen, eng gebauten Mietskasernen (Insulae), deren obere Fachwerk-Stockwerke kein fließendes Wasser besaßen und extrem feuer- und einsturzgefährdet waren.',
          'Jeder Römer besaß eine eigene Marmorvilla mit zwanzig Gärten und eigenem Schwimmbad.',
          'In Zelten aus Kamelleder mitten auf dem Forum Romanum.',
        ],
        correctIndex: 0,
        explanation:
          'Während die schmale Oberschicht in ebenerdigen Stadthäusern (Domus) wohnte, lebte die Masse der Bevölkerung in überfüllten, brandgefährlichen Insulae.',
      },
      {
        question: 'Warum wurden die frühen Christen im Römischen Reich (erstmals 64 n. Chr. unter Kaiser Nero) vom Staat verfolgt, obwohl Rom sonst viele fremde Götter duldete?',
        options: [
          'Weil die Christen als Monotheisten das Opfer vor den römischen Staatsgöttern und dem Kaiserbildnis verweigerten, was den Römern als Hochverrat und Gefährdung des göttlichen Staatsschutzes galt.',
          'Weil die Christen verboten, auf Lateinisch oder Griechisch zu sprechen.',
          'Weil die Christen ein eigenes Heer mit Kriegselefanten in Spanien aufstellten.',
        ],
        correctIndex: 0,
        explanation:
          'Der römische Staat verlangte kein inneres Glaubensbekenntnis, aber das formelle Loyalitätsopfer vor den Staatsgöttern und dem Genius des Kaisers. Die christliche Weigerung galt als illoyaler Ungehorsam.',
      },
      {
        question: 'Welche Bedeutung hatten die Katakomben und das Fischsymbol (Ichthys) für die frühen Christen in Rom?',
        options: [
          'Die Katakomben waren unterirdische Grabstätten im weichen Tuffstein vor den Stadtmauern, und das griechische Wort für Fisch (ICHTHYS) diente als geheimes Erkennungszeichen („Jesus Christus, Gottes Sohn, Erlöser").',
          'Es waren unterirdische Fischzuchtbecken für die kaiserliche Küche.',
          'Es waren die Schatzkammern der römischen Bankiers.',
        ],
        correctIndex: 0,
        explanation:
          'Die Buchstaben von ΙΧΘΥΣ (Ichthys = Fisch) bildeten das Akrostichon für „Iēsoûs Christòs Theoû Huiòs Sōtḗr" (Jesus Christus, Gottes Sohn, Retter).',
      },
    ],
    summary:
      'Hinter dem Glanz der Kaiserpaläste lebte das einfache Volk Roms in engen, feuergefährdeten Mietskasernen (Insulae). Nach dem Großen Brand Roms 64 n. Chr. machte Kaiser Nero die kleine Gemeinde der Christen zu Sündenböcken. Weil sie den Kaiserkult ablehnten, wurden sie verfolgt und bestatteten ihre Toten in den unterirdischen Katakomben.',
    unlocksText: 'Freigeschaltet: Kapitel 10 (117 n. Chr. – Die größte Ausdehnung) & Bauplan: Kolosseum!',
  },
  {
    id: 10,
    title: 'Kapitel 10: Die größte Ausdehnung',
    subtitle: 'Antike Globalisierung unter Trajan, Romanisierung der Provinzen, Limes & Mithraskult der Soldaten',
    year: '117 n. Chr.',
    mentorId: 'npc_trajan',
    mentorName: 'Kaiser Marcus Ulpius Traianus (Trajan)',
    mentorRole: 'Optimus Princeps – Herrscher über das Imperium auf seinem Zenit',
    introDialog: [
      'Salve, Kamerad! Du blickst auf das Römische Weltreich im Jahr 117 n. Chr. auf dem absoluten Gipfel seiner Macht! Ich bin Kaiser Trajan – der erste Kaiser, der selbst aus einer Provinz (Spanien) stammt. Von den Nebeln Schottlands bis an den Euphrat im Zweistromland, vom Rhein und der Donau bis an den Rand der Sahara gehorchen über 60 Millionen Menschen dem römischen Adler!',
      'An den Grenzen sichern befestigte Wachtürme und Wälle – der Limes – unser Reich. In den Provinzen blüht die Romanisierung: Überall entstehen Städte nach römischem Vorbild mit Foren, Thermen, Amphitheatern und lateinischer Sprache, während über 80.000 Kilometer Fernstraßen die Welt mit Rom verbinden.',
      'Und unsere Legionäre aus allen Reichsteilen suchen Kraft im geheimnisvollen Mithraskult tief unter der Erde! Baue im Baumenü [B] das „Amphitheatrum Flavium (Kolosseum)", meißle im Handwerk [C] einen „Römischen Meilenstein (Miliarium)" und besuche das unterirdische Mithräum der Legionäre in den Katakomben!',
    ],
    questDescription:
      'Baue im Baumenü [B] das „Amphitheatrum Flavium (Kolosseum)" (2x Tuffstein, 2x Carrara-Marmor). Meißle in [C] den „Römischen Meilenstein (Miliarium)" (2x Tuffstein, 1x Marmor) und besuche das Mithräum der Legionäre in den Katakomben [E]. Sprich danach mit Kaiser Trajan.',
    hints: [
      'Tuffstein brichst du am Palatin [E], Carrara-Marmor am Marmorsteinbruch im Nordosten [E] (oder am Hafen [H] gegen Silber-Denare).',
      'Baue zuerst mit [B] das „Amphitheatrum Flavium (Kolosseum)" und meißle in [C] unter „Kaiserzeit & Spätantike" den „Römischen Meilenstein (Miliarium)".',
      'Steige danach durch den Katakomben-Eingang im Südosten hinab und interagiere rechts im unterirdischen Gewölbe mit dem „Mithräum der Legionäre" [E], bevor du zu Trajan zurückkehrst!',
    ],
    quiz: [
      {
        question: 'Welche Funktion hatte der „Limes" (z. B. der Obergermanisch-Rätische Limes an Rhein und Donau) im 2. Jahrhundert n. Chr.?',
        options: [
          'Er war eine mit Wachtürmen, Palisaden und Kastellen gesicherte Reichsgrenze, die vor Überfällen schützte, aber vor allem den Grenzverkehr, Zoll und Handel zwischen Römern und Germanen kontrollierte.',
          'Er war eine unterirdische Eisenbahnlinie von Rom nach Berlin.',
          'Er diente als Rennstrecke für kaiserliche Streitwagen.',
        ],
        correctIndex: 0,
        explanation:
          'Der Limes war keine völlig undurchdringliche Mauer, sondern eine überwachte Überwachungs- und Zollgrenze mit Toren für geregelten Warenaustausch.',
      },
      {
        question: 'Was versteht man unter der „Romanisierung" der Provinzen (wie Gallien, Spanien oder den Rheinlanden)?',
        options: [
          'Die Verbreitung römischer Lebensweise, Stadtplanung (Thermen, Theater, Aquädukte), des römischen Rechts und der lateinischen Sprache, aus der sich später die romanischen Sprachen entwickelten.',
          'Die Zwangsumsiedlung aller Provinzbewohner in die Stadt Rom.',
          'Das Verbot von Handel und Handwerk außerhalb Italiens.',
        ],
        correctIndex: 0,
        explanation:
          'Viele einheimische Eliten in den Provinzen übernahmen freiwillig römische Kultur und erhielten das begehrte römische Bürgerrecht (212 n. Chr. schließlich für alle freien Reichsbewohner).',
      },
      {
        question: 'Warum war der orientalische „Mithraskult" im 2. und 3. Jahrhundert besonders bei den römischen Legionären am Limes so beliebt?',
        options: [
          'Der in unterirdischen Höhlentempeln (Mithräen) gefeierte Mysterienkult des Lichtgottes Mithras betonte Kameradschaft, Treue, Disziplin und den Sieg des Lichts über die Finsternis.',
          'Weil der Mithraskult allen Soldaten verbot, jemals wieder Waffen zu tragen.',
          'Weil nur Senatorenfrauen in die Mithräen eintreten durften.',
        ],
        correctIndex: 0,
        explanation:
          'Der stufenweise aufgebaute Männerbund des Mithraskults sprach mit seinen Werten von Pflichterfüllung und Bruderschaft besonders Soldaten und Beamte im gesamten Imperium an.',
      },
    ],
    summary:
      'Unter Kaiser Trajan erreichte das Römische Reich 117 n. Chr. seine größte Ausdehnung rund um das Mittelmeer. Der Limes sicherte die Grenzen, durch die Romanisierung entstanden blühende Provinzstädte mit Fernhandel bis nach Asien, und unter den Legionären verbreitete sich der Mysterienkult des Gottes Mithras.',
    unlocksText: 'Freigeschaltet: Kapitel 11 (312 n. Chr. – Das geteilte Reich) & Bauplan: Konstantinsbasilika!',
  },
  {
    id: 11,
    title: 'Kapitel 11: Das geteilte Reich',
    subtitle: 'Krise der Spätantike, Konstantinische Wende und der Aufstieg des Christentums zur Staatsmacht',
    year: '312 – 330 n. Chr.',
    mentorId: 'npc_konstantin',
    mentorName: 'Kaiser Konstantin der Große',
    mentorRole: 'Sieger an der Milvischen Brücke & Gründer Konstantinopels',
    introDialog: [
      'In hoc signo vinces – „In diesem Zeichen wirst du siegen!" Ich bin Kaiser Konstantin. Vor den Toren Roms, an der Milvischen Brücke über den Tiber, zog ich im Jahr 312 n. Chr. in die Entscheidungsschlacht gegen meinen Rivalen Maxentius. Am Himmel sah ich das leuchtende Kreuzzeichen Chi-Rho (☧) – die Anfangsbuchstaben Christi – und ließ es auf die Schilde meiner Soldaten malen!',
      'Vorbei ist die Zeit der blutigen Christenverfolgungen unter Diokletian! Mit der Mailänder Vereinbarung (313 n. Chr.) schenke ich den Christen volle Religionsfreiheit und fördere die Kirche mit prachtvollen Basiliken. Das riesige Reich ist jedoch zu groß für ein einziges Zentrum geworden: Im Osten gründe ich 330 n. Chr. am Bosporus eine neue, christliche Hauptstadt – Konstantinopel, das „Neue Rom"!',
      'Errichte im Baumenü [B] die monumentale „Konstantinsbasilika & Kloster-Skriptorium" und fertige im Handwerk [C] den „Konstantinischen Chi-Rho-Schild (☧)", um die Konstantinische Wende zu vollenden!',
    ],
    questDescription:
      'Baue im Baumenü [B] die „Konstantinsbasilika & Kloster-Skriptorium" (2x Carrara-Marmor, 2x Römische Tonziegel). Fertige außerdem im Handwerk [C] den „Konstantinischen Chi-Rho-Schild (☧)" (1x Holz, 1x Eisenerz) und sprich mit Kaiser Konstantin.',
    hints: [
      'Carrara-Marmor baust du im Nordosten ab [E], Römische Tonziegel brennst du in [C] aus 2x Tuffstein.',
      'Baue mit [B] die „Konstantinsbasilika & Kloster-Skriptorium".',
      'Fertige danach in [C] unter „Kaiserzeit & Spätantike" den „Konstantinischen Chi-Rho-Schild (☧)" (1x Holz, 1x Eisenerz) und sprich mit Konstantin [E]. (Suche an der Basilika auch nach dem 5. Relikt!)',
    ],
    quiz: [
      {
        question: 'Was versteht man in der Geschichtswissenschaft unter der „Konstantinischen Wende" (312/313 n. Chr.)?',
        options: [
          'Den historischen Wandel des Christentums von einer verfolgten Minderheitenreligion zur staatlich anerkannten und kaiserlich geförderten Religion unter Kaiser Konstantin.',
          'Die Umkehrung der Fließrichtung des Flusses Tiber durch römische Ingenieure.',
          'Die Rückkehr Roms zur alten Königsherrschaft der Etrusker.',
        ],
        correctIndex: 0,
        explanation:
          'Durch Konstantins Sieg an der Milvischen Brücke (312) und die Mailänder Vereinbarung (313) endeten die Christenverfolgungen; 380 n. Chr. wurde das Christentum unter Theodosius I. schließlich alleinige Staatsreligion.',
      },
      {
        question: 'Warum verlegte Kaiser Konstantin 330 n. Chr. seine Residenz von Rom nach Konstantinopel (dem heutigen Istanbul) und warum wurde das Reich 395 n. Chr. geteilt?',
        options: [
          'Die östlichen Provinzen waren wirtschaftlich viel reicher und bevölkerungsstärker, und Konstantinopel lag strategisch näher an den bedrohten Grenzen an Donau und Euphrat; durch die Reichsteilung (Westrom/Ostrom) sollte das Riesenreich besser verteidigt werden.',
          'Weil die Stadt Rom im Meer versunken war.',
          'Weil Konstantin die griechische Sprache verbieten wollte.',
        ],
        correctIndex: 0,
        explanation:
          'Der griechisch geprägte Osten war wirtschaftlich stabiler als der Westen. Nach der endgültigen Reichsteilung 395 n. Chr. überlebte das Oströmische (Byzantinische) Reich den Untergang Westroms um fast 1.000 Jahre.',
      },
      {
        question: 'Was bedeutete das Zeichen „Chi-Rho" (☧) auf den Standarten (Labarum) und Schilden der Soldaten Konstantins?',
        options: [
          'Es sind die übereinandergelegten ersten beiden griechischen Buchstaben Χ (Chi) und Ρ (Rho) des Namens „Christus" (ΧΡΙΣΤΟΣ).',
          'Es war das alte Wappen der karthagischen Kriegselefanten.',
          'Es bedeutete „Zwei gekreuzte Schwerter des Kriegsgottes Mars".',
        ],
        correctIndex: 0,
        explanation:
          'Das Christogramm (Chi-Rho) wurde zum sichtbaren Hoheitszeichen des christlichen Kaisertums der Spätantike.',
      },
    ],
    summary:
      'In der Spätantike wurde das Römische Reich tiefgreifend umgestaltet: Mit der Konstantinischen Wende (312/313 n. Chr.) stieg das zuvor verfolgte Christentum zur geförderten Staatsmacht auf, und mit der Gründung Konstantinopels (330 n. Chr.) sowie der Reichsteilung (395 n. Chr.) verlagerte sich das Machtzentrum in den Osten.',
    unlocksText: 'Freigeschaltet: Kapitel 12 (476 n. Chr. – Der letzte Kaiser)!',
  },
  {
    id: 12,
    title: 'Kapitel 12: Der letzte Kaiser',
    subtitle: 'Endzeitstimmung 476 n. Chr., Völkerwanderung und die Rettung des antiken Erbes durch das Mönchtum',
    year: '476 n. Chr.',
    mentorId: 'npc_cassiodor',
    mentorName: 'Flavius Magnus Aurelius Cassiodorus',
    mentorRole: 'Spätantiker Gelehrter & Gründer des Klosters Vivarium',
    introDialog: [
      'Sieh auf die überwucherten Marmorsäulen des Forum Romanum, mein junger Freund... Wir schreiben das Schicksalsjahr 476 n. Chr. Über tausendzweihundert Jahre nach dem Gründer Romulus trägt der letzte, blutjunge Kaiser des Weströmischen Reiches spöttischerweise den Namen „Romulus Augustulus" – das „kleine Kaiserlein"!',
      'In den Wirren der Völkerwanderung haben Westgoten und Vandalen Rom geplündert, und heute hat der germanische Heerführer Odoaker den letzten Westkaiser abgesetzt und die Kaiserinsignien nach Konstantinopel geschickt. Die politische Macht Westroms ist erloschen – die Antike geht zu Ende und das Mittelalter bricht an!',
      'Doch Rom stirbt nicht, solange sein Geist weiterlebt! In unseren christlichen Klöstern und Schreibstuben (Skriptorien) retten wir Mönche die Werke Ciceros, Vergils, die Heilkunst und das römische Recht vor dem Vergessen. Binde im Handwerk [C] den „Spätantiken Pergament-Codex (Vivarium)", damit Roms Kulturerbe für das zukünftige Europa bewahrt bleibt!',
    ],
    questDescription:
      'Binde im Handwerk [C] unter „Kaiserzeit & Spätantike" den „Spätantiken Pergament-Codex (Vivarium)" (1x Schafwolle, 1x Römisches Olivenöl) und überreiche ihn dem Gelehrten Cassiodor, um die 1200-jährige Geschichte Roms abzuschließen.',
    hints: [
      'Schafwolle gewinnst du auf der Schafweide im Südosten [E], Römisches Olivenöl presst du in [C] aus 2x Sabiner Oliven.',
      'Öffne [C], wähle die Kategorie „Kaiserzeit & Spätantike" und binde den „Spätantiken Pergament-Codex (Vivarium)".',
      'Sprich anschließend mit Cassiodor [E] für das große Abschluss-Quiz!',
    ],
    quiz: [
      {
        question: 'Welches Ereignis im Jahr 476 n. Chr. gilt traditionell als das Ende des Weströmischen Reiches und als Übergang von der Antike zum Mittelalter?',
        options: [
          'Der germanische Heerführer Odoaker setzte den letzten weströmischen Kaiser Romulus Augustulus ab und ernannte keinen Nachfolger mehr im Westen.',
          'Ein riesiger Vulkanausbruch des Vesuvs zerstörte ganz Europa.',
          'Julius Caesar kehrte aus Gallien zurück und rief die Republik wieder aus.',
        ],
        correctIndex: 0,
        explanation:
          'Mit der Absetzung des Romulus Augustulus 476 n. Chr. endete das weströmische Kaisertum, während auf dem Boden des Westreichs germanisch-romanische Königreiche entstanden und das Oströmische Reich (Byzanz) bis 1453 fortbestand.',
      },
      {
        question: 'Warum brach das Weströmische Reich im 5. Jahrhundert n. Chr. zusammen (Multikausalität)?',
        options: [
          'Durch das Zusammenwirken mehrerer Krisen: militärischer Druck der Völkerwanderung (Hunnen, Goten, Vandalen), Abhängigkeit von germanischen Söldnerheeren, Bürgerkriege sowie wirtschaftlicher Verfall und Steuerschwund im Westen.',
          'Einzig und allein deshalb, weil die Römer keine Helme mehr trugen.',
          'Weil es in Italien keine Olivenbäume mehr gab.',
        ],
        correctIndex: 0,
        explanation:
          'Historiker betonen das Zusammenspiel äußerer Faktoren (Völkerwanderung) und innerer struktureller Schwächen (Steuerausfälle, Verlust ganzer Provinzen, Machtkämpfe der Heermeister).',
      },
      {
        question: 'Wie überlebte das kulturelle, rechtliche und wissenschaftliche Erbe des Alten Rom den Untergang des Weströmischen Staates?',
        options: [
          'Christliche Mönche und Gelehrte (wie Cassiodor und die Benediktiner) schrieben in ihren Klöstern (Skriptorien) die antiken Handschriften ab; zudem prägten die lateinische Sprache, das römische Recht und die Architektur ganz Europa bis heute.',
          'Alle Bücher wurden in Bleikisten auf dem Meeresgrund versenkt und erst im 20. Jahrhundert von Tauchern gefunden.',
          'Das Wissen ging restlos verloren und niemand in Europa hörte je wieder von Rom.',
        ],
        correctIndex: 0,
        explanation:
          'Durch die mittelalterlichen Klosterschreibstuben (Skriptorien), die katholische Kirche (Latein) und das oströmische Gesetzbuch Kaiser Justinians (Corpus Iuris Civilis) wurde das antike Erbe zum Fundament Europas.',
      },
    ],
    summary:
      '476 n. Chr. setzte der germanische Heerführer Odoaker den letzten weströmischen Kaiser Romulus Augustulus ab. Während das Westreich in den Wirren der Völkerwanderung zerfiel und Ostrom (Byzanz) fortbestand, retteten christliche Klöster in ihren Schreibstuben (Skriptorien) die lateinische Literatur, Wissenschaft und das Recht der Antike für Europa.',
    unlocksText:
      'Meisterleistung! Du hast alle 12 Kapitel des Alten Rom von 753 v. Chr. bis 476 n. Chr. gemeistert! Öffne jetzt deine druckbare A4-Urkunde mit [U] oder vergleiche die Epochen mit [Z]!',
  },
];
