const timeout = process.env.SLOWMO ? 30000 : 100000;
beforeAll(async () => {
  await page.goto('http://127.0.0.1:8080/index.html', {waitUntil: 'domcontentloaded'});
});

describe('Enter FullSreen Mode', () => {
  test('Test if FullSreen Expands', async () => {
    // Wait for Elements  to load
    await page.waitForSelector('.fullscreen');
    await page.waitForSelector('#image');

    //Stimulate click on fullscreen
    await page.evaluate(()=>document.querySelector('.fullscreen').click())

    // get values of input fields

    const imageDisplayInput = await page.evaluate(() => getComputedStyle(document.querySelector('#image')).display);
    const imageHeightInput = await page.evaluate(() => getComputedStyle(document.querySelector('#image')).height);
    const imageWidthInput = await page.evaluate(() => getComputedStyle(document.querySelector('#image')).width);
    const imagePositionInput = await page.evaluate(() => getComputedStyle(document.querySelector('#image')).position);
    const imageZIndexInput = await page.evaluate(() => getComputedStyle(document.querySelector('#image')).zIndex);

    // Check if value is changed or not
    expect(imageDisplayInput).toEqual('block');
    expect(imageHeightInput).not.toEqual('100%');
    expect(imageWidthInput).not.toEqual('auto');
    expect(imagePositionInput).toEqual('absolute');
    expect(imageZIndexInput).toEqual('2');


  }, timeout);
});

describe('Exit FullSreen Mode', () => {
  test('Test if FullSreen Exits', async () => {
    // Wait for Elements  to load
    await page.waitForSelector('.fullscreen');
    await page.waitForSelector('#image');


    //Stimulate click on fullscreen
    await page.evaluate(()=>document.querySelector('.fullscreen').click())

    // get values of input fields

    const imageDisplayInput = await page.evaluate(() => getComputedStyle(document.querySelector('#image')).display);
    const imageLeftInput = await page.evaluate(() => getComputedStyle(document.querySelector('#image')).left);
    const imagePositionInput = await page.evaluate(() => getComputedStyle(document.querySelector('#image')).position);

    // Check if value is changed or not
    expect(imageDisplayInput).toEqual('inline');
    expect(imageLeftInput).not.toEqual('0');
    expect(imagePositionInput).toEqual('relative');


  }, timeout);
});
