import express from 'express';
import "express-async-errors"; // needs to be imported before routers and other stuff!

// Import of login router
import { loginRouter } from './routes/login';

import cookieParser from 'cookie-parser';
import { configureCORS } from './configCORS';
import { userRouter } from './routes/user';
import { guestRouter } from './routes/guest';
import { verificationRouter } from './routes/verification';

const app = express();
configureCORS(app);

// Middleware:
app.use('*', express.json());
app.use(cookieParser());

// Routes
app.use("/api/login", loginRouter);
app.use("/api/user", userRouter);
app.use("/api/guest", guestRouter);
app.use("/api/verification", verificationRouter);

export default app;