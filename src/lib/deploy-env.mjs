// A production build on Cloudflare Pages must not ship example.com links (TSK-060). Pages sets
// CF_PAGES=1 and CF_PAGES_BRANCH; the production branch is main. Preview and local builds keep the
// placeholders so anyone can build without settings.
export const REQUIRED = ['SITE_URL', 'APP_URL', 'TASKS_APP_URL', 'CONTACT_EMAIL'];

export function deployProblems(env) {
  const production = env.CF_PAGES === '1' && (env.CF_PAGES_BRANCH ?? '') === (env.PRODUCTION_BRANCH || 'main');
  if (!production && env.REQUIRE_DEPLOY_ENV !== '1') return [];
  return REQUIRED.flatMap((name) => {
    const value = env[name] ?? '';
    if (!value) return [`${name} is not set`];
    if (/example\.(com|org|net)/i.test(value)) return [`${name} still points at an example domain`];
    if (name !== 'CONTACT_EMAIL' && !/^https:\/\//.test(value)) return [`${name} must start with https://`];
    return [];
  });
}

export function assertDeployEnv(env = process.env) {
  const problems = deployProblems(env);
  if (problems.length > 0) {
    throw new Error(`Production build settings are missing (Pages → Settings → Variables): ${problems.join('; ')}`);
  }
}
