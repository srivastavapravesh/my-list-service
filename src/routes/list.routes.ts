import { Router } from 'express';
import * as listController from '../controllers/list.controller';

const router = Router();

router.post('/', listController.addToList);
router.delete('/:contentId', listController.removeFromList);
router.get('/', listController.listItems);

export default router;