export interface EnvironmentConfig {
  /** Storefront under test; API calls use the same origin. */
  baseURL: string;
}

const environments = {
  dev: { baseURL: 'https://automationexercise.com' },
  test: { baseURL: 'https://automationexercise.com' },
} satisfies Record<string, EnvironmentConfig>;

export type EnvironmentName = keyof typeof environments;

function isEnvironmentName(name: string): name is EnvironmentName {
  return Object.hasOwn(environments, name);
}

/**
 * Picks the environment from `ENV` (default `dev`). `BASE_URL` overrides the
 * configured URL, which is handy for pointing the suite at a local or staging copy.
 */
export function resolveEnvironment(
  name: string = process.env.ENV ?? 'dev',
): EnvironmentConfig & { name: EnvironmentName } {
  if (!isEnvironmentName(name)) {
    throw new Error(`Unknown ENV "${name}". Expected one of: ${Object.keys(environments).join(', ')}`);
  }
  return { name, baseURL: process.env.BASE_URL ?? environments[name].baseURL };
}
