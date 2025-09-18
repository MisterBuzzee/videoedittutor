export enum Application {
  DavinciResolve = "Davinci Resolve",
  SonyVegas = "Sony Vegas",
  FinalCutPro = "Final Cut Pro",
}

export interface Tutorial {
  title: string;
  steps: string[];
}

export interface HistoryItem {
  id: number;
  app: Application;
  prompt: string;
  tutorial: Tutorial;
}