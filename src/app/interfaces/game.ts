import { IProposal } from "./proposal";

/**
 * Game interface
 */
export interface IGame {
    id: number;
    proposal: IProposal;
    users: string[];
    active: boolean;
}