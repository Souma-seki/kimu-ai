import type { loadingWorkEntity } from 'api/@types/work';
import assert from 'assert';

import { OPENAI_MODEL } from 'service/envValues';
import { openai } from 'service/openai';
import { workUseCase } from '../useCase/workUseCase';

const createChatPrompt = (
  loadingWork: loadingWorkEntity,
  html: string,
): string => `以下は"${loadingWork.author}"が書いた"${loadingWork.title}"という小説の内容です。
サムネイルを作成するため、Dall-E 3のプロンプトを作成してください。
トリミングせず全面に1枚の絵をDall-E 3に描画させてください。
出力した結果をそのままDall-E 3に渡すため、余計なテキストを含めず目的のプロンプトのみ生成してください。
==============
${html}`;

const getImage = async (prompt: string): Promise<Buffer> => {
  const res = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    size: '1792x1024',
    response_format: 'b64_json',
  });
  const { b64_json } = res.data[0];
  const arrayBuffer = await fetch(`data:image/png;base64,${b64_json}`).then((b) => b.arrayBuffer());

  return Buffer.from(arrayBuffer);
};

export const workEvent = {
  workCreated: (params: { loadingWork: loadingWorkEntity; html: string }): void => {
    const chatPrompt = createChatPrompt(params.loadingWork, params.html);

    openai.chat.completions
      .create({
        model: OPENAI_MODEL,
        temperature: 0,
        messages: [
          { role: 'system', content: 'あなたは小説の編集者です' },
          { role: 'user', content: chatPrompt },
        ],
      })
      .then(async (response) => {
        const imagePrompt = response.choices[0].message.content;
        assert(imagePrompt);
        const image = await getImage(imagePrompt);
        await workUseCase.complete(params.loadingWork, image);
      });
  },
};