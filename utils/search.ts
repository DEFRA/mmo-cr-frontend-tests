/**
 * Search helpers shared by page objects, flows and the reference data global setup.
 *
 * @author Randhir Patel
 * @since 2026-11-25
 */

// Port, gear and species searches type the first 2 characters of the name
export const searchTermFor = (name: string): string => name.slice(0, 2);
