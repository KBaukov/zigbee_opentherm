# zigbee_opentherm

Эта  "поделка"  собиралась  на вот этом железе:

![image](https://github.com/user-attachments/assets/b9284040-545f-42a4-a7d9-e9d053aaeeae)

и

![image](https://github.com/user-attachments/assets/7ffa9180-b9c7-4822-ad52-2c3fa9166496)

покупал  вот тут...
https://www.ozon.ru/product/komplekt-shield-adapter-opentherm-dlya-esp-32-c6-wi-fi-zigbee-3-0-1770642479/?from_sku=1770628302&oos_search=false

=========================================================================================

# Инструкция по  настройке для  Home Assistant.
   1. Содержимое папки esphome/components/zigbee (репозитория), необходимо разметить в папке /homeassistant/esphome/components/zigbee, в вашем Home Assistant.  Это модифицированная версия внешнего сомпонента https://github.com/luar123/zigbee_esphome/.  Спасибо автору (luar123).  Что изменил:  добавил новый тригер для событ on_connect (когда устройство подсоединяется к сети. Не Join !!!!). И добавил несколько  вспомогательных  функций, для облегчения автоматизации в коде YAML.
   2. Создать в EspHomeBuilder новое устройство. При выборе типа контроллера выбирайте любое(например ESP32). Все равнро пока esphome не поддерживает контроллеры с zigbee.  Но потом в самом коде, в разделе esp32 укажите  правильный контроллер.
      
```
############### Controller Board settins #########################################
esp32:
  board: esp32-c6-devkitc-1
  flash_size: 8MB
  partitions: partitions_zb.csv
  framework:
    type: esp-idf
    sdkconfig_options:
      CONFIG_ESPTOOLPY_FLASHSIZE_8MB: y
##################################################################################
```  

  Ну или просто  скопируйте содержимое файла zb-therm.yaml в свой код. 
  
  3. Положите в папку /homeassistant/esphome,  файл  partitions_zb.csv. без  него код не соберется.
  4. Положите в папку /homeassistant/zigbee2mqtt/external_converters/  файл ковертора ieds_zbot.js.
  5. Соберите и залейте на контроллер. В первый раз  придется через USB. потом  можено по воздуху. Устройство реализует web_server и досупно по адресу http://<you_ip>:8080 .
  6. В ZHA  залетает без проблем.  А в Z2M  пока  залетают  не все атрибуты и контролы (работаю над этим).

====================================================================================     

Собственно самое интересное это как в формате YAML создавать zigbee устройства, кластеры и их атрибуты. 
```
##################################################################################
#                            Zigbee определения                                  #
################################################################################## 
zigbee:
  id: "zb"
  name: ZB_OT_1
  manufacturer: "IE DS"
  version: 5
  ###  Ендпоиты  ###
  endpoints:  
    - num: 5 ###  Элементы управления отопительным контуром ###
      device_type: THERMOSTAT
      clusters:
        ###  Setpoint CH ####
        - id: THERMOSTAT
          role: Server
          attributes:
            - attribute_id: 0x0000 #Local Temp
              type: U16
              report: true
              #value: 3500
              device: chTemp
              scale: 100
            - attribute_id: 0x0003 #abs min
              type: U16
              value: 3000              
            - attribute_id: 0x0004 #abs max
              id: ch_abs_max
              type: U16
              value: 8500                 
            #############################################################
            - attribute_id: 0x0011 # OccupiedCoolingSetpoint curent Level
              id: ch_cool_sp
              type: U16
              value: 8500
            - attribute_id: 0x0018 ## MaxCoolSetpointLimit min Level
              id: ch_cool_min
              type: U16
              value: 8500 # 85℃
            - attribute_id: 0x0017 ## MinCoolSetpointLimit max Level
              id: ch_cool_max
              type: U16
              value: 8500 # 85℃
            ####################################################  
            - attribute_id: 0x0012 # OccupiedHeatingSetpoint curent Level
              # id: zb_ch_dest
              type: S16
              #access: READ_WRITE
              #value: 5500
              # scale: 100
              # device: chDestTemp
              on_value:
                then:
                  - number.set:
                      id: chDestTemp
                      value: !lambda "return (float)(x/100);"
                  - switch.turn_off: ch_en_sw
                  - delay: 1000ms
                  - switch.turn_on: ch_en_sw
            - attribute_id: 0x0015 ## min Level
              type: U16
              value: 3000 # 30℃
            - attribute_id: 0x0016 ## max Level
              type: U16
              value: 8500 # 85℃
              on_value:
                then:                  
                  - number.set:
                      id: ch_t_max
                      value: !lambda "return (float)(x);"
                  # - lambda: !lambda |-
                  #     ESP_LOGD("Change CH max level", "############ CH_max: %d", x);
            - attribute_id: 0x0019	#MinSetpointDeadBand
              type: U8
              value: 0
            - attribute_id: 0x001C ## System mode 
              id: ch_sys_mode
              type: U8
              #value: 0x04 #  Только обогрев (Heat).
              on_value:
                then:
                  - lambda: !lambda |-
                      bool is (x == 0x04);
                      id(ch_en_sw).publish_state(is);
                      id(ch_sw)=is;

            - attribute_id: 0x001B ## Control Sequence of Operation
              type: U8
              value: 0x02 # Heating Only
            - attribute_id: 0x001E ## Thermostat Running Mode
              type: U8
              value: 0x04 # Heating Only            
            # - attribute_id: 0x0025 ## ThermostatProgrammingOperationMod
            #   type: U8
            #   value: 0x02
#######################################################################################
    - num: 6
      device_type: THERMOSTAT
      clusters:
        ###  Setpoint DHW ####
        - id: THERMOSTAT
          role: Server
          attributes:
            - attribute_id: 0x0000 #Local Temp
              type: U16
              report: true
              #value: 3500
              device: dhwTemp
              scale: 100
            - attribute_id: 0x0003 #abs min
              type: U16
              value: 3500
            - attribute_id: 0x0004 #abs max
              type: U16
              value: 6500
            # - attribute_id: 0x0010 #Colibration
            #   type: U16
            #   value: 5500
            #############################################################
            - attribute_id: 0x0011 # OccupiedCoolingSetpoint curent Level
              type: U16
              value: 6500
            - attribute_id: 0x0018 ## MaxCoolSetpointLimit min Level
              type: U16
              value: 6500 # 85℃
            - attribute_id: 0x0017 ## MinCoolSetpointLimit max Level
              type: U16
              value: 6500 # 30℃
            ####################################################  
            - attribute_id: 0x0012 # OccupiedHeatingSetpoint curent Level
              # id: zb_ch_dest
              type: S16
              on_value:
                then:
                  - number.set:
                      id: dhwDestTemp
                      value: !lambda "return (float)(x/100);"
                  - switch.turn_off: dhw_en_sw
                  - delay: 1000ms
                  - switch.turn_on: dhw_en_sw
            - attribute_id: 0x0015 ## min Level
              type: U16
              value: 3500 # 30℃
            - attribute_id: 0x0016 ## max Level
              type: U16
              value: 6500 # 85℃
            - attribute_id: 0x0019	#MinSetpointDeadBand
              type: U8
              value: 0
            - attribute_id: 0x001C ## System mode 
              id: dhw_sys_mode
              type: U8
              #value: 0x04 #  Только обогрев (Heat).
              on_value:
                then:
                  - lambda: !lambda |-
                      bool is (x == 0x04);
                      id(dhw_en_sw).publish_state(is);
                      id(dhw_sw)=is;
            - attribute_id: 0x001B ## Control Sequence of Operation
              type: U8
              value: 0x02 # Heating Only
            - attribute_id: 0x001E ## Thermostat Running Mode
              type: U8
              value: 0x04 # Heating Only            

  ### Zigbee events ###
  on_connect:
    then:      
      - light.turn_on:
          id: light_1
          brightness: 30%
          red: 0
          green: 0
          blue: 0
      - light.control:
          id: light_1
          red: 0
          green: 0
          blue: 50%
      - logger.log: "Connected network"
  on_join:
    then:      
      - light.turn_on:
          id: light_1
          brightness: 30%
          red: 0
          green: 0
          blue: 0
      - light.control:
          id: light_1
          red: 0
          green: 0
          blue: 50%
      - logger.log: "Joined network"
#######################################################################################                         

```

С помощю атривута device, можно нпрямую  брать данные из  других сущностей esphome.
```
- attribute_id: 0x0000 #Local Temp
  type: U16
  report: true
  #value: 3500
  device: dhwTemp
  scale: 100
```
В этом примее атрибут связывается с датчиком с id: dhwTemp. При этом  значение сразу  корректируется  при помощи  scale: 100. Датчик  отдает 32.34, а атрибут  получает  3234.
