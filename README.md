# pixelart-16x16

> A Bluetooth-controlled 16×16 LED matrix powered by ESP32-C3 and WS2812B LEDs.

Draw colorful pixel art directly in your web browser and send it wirelessly to your LED matrix using **Web Bluetooth**.  
The project includes both the **firmware** for the ESP32-C3 and a **web app** for creation, upload, and slideshow control.

![webapp](imgs/webapp.png)

## 🚀 Overview

| Component | Description |
|------------|-------------|
| 🧠 **Firmware** | ESP32-C3 firmware handling BLE, palette management, frame updates, and animations |
| 🖥️ **Web Control App** | Browser-based pixel editor with save/load, brightness, and slideshow features |
| ⚙️ **Hardware** | 16×16 WS2812B LED matrix driven by ESP32-C3 |
| 🔋 **Communication** | Web Bluetooth API over custom BLE service |

## Hardware setup

| Component | Description |
|------------|-------------|
| **ESP32-C3** | Microcontroller (BLE + WiFi) |
| **LED Matrix 16×16** | WS2812B (256 addressable RGB LEDs) |
| **Power Supply** | 5 V DC, ≥ 3 A recommended |

**Pinout:**
| Signal | ESP32-C3 Pin | Notes |
|--------|--------------|-------|
| LED Data | GPIO 8 | Configurable via `DATA_PIN` |
| 5V | VIN | Power input |
| GND | GND | Common ground |

## Firmware (ESP32-C3 + WS2812B)

Firmware for controlling a 16×16 WS2812B LED matrix using an ESP32-C3 via **Bluetooth Low Energy (BLE)**.  
Designed to work with the **Web Control App**, which lets you draw and upload pixel art or animations wirelessly.

**Advertised Bluetooth device name:** `Matrix16x16`

## Web Control App

The Webapp uses the Web Bluetooth API to send data directly to your ESP32-C3.

This web interface lets you:
- Draw and color pixel art in real-time  
- Control brightness  
- Save/load drawings as `.json` files  
- Upload drawings to the ESP32 matrix  
- Play animated slideshows

Each drawing must be stored as a `.json` file in the `/drawings/` directory.  
Corresponding thumbnail images should be placed in the `/images/` directory.

You can generate a PNG thumbnail from any exported JSON drawing with the provided script:

```
cd web/
source venv/bin/activate
python scripts/json_to_png.py drawings/example.json
```


## What's Icon Available so far?


<table>

<tr>
<td><img src="web/images/alien.png" width="100" title="alien"></td>
<td><img src="web/images/bear.png" width="100" title="bear"></td>
<td><img src="web/images/bird.png" width="100" title="bird"></td>
<td><img src="web/images/boot.png" width="100" title="bot"></td>
</tr>

<tr>
<td><img src="web/images/buzz.png" width="100" title="buzz"></td>
<td><img src="web/images/cat1.png" width="100" title="cat1"></td>
<td><img src="web/images/cat2.png" width="100" title="cat2"></td>
<td><img src="web/images/cat3.png" width="100" title="cat3"></td>
</tr>
</table>