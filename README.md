Ionic App Base
=====================

Instale o `ionic` e o `cordova`:

```
npm install -g ionic cordova
```

Instale as dependências:

```
npm install
```

Instale os plugins com o comando:

```
npm install <nome_plugin>@<versao>
```

## Lista de plugins instalados
* cordova-plugin-compat 1.0.0 "Compat"
* cordova-plugin-datepicker 0.9.2 "DatePicker"
* cordova-plugin-device 1.1.2 "Device"
* cordova-plugin-geolocation 2.2.0 "Geolocation"
* cordova-plugin-globalization 1.0.2 "Globalization"
* cordova-plugin-google-analytics 0.8.1 "Google Universal Analytics Plugin"
* cordova-plugin-inappbrowser 1.4.0 "InAppBrowser"
* cordova-plugin-network-information 1.2.1 "Network Information"
* cordova-plugin-splashscreen 3.2.2 "Splashscreen"
* cordova-plugin-statusbar 2.1.3 "StatusBar"
* cordova-plugin-whitelist 1.2.2 "Whitelist"
* cordova-plugin-x-toast 2.5.1 "Toast"
* ionic-plugin-keyboard 2.2.0 "Keyboard"

Para rodar o ionic no browser:

```
ionic serve
```

Para rodar o ionic no app:

```
cordova platform add ios (use este comando apenas uma vez para adicionar a plataforma)
```

```
ionic build ios
```

Depois abra o projeto no xcode e rode ele ou para rodar no simulador do mac use o comando:

```
ionic emulate ios
```


