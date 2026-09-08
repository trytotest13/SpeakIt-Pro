export default async function run(page, ui) {
  const rows = await page.locator('.chat-row').count()
  if (rows > 0) { await page.locator('.chat-row').first().click() }
  await page.waitForTimeout(600)
  await page.screenshot({ path: 'taskgram-list.png' })
  return { rows }
}
