"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.updateUserData = updateUserData;
exports.getUserById = getUserById;
exports.getUserByMail = getUserByMail;
exports.getUserByUsername = getUserByUsername;
exports.deleteUserById = deleteUserById;
exports.deleteUserByMail = deleteUserByMail;
exports.deleteUserByUsername = deleteUserByUsername;
exports.hostOnlineMatch = hostOnlineMatch;
exports.joinOnlineMatch = joinOnlineMatch;
exports.updateOnlineMatch = updateOnlineMatch;
exports.deleteOnlineMatch = deleteOnlineMatch;
exports.getPublicOnlinematches = getPublicOnlinematches;
exports.activateUserAccount = activateUserAccount;
exports.writeLeaderboard = writeLeaderboard;
exports.getLeaderboard = getLeaderboard;
exports.getAllUsers = getAllUsers;
exports.deleteEntriesFromCollection = deleteEntriesFromCollection;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongodb_1 = require("mongodb");
const Resources_1 = require("../Resources");
const MailService_1 = require("./MailService");
const UserService_1 = require("./UserService");
// Set up MongoDB URL
const MONGO_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=OceanCombat`;
/**
 * Create user with data from UserResource and return created object.
 */
function registerUser(registerRes) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        // Create user
        let userInit = Object.assign(Object.assign({ _id: new mongodb_1.ObjectId() }, registerRes), { password: yield (0, UserService_1.hashPassword)(registerRes.password), points: 0, premium: false, level: 0, gameSound: 0.3, music: 0.3, higherLvlChallenge: false, verified: false, verificationTimer: new Date(Date.now() + Resources_1.ExpirationTime.TwentyFourHours), skin: "standard" });
        try {
            // Create mongoDB native client
            yield client.connect();
            console.log("Connected successfully to server");
            // Make sure email and username is not in use
            const emailCheck = yield client.db("OceanCombat").collection("Users").findOne({ email: registerRes.email });
            const usernameCheck = yield client.db("OceanCombat").collection("Users").findOne({ username: registerRes.username });
            if (emailCheck !== null) {
                throw new Error("Email already registered. Please provide another email to continue!");
            }
            if (usernameCheck !== null) {
                throw new Error("Username already registered. Please provide another username to continue!");
            }
            // Write it to db and send a verification mail
            if (userInit._id && userInit.email && userInit.password) {
                yield client.db("OceanCombat").collection("Users").insertOne(userInit);
                yield (0, MailService_1.sendVerificationEmail)(userInit._id, userInit.email);
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            return Object.assign(Object.assign({}, userInit), { password: undefined });
        }
    });
}
/**
 * Identify and update user by resource.
 * If user couldn't be found, and an error is thrown.
 */
function updateUserData(userRes) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = null;
        console.log("userMail (b4 try-case): " + userRes.email);
        console.log("userID: (b4 try-case)" + (userRes === null || userRes === void 0 ? void 0 : userRes._id));
        console.log("username: (b4 try-case)" + (userRes === null || userRes === void 0 ? void 0 : userRes.username));
        try {
            // Create mongoDB native client, connect to db & get user collection
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const user = yield getUserById(userRes._id);
            console.log("userMail (try-case): " + (user === null || user === void 0 ? void 0 : user.email));
            console.log("userID (try-case): " + (user === null || user === void 0 ? void 0 : user._id));
            console.log("username (try-case): " + (user === null || user === void 0 ? void 0 : user.username));
            let changedMail = false;
            if (user !== null) {
                console.log("User props of user:" + JSON.stringify(user));
                console.log("User props of userDoc (this needs to have the same object id):" + JSON.stringify(userRes));
                // Set new values (user settings)
                // Set new email if not used
                if (userRes.email !== undefined && userRes.email !== user.email) {
                    let result = yield getUserByMail(userRes.email);
                    if (result !== null) {
                        throw new Error("Mail address already in use!");
                    }
                    else {
                        user.email = userRes.email;
                        changedMail = true;
                        console.log("Email changed");
                    }
                }
                // check if password is set and if it is different from the old one
                if (userRes.password !== undefined && user.password !== undefined) {
                    const isNewPassword = !(yield bcryptjs_1.default.compare(userRes.password, user.password));
                    if (isNewPassword) {
                        user.password = yield (0, UserService_1.hashPassword)(userRes.password);
                    }
                }
                if (userRes.username !== undefined && userRes.username !== user.username) {
                    throw new Error("Username can't be changed!");
                }
                // Check if user collected new points and if a new level was reached
                if (userRes.points !== undefined && userRes.points !== user.points) {
                    user.points = userRes.points;
                    // Check if user has reached a new level
                    const newLevel = (0, Resources_1.calculateLevel)(userRes.points);
                    if (userRes.level !== undefined && userRes.level < newLevel) {
                        user.level = newLevel;
                    }
                }
                if (userRes.premium !== undefined && userRes.premium !== user.premium) {
                    user.premium = userRes.premium;
                }
                if (userRes.gameSound !== undefined && userRes.gameSound !== user.gameSound) {
                    user.gameSound = userRes.gameSound;
                }
                if (userRes.music !== undefined && userRes.music !== user.music) {
                    user.music = userRes.music;
                }
                if (userRes.higherLvlChallenge !== undefined && userRes.higherLvlChallenge !== user.higherLvlChallenge) {
                    user.higherLvlChallenge = userRes.higherLvlChallenge;
                }
                if (userRes.skin !== undefined && userRes.skin !== user.skin) {
                    user.skin = userRes.skin;
                }
                // If email changed, update verificationTimer, set verified to false and resend verification mail
                if (changedMail) {
                    user.verificationTimer = new Date(Date.now() + Resources_1.ExpirationTime.TwentyFourHours);
                    user.verified = false;
                    yield (0, MailService_1.sendVerificationEmail)(user._id, user.email);
                }
                console.log("userDoc once again (this needs to have the same object id):" + JSON.stringify(user));
                // Update user settings with new data
                yield users.updateOne({ _id: user._id }, {
                    $set: {
                        email: user.email,
                        password: user.password,
                        points: user.points,
                        premium: user.premium,
                        level: user.level,
                        gameSound: user.gameSound,
                        music: user.music,
                        higherLvlChallenge: user.higherLvlChallenge,
                        verified: user.verified,
                        verificationTimer: user.verificationTimer,
                        skin: user.skin
                    }
                });
                console.log("Test 1");
                result = user;
                console.log("Test 2");
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            if (result === null) {
                console.log("Couldn't find user to update!");
                return null;
            }
            return result;
        }
    });
}
/**
 * Get and return user by email (unique).
 * If user couldn't be found an error is thrown.
 */
function getUserById(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = null;
        try {
            if (!userId) {
                throw new Error("Please provide an unique identifier to search for!");
            }
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const user = yield users.findOne({ _id: userId });
            if (user !== null) {
                result = {
                    _id: userId,
                    email: user.email,
                    password: user.password,
                    username: user.username,
                    points: user.points,
                    team: user.team,
                    premium: user.premium,
                    level: user.level,
                    gameSound: user.gameSound,
                    music: user.music,
                    higherLvlChallenge: user.higherLvlChallenge,
                    verified: user.verified,
                    verificationTimer: user.verificationTimer,
                    skin: user.skin
                };
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            if (result === null) {
                throw new Error("Couldn't find user by id!");
            }
            return result;
        }
    });
}
/**
 * Get and return user by email (unique).
 * If user couldn't be found an error is thrown.
 */
function getUserByMail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = null;
        try {
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const user = yield users.findOne({ email: email });
            if (user !== null) {
                result = {
                    _id: user._id,
                    email: user.email,
                    password: user.password,
                    username: user.username,
                    points: user.points,
                    team: user.team,
                    premium: user.premium,
                    level: user.level,
                    gameSound: user.gameSound,
                    music: user.music,
                    higherLvlChallenge: user.higherLvlChallenge,
                    verified: user.verified,
                    verificationTimer: user.verificationTimer,
                    skin: user.skin
                };
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            return result;
        }
    });
}
/**
 * Get and return user by username (unique).
 * If user couldn't be found an error is thrown.
 */
function getUserByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = null;
        try {
            if (!username) {
                throw new Error("Please provide an unique identifier to search for!");
            }
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const user = yield users.findOne({ username: username });
            if (user !== null) {
                result = {
                    _id: user._id,
                    email: user.email,
                    password: user.password,
                    username: user.username,
                    points: user.points,
                    team: user.team,
                    premium: user.premium,
                    level: user.level,
                    gameSound: user.gameSound,
                    music: user.music,
                    higherLvlChallenge: user.higherLvlChallenge,
                    verified: user.verified,
                    verificationTimer: user.verificationTimer,
                    skin: user.skin
                };
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            if (result === null) {
                // throw new Error("Couldn't find user by username!");
            }
            return result;
        }
    });
}
/**
 * Delete user by id.
 * If user couldn't be found an error is thrown.
 */
function deleteUserById(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = false;
        try {
            if (!userId) {
                throw new Error("Please provide an unique identifier to search for!");
            }
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const user = yield users.findOne({ _id: userId }); // Convert string into ObjectId
            if (user !== null) {
                yield users.findOneAndDelete({ _id: userId });
                result = true;
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            if (result === null) {
                throw new Error("Couldn't find user by id!");
            }
            return result;
        }
    });
}
/**
 * Identify and delete user by email.
 * If user couldn't be found an error is thrown.
 */
function deleteUserByMail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = false;
        try {
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Started - deleteUserByMail");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const user = yield users.deleteOne({ email: email }); // deleteOne returns result of deleted docs, what at max is 1
            if (user.deletedCount === 1) {
                result = true;
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            if (result === null) {
                throw new Error("Couldn't find user by mail to delete!");
            }
            return result;
        }
    });
}
/**
 * Identify user by username.
 * If user couldn't be found an error is thrown.
 */
function deleteUserByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = false;
        try {
            if (!username) {
                throw new Error("Please provide an unique identifier to search for!");
            }
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Started - deleteUserByMail");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const user = yield users.findOne({ username: username });
            if (user === null) {
                throw new Error("No user found for provided identifier!");
            }
            else {
                yield users.findOneAndDelete({ _id: user === null || user === void 0 ? void 0 : user._id });
                result = true;
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            return result;
        }
    });
}
// Host public online match
function hostOnlineMatch(onlineMatch) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        try {
            // Create mongoDB native client
            yield client.connect();
            console.log("Started - hostOnlineMatch");
            // Connect to db
            const db = client.db("OceanCombat");
            // ##################### Cleaning DB part BEGIN #####################
            // Clean up old lobbies (older than 2h) and write it back to db [This code part has been partly written by AI] 
            let timeCheck2h = new Date();
            timeCheck2h.setHours(timeCheck2h.getHours() - 2);
            // Check all public matches
            const pubCollAsArray = yield db.collection("PublicOnlinematches").find().toArray();
            if (pubCollAsArray.length > 0) {
                const pupOldMatchesFilter = pubCollAsArray.filter(match => match.createdAt < timeCheck2h && match.gamestatus !== Resources_1.Gamestatus.Test);
                if (pupOldMatchesFilter.length > 0) {
                    const matchIds = pupOldMatchesFilter.map(match => match._id);
                    yield db.collection("PublicOnlinematches").deleteMany({ _id: { $in: matchIds } });
                }
            }
            // Check all private matches
            const privCollAsArray = yield db.collection("PrivateOnlinematches").find().toArray();
            if (privCollAsArray.length > 0) {
                const privOldMatchesFilter = privCollAsArray.filter(match => match.createdAt < timeCheck2h && match.gamestatus !== Resources_1.Gamestatus.Test);
                if (privOldMatchesFilter.length > 0) {
                    const matchIds = privOldMatchesFilter.map(match => match._id);
                    yield db.collection("PrivateOnlinematches").deleteMany({ _id: { $in: matchIds } });
                }
            }
            // ####################### Cleaning DB part END #######################
            // Find out where to host the match
            const collectionName = onlineMatch.privateMatch ? "PrivateOnlinematches" : "PublicOnlinematches";
            const collection = db.collection(collectionName);
            // Check if room id already exists
            const result = yield collection.findOne({ roomId: onlineMatch.roomId });
            if (result !== null) {
                console.log("(Room id already in use!)");
            }
            // Check if a password is set
            let password = undefined;
            if (onlineMatch.password !== undefined) {
                password = onlineMatch.password;
            }
            // Create match without password
            const matchData01 = {
                roomId: onlineMatch.roomId,
                privateMatch: onlineMatch.privateMatch,
                gameMap: onlineMatch.gameMap,
                superWeapons: onlineMatch.superWeapons,
                shotTimer: onlineMatch.shotTimer,
                gameMode: onlineMatch.gameMode,
                hostName: onlineMatch.hostName,
                players: [onlineMatch.hostName],
                maxPlayers: onlineMatch.maxPlayers,
                createdAt: new Date(),
                gamestatus: onlineMatch.gamestatus
            };
            // Create match without password
            const matchData02 = Object.assign(Object.assign({}, matchData01), { password: onlineMatch.password });
            // Find out where to host match (private / public))
            if (typeof password !== "string") {
                yield collection.insertOne(matchData01);
            }
            else {
                yield collection.insertOne(matchData02);
            }
            return true;
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
        }
    });
}
// Join online match
function joinOnlineMatch(roomId, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let gamestatus = Resources_1.Gamestatus.Waiting;
        try {
            // Create mongoDB client
            yield client.connect();
            console.log("Started - joinOnlineMatch");
            // Connect to db and get collections
            const db = client.db("OceanCombat");
            const privateCollection = db.collection("PrivateOnlinematches");
            const publicCollection = db.collection("PublicOnlinematches");
            // Search in private rooms
            let room = yield privateCollection.findOne({ roomId: roomId });
            if (!room) {
                // Search in public rooms
                room = yield publicCollection.findOne({ roomId: roomId });
            }
            if (!room) {
                // throw new Error("No room found to join!");
                return null;
            }
            // Check if max number of players has been reached to prevent further joins
            if (room.players.length == room.maxPlayers) {
                // throw new Error("Room is already full!");
                return null;
            }
            // Check, if user has already joined once before, otherwise add user and update db
            if (!room.players.includes(username)) {
                room.players.push(username);
                // Check if max number of players has been reached to change gamestatus to full
                if (room.players.length == room.maxPlayers) {
                    gamestatus = Resources_1.Gamestatus.Full;
                }
            }
            const collection = room.privateMatch ? privateCollection : publicCollection;
            const result = yield collection.findOneAndUpdate({ roomId: roomId }, { $set: room }, { returnDocument: "after" });
            // Return OnlineMatchResource or null [Chris's fix for frontend]
            if (result) {
                const onlineMatchResource = {
                    roomId: result.roomId,
                    privateMatch: result.privateMatch,
                    gameMap: result.gameMap,
                    password: result.password,
                    superWeapons: result.superWeapons,
                    shotTimer: result.shotTimer,
                    gameMode: result.gameMode,
                    hostName: result.hostName,
                    players: result.players,
                    maxPlayers: result.maxPlayers,
                    createdAt: result.createdAt,
                    gamestatus: gamestatus // is determined in the to above maxPlayer checks
                };
                console.log("result in joinOnlineMatch", JSON.stringify(onlineMatchResource));
                return onlineMatchResource;
            }
            return null;
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
        }
    });
}
// Update online match settings
function updateOnlineMatch(onlineMatchResource, username) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        try {
            // Create mongoDB client
            yield client.connect();
            console.log("Started - updateOnlineMatch");
            // Connect to db and get collections
            const db = client.db("OceanCombat");
            const privateCollection = db.collection("PrivateOnlinematches");
            const publicCollection = db.collection("PublicOnlinematches");
            // Search for room. If privacy has been changed after hosting, delete old match
            let room = yield privateCollection.findOne({ roomId: onlineMatchResource.roomId });
            let deleted = false;
            // Search in private rooms
            if (!room) {
                // Search in public rooms. If found and privacy type is now private, delete it from public
                room = yield publicCollection.findOne({ roomId: onlineMatchResource.roomId });
                if (room && onlineMatchResource.privateMatch) {
                    yield publicCollection.findOneAndDelete({ roomId: onlineMatchResource.roomId });
                    deleted = true;
                }
                // If found in private rooms and privacy type is now public, delete it from private
            }
            else if (room && !onlineMatchResource.privateMatch) {
                yield privateCollection.findOneAndDelete({ roomId: onlineMatchResource.roomId });
                deleted = true;
            }
            if (!room) {
                // throw new Error("No room found to join!");
                console.log("No room found to join");
                return false;
            }
            // Find where to host room
            const collection = room.privateMatch ? privateCollection : publicCollection;
            // Copy new match data
            let newMatchData = Object.assign({}, onlineMatchResource);
            // Remove "unwanted" user from match (if username is provided) [This code part has been written by AI]
            if (username) {
                const index = newMatchData.players.indexOf(username);
                if (index !== -1) {
                    newMatchData.players.splice(index, 1);
                }
            }
            // If match was deleted, insert new match into the correct collection 
            if (deleted) {
                yield collection.insertOne(newMatchData);
            }
            else {
                // Update match in db
                yield collection.findOneAndUpdate({ roomId: onlineMatchResource.roomId }, { $set: newMatchData });
            }
            return true;
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
        }
    });
}
// Delete online match
function deleteOnlineMatch(roomId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = false;
        try {
            // Create mongoDB client
            yield client.connect();
            console.log("Started - deleteOnlineMatch");
            // Search for match
            const privateMatch = yield client.db("OceanCombat").collection("PrivateOnlinematches").findOne({ roomId: roomId });
            const publicMatch = yield client.db("OceanCombat").collection("PublicOnlinematches").findOne({ roomId: roomId });
            // Determine collection where match is stored to delete
            if (privateMatch === null && publicMatch === null) {
                throw new Error("No match found to delete!");
            }
            else {
                if (privateMatch !== null) {
                    yield client.db("OceanCombat").collection("PrivateOnlinematches").findOneAndDelete({ _id: privateMatch._id });
                }
                else if (publicMatch !== null) {
                    yield client.db("OceanCombat").collection("PublicOnlinematches").findOneAndDelete({ _id: publicMatch._id });
                }
                result = true;
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            return result;
        }
    });
}
// Get public online matches
function getPublicOnlinematches(gameMode) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let onlineMatches = [];
        try {
            // Create mongoDB client
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            // Get all public 1vs1 matches
            if (gameMode === "1vs1") {
                const matches = yield db.collection("PublicOnlinematches").find({ gameMode: "1vs1" }).toArray();
                if (matches.length === 0) {
                    // throw new Error("No 1vs1 matches online!"); 
                }
                onlineMatches = matches.map((match) => ({
                    roomId: match.roomId,
                    privateMatch: match.privateMatch,
                    gameMap: match.gameMap,
                    password: match.password,
                    superWeapons: match.superWeapons,
                    shotTimer: match.shotTimer,
                    gameMode: match.gamemode,
                    hostName: match.hostName,
                    players: match.players,
                    maxPlayers: match.maxPlayers,
                    createdAt: match.createdAt,
                    gamestatus: match.gamestatus
                }));
                // Get all public Team matches
            }
            else if (gameMode === "Team") {
                const matches = yield db.collection("PublicOnlinematches").find({ gameMode: "Team" }).toArray();
                if (matches.length === 0) {
                    // throw new Error("No Team matches online!");
                }
                onlineMatches = matches.map((match) => ({
                    roomId: match.roomId,
                    privateMatch: match.privateMatch,
                    gameMap: match.gameMap,
                    password: match.password,
                    superWeapons: match.superWeapons,
                    shotTimer: match.shotTimer,
                    gameMode: match.gamemode,
                    hostName: match.hostName,
                    players: match.players,
                    maxPlayers: match.maxPlayers,
                    createdAt: match.createdAt,
                    gamestatus: match.gamestatus
                }));
                // Get all public FFA matches
            }
            else if (gameMode === "FFA") {
                const matches = yield db.collection("PublicOnlinematches").find({ gameMode: "FFA" }).toArray();
                if (matches.length === 0) {
                    throw new Error("No FFA matches online!");
                }
                onlineMatches = matches.map((match) => ({
                    roomId: match.roomId,
                    privateMatch: match.privateMatch,
                    gameMap: match.gameMap,
                    password: match.password,
                    superWeapons: match.superWeapons,
                    shotTimer: match.shotTimer,
                    gameMode: match.gamemode,
                    hostName: match.hostName,
                    players: match.players,
                    maxPlayers: match.maxPlayers,
                    createdAt: match.createdAt,
                    gamestatus: match.gamestatus
                }));
            }
            else {
                const matches = yield db.collection("PublicOnlinematches").find().toArray();
                if (matches.length === 0) {
                    // throw new Error("No matches online!");
                }
                onlineMatches = matches.map((match) => ({
                    roomId: match.roomId,
                    privateMatch: match.privateMatch,
                    gameMap: match.gameMap,
                    password: match.password,
                    superWeapons: match.superWeapons,
                    shotTimer: match.shotTimer,
                    gameMode: match.gamemode,
                    hostName: match.hostName,
                    players: match.players,
                    maxPlayers: match.maxPlayers,
                    createdAt: match.createdAt,
                    gamestatus: match.gamestatus
                }));
            }
            // Return result
            return onlineMatches;
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
        }
    });
}
/**
 * Identify user by email and activate account.
 * If user couldn't be found an error is thrown.
 */
function activateUserAccount(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = false;
        try {
            if (!userId) {
                throw new Error("Please provide an unique identifier to search for!");
            }
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Started - activateUserAccount");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const user = yield getUserById(userId);
            if (user === null) {
                console.log("activateUserAccount: user is null");
                throw new Error("No user found for provided identifier!");
            }
            else {
                console.log("activateUserAccount: user not null", user.email);
                // Check if time to activate account has already expired
                if (user.verificationTimer)
                    if (new Date(Date.now()).getTime() > new Date(user.verificationTimer).getTime()) {
                        throw new Error("Time to active account has already expired!");
                    }
                // Set user account verified and save it to db
                if (user.verified) {
                    console.log("activateUserAccount: user already verified", user.email);
                    result = true;
                }
                else {
                    console.log("activateUserAccount: user not verified", user.email);
                    yield users.findOneAndUpdate({ _id: user === null || user === void 0 ? void 0 : user._id }, { $set: { verified: true } });
                    result = true;
                    console.log("activateUserAccount: user is now verified", user.email);
                }
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            console.log(result.toString());
            return result;
        }
    });
}
// Sorts and rewrites the leaderboard to db
function writeLeaderboard() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        try {
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Started - writeLeaderboard");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const leaderboard = db.collection("Leaderboard");
            // Sort players in descending order of points (collection sort - might be faster for a huge amount of entries) [This code part has been generated by AI]
            const cursor = users.find().sort({ points: -1 });
            const sortedUserCollection = yield cursor.toArray();
            // Transform users into leaderboard schema [This code part has been generated by AI]
            const leaderboardEntries = sortedUserCollection.map((user, index) => ({
                rank: index + 1,
                username: user.username || "",
                points: user.points || 0,
                country: user.country || Resources_1.Country.DE,
                level: user.level || 0,
            }));
            // Delete Leaderboard collection
            yield leaderboard.drop();
            // Create Leaderboard collection 
            let newLeaderboard = yield db.createCollection("Leaderboard");
            // Write leaderboard entries to Leaderboard collection
            yield newLeaderboard.insertMany(leaderboardEntries);
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
        }
    });
}
// Get current leaderboard
function getLeaderboard() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let leaderboard = [];
        try {
            // Create mongoDB native client & get leaderboard collection
            yield client.connect();
            console.log("Started - getLeaderboard");
            const db = client.db("OceanCombat");
            const leaderboardCollection = db.collection("Leaderboard");
            // Check if Leaderboard collection is not empty
            const count = yield leaderboardCollection.countDocuments();
            if (count > 0) {
                // Get leaderboard from the collection
                const leaderboardDocs = yield leaderboardCollection.find().toArray();
                leaderboard = leaderboardDocs.map((doc) => {
                    const { _id } = doc, leaderboardEntry = __rest(doc, ["_id"]);
                    return leaderboardEntry;
                });
                return leaderboard;
            }
            else {
                return null;
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
        }
        return leaderboard;
    });
}
// Get all users
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let userArray = [];
        try {
            // Create mongoDB client & get user collection
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            const usersCursor = db.collection("Users").find();
            const userDocumentArray = yield usersCursor.toArray();
            userArray = userDocumentArray.map((userDoc) => {
                const user = {
                    _id: userDoc._id,
                    email: userDoc.email,
                    username: userDoc.username,
                    points: userDoc.points,
                    premium: userDoc.premium,
                    level: userDoc.level,
                    gameSound: userDoc.gameSound,
                    music: userDoc.music,
                    higherLvlChallenge: userDoc.higherLvlChallenge,
                    verified: userDoc.verified,
                    verificationTimer: userDoc.verificationTimer,
                    skin: userDoc.skin
                };
                return user;
            });
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
        }
        return userArray;
    });
}
// Delete all entries from collection
function deleteEntriesFromCollection(collectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        try {
            // Create mongoDB client
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            const collection = db.collection(collectionName);
            // Delete all entries of collection
            yield collection.deleteMany();
            console.log(`Collection ${collectionName} successfully deleted`);
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
        }
    });
}
//# sourceMappingURL=DBService.js.map