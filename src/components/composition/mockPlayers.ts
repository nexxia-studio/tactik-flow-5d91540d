/** Mock players for FUT composition */

export interface FUTPlayer {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  jerseyNumber: number;
  rating: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  avatarUrl?: string;
}

export const MOCK_PLAYERS: FUTPlayer[] = [
  { id: "1", firstName: "Maxime", lastName: "Dupont", position: "GK", jerseyNumber: 1, rating: 78, pace: 45, shooting: 20, passing: 55, dribbling: 40, defending: 30, physical: 72 },
  { id: "2", firstName: "Lucas", lastName: "Mertens", position: "LB", jerseyNumber: 3, rating: 74, pace: 78, shooting: 42, passing: 65, dribbling: 60, defending: 72, physical: 68 },
  { id: "3", firstName: "Thomas", lastName: "Leclerc", position: "CB", jerseyNumber: 4, rating: 76, pace: 55, shooting: 35, passing: 52, dribbling: 45, defending: 80, physical: 78 },
  { id: "4", firstName: "Nathan", lastName: "Peeters", position: "CB", jerseyNumber: 5, rating: 75, pace: 52, shooting: 30, passing: 50, dribbling: 42, defending: 78, physical: 80 },
  { id: "5", firstName: "Enzo", lastName: "Claessens", position: "RB", jerseyNumber: 2, rating: 73, pace: 80, shooting: 45, passing: 62, dribbling: 65, defending: 70, physical: 65 },
  { id: "6", firstName: "Antoine", lastName: "Henrard", position: "CM", jerseyNumber: 8, rating: 79, pace: 65, shooting: 68, passing: 78, dribbling: 72, defending: 60, physical: 70 },
  { id: "7", firstName: "Julien", lastName: "Servais", position: "CM", jerseyNumber: 6, rating: 77, pace: 60, shooting: 55, passing: 75, dribbling: 68, defending: 72, physical: 72 },
  { id: "8", firstName: "Rémy", lastName: "Lambert", position: "CM", jerseyNumber: 10, rating: 82, pace: 68, shooting: 72, passing: 82, dribbling: 80, defending: 48, physical: 62 },
  { id: "9", firstName: "Adrien", lastName: "Fontaine", position: "LW", jerseyNumber: 11, rating: 80, pace: 88, shooting: 75, passing: 68, dribbling: 82, defending: 30, physical: 58 },
  { id: "10", firstName: "Kevin", lastName: "Schmitz", position: "ST", jerseyNumber: 9, rating: 83, pace: 82, shooting: 85, passing: 60, dribbling: 75, defending: 25, physical: 76 },
  { id: "11", firstName: "Dylan", lastName: "Thiry", position: "RW", jerseyNumber: 7, rating: 78, pace: 85, shooting: 70, passing: 65, dribbling: 78, defending: 28, physical: 60 },
];
