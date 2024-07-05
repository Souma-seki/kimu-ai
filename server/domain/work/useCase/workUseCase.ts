import type { loadingWorkEntity } from 'api/@types/work';
import { transaction } from 'service/prismaClient';
import { s3 } from 'service/s3Client';
import { workEvent } from '../event/workEvent';
import { workMethod } from '../model/workMethod';
import { novelQuery } from '../repository/novelQuery';
import { workCommand } from '../repository/workCommand';

export const workUseCase = {
  create: (novelUrl: string): Promise<loadingWorkEntity> =>
    transaction('RepeatableRead', async (tx) => {
      const { title, author, html } = await novelQuery.scrape(novelUrl);
      const loadingWork = workMethod.create({ novelUrl, title, author });

      await workCommand.save(tx, loadingWork);
      await s3.putText(`works/${loadingWork.id}/content.txt`, html);

      workEvent.workCreated({ loadingWork, html });

      return loadingWork;
    }),
  complete: (loadingWork: loadingWorkEntity, image: Buffer): Promise<void> =>
    transaction('RepeatableRead', async (tx) => {
      const completeWork = workMethod.complete(loadingWork);

      await workCommand.save(tx, completeWork);
      await s3.putImage(`works/${loadingWork.id}/image.jpg`, image);
    }),
  failure: (leadingWork: loadingWorkEntity, errorMsg: string): Promise<void> =>
    transaction('RepeatableRead', async (tx) => {
      const failedWork = workMethod.failure(leadingWork, errorMsg);
      await workCommand.save(tx, failedWork);
    }),
};
