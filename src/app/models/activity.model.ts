export interface Activity {
  nodeId: number;
  duration: number;
  startDate: string;
  endDate: string;
  directPrerequisites: number[];
  allPrerequisites: number[];
  directDependencies: number[];
  allDependencies: number[];
}