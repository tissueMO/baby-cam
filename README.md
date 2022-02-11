ベビーカメラ
===

## Summary

ベッドに寝かせた赤ちゃんを遠隔監視するためのソリューションです。  
映像によるリアルタイム配信に加え、部屋の気温・湿度や赤ちゃんが泣いているかどうかを可視化できます。  


## Architecture

![architecture](https://user-images.githubusercontent.com/20965271/153109502-21d66e6b-6811-4b75-9f77-17c4e4fba025.png)


### (Raspberry Pi) 配信元マシン

以下のデーモンプロセスを起動します。  

- ビデオストリーム配信用プロセス (FFmpeg)
- ボリュームレベル配信用プロセス (Node.js)
- ビデオストリーム配信障害発生時のリブート要求待ち受け用サーバープロセス (Node.js)
  - ビデオストリームの配信が停止する障害は原因不明。  
    予期せぬタイミングでUSBデバイスが応答しなくなる現象でリブートにより解消されることが判っています。  
    また、この現象はより高い解像度設定で動作させることで発生確率が高まることが判っています。  


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
- Raspberry Pi OS (32 bit)
  - Bash
  - systemd
  - FFmpeg
    - Alsa
    - V4L2 (Video for Linux 2)
- Docker
- [Nginx](https://nginx.org/en/)
- [SwitchBot Meter](https://www.switchbot.jp/products/switchbot-meter)
- WebSocket
- Node.js
  - [app](app/src/package.json)
  - [level-sender](level-sender/src/package.json)
  - [rebooter](rebooter/src/package.json)
  - [web](web/src/package.json)
    - [Bootstrap](https://github.com/twbs/bootstrap)
    - [CoreUI](https://coreui.io/)
    - [FontAwesome](https://fontawesome.com/)


## Setup

本リポジトリーからクローンして実際に動かすまでの手順を示します。

### (Raspberry Pi) 配信元マシン

1. Raspberry Pi OS (32bit) をインストールします。
    - 必要に応じてIPアドレス固定化の設定等を行います。
2. USBカメラとUSBマイクを接続します。
3. Node.js (16-) と Yarn をインストールします。
4. 本リポジトリーを `/usr/local/src/` にクローンします。
5. 必要な設定値を埋め込みます。
    - [/usr/local/src/baby-cam/camera/config/environment/babycam](camera/config/environment/babycam.example)
        - `BABYCAM_AUDIO_SOURCE`: 配信用オーディオソース名 (例: `hw:2,0`)
            - `arecord -l` コマンドによって確認できます。
        - `BABYCAM_VIDEO_SOURCE`: 配信用ビデオソース名 (例: `/dev/video0`)
            - `v4l2-ctl --list-devices` コマンドによって確認できます。 
        - `BABYCAM_VIDEO_SIZE`: 配信用ビデオ解像度 (例: `640x360`)
        - `BABYCAM_STREAM_HOST`: 配信先RTMPサーバーホスト名
     - [/usr/local/src/baby-cam/camera/config/environment/babycam-level-sender](camera/config/environment/babycam-level-sender.example)
         - `WEBSOCKET_HOST`: アプリケーションサーバーのWebSocketホスト名 (例: `ws://example.com:3000`)
         - `BABYCRY_AUDIO_SOURCE`: 泣き状況判定用のUSBマイクデバイスID
           - 配信用オーディオソースとは別のデバイスを指定する必要があり、 `arecord -l` コマンドによって得られるIDとは異なります。
           - 以下のコマンドによって確認できます。(予め `yarn install` を実行しておく必要があります)  
             ```bash
             $ cd /usr/local/src/baby-cam/camera/level-sender/src
             $ yarn devices
             ```
6. インストールスクリプトを実行します。  
    ```bash
    $ chmod +x /usr/local/src/baby-cam/camera/install.sh
    $ sudo /usr/local/src/baby-cam/camera/install.sh
    ```
7. OSを再起動します。
8. 各種デーモンが起動していることを確認します。  
    ```bash
    $ sudo systemctl status babycam
    $ sudo systemctl status babycam-level-sender
    $ sudo systemctl status babycam-rebooter
    ```


### RTMPサーバー / Webサーバー

※同一Dockerコンテナー内でRTMPサーバーとWebサーバーを同居させています。  

1. [web](./web) をDockerビルドします。
    - ビルド引数に `APP_HOST` (アプリケーションサーバーのホスト名) を加えます。
2. 環境変数の設定に `REBOOTER_HOST` (配信元マシン側で待ち受けるビデオストリーム配信障害発生時のリブート要求口) を加えます。
3. 公開ポートの設定に `80` (HTTP) と `1935` (RTMP) を加えます。
4. Dockerコンテナーを起動します。


### アプリケーションサーバー

1. [app](./app) をDockerビルドします。
2. 環境変数の設定に `SWITCHBOT_API_TOKEN` と `SWITCHBOT_METER_DEVICE_ID` を加えます。
    - Docker-Composeを使用する場合は [.env](./app/.env.example) ファイルを作成します。
3. 公開ポートの設定に `3000` (Node.js) を加えます。
4. Dockerコンテナーを起動します。


## Author

[tissueMO](https://github.com/tissueMO)
