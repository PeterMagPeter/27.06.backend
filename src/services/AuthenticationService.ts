import { getUserByMail } from "./DBService";
import { isCorrectPassword } from "./UserService";

/**
 * Checks name and password. If successful, true is returned, otherwise false
 */
export async function login(email: string, password: string): Promise<{ id: string } | false> {
    // Try to find user in db
    const dbUser = await getUserByMail(email);

    // Check, if user exists, if account is already activated and if credentials are correct
    if(dbUser !== null && dbUser.verified ){
        const passwordValid = await isCorrectPassword(email, password);
        if(passwordValid) {
            return { id: dbUser?._id.toString() }
        }
    } 
    return false;
}