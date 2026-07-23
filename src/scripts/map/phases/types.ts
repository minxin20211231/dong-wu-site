export type SceneKind =
  | 'inspection'
  | 'needs'
  | 'drawing'
  | 'contract'
  | 'protection'
  | 'demolition'
  | 'waterproof'
  | 'utilities'
  | 'hvac'
  | 'woodwork'
  | 'cabinetry'
  | 'painting'
  | 'lighting'
  | 'handover'
  | 'movein';

export type PhaseStationScene = {
  id: string;
  kind: SceneKind;
  locked: boolean;
};

