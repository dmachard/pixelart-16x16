#include <Arduino.h>
#include <FastLED.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID "12345678-1234-1234-1234-123456789012"
#define CHARACTERISTIC_UUID "87654321-4321-4321-4321-210987654321"
#define DATA_PIN 8
#define WIDTH 16
#define HEIGHT 16
#define NUM_LEDS (WIDTH * HEIGHT)
#define MAX_BRIGHTNESS 255
#define COLOR_ORDER GRB
#define LED_TYPE WS2812B
#define FRAME_DELAY 15000  // 15 seconds per frame
#define RANDOM_ANIMATION_DELAY 30  // 30 ms per pixel reveal
#define BYTES_PER_ROW (WIDTH / 2)
#define MAX_PALETTE_SIZE 16

CRGB leds[NUM_LEDS];
CRGB palette[MAX_PALETTE_SIZE];
uint8_t brightness = 25;

BLECharacteristic *pCharacteristic;
BLEServer *pServer;
bool deviceConnected = false;
const uint8_t HEADER_SIZE = 5;

#define MAX_FRAMES 10
CRGB frames[MAX_FRAMES][NUM_LEDS];
CRGB tempLeds[NUM_LEDS];
int totalFrames = 0;
int currentFrame = 0;
bool slideshowActive = false;
unsigned long lastUpdate = 0;

int remainingPixels[NUM_LEDS];
int remainingCount = 0;
bool randomAnimationActive = false;
unsigned long lastRandomUpdate = 0;

void startRandomAnimation() {
    remainingCount = NUM_LEDS;
    for (int i = 0; i < NUM_LEDS; i++) remainingPixels[i] = i;

    lastRandomUpdate = millis();
    randomAnimationActive = true;
}

void handleRandomAnimation() {
    if (!randomAnimationActive) return;
    if (remainingCount == 0) {
        randomAnimationActive = false;
        return;
    }

    unsigned long now = millis();
    if (now - lastRandomUpdate < RANDOM_ANIMATION_DELAY) return;
    lastRandomUpdate = now;

    int r = random(remainingCount);
    int idx = remainingPixels[r];

    leds[idx] = tempLeds[idx];

    FastLED.show();

    remainingPixels[r] = remainingPixels[remainingCount - 1];
    remainingCount--;
}

void handleSlideshow() {
    if (!slideshowActive || totalFrames == 0) return;

    unsigned long now = millis();

    if (now - lastUpdate < FRAME_DELAY) return;
    lastUpdate = now;

    memcpy(tempLeds, frames[currentFrame], sizeof(tempLeds));
    startRandomAnimation();

    currentFrame++;
    if (currentFrame >= totalFrames) currentFrame = 0;
}

// Convert logical (x,y) coordinates to physical LED strip index
// The matrix is rotated 180° and wired in serpentine pattern
inline int getPhysicalLedIndex(int x, int y) {
    int physicalX = (WIDTH - 1) - x;  // Mirror X for 180° rotation
    
    // Serpentine wiring: even rows L→R, odd rows R→L
    if (y % 2 == 0) {
        return y * WIDTH + physicalX;
    } else {
        return y * WIDTH + ((WIDTH - 1) - physicalX);
    }
}

void updateMatrixColor(uint8_t* data, size_t len) {
    if (len < HEADER_SIZE) {
        Serial.println("⚠️ Data too short (missing header)");
        return;
    }
    // --- Parse header ---
    uint8_t mode = data[0];
    brightness = data[1];
    FastLED.setBrightness(brightness);
    uint8_t paletteSize = data[2];
    if (paletteSize > 16) paletteSize = 16;
    uint8_t frameIndex = data[3];
    uint8_t frameCount = data[4];

    // Parse palette
    size_t paletteBytes = paletteSize * 3;
    if (len < HEADER_SIZE + paletteBytes) return;

    for (int i = 0; i < paletteSize; i++) {
        int offset = HEADER_SIZE + i * 3;
        palette[i] = CRGB(data[offset], data[offset+1], data[offset+2]);
    }

    // Parse pixel indices
    size_t pixelDataStart = HEADER_SIZE + paletteBytes;
    for (int y = 0; y < HEIGHT; y++) {
        for (int x = 0; x < WIDTH; x += 2) {
            int byteIndex = pixelDataStart + (y * BYTES_PER_ROW + x / 2);
            if (byteIndex >= len) return;

            // Extract two pixel indices from one byte
            uint8_t pixelByte = data[byteIndex];
            uint8_t idx1 = (pixelByte >> 4) & 0x0F;
            uint8_t idx2 = pixelByte & 0x0F;

            // Set pixels using the new mapping function
            tempLeds[getPhysicalLedIndex(x, y)] = (idx1 < paletteSize) ? palette[idx1] : CRGB::Black;
            tempLeds[getPhysicalLedIndex(x + 1, y)] = (idx2 < paletteSize) ? palette[idx2] : CRGB::Black;
        }
    }

    Serial.printf("Frame %d/%d received !\n", frameIndex + 1, frameCount);

    // --- Mode handling ---
    switch(mode) {
        case 0: // Custom
            slideshowActive = false;
            memcpy(leds, tempLeds, sizeof(leds));
            FastLED.show();
            break;
        case 1: // Slideshow
            if (frameIndex < MAX_FRAMES) {
                memcpy(frames[frameIndex], tempLeds, sizeof(tempLeds));
                if (frameIndex + 1 == frameCount) {
                    totalFrames = frameCount;
                    currentFrame = 0;
                    slideshowActive = true;
                    lastUpdate = millis();
                    Serial.printf("🎞️ Slideshow started with %d frames !\n", totalFrames);
                }

                // Start random animation for first frame
                memcpy(tempLeds, frames[0], sizeof(tempLeds));
                startRandomAnimation();
            } else {
                Serial.println("Too much frames (> MAX_FRAMES) !");
            }
            break;
        default:
            break;
    }

    Serial.printf("✓ Matrix updated! Mode: %d, Brightness: %d, Palette: %d colors\n", mode, brightness, paletteSize);
}


class ServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
        deviceConnected = true;
        Serial.println("✓ Client connected !");
    }

    void onDisconnect(BLEServer* pServer) {
        deviceConnected = false;
        Serial.println("✗ Client disconnected !");
        delay(500);
        pServer->startAdvertising();
        Serial.println("✓ BLE restarted !");
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        std::string value = pCharacteristic->getValue();
        Serial.printf("Data received: %d bytes\n", value.length());
        updateMatrixColor((uint8_t*)value.data(), value.length());
    }
};

void setup() {
    Serial.begin(115200);
    delay(500);
    Serial.println("Starting ESP32-C3...");

    FastLED.addLeds<WS2812B, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
    FastLED.setBrightness(brightness);
    FastLED.clear();
    FastLED.show();
    Serial.println("FastLED Matrix Ready!");

    Serial.println("Initing BLE...");
    BLEDevice::init("Matrix16x16");
    pServer = BLEDevice::createServer();
    pServer->setCallbacks(new ServerCallbacks());

    BLEService *pService = pServer->createService(SERVICE_UUID);
    pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_WRITE
    );
    pCharacteristic->setCallbacks(new MyCallbacks());

    pService->start();

    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    pAdvertising->setMinPreferred(0x06);
    pAdvertising->setMinPreferred(0x12);
    pAdvertising->start();

    Serial.println("✓ BLE started !");
    Serial.println("✓ Name: Matrix16x16");
    Serial.println("✓ Waiting for connection...");
}

void loop() {
    handleRandomAnimation();
    handleSlideshow();
}
