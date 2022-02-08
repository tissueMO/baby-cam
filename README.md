ベビーカメラ
===

## Summary

ベッドに寝かせた赤ちゃんを遠隔監視するためのソリューションです。  


## Architecture

![architecture](https://user-images.githubusercontent.com/20965271/153109502-21d66e6b-6811-4b75-9f77-17c4e4fba025.png)


### (Raspberry Pi) 配信元マシン

以下のデーモンプロセスを起動します。  

- ビデオストリーム配信用プロセス (FFmpeg)
- ビデオストリーム配信障害発生時のリブート要求待ち受け用サーバープロセス (Node.js)
- ボリュームレベル配信用プロセス (Node.js)

※ビデオストリームの配信が停止する障害は原因不明。予期せぬタイミングでUSBデバイスが応答しなくなる現象でリブートにより解消されることが判っています。


### RTMPサーバー

配信元マシンから受け取ったビデオストリームをRTMPで配信します。  
バックグラウンドでビデオストリーム配信障害監視用のデーモンプロセスを走らせ、配信が停止されると配信元に対しリブート要求を投げます。  


### Webサーバー

サイト表示用の静的コンテンツとHLSによるビデオストリームを提供します。


### アプリケーションサーバー

WebSocketサーバーとして以下の役割を担います。

- (From 配信元マシン) マイクから入力されたボリュームレベルを受信
  - 一定時間のボリュームレベルを分析し、赤ちゃんが泣いているかどうかを判定します。
- (To Webブラウザー) ボリュームレベル/気温/湿度を配信
  - 気温と湿度はSwitchBotのAPI経由で取得します。


## Dependency

- Raspberry Pi 3 Model B+
- FFmpeg
  - Alsa
  - V4L2 (Video for Linux 2)
- Docker
- [Nginx](https://nginx.org/en/)
- Bash
- [SwitchBot Meter](https://www.switchbot.jp/products/switchbot-meter)
- WebSocket
- Node.js
  - [app](app/src/package.json)
  - [cry-client](cry-client/src/package.json)
  - [rebooter](rebooter/src/package.json)
- [hls.js](https://github.com/video-dev/hls.js/)
- [Bootstrap](https://github.com/twbs/bootstrap)
- [CoreUI](https://coreui.io/)
- [FontAwesome](https://fontawesome.com/)


## Setup

本リポジトリーからクローンして実際に動かすまでの手順を示します。

// TBD


## Author

[tissueMO](https://github.com/tissueMO)
