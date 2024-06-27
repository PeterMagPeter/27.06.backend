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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.updateUserData = updateUserData;
exports.getUserById = getUserById;
exports.getUserByMail = getUserByMail;
exports.getUserByUsername = getUserByUsername;
exports.deleteUserByMail = deleteUserByMail;
exports.deleteUserByUsername = deleteUserByUsername;
exports.hostOnlineMatch = hostOnlineMatch;
exports.joinOnlineMatch = joinOnlineMatch;
exports.updateOnlineMatch = updateOnlineMatch;
exports.deleteOnlineMatch = deleteOnlineMatch;
exports.getPublicOnlinematches = getPublicOnlinematches;
exports.activateUserAccount = activateUserAccount;
exports.getAllUsers = getAllUsers;
exports.deleteEntriesFromCollection = deleteEntriesFromCollection;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongodb_1 = require("mongodb");
const Resources_1 = require("../Resources");
;
// Set up MongoDB URL
const MONGO_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=OceanCombat`;
/**
 * Create user with data from UserResource and return created object.
 */
function registerUser(userRes) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = false;
        try {
            // Create mongoDB native client
            yield client.connect();
            console.log("Connected successfully to server");
            // Make sure email and username is not in use
            const emailCheck = yield client.db("OceanCombat").collection("Users").findOne({ email: userRes.email });
            const usernameCheck = yield client.db("OceanCombat").collection("Users").findOne({ username: userRes.username });
            if (emailCheck !== null) {
                throw new Error("Email already registered. Please provide another email to continue!");
            }
            if (usernameCheck !== null) {
                throw new Error("Username already registered. Please provide another username to continue!");
            }
            // Write object to db
            const user = Object.assign({}, userRes);
            yield client.db("OceanCombat").collection("Users").insertOne(user);
            result = true;
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
 * Identify and update user by resource.
 * If user couldn't be found, and an error is thrown.
 */
function updateUserData(userRes) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = false;
        try {
            // Create mongoDB native client, connect to db & get user collection
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const user = yield users.findOne({ _id: new mongodb_1.ObjectId(userRes.id) });
            if (user !== null) {
                // Set new values (user settings)
                if (userRes.email !== undefined) {
                    const result = getUserByMail(user.email);
                    if (result === null) {
                        user.email = userRes.email;
                    }
                    else {
                        throw new Error("Mail address already in use!");
                    }
                }
                if (userRes.password !== undefined) {
                    user.password = userRes.password;
                }
                if (userRes.points !== undefined) {
                    user.points = userRes.points;
                    // Check if user has reached a new level
                    const newLevel = yield (0, Resources_1.calculateLevel)(userRes.points);
                    if (userRes.level !== undefined && userRes.level < newLevel) {
                        user.level = newLevel;
                    }
                }
                if (userRes.premium !== undefined) {
                    user.premium = userRes.premium;
                }
                if (userRes.gameSound !== undefined) {
                    user.gameSound = userRes.gameSound;
                }
                if (userRes.music !== undefined) {
                    user.music = userRes.music;
                }
                if (userRes.higherLvlChallenge !== undefined) {
                    user.higherLvlChallenge = userRes.higherLvlChallenge;
                }
                // Update user settings with new data
                yield users.findOneAndUpdate({ _id: user._id }, {
                    $set: {
                        email: user.email, password: user.password, points: user.points,
                        premium: user.premium, level: user.level, gameSound: user.gameSound,
                        music: user.music, higherLvlChallenge: user.higherLvlChallenge
                    }
                });
                result = true;
            }
            ;
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            if (result === null) {
                throw new Error("Couldn't find user to update!");
            }
            return result;
        }
    });
}
/**
 * Get and return user by email (unique).
 * If user couldn't be found an error is thrown.
 */
function getUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = null;
        try {
            if (!id) {
                throw new Error("Please provide an unique identifier to search for!");
            }
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const user = yield users.findOne({ _id: new mongodb_1.ObjectId(id) }); // Convert string into ObjectId
            if (user !== null) {
                result = {
                    id: user._id.toString(),
                    email: user.email,
                    password: user.password,
                    username: user.username,
                    points: user.points,
                    matchPoints: user.matchPoints,
                    team: user.team,
                    premium: user.premium,
                    level: user.level,
                    gameSound: user.gameSound,
                    music: user.music,
                    higherLvlChallenge: user.higherLvlChallenge,
                    active: user.active
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
                    id: user._id.toString(),
                    email: user.email,
                    password: user.password,
                    username: user.username,
                    points: user.points,
                    matchPoints: user.matchPoints,
                    team: user.team,
                    premium: user.premium,
                    level: user.level,
                    gameSound: user.gameSound,
                    music: user.music,
                    higherLvlChallenge: user.higherLvlChallenge,
                    active: user.active
                };
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            if (result === null) {
                throw new Error("Couldn't find user by mail!");
            }
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
                    id: user._id.toString(),
                    email: user.email,
                    password: user.password,
                    username: user.username,
                    points: user.points,
                    matchPoints: user.matchPoints,
                    team: user.team,
                    premium: user.premium,
                    level: user.level,
                    gameSound: user.gameSound,
                    music: user.music,
                    higherLvlChallenge: user.higherLvlChallenge,
                    active: user.active
                };
            }
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
            if (result === null) {
                throw new Error("Couldn't find user by username!");
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
            // Connect to db, find out if a password is set and where to host the match
            const db = client.db("OceanCombat");
            const collectionName = onlineMatch.privateMatch ? "PrivateOnlinematches" : "PublicOnlinematches";
            const collection = db.collection(collectionName);
            // Check if room id already exists
            const result = yield collection.findOne({ roomId: onlineMatch.roomId });
            if (result !== null) {
                throw new Error("Room id already in use!");
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
                createdAt: new Date()
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
            return false;
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
        try {
            // Create mongoDB client
            yield client.connect();
            console.log("Started - joinOnlineMatch");
            // Connect to db and get collections
            const db = client.db("OceanCombat");
            const privateCollection = db.collection("PrivateOnlinematches");
            const publicCollection = db.collection("PublicOnlinematches");
            // Search for room
            let room = yield privateCollection.findOne({ roomId: roomId });
            if (!room) {
                room = yield publicCollection.findOne({ roomId: roomId });
            }
            if (!room) {
                throw new Error("No room found to join!");
            }
            // Add user and update entry in db
            room.players.push(username);
            const collection = room.roomType === 'private' ? privateCollection : publicCollection;
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
                    createdAt: result.createdAt
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
            if (!room) {
                room = yield publicCollection.findOne({ roomId: onlineMatchResource.roomId });
                if (room && onlineMatchResource.privateMatch) {
                    yield publicCollection.findOneAndDelete({ roomId: onlineMatchResource.roomId });
                    deleted = true;
                }
            }
            else if (room && !onlineMatchResource.privateMatch) {
                yield privateCollection.findOneAndDelete({ roomId: onlineMatchResource.roomId });
                deleted = true;
            }
            if (!room) {
                throw new Error("No room found to join!");
            }
            // Find room
            const collection = room.roomType === 'private' ? privateCollection : publicCollection;
            // Copy new match data
            const newMatchData = Object.assign({}, onlineMatchResource);
            // Remove user from players array if username is provided [This part is AI-generated]
            if (username) {
                const index = newMatchData.players.indexOf(username);
                if (index !== -1) {
                    newMatchData.players.splice(index, 1);
                }
            }
            // If match was deleted, insert new match into the correct collection [This part is AI-generated]
            if (deleted) {
                yield collection.insertOne(newMatchData);
                return newMatchData;
            }
            // Update match in db
            const result = yield collection.findOneAndUpdate({ roomId: onlineMatchResource.roomId }, { $set: newMatchData });
            // Return OnlineMatchResource or null [Chris's fix for frontend]
            if (result && result.value) {
                const onlineMatchResource = {
                    roomId: result.value.roomId,
                    privateMatch: result.value.privateMatch,
                    gameMap: result.value.gameMap,
                    password: result.value.password,
                    superWeapons: result.value.superWeapons,
                    shotTimer: result.value.shotTimer,
                    gameMode: result.value.gameMode,
                    hostName: result.value.hostName,
                    players: result.value.players,
                    maxPlayers: result.value.maxPlayers,
                    createdAt: result.createdAt
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
        try {
            // Create mongoDB client
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            let onlineMatches = [];
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
                    createdAt: match.createdAt
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
                    createdAt: match.createdAt
                }));
                // Get all public FFA matches
            }
            else {
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
                    createdAt: match.createdAt
                }));
            }
            // Return result
            return onlineMatches;
        }
        catch (error) {
            throw error;
            return [];
        }
        finally {
            yield client.close();
        }
    });
}
/**
 * Identify user by email.
 * If user couldn't be found an error is thrown.
 */
function activateUserAccount(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let result = false;
        try {
            if (!email) {
                throw new Error("Please provide an unique identifier to search for!");
            }
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Started - deleteUserByMail");
            const db = client.db("OceanCombat");
            const users = db.collection("Users");
            const user = yield users.findOne({ email: email });
            if (user === null) {
                throw new Error("No user found for provided identifier!");
            }
            else {
                // Set user account active and save it to db
                yield users.findOneAndUpdate({ _id: user === null || user === void 0 ? void 0 : user._id }, { $set: { active: true } });
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
// Get all users
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let users = [];
        try {
            // Create mongoDB client
            yield client.connect();
            console.log("Connected successfully to server");
            const db = client.db("OceanCombat");
            const usersCursor = db.collection("Users").find();
            const userArray = yield usersCursor.toArray();
            users = userArray.map((doc) => {
                const user = {
                    id: doc._id.toString(),
                    email: doc.email,
                    password: doc.password,
                    username: doc.username,
                    points: doc.points,
                    matchPoints: doc.matchPoints,
                    team: doc.team,
                    premium: doc.premium,
                    level: doc.level,
                    gameSound: doc.gameSound,
                    music: doc.music,
                    higherLvlChallenge: doc.higherLvlChallenge,
                    active: doc.active
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
        return users;
    });
}
// Delete all etnries from collection
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