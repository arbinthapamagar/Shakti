import { Router } from 'express';
import { verifyUserJwt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { uploadDriverDocument, getMyDriverProfile } from '../controller/users/user.driver.controller.js';

const documentRouter = Router();
documentRouter.use(verifyUserJwt);

documentRouter.post('/', upload.single('document'), uploadDriverDocument);
documentRouter.get('/', async (req, res, next) => {
    req.params.id = req.user._id.toString();
    next();
}, getMyDriverProfile);

export { documentRouter };
