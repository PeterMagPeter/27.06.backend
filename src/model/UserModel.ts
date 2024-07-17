import { Model, model, Schema } from "mongoose"
import bcrypt from "bcryptjs"

interface IUserMethods {
    isCorrectPassword(toCheck: string): Promise<boolean>
};

type UserModel = Model<IUser, {}, IUserMethods>;

// User interface
export interface IUser {
    email: string
    username: string,
    password: string,
    points?: number,
    matchPoints?: number,
    team?: number,          // Used in frontend in teams- or ffa-mode otherwise it's empty by default (e.g. 1vs1)
    //picture?: string,                         NICE TO HAVE
    premium?: boolean,
    level?: number,
    gameSound?: number,
    music?: number,
    higherLvlChallenge?: boolean,
    verified?: boolean,
    verificationTimer?: Date
};

// User schema
const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    points: { type: Number, default: 0 },
    matchPoints: { type: Number, default: 0 },
    team: { type: Number },   // Used in frontend in teams- or ffa-mode otherwise it's empty by default (e.g. 1vs1)
    //picture: {type: String, default: ""},     NICE TO HAVE
    premium: { type: Boolean, default: false },
    level: { type: Number, default: 0 },
    gameSound: { type: Number, default: 0.3 },
    music: { type: Number, default: 0.3 },
    higherLvlChallenge: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    verificationTimer: { type: Date, default: Date.now() + 1000 * 60 * 60 * 24 } // Last number means the hours left to verify account [24h]
});

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
});

userSchema.pre(["updateOne", "findOneAndUpdate", "updateMany"], async function () {
    const update = this.getUpdate();
    if (update && "password" in update) {
        const hashedPassword = await bcrypt.hash(update.password, 10);
        update.password = hashedPassword;
    }
});

userSchema.method("isCorrectPassword", function (toCheck: string): Promise<boolean> {
    if (this.isModified("password")) {
        throw new Error("Error! Can't compare password, some updates aren't yet saved.")
    }
    const isCorrect = bcrypt.compare(toCheck, this.password);
    return isCorrect;
});

export const User = model("User", userSchema);