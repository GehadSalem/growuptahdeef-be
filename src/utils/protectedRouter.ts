// utils/protectedRouter.ts
import { Router } from 'express';
import { asyncHandler } from '../middlewares/error.middleware';
import {authenticate} from '../middlewares/auth.middleware';

const protectedRouter = Router();


// Apply authentication to all routes using this router
protectedRouter.use(asyncHandler(authenticate));
// 

export default protectedRouter;