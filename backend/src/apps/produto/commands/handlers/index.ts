import { CreateProdutoHandler } from './create-produto.handler';
import { UpdateProdutoHandler } from './update-produto.handler';
import { DeleteProdutoHandler } from './delete-produto.handler';

export const CommandHandlers = [
  CreateProdutoHandler,
  UpdateProdutoHandler,
  DeleteProdutoHandler,
];
