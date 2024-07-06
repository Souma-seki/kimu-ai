import type { CompletedWorkEntity, loadingWorkEntity } from 'api/@types/work';
import { brandedId } from 'service/brandedId';
import { s3 } from 'service/s3Client';
import { ulid } from 'ulid';
import type { FailedWorkEntity } from '../../../api/@types/work';
import { getContentKey, getImageKey } from '../service/getS3Key';

export const workMethod = {
  create: async (val: {
    novelUrl: string;
    title: string;
    author: string;
  }): Promise<loadingWorkEntity> => {
    const id = brandedId.work.entity.parse(ulid());
    return {
      id: brandedId.work.entity.parse(ulid()),
      status: 'loading',
      novelUrl: val.novelUrl,
      title: val.title,
      author: val.author,
      contentUrl: await s3.getSignedUrl(getContentKey(id)),
      createdTime: Date.now(),
      imageUrl: null,
      errorMsg: null,
    };
  },
  complete: async (leadingWork: loadingWorkEntity): Promise<CompletedWorkEntity> => {
    return {
      ...leadingWork,
      status: 'completed',
      imageUrl: await s3.getSignedUrl(getImageKey(leadingWork.id)),
    };
  },
  failure: (leadingWork: loadingWorkEntity, errorMsg: string): FailedWorkEntity => {
    return {
      ...leadingWork,
      status: 'failed',
      errorMsg,
    };
  },
};
