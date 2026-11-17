import { expect, test } from '@playwright/test';

interface CatalogIndex {
  entries: Record<string, { id: string; title: string; name: string; type: 'story' | 'docs' }>;
}

test('renders the catalog and completes each story interaction', async ({ page, request }) => {
  const response = await request.get('/index.json');
  expect(response.ok()).toBe(true);
  const index: CatalogIndex = await response.json();
  const stories = Object.values(index.entries).filter((entry) => entry.type === 'story');
  expect(stories.length).toBeGreaterThan(0);
  expect(stories.map((story) => story.id)).toContain('notifications-success--created');
  test.setTimeout(stories.length * 10_000 + 10_000);

  for (const story of stories) {
    await test.step(`${story.title}: ${story.name}`, async () => {
      const pageErrors: string[] = [];
      const recordError = (error: Error) => pageErrors.push(error.message);
      page.on('pageerror', recordError);

      try {
        const url = new URL('/iframe.html', response.url());
        url.search = new URLSearchParams({
          id: story.id,
          viewMode: 'story',
          catalogTest: '1',
        }).toString();
        await page.goto(url.href);
        const result = page.locator('html[data-catalog-result]');
        await expect(result).toHaveAttribute('data-catalog-story', story.id);
        await expect(result).toHaveAttribute('data-catalog-result', 'success');
        expect(pageErrors).toEqual([]);
      } finally {
        page.off('pageerror', recordError);
      }
    });
  }
});
