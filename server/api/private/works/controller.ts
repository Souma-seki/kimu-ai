import { workQuery } from 'domain/work/repository/workQuery';
import { workUseCase } from 'domain/work/useCase/workUseCase';
import { prismaClient } from 'service/prismaClient';
import { defineController } from './$relay';

export default defineController(() => ({
  get: () => workQuery.listAll(prismaClient).then((works) => ({ status: 200, body: works })),
  post: ({ body }) =>
    workUseCase.create(body.novelUrl).then((work) => ({ status: 200, body: work })),
}));
