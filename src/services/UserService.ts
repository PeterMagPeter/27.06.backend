import { UserResource } from "../Resources";
import { User } from "../model/UserModel";
import { deleteUserByMail, getUserByMail, registerUser, updateUserData as updateUserData } from "./DBService";

/**
 * Create user with data from UserResource and write it into db
 */
export async function createUser(userRes: UserResource) {
    const user = await User.create({
        email: userRes.email,
        password: userRes.password,
        username: userRes.username,
        points: userRes.points,
        premium: userRes.premium,
        level: userRes.level,
        gameSound: userRes.gameSound,
        music: userRes.music,
        higherLvlChallenge: userRes.higherLvlChallenge
    });

    // Write user into db
    try {
        return await registerUser(user);
    } catch (error) {
        throw error;
    }
}

/**
 * Identify and update user by ID with the given UserResource
 * If no id is provided or user couldn't be found, an error is thrown.
 */
export async function updateUser(userRes: UserResource) {
    if (!userRes.id) {
        throw new Error("Please provide an user to update!");
    }
    //TODO Implement additional update progress via userSchema.pre(["updateOne", 
    //"findOneAndUpdate", "updateMany"], async function ()
    try {
        return await updateUserData(userRes);
    } catch (error) {
        throw error;
    }
}

/**
 * Get and return user by mail.
 * If user couldn't be found an error is thrown.
 */
export async function getUser(email: string) {
    if (!email) {
        throw new Error("Please provide an email to search for!");
    }
    try {
        return await getUserByMail(email);
    } catch (error) {
        throw error;
    }
}

/**
 * Identify user by mail.
 * If user couldn't be found an error is thrown.
 */
export async function deleteUser(email: string) {
    if (!email) {
        throw new Error("Please provide an email to search for!");
    }
    try {
        const result = await getUser(email);
        if (result !== null) {
            return await deleteUserByMail(email);
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Returns all users stored in DB.
 * Omits privacy related data, i.e. email, id and member status
 */
export async function getAllUsers(): Promise<UserResource[]> {
    const users = await User.find({}).exec();
    const userResources = users.map(user => ({
        username: user.username,
        points: user.points,
        level: user.level,
        active: user.active
    }));
    return userResources;
}