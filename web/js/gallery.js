// Gallery JS
const galleryData = [
    { name: "Heart", thumb: "images/heart.png", file: "drawings/heart.json" },
    { name: "Smiley", thumb: "images/smiley1.png", file: "drawings/smiley1.json" },
    { name: "Smiley", thumb: "images/smiley2.png", file: "drawings/smiley2.json" },
    { name: "Smiley", thumb: "images/smiley3.png", file: "drawings/smiley3.json" },
    { name: "Smiley", thumb: "images/smiley4.png", file: "drawings/smiley4.json" },
    { name: "Smiley", thumb: "images/smiley5.png", file: "drawings/smiley5.json" },
    { name: "Pumpkin", thumb: "images/pumpkin.png", file: "drawings/pumpkin.json" },
    { name: "Frog", thumb: "images/frog.png", file: "drawings/frog.json" },
    { name: "Alien", thumb: "images/alien.png", file: "drawings/alien.json" },
    { name: "Pink Flamingo", thumb: "images/pinkflamingo.png", file: "drawings/pinkflamingo.json" },
    { name: "Bird", thumb: "images/bird.png", file: "drawings/bird.json" },
    { name: "Face", thumb: "images/face1.png", file: "drawings/face1.json" },
    { name: "Face", thumb: "images/face2.png", file: "drawings/face2.json" },
    { name: "Face", thumb: "images/face3.png", file: "drawings/face3.json" },
    { name: "Cat", thumb: "images/cat1.png", file: "drawings/cat1.json" },
    { name: "Cat", thumb: "images/cat2.png", file: "drawings/cat2.json" },
    { name: "Cat", thumb: "images/cat3.png", file: "drawings/cat3.json" },
    { name: "Buzz", thumb: "images/buzz.png", file: "drawings/buzz.json" },
    { name: "Fox", thumb: "images/fox1.png", file: "drawings/fox1.json" },
    { name: "Fox", thumb: "images/fox2.png", file: "drawings/fox2.json" },
    { name: "Minion", thumb: "images/minion.png", file: "drawings/minion.json" },
    { name: "Bot", thumb: "images/bot.png", file: "drawings/bot.json" },
    { name: "Bot", thumb: "images/bot2.png", file: "drawings/bot2.json" },
    { name: "I love you", thumb: "images/iloveyou.png", file: "drawings/iloveyou.json" },
    { name: "Home", thumb: "images/home.png", file: "drawings/home.json" },
    { name: "Ghost", thumb: "images/ghost1.png", file: "drawings/ghost1.json" },
    { name: "Ghost", thumb: "images/ghost2.png", file: "drawings/ghost2.json" },
    { name: "Hand", thumb: "images/hand.png", file: "drawings/hand.json" },
    { name: "City", thumb: "images/city.png", file: "drawings/city.json" },
    { name: "Bear", thumb: "images/bear.png", file: "drawings/bear.json" },
    { name: "Bear", thumb: "images/bear2.png", file: "drawings/bear2json" },
    { name: "Sonic", thumb: "images/sonic.png", file: "drawings/sonic.json" },
    { name: "Yoshi", thumb: "images/yoshi.png", file: "drawings/yoshi.json" },
    { name: "Pacman", thumb: "images/pacman.png", file: "drawings/pacman.json" },
    { name: "Pockemon", thumb: "images/pockemon.png", file: "drawings/pockemon.json" },
    { name: "Mario", thumb: "images/mario.png", file: "drawings/mario.json" },
    { name: "Question", thumb: "images/question.png", file: "drawings/question.json" },
    { name: "Skull", thumb: "images/skull.png", file: "drawings/skull.json" },
    { name: "Skull", thumb: "images/skull2.png", file: "drawings/skull2.json" },
    { name: "Chicken", thumb: "images/chicken.png", file: "drawings/chicken.json" },
    { name: "Hello Kitty", thumb: "images/hellokitty.png", file: "drawings/hellokitty.json" },
    { name: "Cloud", thumb: "images/cloud.png", file: "drawings/cloud.json" },
    { name: "Moon", thumb: "images/moon.png", file: "drawings/moon.json" },
    { name: "Moon", thumb: "images/moon2.png", file: "drawings/moon2.json" },
    { name: "Star", thumb: "images/star.png", file: "drawings/star.json" },
    { name: "Whale", thumb: "images/whale.png", file: "drawings/whale.json" },
    { name: "Dog", thumb: "images/dog.png", file: "drawings/dog.json" },
    { name: "Dog", thumb: "images/dog2.png", file: "drawings/dog2.json" },
    { name: "Candle", thumb: "images/candle.png", file: "drawings/candle.json" },
    { name: "Franchektein", thumb: "images/franchektein.png", file: "drawings/franchektein.json" },
    { name: "Counter", thumb: "images/counter.png", file: "drawings/counter.json" },
    { name: "Iron Man", thumb: "images/ironman.png", file: "drawings/ironman.json" },
    { name: "Rocket", thumb: "images/rocket.png", file: "drawings/rocket.json" },
    { name: "Goomba", thumb: "images/goomba.png", file: "drawings/goomba.json" },
    { name: "Clock", thumb: "images/clock.png", file: "drawings/clock.json" },
    { name: "Apple", thumb: "images/apple.png", file: "drawings/apple.json" },
    { name: "Playstation", thumb: "images/playstation.png", file: "drawings/playstation.json" },
];


function renderGallery() {
    const galleryEl = document.getElementById('gallery');
    galleryEl.innerHTML = '';
    galleryData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.title = item.name;
        div.innerHTML = `<img src="${item.thumb}" alt="${item.name}">`;
        div.addEventListener('click', async () => {
            try {
                const res = await fetch(item.file);
                if (!res.ok) throw new Error('file not found');
                const json = await res.text();
                loadDrawing(json);
            } catch (err) {
                showNotification('✗ Loading error ' + item.name, true);
            }
        });
        galleryEl.appendChild(div);
    });
}

renderGallery()


async function sendSlideshow() {
    const mode = 1;
    const brightness = parseInt(document.getElementById('brightnessSelect').value);

    if (!galleryData || galleryData.length === 0) return;

    const shuffled = galleryData.slice().sort(() => Math.random() - 0.5);
    const framesToSend = shuffled.slice(0, Math.min(10, shuffled.length));

    const totalFrames = framesToSend.length;

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
        const item = framesToSend[frameIndex];
        try {
            const res = await fetch(item.file);
            if (!res.ok) {
                console.warn('File not found:', item.name);
                continue;
            }

            const json = await res.json();
            const { pixelsFlat, palette } = preparePixelsAndPalette(json.pixels);

            await window.ledmatrix.esp32.send({
                pixels: pixelsFlat,
                palette,
                brightness,
                mode,
                frameIndex,
                totalFrames
            });

            await new Promise(r => setTimeout(r, 50)); // 100 ms entre frames

        } catch (err) {
            console.warn('Error slideshow:', item.name, err);
        }
    }

    console.log(`🎞️ Slideshow sent with ${totalFrames} frames.`);
}
