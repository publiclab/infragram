const timeout = process.env.SLOWMO ? 30000 : 100000;
beforeAll(async () => {
  await page.goto('http://127.0.0.1:8080/v2/index.html', {waitUntil: 'domcontentloaded'});
});

describe('Change Resolution of Canvas ', () => {
  test('Test Canvas Multiple Resolution', async () => {
    // Wait for #image Canvas to load
    await page.waitForSelector('#image');
    // Wait for #qvga Button  to load
    await page.waitForSelector('#qvga');    
    // Wait for #vga  Button load    
    await page.waitForSelector('#vga');
    // Wait for #hd Button  to load    
    await page.waitForSelector('#hd');
    // Wait for #full-hd Button  to load    
    await page.waitForSelector('#full-hd');

    // Click  #qvga Button
    await page.evaluate(()=>document.querySelector('#qvga').click());
    // Get Height and Width of canvas #image
    const ImageQvgaWidthInput = await page.evaluate(()=>document.querySelector('#image').width);
    const ImageQvgaHeightInput = await page.evaluate(()=>document.querySelector('#image').height);

    await page.evaluate(()=>document.querySelector('#vga').click());
    const ImageVgaWidthInput = await page.evaluate(()=>document.querySelector('#image').width);
    const ImageVgaHeightInput = await page.evaluate(()=>document.querySelector('#image').height);    
    await page.evaluate(()=>document.querySelector('#hd').click());
    const ImageHDWidthInput = await page.evaluate(()=>document.querySelector('#image').width);
    const ImageHDHeightInput = await page.evaluate(()=>document.querySelector('#image').height);    
    await page.evaluate(()=>document.querySelector('#full-hd').click());
    const ImageFullHdWidthInput = await page.evaluate(()=>document.querySelector('#image').width);
    const ImageFullDdHeightInput = await page.evaluate(()=>document.querySelector('#image').height);

    //Qvga confirmation
    expect(ImageQvgaWidthInput).toBe(100);
    expect(ImageQvgaHeightInput).toBe(100);
    //Vga confirmation
    expect(ImageVgaWidthInput).toEqual(800);
    expect(ImageVgaHeightInput).toEqual(600);
    //HD confirmation
    expect(ImageHDWidthInput).toEqual(1920);
    expect(ImageHDHeightInput).toEqual(1080);
    //Full-HD confirmation
    expect(ImageFullHdWidthInput).toEqual(7680);
    expect(ImageFullDdHeightInput).toEqual(4320);
  }, timeout);
});
