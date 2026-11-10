import { expect, test } from '@playwright/test';

for (const width of [1440, 390, 320]) {
  test(`persistent progress header follows scrolling and contract updates at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const summary = page.getByRole('complementary', {
      name: 'Progress summary',
    });

    await expect(summary).toHaveCount(0);
    await page
      .locator('#tracker')
      .evaluate((tracker) =>
        tracker.scrollIntoView({ behavior: 'instant', block: 'start' }),
      );
    await expect(summary).toHaveCount(0);
    await page.evaluate(() => {
      const tracker = document.getElementById('tracker')!;

      window.scrollTo({
        top: window.scrollY + tracker.getBoundingClientRect().bottom + 1,
        behavior: 'instant',
      });
    });
    await expect(summary).toBeVisible();
    await expect(summary.getByRole('progressbar')).toHaveCount(4);
    const bars = await summary
      .getByRole('progressbar')
      .evaluateAll((elements) =>
        elements.map((element) => ({
          name: element.getAttribute('aria-label'),
          left: element.getBoundingClientRect().left,
          top: element.getBoundingClientRect().top,
        })),
      );

    expect(bars.map((bar) => bar.name)).toEqual([
      'Transport summary',
      'Collection summary',
      'Defense summary',
      'Overall summary',
    ]);
    expect(bars.every((bar) => bar.top === bars[0].top)).toBe(true);
    expect(bars.map((bar) => bar.left)).toEqual(
      bars.map((bar) => bar.left).toSorted((a, b) => a - b),
    );

    await page
      .getByRole('button', {
        name: 'Log Important Supply Haul completion',
        exact: true,
      })
      .click();
    await page
      .getByRole('button', { name: 'Log Beryl completion', exact: true })
      .click();
    await page
      .getByRole('button', {
        name: 'Log Yellow Lvl. Support Ship completion',
        exact: true,
      })
      .click();
    await expect(
      summary.getByRole('progressbar', { name: 'Transport summary' }),
    ).toHaveAttribute('aria-valuenow', '625');
    await expect(
      summary.getByRole('progressbar', { name: 'Collection summary' }),
    ).toHaveAttribute('aria-valuenow', '669');
    await expect(
      summary.getByRole('progressbar', { name: 'Defense summary' }),
    ).toHaveAttribute('aria-valuenow', '146');
    await expect(
      summary.getByRole('progressbar', { name: 'Overall summary' }),
    ).toHaveAttribute('aria-valuenow', '1440');
    await page.reload();
    await page.locator('#field-guide').scrollIntoViewIfNeeded();
    await expect(summary).toBeVisible();
    await expect(
      summary.getByRole('progressbar', { name: 'Overall summary' }),
    ).toHaveAttribute('aria-valuenow', '1440');
    const bounds = await summary.boundingBox();

    expect(bounds?.y).toBe(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('persistent-header.png'),
    });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(summary).toHaveCount(0);
    await page.getByRole('link', { name: 'Field guide', exact: true }).click();
    await expect(summary).toBeVisible();
    await summary.getByRole('link').first().click();
    await expect(summary).toHaveCount(0);
  });
}

test('persistent header shows correctly placed milestones and updates reached tiers', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() =>
    localStorage.setItem(
      'rsi-discovery-progress-v1',
      JSON.stringify({ transport: 1999, collection: 4000, defense: 6500 }),
    ),
  );
  await page.goto('/');
  await page.getByRole('link', { name: 'Field guide', exact: true }).click();
  const summary = page.getByRole('complementary', { name: 'Progress summary' });
  const transport = summary.getByRole('progressbar', {
    name: 'Transport summary',
  });
  const overall = summary.getByRole('progressbar', { name: 'Overall summary' });

  await expect(summary).toBeVisible();
  await expect(transport).toHaveAttribute(
    'aria-valuetext',
    '1,999 of 10,000 points, 0 of 4 reward milestones reached',
  );
  await expect(transport.locator('[title]')).toHaveCount(4);
  await expect(overall.locator('[title]')).toHaveCount(4);
  await expect(transport.locator('[title]').first()).toHaveAttribute(
    'title',
    /Tier 1: 2,000 points \(locked\).*\nZeus Keelback livery, BriskAir IC-20 cooler/,
  );
  await expect(
    summary
      .getByRole('progressbar', { name: 'Collection summary' })
      .locator('[data-unlocked="true"]'),
  ).toHaveCount(2);
  await expect(
    summary
      .getByRole('progressbar', { name: 'Defense summary' })
      .locator('[data-unlocked="true"]'),
  ).toHaveCount(3);
  await expect(overall.locator('[data-unlocked="true"]')).toHaveCount(2);

  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('#field-guide').scrollIntoViewIfNeeded();
    await expect(summary).toBeVisible();
    const trackPositions = await transport
      .locator('[title]')
      .evaluateAll((markers) =>
        markers.map((marker) => (marker as HTMLElement).style.left),
      );
    const overallPositions = await overall
      .locator('[title]')
      .evaluateAll((markers) =>
        markers.map((marker) => (marker as HTMLElement).style.left),
      );

    expect(trackPositions).toEqual(['20%', '40%', '65%', '100%']);
    expect(overallPositions).toEqual(['15%', '33%', '80%', '100%']);
    const end = await overall.locator('[title]').last().boundingBox();
    const bar = await overall.boundingBox();

    expect(end!.x + end!.width).toBeLessThanOrEqual(bar!.x + bar!.width + 1);
  }

  await page
    .getByRole('button', {
      name: 'Log Important Supply Haul completion',
      exact: true,
    })
    .click();
  await page.locator('#field-guide').scrollIntoViewIfNeeded();
  await expect(transport.locator('[data-unlocked="true"]')).toHaveCount(1);
  await expect(transport.locator('[title]').first()).toHaveAttribute(
    'title',
    /2,000 points \(reached\)/,
  );
  await expect(transport).toHaveAttribute(
    'aria-valuetext',
    '2,624 of 10,000 points, 1 of 4 reward milestones reached',
  );
});

test('completed contracts add their awards to the matching track and save the total', async ({
  page,
}) => {
  const expected = { transport: 0, collection: 0, defense: 0 };
  const contracts = [
    ['Important Supply Haul', 'transport', 625],
    ['Package Recovery (Exp. E)', 'transport', 313],
    ['Beryl', 'collection', 669],
    ['UCM Order (L)', 'collection', 486],
    ['Orange Lvl. RSI Ship Under Attack', 'defense', 417],
    ['Yellow Lvl. Support Ship', 'defense', 146],
    ['Iron', 'collection', 408],
    ['Beryl + Iron pair', 'collection', 1077],
  ] as const;

  await page.goto('/');

  for (const [name, track, award] of contracts) {
    await page
      .getByRole('button', { name: `Log ${name} completion`, exact: true })
      .click();
    expected[track] += award;

    for (const id of ['transport', 'collection', 'defense'] as const) {
      await expect(
        page.getByRole('spinbutton', { name: `${id} points` }),
      ).toHaveValue(String(expected[id]));
    }

    await expect(
      page.getByRole('progressbar', { name: 'Overall progress', exact: true }),
    ).toHaveAttribute(
      'aria-valuenow',
      String(expected.transport + expected.collection + expected.defense),
    );
  }

  await page
    .getByRole('button', {
      name: 'Log Important Supply Haul completion',
      exact: true,
    })
    .dblclick();
  await expect(
    page.getByRole('slider', { name: 'Transport progress' }),
  ).toHaveValue('2188');
  await expect(
    page.getByRole('progressbar', { name: 'Overall progress', exact: true }),
  ).toHaveAttribute('aria-valuenow', '5391');
  await page.reload();
  await expect(
    page.getByRole('progressbar', { name: 'Overall progress', exact: true }),
  ).toHaveAttribute('aria-valuenow', '5391');
  await expect(
    page.getByRole('slider', { name: 'Collection progress' }),
  ).toHaveValue('2640');
});

test('contract completion updates tiers and caps progress at 10,000', async ({
  page,
}) => {
  await page.goto('/');
  const input = page.getByRole('spinbutton', { name: 'transport points' });
  const completeHaul = page.getByRole('button', {
    name: 'Log Important Supply Haul completion',
  });

  await input.fill('1999');
  await input.press('Enter');
  await page
    .getByRole('button', { name: 'Set Collection to tier 1, 2,000 points' })
    .click();
  await completeHaul.click();
  await expect(input).toHaveValue('2624');
  await expect(
    page
      .getByRole('article', { name: 'Transport', exact: true })
      .getByLabel('Reached'),
  ).toHaveCount(1);
  await expect(
    page
      .getByRole('region', { name: 'Your overall progress' })
      .locator('[data-unlocked="true"]'),
  ).toHaveCount(1);
  await input.fill('9990');
  await input.press('Enter');
  await completeHaul.click();
  await expect(input).toHaveValue('10000');
  await expect(
    page.getByRole('progressbar', { name: 'Overall progress', exact: true }),
  ).toHaveAttribute('aria-valuenow', '12000');
  await expect(completeHaul).toBeDisabled();
  await expect(
    page.getByRole('button', {
      name: 'Log Package Recovery (Exp. E) completion',
    }),
  ).toBeDisabled();
  await expect(
    page.getByText(
      'Important Supply Haul logged. Added 10 transport points; track now 10,000 / 10,000.',
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Log Beryl completion', exact: true }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'Reset Transport to zero' }).click();
  await expect(completeHaul).toBeEnabled();
});

test('sliders, exact entry, tier shortcuts, persistence, and reset stay in sync', async ({
  page,
}) => {
  await page.goto('/');
  const total = page.getByRole('progressbar', { name: 'Overall progress' });
  const transport = page.getByRole('slider', { name: 'Transport progress' });

  await expect(total).toHaveAttribute('aria-valuenow', '0');
  await transport.focus();
  await transport.press('ArrowRight');
  await expect(total).toHaveAttribute('aria-valuenow', '1');
  await page.getByRole('spinbutton', { name: 'transport points' }).fill('1999');
  await page
    .getByRole('spinbutton', { name: 'transport points' })
    .press('Enter');
  await expect(transport).toHaveValue('1999');
  await expect(
    page
      .getByRole('article', { name: 'Transport', exact: true })
      .getByLabel('Reached'),
  ).toHaveCount(0);
  await transport.focus();
  await transport.press('ArrowRight');
  await expect(
    page
      .getByRole('article', { name: 'Transport', exact: true })
      .getByLabel('Reached'),
  ).toHaveCount(1);
  await page
    .getByRole('button', { name: 'Set Collection to tier 3, 6,500 points' })
    .click();
  await page.getByRole('spinbutton', { name: 'defense points' }).fill('1400');
  await page.getByRole('spinbutton', { name: 'defense points' }).press('Enter');
  await expect(total).toHaveAttribute('aria-valuenow', '9900');
  await expect(page.getByTestId('overall-points')).toHaveText('9,900');
  await expect(
    page
      .getByRole('region', { name: 'Your overall progress' })
      .locator('[data-unlocked="true"]'),
  ).toHaveCount(2);
  await page.reload();
  await expect(total).toHaveAttribute('aria-valuenow', '9900');
  await expect(transport).toHaveValue('2000');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(total).toHaveAttribute('aria-valuenow', '9900');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(total).toHaveAttribute('aria-valuenow', '0');
  await page.reload();
  await expect(total).toHaveAttribute('aria-valuenow', '0');
});

test('point entry is bounded and Escape cancels a draft', async ({ page }) => {
  await page.goto('/');
  const input = page.getByRole('spinbutton', { name: 'transport points' });

  await input.fill('20000');
  await input.press('Enter');
  await expect(input).toHaveValue('10000');
  await input.fill('-20');
  await input.press('Enter');
  await expect(input).toHaveValue('0');
  await input.fill('1234');
  await input.press('Enter');
  await input.fill('9999');
  await input.press('Escape');
  await input.press('Tab');
  await expect(input).toHaveValue('1234');
  await input.fill('');
  await input.press('Tab');
  await expect(input).toHaveValue('1234');
});

test('all four tiers complete and remaining runs reach zero', async ({
  page,
}) => {
  await page.goto('/');

  for (const track of ['Transport', 'Collection', 'Defense']) {
    await page
      .getByRole('button', { name: `Set ${track} to tier 4, 10,000 points` })
      .click();
  }

  await expect(
    page.getByRole('progressbar', { name: 'Overall progress', exact: true }),
  ).toHaveAttribute('aria-valuenow', '30000');
  await expect(page.getByText('All overall tiers reached')).toBeVisible();
  await expect(
    page.getByText('Track complete. Every tier reached.'),
  ).toHaveCount(3);
  await expect(page.getByText('0 runs left', { exact: true })).toHaveCount(6);
});

test('corrupt storage recovers and unavailable storage keeps the tracker usable', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.evaluate(() =>
    localStorage.setItem('rsi-discovery-progress-v1', 'broken'),
  );
  await page.reload();
  await expect(
    page.getByRole('progressbar', { name: 'Overall progress', exact: true }),
  ).toHaveAttribute('aria-valuenow', '0');
  await context.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage disabled', 'SecurityError');
      },
    });
  });
  await page.reload();
  await expect(page.getByRole('status')).toContainText('Storage unavailable');
  await page
    .getByRole('button', { name: 'Set Defense to tier 1, 2,000 points' })
    .click();
  await expect(
    page.getByRole('progressbar', { name: 'Overall progress', exact: true }),
  ).toHaveAttribute('aria-valuenow', '2000');
});

test('mobile and desktop layouts fit and show the complete guide', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];

  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(
      page.getByRole('heading', { name: 'RSI Discovery Month' }),
    ).toBeVisible();
    await expect(page.getByRole('slider')).toHaveCount(3);
    const fits = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );

    expect(fits, `layout fits at ${width}px`).toBe(true);
  }

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({
    path: testInfo.outputPath('desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath('mobile.png'),
    fullPage: true,
  });
  await page
    .getByText('How do I equip a reward livery?', { exact: true })
    .click();
  await expect(
    page.getByText(/Claim the matching ship at a terminal/),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
