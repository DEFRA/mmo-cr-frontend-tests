/**
 * Hand-off between the reference data global setup and the test workers: the global setup stores its random
 * selections in these environment variables, and test-data/testData.ts reads them in each worker.
 *
 * @author Randhir Patel
 * @since 2026-11-25
 */

export const selectionEnv = {
  vessel: 'REFERENCE_DATA_SELECTED_VESSEL',
  ports: 'REFERENCE_DATA_SELECTED_PORTS',
  gear: 'REFERENCE_DATA_SELECTED_GEAR',
  species: 'REFERENCE_DATA_SELECTED_SPECIES'
} as const;

// Number of distinct ports the specs use at once (ports.first … ports.fifth)
export const selectedPortsCount = 5;

export const readSelection = <T>(envName: string): T | undefined => {
  const value = process.env[envName];
  return value ? (JSON.parse(value) as T) : undefined;
};
