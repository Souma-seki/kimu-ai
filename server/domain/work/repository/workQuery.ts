import type { Prisma, Work } from '@prisma/client';
import { WORK_STATUSES } from 'api/@constants';
import type { WorkEntity } from 'api/@types/work';
import { brandedId } from 'service/brandedId';
import { s3 } from 'service/s3Client';
import { z } from 'zod';
import { getContentKey } from '../service/getS3Key';

const toWorkEntity = async (prismaWork: Work): Promise<WorkEntity> => {
  const status = z.enum(WORK_STATUSES).parse(prismaWork.status);
  const id = brandedId.work.entity.parse(prismaWork.id);
  const contentUrl = await s3.getSignedUrl(getContentKey(id));

  switch (status) {
    case 'loading':
      return {
        id,
        status,
        novelUrl: prismaWork.novelUrl,
        title: prismaWork.title,
        author: prismaWork.author,
        createdTime: prismaWork.createdAt.getTime(),
        imageUrl: null,
        errorMsg: null,
        contentUrl,
      };
    case 'completed':
      return {
        id,
        status,
        novelUrl: prismaWork.novelUrl,
        title: prismaWork.title,
        author: prismaWork.author,
        contentUrl,
        createdTime: prismaWork.createdAt.getTime(),
        imageUrl: 'null',
        errorMsg: null,
      };
    case 'failed':
      return {
        id,
        status,
        novelUrl: prismaWork.novelUrl,
        title: prismaWork.title,
        author: prismaWork.author,
        createdTime: prismaWork.createdAt.getTime(),
        imageUrl: null,
        errorMsg: z.string().parse(prismaWork.errorMsg),
        contentUrl,
      };
    /* v8 ignore next 2 */
    default:
      throw new Error(status satisfies never);
  }
};
export const workQuery = {
  listAll: (tx: Prisma.TransactionClient): Promise<WorkEntity[]> =>
    tx.work.findMany().then((works) => Promise.all(works.map(toWorkEntity))),
};
