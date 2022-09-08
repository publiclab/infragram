const timeout = process.env.SLOWMO ? 30000 : 100000;
beforeAll(async () => {
  await page.goto('http://127.0.0.1:8080/index.html', {waitUntil: 'domcontentloaded'});
});
describe('Presets Ndvi Red color', () => {
  test('Test values of Presets Ndvi Red color and related feilds', async () => {
    // Wait for #preset_ndvi_red_color  to load
    await page.waitForSelector('#preset_ndvi_red_color');
    // Wait for #modeSwitcher  to load
    await page.waitForSelector('#modeSwitcher');
    // Wait for #m_exp  to load
    await page.waitForSelector('#m_exp');
    // Wait for #preset-modal  to load
    await page.waitForSelector('#preset-modal');
    // Wait for #colorbar-container  to load
    await page.waitForSelector('#colorbar-container');

    //Stimulate click on presets_ndvi_red_color Button
    await page.evaluate(()=>document.querySelector('#preset_ndvi_red_color').click())

    // Get value of #modeSwitcher
    const modeSwitcherInput = await page.evaluate(() => document.querySelector('#modeSwitcher').value);
    // Get value of #m_exp
    const m_expInput = await page.evaluate(() => document.querySelector('#m_exp').value);
    // Get Css display of #preset_modal
    const preset_modalInput = await page.evaluate(() => getComputedStyle(document.querySelector('#preset-modal')).display);
    // Get Css display of #colorbar_container
    const colorbar_containerInput = await page.evaluate(() => getComputedStyle(document.querySelector('#colorbar-container')).display);

    // Check if  #colorbar_Container appears
    expect(colorbar_containerInput).toBe('inline-block');
    // Check if #preset-modal appears
    expect(preset_modalInput).toBe('none');
    // Confirm #modeSwitcher value        
    expect(modeSwitcherInput).toEqual('infragrammar_mono');
    // Confirm #m_exp value  
    expect(m_expInput).toEqual('(B-R)/(B+R)');

  }, timeout);
  });

