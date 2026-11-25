import { test } from '@playwright/test';

const sensitiveMethod = /sign|login|password|credential/i;

const describeArg = (arg: unknown): string | undefined => {
  if (typeof arg === 'string') return arg.length > 60 ? `${arg.slice(0, 57)}...` : arg;
  if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
  if (arg instanceof Date) return arg.toISOString().slice(0, 10);
  return undefined;
};

/**
 * Wraps a flow helper so every public method call appears as a named step in the Allure and HTML reports,
 * e.g. `FavouritesFlow.addPortToAccount(Plymouth)`. Only primitive and date arguments are logged, and
 * none for sign-in methods so credentials never reach the report.
 *
 * @author Randhir Patel
 * @since 2026-11-25
 */
export const withSteps = <T extends object>(flow: T): T =>
  new Proxy(flow, {
    get(target, property, receiver) {
      const value: unknown = Reflect.get(target, property, receiver);
      if (typeof value !== 'function' || typeof property !== 'string' || property === 'constructor') return value;

      return (...args: unknown[]) => {
        const shown = sensitiveMethod.test(property)
          ? []
          : args.map(describeArg).filter((arg): arg is string => arg !== undefined);
        const title = `${target.constructor.name}.${property}(${shown.join(', ')})`;
        return test.step(title, () => value.apply(target, args) as Promise<unknown>);
      };
    }
  });
