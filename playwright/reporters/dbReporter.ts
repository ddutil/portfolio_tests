import type {
  Reporter,
  TestCase,
  TestResult,
  FullConfig,
  Suite,
  FullResult,
} from '@playwright/test/reporter';
import { config } from 'dotenv';
import { runQuery } from '../../utils/dbUtils';

config();

interface TestRecord {
  name: string;
  status: string;
  durationMs: number;
}

class DbReporter implements Reporter {
  private startTime: number = 0;
  private total = 0;
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private tests: TestRecord[] = [];

  onBegin(_config: FullConfig, _suite: Suite) {
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.total++;
    if (result.status === 'passed') this.passed++;
    else if (result.status === 'skipped') this.skipped++;
    else this.failed++; // failed, timedOut, interrupted

    this.tests.push({
      name: test.titlePath().slice(1).join(' > '), // e.g. "Contact Page Layout > minimal happy path"
      status: result.status,
      durationMs: result.duration,
    });
  }

  async onEnd(_result: FullResult) {
    const durationMs = Date.now() - this.startTime;
    const environment = process.env.CI ? 'ci' : 'local';
    const runNumber = process.env.GITHUB_RUN_NUMBER;
    const runDate = new Date().toISOString().slice(0, 10);
    const reportUrl = process.env.CI && runNumber
      ? `https://ddutil.github.io/portfolio_tests/reports/${runDate}-run-${runNumber}/index.html`
      : null;

    try {
      await runQuery(
        `INSERT INTO public.test_runs
          ("runDate", "suiteName", total, passed, failed, skipped, "durationMs", environment, tests, "reportUrl")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [new Date(), 'Playwright', this.total, this.passed, this.failed, this.skipped, durationMs, environment, JSON.stringify(this.tests), reportUrl]
      );
      console.log(`\nTest run logged to database (${environment}): ${this.passed}/${this.total} passed`);
    } catch (err) {
      console.error('\nFailed to log test run to database:', err);
    }
  }
}

export default DbReporter;
