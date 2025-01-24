# Apify Youtube Music Downloader Actor

## Introduction

- An [Apify](https://apify.com/) actor to download Youtube Music at highest quality.
- Just paste the url and you are good to go however if you want to select diffeent quality you can choose that but in proxy configuration, only residential one works but all other gets blocked by Youtube.

## Building 

Use docker command to build `sudo docker build -t app -f ./.actor/Dockerfile .` root say yt-music-downloader. and in local copy shared folder first.