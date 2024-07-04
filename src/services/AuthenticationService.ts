import { User } from "../model/UserModel"
import { getUserByMail } from "./DBService";

/**
 * Checks name and password. If successful, true is returned, otherwise false
 */
export async function login(email: string, password: string): Promise<{ id: string } | false> {
    // Try to find user in db
    const dbUser = await getUserByMail(email);

    // Check, if user account is already activated
    if(dbUser && !dbUser.verified){
        return false
    }
    
    // Create user (just for use of isCorrectPassword() from user schema)
    let user;
    if(dbUser !== null){
        user = await User.create({...dbUser});
    }

    // Check password
    const pwValid = await user?.isCorrectPassword(password);
    if (!pwValid) return false
    else return { id: user?.id }
}