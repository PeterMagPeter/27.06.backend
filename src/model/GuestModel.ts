import {Model, model, Schema} from "mongoose"

type GuestModel = Model<IGuest, {}>;

// Guest interface
export interface IGuest{
    username: string,
    points?: number,
    //picture?: string,                         NICE TO HAVE
    level?: number,
    gameSound?: number,
    music?: number,
    skin: string
};

// Guest schema
const guestSchema = new Schema<IGuest, GuestModel>({
    username: {type: String, required: true, unique: true},
    points: {type: Number, default: 0},
    //picture: {type: String, default: ""},     NICE TO HAVE
    level: {type: Number, default: 1},
    gameSound: {type: Number, default: 0.3},
    music: {type: Number, default: 0.3},
    skin: {type: String, default: "standard"}
});

export const Guest = model("Guest", guestSchema);