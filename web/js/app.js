
const gridDiv = document.getElementById('grid');
gridDiv.addEventListener('pointerdown', startDrawing);
gridDiv.addEventListener('pointermove', continueDrawing);
gridDiv.addEventListener('pointerup', () => { isDrawing = false; });
gridDiv.addEventListener('pointerleave', () => { isDrawing = false; });
gridDiv.addEventListener('touchmove', (e) => { if (isDrawing) e.preventDefault(); }, { passive: false });

const connectBtn = document.getElementById('connectBtn');
connectBtn.addEventListener('click', connectBLE);

const clearBtn = document.getElementById('clearBtn');
clearBtn.addEventListener('click', clearMatrix);

const saveBtn = document.getElementById('saveBtn');
saveBtn.addEventListener('click', saveDrawing);

const loadBtn = document.getElementById('loadBtn');
loadBtn.addEventListener('click', () => { fileInput.click(); });

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { loadDrawing(event.target.result); fileInput.value = ''; }; reader.onerror = () => { showNotification('✗ Erreur de lecture du fichier', true); fileInput.value = ''; }; reader.readAsText(file); });

const brightnessSelect = document.getElementById('brightnessSelect');
brightnessSelect.addEventListener('change', updateBrightness);

const SERVICE_UUID = '12345678-1234-1234-1234-123456789012';
const CHAR_UUID   = '87654321-4321-4321-4321-210987654321';

let pixels = Array(16).fill().map(() => Array(16).fill(null));
let pixelElements = createGrid(gridDiv, 16);
let brightness = 25;
let isLoading = false;
let isDrawing = false;
let selectedColor = '#ffffff';
let lastDrawState = true;
let lastPixel = null;
let sendTimeout = null;

function createGrid(gridDiv, size = 16) {
    const pixelElements = [];

    for (let y = 0; y < size; y++) {
        pixelElements[y] = [];
        for (let x = 0; x < size; x++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.dataset.x = x;
            pixel.dataset.y = y;
            gridDiv.appendChild(pixel);
            pixelElements[y][x] = pixel;
        }
    }

    // Initialize all pixels to off
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const el = pixelElements[y][x];
            el.classList.remove('on');
            el.style.background = '#000';
            el.style.boxShadow = 'none';
        }
    }

    return pixelElements;
}

function setPixelStateColor(x, y, color) {
    const normalizedColor = color === '#000000' ? null : color;
    if (pixels[y][x] === normalizedColor) return;
    pixels[y][x] = normalizedColor;

    const el = pixelElements[y][x];
    if (normalizedColor) {
        el.classList.add('on');
        el.style.background = normalizedColor;
        el.style.boxShadow = '0 0 8px ' + normalizedColor;
    } else {
        el.classList.remove('on');
        el.style.background = '#000';
        el.style.boxShadow = 'none';
    }
    sendToESP32Debounced();
}

function sendToESP32Debounced() {
    if (!window.ledmatrix || !window.ledmatrix.esp32 || !window.ledmatrix.esp32.send) {
        console.warn('LEDMatrix not connected, skipping send');
        return;
    }
    if (sendTimeout) clearTimeout(sendTimeout);
    
    sendTimeout = setTimeout(() => {
        // Convert pixels and palette
        const { pixelsFlat, palette } = preparePixelsAndPalette();

        // Send to ESP32
        window.ledmatrix.esp32.send({  pixels: pixelsFlat, palette: palette, brightness: brightness, mode: 0 });
        sendTimeout = null;
    }, 20);

}

function preparePixelsAndPalette(pixelsGrid = pixels) {
    const usedColors = new Set();
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++)
            if (pixelsGrid[y][x]) usedColors.add(pixelsGrid[y][x]);

    const palette = ['#000000'];
    usedColors.forEach(c => {
        if (c !== '#000000') palette.push(c);
    });
    const finalPalette = palette.slice(0, 16);

    const colorToIndex = {};
    finalPalette.forEach((color, idx) => (colorToIndex[color] = idx));

    const pixelsFlat = [];
    for (let y = 0; y < 16; y++)
        for (let x = 0; x < 16; x++)
            pixelsFlat.push(colorToIndex[pixelsGrid[y][x] || '#000000'] || 0);

    return { pixelsFlat, palette: finalPalette };
}

function showNotification(message, isError = false) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    if (isError) notif.style.background = '#f44336';
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 1500);
}

async function connectBLE() {
    try {
        showNotification('Connecting via Bluetooth...');

        // Check if BLE is supported
        if (!window.ledmatrix?.ble?.isSupported?.()) {
            throw new Error('Bluetooth is not supported in this browser.');
        }

        // Attempt BLE connection
        const { device, characteristic } = await window.ledmatrix.ble.connect(SERVICE_UUID, CHAR_UUID);

        showNotification('✓ Connected to ' + (device.name || 'device'));
        connectBtn.textContent = 'Connected ✓';
        connectBtn.disabled = true;

        // Handle disconnection
        device.addEventListener('gattserverdisconnected', () => {
            showNotification('Disconnected');
            connectBtn.textContent = 'Connect';
            connectBtn.disabled = false;
        });

    } catch (error) {
        showNotification('Error: ' + (error?.message || error), true);
        console.error(error);
    }
}

function updateBrightness(event) {
    brightness = parseInt(event.target.value);
    sendToESP32Debounced();
}

function clearMatrix() {
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            setPixelStateColor(x, y, null);
        }
    }
}

function saveDrawing() {
    const drawing = { version: '1.0', width: 16, height: 16, brightness: brightness, pixels: pixels, timestamp: new Date().toISOString(), description: 'LED Matrix 16x16 Drawing' };
    const json = JSON.stringify(drawing, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `led-matrix-${Date.now()}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showNotification('✓ Dessin sauvegardé !');
}

async function loadDrawing(jsonData) {
    if (isLoading) {
        showNotification('✗ A drawing is already being loaded', true);
        return;
    }
    isLoading = true;
    try {
        const drawing = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

        if (!drawing.pixels || !Array.isArray(drawing.pixels)) 
            throw new Error('Invalid file format');

        if (drawing.pixels.length !== 16 || drawing.pixels[0].length !== 16) 
            throw new Error('Invalid dimensions (16x16 required)');

        if (drawing.brightness !== undefined) { 
            brightness = drawing.brightness; 
            brightnessSelect.value = brightness;
        }

        // Apply pixels immediately
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const color = drawing.pixels[y][x] || '#000000';
                setPixelStateColor(x, y, color); // updates visual and schedules BLE send
            }
        }

        showNotification('✓ Drawing loaded!');

    } catch (error) {
        showNotification('✗ Error: ' + error.message, true);
        console.error('Static load error:', error);
    } finally {
        isLoading = false;
    }
}

function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    lastPixel = null;

    const pixel = e.target.closest('.pixel');
    if (!pixel) return;

    const x = parseInt(pixel.dataset.x);
    const y = parseInt(pixel.dataset.y);

    lastDrawState = !(pixels[y][x] !== null);
    lastPixel = pixel;
    setPixelStateColor(x, y, lastDrawState ? selectedColor : null);
}

function continueDrawing(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const element = document.elementFromPoint(e.clientX, e.clientY);
    const pixel = element?.closest('.pixel');
    if (!pixel || pixel === lastPixel) return;

    const x = parseInt(pixel.dataset.x);
    const y = parseInt(pixel.dataset.y);

    lastPixel = pixel;
    setPixelStateColor(x, y, lastDrawState ? selectedColor : null);
}

// slideshow JS
const slideshowBtn = document.getElementById('slideshowBtn');
slideshowBtn.addEventListener('click', async () => {
    if (!window.ledmatrix?.esp32?.send) {
        showNotification('✗ Not connected', true);
        return;
    }
    await sendSlideshow();
    showNotification('🎞️ Slideshow sent !');
});


// Palette JS
const paletteEl = document.getElementById('palette');
const swatches = Array.from(paletteEl.querySelectorAll('.swatch'));
const eraser = document.getElementById('eraser');
const customColor = document.getElementById('customColor');
function selectSwatchElement(el) { swatches.forEach(s => s.classList.remove('selected')); if (el && el.classList.contains('swatch')) el.classList.add('selected'); }
selectedColor = '#ffffff'; const initial = swatches.find(s => s.dataset.color === selectedColor); if (initial) selectSwatchElement(initial);
swatches.forEach(s => { s.addEventListener('click', () => { const col = s.dataset.color || null; selectedColor = col; selectSwatchElement(s); }); });
eraser.addEventListener('click', () => { selectedColor = null; selectSwatchElement(null); });
customColor.addEventListener('input', (e) => { selectedColor = e.target.value; selectSwatchElement(null); });
