/* eslint-disable compat/compat */
import { IEventAggregator } from '@aurelia/kernel';
import { IRouter, RouterStartEvent } from '../router.js';

/**
 * Get either a provided value or the value of an html attribute,
 * depending on `useValue`. If `checkExists` is `true` the
 * existence of the html attribute is returned, regardless of
 * `useValue` (or `value`).
 *
 * @param name - Attribute name
 * @param valueOrDefault - The value that's used if `useValue` or if
 * the attribute doesn't exist on the element (so it's also default)
 * @param useValue - Whether the value should be used (unless check exists)
 * @param element - The element with the attributes
 * @param checkExists - Whether only the existence of the html attribute
 * should be checked and returned as a boolean
 */
export function getValueOrAttribute(name: string, valueOrDefault: string | boolean, useValue: boolean, element: HTMLElement, checkExists: boolean = false): string | boolean | undefined {
  // If an attribute exist check is requested, the value isn't used at all
  if (checkExists) {
    return element.hasAttribute(name);
  }
  if (useValue) {
    return valueOrDefault;
  }
  const attribute = element.getAttribute(name) ?? '';
  // If no or empty attribute, the provided value serves as default
  return attribute.length > 0 ? attribute : valueOrDefault;
}

/**
 * Make it possible to wait for router start by subscribing to the
 * router start event and return a promise that's resolved when
 * the router start event fires.
 */
export function waitForRouterStart(router: IRouter, ea: IEventAggregator): void | Promise<void> {
  if (router.isActive) {
    return;
  }
  return new Promise((resolve) => {
    const subscription = ea.subscribe(RouterStartEvent.eventName, () => {
      resolve();
      subscription.dispose();
    });
  });
}