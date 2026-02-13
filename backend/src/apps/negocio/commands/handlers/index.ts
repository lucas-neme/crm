import { CreateNegocioHandler } from './create-negocio.handler';
import { UpdateNegocioHandler } from './update-negocio.handler';
import { DeleteNegocioHandler } from './delete-negocio.handler';

export const CommandHandlers = [
  CreateNegocioHandler,
  UpdateNegocioHandler,
  DeleteNegocioHandler,
];
