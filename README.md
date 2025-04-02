# zigbee_opentherm

Эта  "поделка"  собиралась  на вот этом железе:
https://www.ozon.ru/product/komplekt-shield-adapter-opentherm-dlya-esp-32-c6-wi-fi-zigbee-3-0-1770642479/?from_sku=1770628302&oos_search=false
![image](https://github.com/user-attachments/assets/b9284040-545f-42a4-a7d9-e9d053aaeeae)
и
![image](https://github.com/user-attachments/assets/7ffa9180-b9c7-4822-ad52-2c3fa9166496)
=========================================================================================

# Инструкция по  настройке для  Home Assistant.
   1. Содержимое папки esphome/components/zigbee (репозитория), необходимо разметить в папке /homeassistant/esphome/components/zigbee, в вашем Home Assistant.  Это модифицированная версия внешнего сомпонента https://github.com/luar123/zigbee_esphome/.  Спасибо автору (luar123).  Что изменил:  добавил новый тригер для событ on_connect (когда устройство подсоединяется к сети. Не Join !!!!). И добавил несколько  вспомогательных  функций, для облегчения автоматизации в коде YAML.
   2. Создать в EspHomeBuilder новое устройство. При выборе типа контроллера выбирайте любое(например ESP32). Все равнро пока esphome не поддерживает контроллеры с zigbee.  Но потом самом коде,  в разделе esp32 укажите  правильный контроллер.
      
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

  Ну или просто  скопируйте содержимое файла zb-therm.yaml в свой код. 
  
  3. Положите в папку /homeassistant/esphome,  файл  partitions_zb.csv. без  него код не соберется.
  4. Положите в папку /homeassistant/zigbee2mqtt/external_converters/  файл ковертора ieds_zbot.js.
  5. Соберите и залейте на контроллер.
  6. В ZHA  залетает без проблем.  А в Z2M  пока  залетают  не все атрибуты и контролы (работаю над этим).

====================================================================================     
