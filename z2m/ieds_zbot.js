const {} = require('zigbee-herdsman-converters/lib/modernExtend');
const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const repInterval = require('zigbee-herdsman-converters/lib/constants');
const ota = require('zigbee-herdsman-converters/lib/ota');
const tuya = require('zigbee-herdsman-converters/lib/tuya');
const {} = require('zigbee-herdsman-converters/lib/tuya');
const utils = require('zigbee-herdsman-converters/lib/utils');
const globalStore = require('zigbee-herdsman-converters/lib/store');
const e = exposes.presets;
const ea = exposes.access;

//const utils.precisionRound = function(val, pr) {
//  return val.toFixed(pr);  
//};

const definition = {
	zigbeeModel: ['ZB_OT_1'],
	model: 'ZB_OT_1',
	vendor: 'IE DS',
	description: 'Dual channel heating and hot water opentherm adapter',
	fingerprint: [
		{
			type: 'EndDevice', manufacturerName: 'IE DS', modelID: 'ZB_OT_1', 
			endpoints: [
				{
					ID: 5, profileID: 260, deviceID: 769, 
					inputClusters: [0, 3, 513], 
					outputClusters: [3]
				},
				{
					ID: 6, profileID: 260, deviceID: 769, 
					inputClusters: [0, 3, 513], 
					outputClusters: [3]
				}
			],
		}
	],
	exposes: [
		exposes.climate('CH').withSetpoint('occupied_heating_setpoint', 35, 85, 0.5)
			.withLocalTemperature()
			.withSystemMode(['off', 'heat'])
			//.withRunningMode(['off', 'heat'])
			//.withControlSequenceOfOperation(['heating_only'])
			.withEndpoint('CH')
			,
		exposes.climate('DHW').withSetpoint('occupied_heating_setpoint', 30, 65, 0.5)
			.withLocalTemperature()
			.withSystemMode(['off', 'heat'])
			//.withRunningMode(['off', 'heat'])
			//.withControlSequenceOfOperation(['heating_only'])
			.withEndpoint('DHW')
	],
	fromZigbee: [
		//fz.hvacThermostat
		{
			cluster: "hvacThermostat",
			type: ["attributeReport", "readResponse"],
			convert: (model, msg, publish, options, meta) => {
				const result = {};
				if (msg.data.localTemp !== undefined) {
					const value = utils.precisionRound(msg.data.localTemp, 2) / 100;
					if (value >= -273.15) {
						result[utils.postfixWithEndpointName("local_temperature", msg, model, meta)] = value;
					}
				}
				if (msg.data.occupiedHeatingSetpoint !== undefined) {
					const value = utils.precisionRound(msg.data.occupiedHeatingSetpoint, 2) / 100;
					// Stelpro will return -325.65 when set to off, value is not realistic anyway
					if (value >= -273.15) {
						result[utils.postfixWithEndpointName("occupied_heating_setpoint", msg, model, meta)] = value;
					}
				}
				if (msg.data.occupiedCoolingSetpoint !== undefined) {
					result[utils.postfixWithEndpointName("occupied_cooling_setpoint", msg, model, meta)] =
						utils.precisionRound(msg.data.occupiedCoolingSetpoint, 2) / 100;
				}
				if (msg.data.ctrlSeqeOfOper !== undefined) {
					result[utils.postfixWithEndpointName("control_sequence_of_operation", msg, model, meta)] =
						constants.thermostatControlSequenceOfOperations[msg.data.ctrlSeqeOfOper];
				}
				if (msg.data.systemMode !== undefined) {
					result[utils.postfixWithEndpointName("system_mode", msg, model, meta)] = constants.thermostatSystemModes[msg.data.systemMode];
				}
				if (msg.data.runningMode !== undefined) {
					result[utils.postfixWithEndpointName("running_mode", msg, model, meta)] = constants.thermostatRunningMode[msg.data.runningMode];
				}
				//if (msg.data.runningState !== undefined) {
			    //		result[utils.postfixWithEndpointName("running_state", msg, model, meta)] = constants.thermostatRunningStates[msg.data.runningState];
				//}
				if (msg.data.minHeatSetpointLimit !== undefined) {
					const value = utils.precisionRound(msg.data.minHeatSetpointLimit, 2) / 100;
					if (value >= -273.15) {
						result[utils.postfixWithEndpointName("min_heat_setpoint_limit", msg, model, meta)] = value;
					}
				}
				if (msg.data.maxHeatSetpointLimit !== undefined) {
					const value = utils.precisionRound(msg.data.maxHeatSetpointLimit, 2) / 100;
					if (value >= -273.15) {
						result[utils.postfixWithEndpointName("max_heat_setpoint_limit", msg, model, meta)] = value;
					}
				}
				if (msg.data.absMinHeatSetpointLimit !== undefined) {
					const value = utils.precisionRound(msg.data.absMinHeatSetpointLimit, 2) / 100;
					if (value >= -273.15) {
						result[utils.postfixWithEndpointName("abs_min_heat_setpoint_limit", msg, model, meta)] = value;
					}
				}
				if (msg.data.absMaxHeatSetpointLimit !== undefined) {
					const value = utils.precisionRound(msg.data.absMaxHeatSetpointLimit, 2) / 100;
					if (value >= -273.15) {
						result[utils.postfixWithEndpointName("abs_max_heat_setpoint_limit", msg, model, meta)] = value;
					}
				}
				if (msg.data.absMinCoolSetpointLimit !== undefined) {
					const value = utils.precisionRound(msg.data.absMinCoolSetpointLimit, 2) / 100;
					if (value >= -273.15) {
						result[utils.postfixWithEndpointName("abs_min_cool_setpoint_limit", msg, model, meta)] = value;
					}
				}
				if (msg.data.absMaxCoolSetpointLimit !== undefined) {
					const value = utils.precisionRound(msg.data.absMaxCoolSetpointLimit, 2) / 100;
					if (value >= -273.15) {
						result[utils.postfixWithEndpointName("abs_max_cool_setpoint_limit", msg, model, meta)] = value;
					}
				}
				if (msg.data.minSetpointDeadBand !== undefined) {
					const value = utils.precisionRound(msg.data.minSetpointDeadBand, 2) / 100;
					if (value >= -273.15) {
						result[utils.postfixWithEndpointName("min_setpoint_dead_band", msg, model, meta)] = value;
					}
				}
				return result;
			},
			
		}
		
	],
	toZigbee: [
		tz.thermostat_local_temperature, 
		tz.thermostat_system_mode, 
		tz.thermostat_running_state,
		tz.thermostat_occupied_heating_setpoint, 
		tz.thermostat_control_sequence_of_operation
	],
	endpoint: (device) => {
		return {'CH': 5, 'DHW': 6};
	},
	meta: {configureKey: 3, disableDefaultResponse: true, multiEndpoint: false},
	options: [], 
	configure: async (device, coordinatorEndpoint, logger) => {
		const binds = [ 'genBasic', 'genIdentify', 'hvacThermostat', ];
		
		const chEndpoint = device.getEndpoint(5);
		await reporting.bind(chEndpoint, coordinatorEndpoint, binds);
		await reporting.thermostatTemperature(chEndpoint, 0, repInterval.SECONDS_5, 1);
		//await reporting.thermostatOccupiedHeatingSetpoint(chEndpoint);
		
		const dhwEndpoint = device.getEndpoint(6);
		await reporting.bind(dhwEndpoint, coordinatorEndpoint, binds);
		await reporting.thermostatTemperature(dhwEndpoint, 0, repInterval.SECONDS_5, 1);
		//await reporting.thermostatOccupiedHeatingSetpoint(dhwEndpoint);
		
	},
	icon: "data:image/jpeg;base64,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"
	
};

module.exports = definition;