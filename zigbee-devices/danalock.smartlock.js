const Accessory = require('./lib/accessory');

module.exports = class DanalockV3 extends Accessory {
    static get manufacturerName() {
        return ['Danalock'];
    }

    static get modelID() {
        return ['V3-BTZB'];
    }

    init(device) {
        const ep = device.endpoints[0].ID;
        const lockMechanismService = this.addService('LockMechanism', device.meta.name);

        lockMechanismService.get('CurrentPosition', ep, 'closuresWindowCovering', 'currentPositionLiftPercentage', (data, cache) => {
            if (cache) {
                lockMechanismService.update('TargetPosition', 100 - data);
            }

            return 100 - data;
        })
            .set('TargetPosition', ep, 'closuresWindowCovering', data => {
                return {command: 'goToLiftPercentage', payload: {percentageliftvalue: 100 - data}};
            });

        this.addService('BatteryService', device.meta.name)
            .get('StatusLowBattery', 1, 'genPowerCfg', 'batteryPercentageRemaining', data => data < 10 ? 1 : 0)
            .get('BatteryLevel', 1, 'genPowerCfg', 'batteryPercentageRemaining', data => data)
            .update('ChargingState', 2);
    }
};
