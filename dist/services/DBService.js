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
exports.deleteEntriesFromCollection = exports.getAllUsers = exports.getLeaderboard = exports.writeLeaderboardSimpel = exports.activateUserAccount = exports.getPublicOnlinematches = exports.deleteOnlineMatch = exports.updateOnlineMatch = exports.joinOnlineMatch = exports.hostOnlineMatch = exports.deleteUserByUsername = exports.deleteUserByMail = exports.deleteUserById = exports.getUserByUsername = exports.getUserByMail = exports.getUserById = exports.updateUserData = exports.registerUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongodb_1 = require("mongodb");
const Resources_1 = require("../Resources");
const MailService_1 = require("./MailService");
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
            // Write object to db and send a verification mail
            if (userRes._id && userRes.email && userRes.password) {
                yield client.db("OceanCombat").collection("Users").insertOne(userRes);
                yield (0, MailService_1.sendVerificationEmail)(userRes._id, userRes.email);
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
exports.registerUser = registerUser;
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
            const user = yield users.findOne({ _id: userRes._id });
            let changedMail = false;
            if (user !== null) {
                // Set new values (user settings)
                if (userRes.email !== undefined) {
                    const result = getUserByMail(user.email);
                    if (result === null) {
                        user.email = userRes.email;
                        changedMail = true;
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
                // If email changed, update verificationTimer, set verified to false and resend verification mail
                if (changedMail) {
                    user.verificationTimer = new Date(Date.now() + 1000 * 60 * 60 * 24);
                    user.verified = false;
                    yield (0, MailService_1.sendVerificationEmail)(user._id, user.email);
                }
                // Update user settings with new data
                yield users.findOneAndUpdate({ _id: user._id }, {
                    $set: {
                        email: user.email, password: user.password, points: user.points,
                        premium: user.premium, level: user.level, gameSound: user.gameSound,
                        music: user.music, higherLvlChallenge: user.higherLvlChallenge,
                        verificationTimer: user.verificationTimer, verified: user.verified
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
exports.updateUserData = updateUserData;
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
                    verificationTimer: user.verificationTimer
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
exports.getUserById = getUserById;
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
                    verificationTimer: user.verificationTimer
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
exports.getUserByMail = getUserByMail;
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
                    verificationTimer: user.verificationTimer
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
exports.getUserByUsername = getUserByUsername;
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
exports.deleteUserById = deleteUserById;
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
exports.deleteUserByMail = deleteUserByMail;
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
exports.deleteUserByUsername = deleteUserByUsername;
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
            // Clean up old lobbies (older than 2h and 3h) and write it back to db [This code part has been partly written by AI]
            let timeCheck2h = new Date();
            timeCheck2h.setHours(timeCheck2h.getHours() - 2);
            let timeCheck3h = new Date();
            timeCheck3h.setHours(timeCheck3h.getHours() - 3);
            // Check all public matches
            const pubCollAsArray = yield db.collection("PublicOnlinematches").find().toArray();
            if (pubCollAsArray.length > 0) {
                const pupOldMatchesPreFilter = pubCollAsArray.filter(match => match.createdAt >= timeCheck2h && match.gamestatus !== Resources_1.Gamestatus.Test);
                if (pupOldMatchesPreFilter.length > 0) {
                    const pupFineFilter = pupOldMatchesPreFilter.filter(match => match.createdAt >= timeCheck3h && match.gamestatus !== Resources_1.Gamestatus.Test);
                    yield db.collection("PublicOnlinematches").insertMany(pupFineFilter);
                }
            }
            // Check all private matches
            const privCollAsArray = yield db.collection("PrivateOnlinematches").find().toArray();
            if (pubCollAsArray.length > 0) {
                const privOldMatchesPreFilter = privCollAsArray.filter(match => match.createdAt >= timeCheck2h && match.gamestatus !== Resources_1.Gamestatus.Test);
                if (privOldMatchesPreFilter.length > 0) {
                    const privFineFilter = privOldMatchesPreFilter.filter(match => match.createdAt >= timeCheck3h && match.gamestatus !== Resources_1.Gamestatus.Test);
                    yield db.collection("PublicOnlinematches").insertMany(privFineFilter);
                }
            }
            // ####################### Cleaning DB part END #######################
            // Find out where to host the match
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
exports.hostOnlineMatch = hostOnlineMatch;
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
                throw new Error("No room found to join!");
            }
            // Check if max number of players has been reached to prevent further joins
            if (room.players.length == room.maxPlayers) {
                throw new Error("Room is already full!");
            }
            // Check, if user has already joined once before, otherwise add user and update db
            if (!room.players.includes(username)) {
                room.players.push(username);
                // Check if max number of players has been reached to change gamestatus to full
                if (room.players.length == room.maxPlayers) {
                    gamestatus = Resources_1.Gamestatus.Full;
                }
            }
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
exports.joinOnlineMatch = joinOnlineMatch;
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
                // If found in prvate rooms and privacy type is now public, delete it from private
            }
            else if (room && !onlineMatchResource.privateMatch) {
                yield privateCollection.findOneAndDelete({ roomId: onlineMatchResource.roomId });
                deleted = true;
            }
            if (!room) {
                throw new Error("No room found to join!");
            }
            // Find where to host room
            const collection = room.roomType === 'private' ? privateCollection : publicCollection;
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
exports.updateOnlineMatch = updateOnlineMatch;
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
exports.deleteOnlineMatch = deleteOnlineMatch;
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
                    throw new Error("No matches online!");
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
exports.getPublicOnlinematches = getPublicOnlinematches;
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
            const user = yield users.findOne({ _id: userId });
            if (user === null) {
                throw new Error("No user found for provided identifier!");
            }
            else {
                // Check if time to activate account has already expired
                if (Date.now() - Resources_1.ExpirationTime.TwentyFour < user.verificationTimer) {
                    throw new Error("Time to active account has already expired!");
                }
                // Set user account verified and save it to db
                if (user.verified) {
                    result = true;
                }
                else {
                    yield users.findOneAndUpdate({ _id: user === null || user === void 0 ? void 0 : user._id }, { $set: { verified: true } });
                    result = true;
                }
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
exports.activateUserAccount = activateUserAccount;
// Returns the leaderboard based on the given parameters [This code part has been generated by AI]
// export async function writeToLeaderboard(user: UserResource): Promise<void> {
//     const client = new MongoClient(MONGO_URL);
//     try {
//         // Create mongoDB native client & get user collection
//         await client.connect();
//         console.log("Started - writeToLeaderboard");
//         const db = client.db("OceanCombat");
//         const leaderboard = db.collection("Leaderboard");
//         // Find user with highest points lower than current user's points
//         const filter = { points: { $lt: user.points } };
//         const sort: { [key: string]: SortDirection } = { points: -1 }; // Sort by points in descending order
//         const projection = { _id: 1 };
//         const options = { projection, sort }; // Options object
//         const userBefore = await leaderboard.findOne(filter, options);
//         // Insert current user at the right position in the array
//         const update: any = {
//             $push: {
//                 users: {
//                     $each: [{ ...user, _id: new ObjectId(user.id) }],
//                     $sort: { points: -1 },
//                 },
//             },
//         };
//         if (userBefore) {
//             const users = await leaderboard.find().toArray();
//             update.$push.users.$position = users.findIndex((u: any) => u._id.equals(userBefore._id)) + 1;
//         }
//         const result: UpdateResult = await leaderboard.updateOne({}, update);
//         console.log(`Updated ${result.matchedCount} document(s)`);
//     } catch (error) {
//         throw error;
//     } finally {
//         await client.close();
//     }
// }
// Sorts and rewrites the leaderboard to db
function writeLeaderboardSimpel() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        try {
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Started - writeLeaderboardSimpel");
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
                level: user.level || 0,
            }));
            // Write leaderboard entries to Leaderboard collection
            yield leaderboard.deleteMany({});
            yield leaderboard.insertMany(leaderboardEntries);
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
        }
    });
}
exports.writeLeaderboardSimpel = writeLeaderboardSimpel;
// Get the leaderboard  
function getLeaderboard() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new mongodb_1.MongoClient(MONGO_URL);
        let leaderboard = [];
        try {
            // Create mongoDB native client & get user collection
            yield client.connect();
            console.log("Started - writeLeaderboardSimpel");
            const db = client.db("OceanCombat");
            const leaderboardEntries = yield db.collection("Leaderboard").find().toArray();
            if (!leaderboardEntries) {
                throw new Error("Leaderboard is currently being revised!");
            }
            // Add all leaderboard objects to array
            leaderboard = leaderboardEntries.map((entry) => ({
                rank: entry.rank,
                username: entry.username,
                points: entry.points,
                country: entry.country,
                level: entry.level
            }));
            return leaderboard;
        }
        catch (error) {
            throw error;
        }
        finally {
            yield client.close();
        }
    });
}
exports.getLeaderboard = getLeaderboard;
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
                    verificationTimer: userDoc.verificationTimer
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
exports.getAllUsers = getAllUsers;
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
exports.deleteEntriesFromCollection = deleteEntriesFromCollection;
//# sourceMappingURL=DBService.js.map