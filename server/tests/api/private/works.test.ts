import { expect, test } from 'vitest';
import { createUserClient, noCookieClient } from '../apiClient';
import { GET, POST } from '../utils';

test(GET(noCookieClient.private.works), async () => {
  const userClient = await createUserClient();
  const res = await userClient.private.works.$get();

  expect(res).toHaveLength(0);
});

test(`${POST(noCookieClient.private.works)} - completed`, async () => {
  const userClient = await createUserClient();
  const novelUrl = 'https://www.aozora.gr.jp/cards/000879/files/127_15260.html';

  await userClient.private.works.$post({ body: { novelUrl } });

  //eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await userClient.private.works.$get();

    if (res[0].status !== 'loading') {
      expect(res[0].status).toBe('completed');
      expect(res[0].novelUrl).toBe(novelUrl);
      expect(res[0].title).toBe('羅生門');
      expect(res[0].author).toBe('芥川龍之介');

      break;
    }
  }
});

test(`${POST(noCookieClient.private.works)} - failed`, async () => {
  const userClient = await createUserClient();
  const novelUrl = 'https://www.aozora.gr.jp/cards/000879/files/empty.html';

  await userClient.private.works.$post({ body: { novelUrl } });

  //eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await userClient.private.works.$get();

    if (res[0].status !== 'loading') {
      expect(res[0].status).toBe('failed');

      break;
    }
  }
});
