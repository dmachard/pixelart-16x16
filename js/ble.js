// ble.js - Module for handling Bluetooth Low Energy (BLE) connections and data transmission

(function () {
    // Internal storage of the last-connected device/characteristic
    let _device = null;
    let _characteristic = null;

    async function connect(serviceUuid, charUuid) {
        if (!navigator.bluetooth) throw new Error('BLE not supported in this browser.');

        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [serviceUuid] }]
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(serviceUuid);
        const characteristic = await service.getCharacteristic(charUuid);

        _device = device;
        _characteristic = characteristic;

        return { device, characteristic };
    }

    async function disconnect() {
        if (_device && _device.gatt.connected) {
            await _device.gatt.disconnect();
            console.log('BLE disconnected.');
        }
        _device = null;
        _characteristic = null;
    }

    function getCharacteristic() {
        if (!_characteristic) throw new Error('BLE not connected.');
        return _characteristic;
    }

    function isConnected() {
        return this.device && this.device.gatt && this.device.gatt.connected;
    }

    function isSupported() {
        return !!navigator.bluetooth;
    }

    window.ledmatrix = window.ledmatrix || {};
    window.ledmatrix.ble = window.ledmatrix.ble || {};
    Object.assign(window.ledmatrix.ble, { connect, disconnect, getCharacteristic, isConnected, isSupported});
})();