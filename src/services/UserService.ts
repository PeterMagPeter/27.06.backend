import { UserResource, RegisterResource } from "../Resources"
import { deleteUserById, getAllUsers, getUserById, getUserByMail, getUserByUsername, registerUser, updateUserData } from "./DBService";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs"

/**
 * Create user with data from UserResource and write it into db
 */
export async function createUserAccount_UserService(registerRes: RegisterResource): Promise<UserResource> {

    let result = await registerUser(registerRes);
    return result;
}

/**
 * Identify and update user by ID with the given UserResource
 * If no id is provided or user couldn't be found, an error is thrown.
 */
export async function updateUser_UserService(userRes: UserResource) {
    if (!userRes._id) {
        throw new Error("Please provide an user to update!");
    }
    return await updateUserData(userRes);
}

/**
 * Get and return user by mail.
 * If user couldn't be found an error is thrown.
 */
export async function getUser_UserService(userId: ObjectId) {
    if (!userId) {
        throw new Error("Please provide an id to search for!");
    }
    return await getUserById(userId);
}

/**
 * Identify user by mail.
 * If user couldn't be found an error is thrown.
 */
export async function deleteUser_UserService(userId: ObjectId) {
    if (!userId) {
        throw new Error("Please provide an id to search for!");
    }
    const result = await getUser_UserService(userId);
    if (result !== null) {
        return await deleteUserById(userId);
    }
}

/**
 * @param password is going to be hashed to avoid that it is saved in plaintext
 * @returns the hashed password incl. salt that has been used to hash password
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds: number = 10;
    const hashedPassword: string = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

/**
 * @param email is used to search for a user in the db
 * @param password is used to compare if the given input data matches the found user and it's password
 * @returns result of comparison
 */
export async function isCorrectPassword(email: string, password: string): Promise<boolean> {
    let result: boolean = false;

    let userByMail = await getUserByMail(email);
    if (userByMail !== null && userByMail.password) {
        const correct = await bcrypt.compare(password, userByMail.password);
        if (correct) {
            return true;
        }
    }
    return result;
}

/**
 * Returns all users stored in DB.
 * Omits privacy related data, i.e. email, id and member status
 */
export async function getAllUsers_UserService(): Promise<UserResource[]> {
    const users = await getAllUsers();
    let userResources: UserResource[] = [];

    userResources = users.map(user => ({
        _id: user._id,
        email: user.email,
        username: user.username,
        points: user.points,
        premium: user.premium,
        level: user.level,
        gameSound: user.gameSound,
        music: user.music,
        higherLvlChallenge: user.higherLvlChallenge,
        verified: user.verified,
        verificationTimer: user.verificationTimer,
        skin: user.skin
    }));
    return userResources;
}