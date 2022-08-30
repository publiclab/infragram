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
    expect(colorbar_containerInput).toEqual('none');
    // Check if #preset_modal appears
    expect(preset_modalInput).toEqual('none');
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

/*
describe('Presets Ndvi Blue ', () => {
  test('Test values of Presets Ndvi Blue and related feilds', async () => {
    // Wait for #preset_ndvi_blue  to load
    await page.waitForSelector('#preset_ndvi_blue');
    // Wait for #modeSwitcher  to load
    await page.waitForSelector('#modeSwitcher');
    // Wait for #m_exp  to load
    await page.waitForSelector('#m_exp');
    // Wait for #preset-modal  to load
    await page.waitForSelector('#preset-modal');
    // Wait for #colorbar-container  to load
    await page.waitForSelector('#colorbar-container');

    // Click  #presets_ndvi_blue Button
    await page.evaluate(()=>document.querySelector('#preset_ndvi_blue').click())

    // Get value of #modeSwitcher
    const modeSwitcherInput = await page.evaluate(() => document.querySelector('#modeSwitcher').value);
    // Get value of #m_exp
    const m_expInput = await page.evaluate(() => document.querySelector('#m_exp').value);
    // Get Css display of #preset-modal
    const preset_modalInput = await page.evaluate(() => getComputedStyle(document.querySelector('#preset-modal')).display);
    // Get Css display of #colorbar_container
    const colorbar_containerInput = await page.evaluate(() => getComputedStyle(document.querySelector('#colorbar-container')).display);


    // Check if  #colorbar_Container appears
    expect(colorbar_containerInput).toEqual('none');
    // Check if #preset Modal appears
    expect(preset_modalInput).toEqual('none');
    // Confirm #modeSwitcher value 
    expect(modeSwitcherInput).toEqual('infragrammar_mono');
    // Confirm #m_exp value     
    expect(m_expInput).toEqual('(R-B)/(R+B)');

  }, timeout);
});

describe('Presets Ndvi Blue color ', () => {
  test('Test values of Presets Ndvi Blue color and related feilds', async () => {
    // Wait for #preset_ndvi_blue_color to load
    await page.waitForSelector('#preset_ndvi_blue_color');
    // Wait for #modeSwitcher to load
    await page.waitForSelector('#modeSwitcher');
    // Wait for #m_exp to load    
    await page.waitForSelector('#m_exp');
    // Wait for #preset_modal to load
    await page.waitForSelector('#preset-modal');
    // Wait for Colorbar-container  to load
    await page.waitForSelector('#colorbar-container');

    // Click  #presets_ndvi_blue_color Button
    await page.evaluate(()=>document.querySelector('#preset_ndvi_blue_color').click())

    // Get value of #modeSwitcher
    const modeSwitcherInput = await page.evaluate(() => document.querySelector('#modeSwitcher').value);
    // Get value of #m_exp
    const m_expInput = await page.evaluate(() => document.querySelector('#m_exp').value);
    // Get Css display of #preset_modal
    const preset_modalInput = await page.evaluate(() => getComputedStyle(document.querySelector('#preset-modal')).display);
    // Get Css display of #colorbar_container
    const colorbar_containerInput = await page.evaluate(() => getComputedStyle(document.querySelector('#colorbar-container')).display);


    // Check if  #colorbar_Container appears
    expect(colorbar_containerInput).toEqual('inline-block');
    // Check if #preset Modal appears
    expect(preset_modalInput).toEqual('none');
    // Confirm #modeSwitcher value        
    expect(modeSwitcherInput).toEqual('infragrammar_mono');
    // Confirm #m_exp value     
    expect(m_expInput).toEqual('(R-B)/(R+B)');

  }, timeout);
});

describe('Presets Ndvi Red', () => {
  test('Test values of Presets Ndvi Red and related feilds', async () => {
    // Wait for #preset_ndvi_red  to load
    await page.waitForSelector('#preset_ndvi_red');
    // Wait for #modeSwitcher  to load
    await page.waitForSelector('#modeSwitcher');
    // Wait for #m_exp  to load
    await page.waitForSelector('#m_exp');
    // Wait for #preset-modal  to load
    await page.waitForSelector('#preset-modal');
    // Wait for #colorbar-container  to load
    await page.waitForSelector('#colorbar-container');

    //Stimulate click on #presets_ndvi_red Button
    await page.evaluate(()=>document.querySelector('#preset_ndvi_red').click())

    // Get value of #modeSwitcher
    const modeSwitcherInput = await page.evaluate(() => document.querySelector('#modeSwitcher').value);
    // Get value of #m_exp
    const m_expInput = await page.evaluate(() => document.querySelector('#m_exp').value);
    // Get Css display of #preset_modal
    const preset_modalInput = await page.evaluate(() => getComputedStyle(document.querySelector('#preset-modal')).display);
    // Get Css display of #colorbar_container
    const colorbar_containerInput = await page.evaluate(() => getComputedStyle(document.querySelector('#colorbar-container')).display);

    // Check if  #colorbar_Container appears
    expect(colorbar_containerInput).toEqual('none');
    // Check if #preset-modal appears
    expect(preset_modalInput).toEqual('none');
    // Confirm #modeSwitcher value        
    expect(modeSwitcherInput).toEqual('infragrammar_mono');
    // Confirm #m_exp value  
    expect(m_expInput).toEqual('(B-R)/(B+R)');

  }, timeout);
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
    expect(colorbar_containerInput).toEqual('inline-block');
    // Check if #preset-modal appears
    expect(preset_modalInput).toEqual('none');
    // Confirm #modeSwitcher value        
    expect(modeSwitcherInput).toEqual('infragrammar_mono');
    // Confirm #m_exp value  
    expect(m_expInput).toEqual('(B-R)/(B+R)');

  }, timeout);
});
*/

