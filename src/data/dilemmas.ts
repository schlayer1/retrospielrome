/**
 * Historische Dilemma- & Ratsentscheidungen für Römisches Reich
 */

export interface DilemmaOption {
  id: string;
  title: string;
  argumentText: string;
  rewards: Record<string, number>;
  storyFlag: string;
  feedbackText: string;
}

export interface DilemmaDef {
  id: string;
  chapter: number;
  councilTitle: string;
  mentorSpeaker: string;
  illustrationKey: string;
  conflictTitle: string;
  conflictText: string;
  options: DilemmaOption[];
}

export const ROMAN_DILEMMAS: DilemmaDef[] = [
  {
    id: 'dilemma_ch4_ager_publicus',
    chapter: 4,
    councilTitle: 'Senatsberatung in der Curia Hostilia',
    mentorSpeaker: 'Senator Cornelia Scipionis',
    illustrationKey: 'council_rome',
    conflictTitle: 'Ackergesetz der Gracchen: Staatsland (Ager Publicus) an mittellose Veteranen verteilen?',
    conflictText: 'Zehntausende heimgekehrte Legionäre besitzen kein Land mehr, da reiche Patrizier das eroberte Staatsland zu riesigen Latifundien mit Sklaven zusammengelegt haben. Volkstribun Tiberius Gracchus fordert, das Staatsland auf maximal 500 Juchart zu begrenzen und den Rest an verarmte Bürgerfamilien zu verteilen. Die Senatsmehrheit fürchtet jedoch um ihre Besitztümer.',
    options: [
      {
        id: 'opt_reform',
        title: 'Landreform durchsetzen & Veteranen ansiedeln',
        argumentText: 'Rom lebt von freien Bauern-Soldaten! Wer für die Republik blutet, muss eine eigene Scholle besitzen, um seine Sippe zu ernähren.',
        rewards: { weizen: 20, olivenoel: 10 },
        storyFlag: 'dilemma_ch4_gracchus_reform',
        feedbackText: 'Eine mutige Entscheidung für das römische Volk! Tausende Veteranen danken dir mit Treue und reicher Getreideernte.'
      },
      {
        id: 'opt_senate_compromise',
        title: 'Kompromiss: Pachtland sichern & Getreidespende',
        argumentText: 'Ein Teil des Landes verbleibt bei den Senatoren gegen eine jährliche Sonderabgabe, die den staatlichen Getreidepreis (Cura Annonae) subventioniert.',
        rewards: { sesterzen: 25, marmor: 8 },
        storyFlag: 'dilemma_ch4_senate_compromise',
        feedbackText: 'Der Bürgerfriede im Senat ist gesichert. Gold und Marmor fließen in neue Basiliken und Thermen.'
      }
    ]
  }
];
