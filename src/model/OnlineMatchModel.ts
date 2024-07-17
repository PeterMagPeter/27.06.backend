import mongoose, { Schema } from 'mongoose';
import { Gamestatus } from 'src/Resources';

export interface IOnlineMatchModel {
    roomId: string;
    privateMatch: boolean;
    gameMap: string;
    password?: string;
    superWeapons: boolean;
    shotTimer: number;
    gameMode: string,
    hostName: string;
    players: string[];
    maxPlayers: number;
    createdAt: Date;
    gamestatus: Gamestatus;
}

const onlineMatchModelSchema: Schema = new Schema({
    roomId: { type: String, required: true },
    privateMatch: { type: Boolean, required: true, default: false },
    gameMap: { type: String, required: true },
    password: { type: String },
    superWeapons: { type: Boolean, required: true },
    shotTimer: { type: Number, required: true },
    gameMode: { type: String, required: true },
    hostName: { type: String, required: true },
    players: [{ type: String }],
    //players: { type: Schema.Types.ObjectId, ref: 'User' },
    maxPlayers: { type: Number },
    createdAt: { type: Date, default: Date.now },
    gamestatus: { type: Gamestatus, default: Gamestatus.Waiting }
});

export const OnlineMatchModel = mongoose.model<IOnlineMatchModel>('OnlineMatch', onlineMatchModelSchema);
