// KISA 가이드 "자동화 공격" 항목 대응 — OAuth 엔드포인트 무차별 대입/자동화 요청 제한.
// vendor.js(원본, 무수정)를 감싸는 얇은 레이어.
//
// 정확도 관련 주의(실측으로 확인, base/판정-KISA21항목.md 참고):
// Workers 네이티브 Rate Limiting API는 IP당 콜로(edge 데이터센터)별로 카운터가
// 분리된다. 같은 클라이언트에서 몇 초 안에 25회를 보내도 Cloudflare 애니캐스트가
// HKG/NRT/KIX 등 서로 다른 콜로로 나눠 라우팅하면 콜로별 카운트는 각각 한도 밑이라
// 전부 통과한다(실측 확인). Cloudflare 공식 문서도 "permissive, eventually
// consistent, intentionally designed to not be used as an accurate accounting
// system"이라고 명시한다 — 정확한 차단이 아니라 성긴 방어선이다. 이 Worker는
// 자체 로그인 폼이 없어(GitHub가 실제 인증 담당) 크리덴셜 무차별 대입 자체가
// 불가능하므로, 이 정도 성긴 방어로도 비례성은 맞다고 판단.
import vendor from './vendor.js';

const RATE_LIMITED_PATHS = ['/auth', '/callback', '/oauth/authorize', '/oauth/redirect'];

export default {
  /**
   * @param {Request} request - HTTP request.
   * @param {{ AUTH_RATE_LIMITER?: { limit: (opts: { key: string }) => Promise<{ success: boolean }> }, [key: string]: string }} env - Environment.
   * @param {ExecutionContext} ctx - Execution context.
   * @returns {Promise<Response>} HTTP response.
   */
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (RATE_LIMITED_PATHS.includes(pathname) && env.AUTH_RATE_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
      const { success } = await env.AUTH_RATE_LIMITER.limit({ key: ip });

      if (!success) {
        return new Response('Too Many Requests', {
          status: 429,
          headers: { 'Retry-After': '60' },
        });
      }
    }

    return vendor.fetch(request, env, ctx);
  },
};
