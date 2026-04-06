/** Utilisateur tel qu’exposé par l’API. */
export interface UserEntity {
  id: string;
  githubUsername: string;
  reputation: number;
  contributions: number;
  createdAt: Date;
  updatedAt: Date;
}
