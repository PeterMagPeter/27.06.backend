import mongoose, { Schema, Types } from 'mongoose';

export interface ITeamMatch {
    public: boolean;
    numberOfPlayers: number;
    map: string;
    password: string;
    superweapons: boolean;
    hostName: Types.ObjectId;
    roomId: number;
    playersTeamOne: Types.ObjectId[];
    playersTeamTwo: Types.ObjectId[];
}

const teamMatchSchema: Schema = new Schema({
    public: { type: Boolean, required: true },
    numberOfPlayers: { type: Number, required: true },
    map: { type: String, required: true },
    password: { type: String },
    superweapons: { type: Boolean, required: true },
    timer: { type: Number, required: true },
    hostName: { type: Schema.Types.ObjectId, required: true },
    roomId: { type: Number, required: true },
    playersTeamOne: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    playersTeamTwo: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

export const TeamMatch = mongoose.model<ITeamMatch>('TeamMatch', teamMatchSchema);
