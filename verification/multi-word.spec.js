const { test, expect } = require('@playwright/test');

test('multi-word selection', async ({ page }) => {
  await page.goto('http://localhost:4201');

  // Wait for the article to be loaded
  await page.waitForSelector('app-article-view');

  // Define the start and end words for the selection
  const startWord = 'Your';
  const endWord = 'Journey';

  // Find the start and end word elements
  const startWordElement = page.locator(`span[data-word="${startWord}"]`).first();
  const endWordElement = page.locator(`span[data-word="${endWord}"]`).first();

  // Perform the mouse drag action to select the text
  await startWordElement.hover();
  await page.mouse.down();
  await endWordElement.hover();
  await page.mouse.up();

  // Capture a screenshot to verify the selection
  await page.screenshot({ path: '/home/jules/verification/multi_word_selection_after_fix.png' });
});
