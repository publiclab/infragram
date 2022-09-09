const timeout = process.env.SLOWMO ? 30000 : 100000;
beforeAll(async () => {
  await page.goto('http://127.0.0.1:8080/index.html', {waitUntil: 'domcontentloaded'});
});

describe('Presets Raw ', () => {
  test('Test values of Presets Raw and related feilds', async () => {

    // Wait for #b_exp to load    
    await page.waitForSelector('#b_exp');

   

    // Click  Presets_raw Button
    await page.evaluate(()=>document.querySelector('#preset_raw').click());

    // Get value of #b_exp
    const b_expInput = await page.evaluate(() => document.querySelector('#b_exp').value);

    // Confirm #b_exp value
    expect(b_expInput).toEqual('B');

  }, timeout);
});
