import { UserResource } from "../Resources";
import { User } from "../model/UserModel";
import { deleteUserById, getAllUsers, getUserById, registerUser, updateUserData } from "./DBService";

/**
 * Create user with data from UserResource and write it into db
 */
export async function createUserAccount_UserService(userRes: UserResource) {
    const user = await User.create({
        email: userRes.email,
        password: userRes.password,
        username: userRes.username,
        points: userRes.points,
        premium: userRes.premium,
        level: userRes.level,
        gameSound: userRes.gameSound,
        music: userRes.music,
        higherLvlChallenge: userRes.higherLvlChallenge,
        verified: userRes.verified,
        verificationTimer: userRes.verificationTimer
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
export async function updateUser_UserService(userRes: UserResource) {
    if (!userRes.id) {
        throw new Error("Please provide an user to update!");
    }
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
export async function getUser_UserService(userId: string) {
    if (!userId) {
        throw new Error("Please provide an email to search for!");
    }
    try {
        return await getUserById(userId);
    } catch (error) {
        throw error;
    }
}

/**
 * Identify user by mail.
 * If user couldn't be found an error is thrown.
 */
export async function deleteUser_UserService(userId: string) {
    if (!userId) {
        throw new Error("Please provide an email to search for!");
    }
    try {
        const result = await getUser_UserService(userId);
        if (result !== null) {
            return await deleteUserById(userId);
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Returns all users stored in DB.
 * Omits privacy related data, i.e. email, id and member status
 */
export async function getAllUsers_UserService(): Promise<UserResource[]> {
    const users = await getAllUsers();
    const userResources = users.map(user => ({
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level,
        verified: user.verified,
        verificationTimer: user.verificationTimer
    }));
    return userResources;
}