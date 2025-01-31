/* istanbul ignore file */
import dotenv from "dotenv";
dotenv.config() // read ".env"

import http from "http";
// import mongoose from 'mongoose';
import { logger } from "./logger"
import { startWebSocketConnection } from "./websockets";

// New addidtions
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import app from "./app"

app.use(cors({
  credentials: true,
  // origin: "*"
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// Initiate Mongoose
//mongoose.Promise = Promise;
//mongoose.connect(MONGO_URL);
//mongoose.connection.on("error", (error: Error) => console.log(error));

/** 
 * Init setup to connect to MongoDB
 * */
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=OceanCombat`;

//Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
  //tls: true  // Etablishes TLS connection
});

async function setup() {

  // Tests if env variables could get read
  let mongodURI = process.env.DB_CONNECTION_STRING;

  if (!mongodURI) {
    logger.error(`Cannot start, no database configured. Set environment variable DB_CONNECTION_STRING. Use "memory" for MongoMemoryServer, anything else for real MongoDB server"`);
    process.exit(1);
  }

  if (mongodURI === "memory") {
    logger.info("Start MongoMemoryServer")
    const MMS = await import('mongodb-memory-server')
    const mongo = await MMS.MongoMemoryServer.create();
    mongodURI = mongo.getUri();

    logger.info(`Connect to mongod at ${mongodURI}`)
    // await mongoose.connect(mongodURI);

  } else {
    logger.info(`Connect to mongod at ${uri}`);

    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect()
        .then(() => { logger.info("Connection successfully etablished!"); });
      // Send a ping to confirm a successful connection
      await client.db("BitBusters").command({ ping: 1 })
        .then(() => { logger.info("Pinged your deployment. You successfully connected to MongoDB!"); });
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
    const testPort: number = parseInt(process.env.HTTP_PORT!);
    const server = http.createServer(app);
    server.listen(testPort || 3001, () => {
      logger.info('Server Started PORT ==> ', testPort);
    });
    startWebSocketConnection(server);
  try {
    //getACollection(); 
    //hostOnlineMatch();
    //createUser();
    // let user: string = "jane@abc.com";
    // let result = await getUserByMail(user);
    //console.log("Found user: " + JSON.stringify(result));

    // Write user
    // let jane: UserResource = {
    //   email: "jane@abc.com",
    //   password: "jane@abc.com1324",
    //   username: "Jane Doe",
    //   points: 26,
    //   level: 4,
    //   higherLvlChallenge: true
    // }
    // await registerUser(jane);

    // Delete user
    // await deleteUserByMail(jane.email!);

    // Host PublicOnlineMatch
    // let publicMatch: OnlineMatchResource = {
    //   roomId: "4444",
    //   privateMatch: false,
    //   gameMap: "BasicMap",
    //   superWeapons: false,
    //   shotTimer: 10,
    //   gameMode: "1vs1",
    //   hostName: "Peter",
    //   players: ["Peter"],
    //   maxPlayers: 4
    // }

    //await hostOnlineMatch(publicMatch);

    // Delete PublicOnlineMatch
    // await deleteOnlineMatch(publicMatch.roomId, publicMatch.privateMatch);
  } catch (e) {
    console.log("Error: " + e);
  }
};

setup().catch(console.dir);