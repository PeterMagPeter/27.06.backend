import express from 'express';
import "express-async-errors"; // needs to be imported before routers and other stuff!

import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swaggerConfig';
// Import of login router
import { loginRouter } from './routes/login';

import cookieParser from 'cookie-parser';
import { configureCORS } from './configCORS';
import { userRouter } from './routes/user';
import { guestRouter } from './routes/guest';
import { verificationRouter } from './routes/verification';
import swaggerDocument from './swaggerConfig';

const app = express();
configureCORS(app);

// Middleware:
app.use('*', express.json());
app.use(cookieParser());

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Swagger setup
app.use("/api/login", loginRouter);
app.use("/api/user", userRouter);
app.use("/api/guest", guestRouter);
app.use("/api/verification", verificationRouter);

export default app;