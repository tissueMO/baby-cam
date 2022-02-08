#!/bin/bash
set -e

clone_dir=/usr/local/src/baby-cam

if [ ! -d $clone_dir ]; then
  echo "リポジトリーを $clone_dir にクローンして下さい。"
  exit 1
fi
if [ ! -f $clone_dir/camera/config/environment/babycam ]; then
  echo "$clone_dir/camera/config/environment/babycam を作成して下さい。"
  exit 1
fi
if [ ! -f $clone_dir/camera/config/environment/babycam-cry-client ]; then
  echo "$clone_dir/camera/config/environment/babycam-cry-client を作成して下さい。"
  exit 1
fi

# 必要なパッケージをインストール
apt install -y \
  ffmpeg libasound2-dev python3 make g++ libasound2-dev

# Node.jsプロジェクトをセットアップ
cd $clone_dir/camera/cry-client/src
yarn
cd $clone_dir/camera/rebooter/src
yarn

# 最新版のPortAudioをビルドしてNode.jsプロジェクトに組み込む
cd /usr/local/src
git clone https://git.assembla.com/portaudio.git
cd /usr/local/src/portaudio
./configure
make clean
make
cp ./lib/.libs/libportaudio.so.2 $clone_dir/cry-client/src/node_modules/naudiodon/build/Release/

# デーモン設定
chmod +x $clone_dir/camera/*.sh
cp $clone_dir/camera/config/systemd/* /etc/systemd/system/
cp $clone_dir/camera/config/environment/* /etc/default/
systemctl enable babycam
systemctl enable babycam-cry-client
systemctl enable babycam-rebooter

echo "Completed."
