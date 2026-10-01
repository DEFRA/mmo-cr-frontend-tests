import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

export default function cleanAllureOutput(): void {
  rmSync(resolve(__dirname, 'allure-results'), { recursive: true, force: true });
  rmSync(resolve(__dirname, 'allure-report'), { recursive: true, force: true });
}
