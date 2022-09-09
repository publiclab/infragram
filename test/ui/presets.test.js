const timeout = process.env.SLOWMO ? 30000 : 100000;
beforeAll(async () => {
  await page.goto('http://127.0.0.1:8080/index.html', {waitUntil: 'domcontentloaded'});
});

describe('Presets Raw ', () => {
  test('Test values of Presets Raw and related feilds', async () => {
    // Wait for #preset_raw  to load
    await page.waitForSelector('#preset_raw');
    // Wait for #modeSwitcher  to load
    await page.waitForSelector('#modeSwitcher');    
    // Wait for #r_exp  to load    
    await page.waitForSelector('#r_exp');
    // Wait for #g_exp  to load    
    await page.waitForSelector('#g_exp');
    // Wait for #b_exp to load    
    await page.waitForSelector('#b_exp');
    // Wait for #preset-modal  to load  
    await page.waitForSelector('#preset-modal');
    // Wait for #colorbar-container  to load
    await page.waitForSelector('#colorbar-container');
   

    // Click  Presets_raw Button
    await page.evaluate(()=>document.querySelector('#preset_raw').click());
    // Get value of #modeSwitcher
    const modeSwitcherInput = await page.evaluate(() => document.querySelector('#modeSwitcher').value);
    // Get value of #r_exp
    const r_expInput = await page.evaluate(() => document.querySelector('#r_exp').value);
    // Get value of #g_exp
    const g_expInput = await page.evaluate(() => document.querySelector('#g_exp').value);
    // Get value of #b_exp
    const b_expInput = await page.evaluate(() => document.querySelector('#b_exp').value);
    // Get value Css display of Preset-modal
    const preset_modalInput = await page.evaluate(() => getComputedStyle(document.querySelector('#preset-modal')).display);
    // Get Css display of #colorbar_container
    const colorbar_containerInput = await page.evaluate(() => getComputedStyle(document.querySelector('#colorbar-container')).display);


    // Check if #colorbar_Container appears
    expect(colorbar_containerInput).toBe('none');
    // Check if #preset_modal appears
    expect(preset_modalInput).toBe('none');
    // Confirm #modeSwitcher Value 
    expect(modeSwitcherInput).toEqual('infragrammar');
    // Confirm #r_exp value
    expect(r_expInput).toEqual('R');
    // Confirm #g_exp value
    expect(g_expInput).toEqual('G');
    // Confirm #b_exp value
    expect(b_expInput).toEqual('B');

  }, timeout);
});
