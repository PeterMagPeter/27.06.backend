import mongoose, { Schema, Types } from 'mongoose';

export interface IDuelMatch {
    public: boolean;
    map: string;
    password: string;
    superweapons: boolean;
    hostName: Types.ObjectId;
    roomId: number;
    playerOne: Types.ObjectId;
    playerTwo: Types.ObjectId;
}

const duelMatchSchema: Schema = new Schema({
    public: { type: Boolean, required: true },
    map: { type: String, required: true },
    password: { type: String },
    superweapons: { type: Boolean, required: true },
    timer: { type: Number, required: true },
    hostName: { type: Schema.Types.ObjectId, required: true },
    roomId: { type: Number, required: true },
    playerOne: { type: Schema.Types.ObjectId, ref: 'User' },
    playerTwo: { type: Schema.Types.ObjectId, ref: 'User' }
});

export const DuelMatch = mongoose.model<IDuelMatch>('DuelMatch', duelMatchSchema);
