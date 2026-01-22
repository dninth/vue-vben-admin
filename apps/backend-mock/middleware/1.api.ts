import { defineEventHandler } from 'h3';
import { sleep } from '~/utils/response';

export default defineEventHandler(async (event) => {
  event.node.res.setHeader(
    'Access-Control-Allow-Origin',
    event.headers.get('Origin') ?? '*',
  );
  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204;
    event.node.res.statusMessage = 'No Content.';
    return 'OK';
  }

  // 保留一个极轻的随机延迟，模拟真实网络环境（可按需移除）
  await sleep(Math.floor(Math.random() * 120));
});
