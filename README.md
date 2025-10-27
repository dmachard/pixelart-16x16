# pixelart-16x16

Paint pixels in your browser and watch them **instantly** light up on your 
physical LED matrix using **Bluetooth**.  

The project includes both the **firmware** for the ESP32-C3 and a **web app** for drawing, upload, and slideshow control.

<table>

<tr>
<td><img src="web/images/alien.png" width="50" title="alien"></td>
<td><img src="web/images/bear.png" width="50" title="bear"></td>
<td><img src="web/images/bird.png" width="50" title="bird"></td>
<td><img src="web/images/bot.png" width="50" title="bot"></td>
<td><img src="web/images/buzz.png" width="50" title="buzz"></td>
<td><img src="web/images/cat1.png" width="50" title="cat"></td>
<td><img src="web/images/cat2.png" width="50" title="cat"></td>
<td><img src="web/images/cat3.png" width="50" title="cat"></td>
</tr>

<tr>
<td><img src="web/images/chicken.png" width="50" title="chicken"></td>
<td><img src="web/images/city.png" width="50" title="city"></td>
<td><img src="web/images/face1.png" width="50" title="face"></td>
<td><img src="web/images/face2.png" width="50" title="face"></td>
<td><img src="web/images/face3.png" width="50" title="face"></td>
<td><img src="web/images/fox1.png" width="50" title="fox"></td>
<td><img src="web/images/fox2.png" width="50" title="fox"></td>
<td><img src="web/images/bear2.png" width="50" title="bear"></td>
</tr>

<tr>
<td><img src="web/images/frog.png" width="50" title="frog"></td>
<td><img src="web/images/ghost1.png" width="50" title="ghost"></td>
<td><img src="web/images/ghost2.png" width="50" title="ghost"></td>
<td><img src="web/images/hand.png" width="50" title="hand"></td>
<td><img src="web/images/heart.png" width="50" title="heart"></td>
<td><img src="web/images/hellokitty.png" width="50" title="hellokitty"></td>
<td><img src="web/images/home.png" width="50" title="home"></td>
<td><img src="web/images/iloveyou.png" width="50" title="iloveyou"></td>
</tr>

<tr>
<td><img src="web/images/mario.png" width="50" title="mario"></td>
<td><img src="web/images/minion.png" width="50" title="minion"></td>
<td><img src="web/images/pacman.png" width="50" title="pacman"></td>
<td><img src="web/images/pinkflamingo.png" width="50" title="pinkflamingo"></td>
<td><img src="web/images/pockemon.png" width="50" title="pockemon"></td>
<td><img src="web/images/pumpkin.png" width="50" title="pumpkin"></td>
<td><img src="web/images/question.png" width="50" title="question"></td>
<td><img src="web/images/skull.png" width="50" title="skull"></td>
</tr>

<tr>
<td><img src="web/images/smiley1.png" width="50" title="smiley"></td>
<td><img src="web/images/smiley2.png" width="50" title="smiley"></td>
<td><img src="web/images/smiley3.png" width="50" title="smiley"></td>
<td><img src="web/images/smiley4.png" width="50" title="smiley"></td>
<td><img src="web/images/sonic.png" width="50" title="sonic"></td>
<td><img src="web/images/yoshi.png" width="50" title="yoshi"></td>
<td><img src="web/images/smiley5.png" width="50" title="smiley"></td>
<td><img src="web/images/candle.png" width="50" title="candle"></td>
</tr>

<tr>
<td><img src="web/images/cat4.png" width="50" title="cat"></td>
<td><img src="web/images/cloud.png" width="50" title="cloud"></td>
<td><img src="web/images/dog.png" width="50" title="dog"></td>
<td><img src="web/images/franchektein.png" width="50" title="franchektein"></td>
<td><img src="web/images/moon.png" width="50" title="moon"></td>
<td><img src="web/images/moon2.png" width="50" title="moon"></td>
<td><img src="web/images/star.png" width="50" title="star"></td>
<td><img src="web/images/whale.png" width="50" title="whale"></td>
</tr>
</table>

## Hardware setup

- **ESP32-C3**:  Microcontroller (BLE + WiFi)
- **LED Matrix 16×16**: WS2812B (256 addressable RGB LEDs)
- **Power Supply**:  5 V DC, ≥ 3 A recommended
- **3D Printed Enclosure**: STL and FreeCAD files included in `/enclosure/`

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

<img src="imgs/webapp.png" width="500" title="alien">

This web interface lets you:
- Draw and color pixel art with instant LED feedback
- Control brightness  
- Save/load drawings as `.json` files  
- Play animated slideshows

Each drawing must be stored as a `.json` file in the `/drawings/` directory.  
Corresponding thumbnail images should be placed in the `/images/` directory.

You can generate a PNG thumbnail from any exported JSON drawing with the provided script:

```
cd web/
source venv/bin/activate
python scripts/json_to_png.py drawings/example.json
```
