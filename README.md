# Setup

> you will have to setup the ssl, because otherwise the auth will not work (it uses cookies)

## SSL

1. create self signed certificate for `127.0.0.1`

```shell
openssl req -x509 -out cert.pem -keyout key.pem -newkey rsa:2048 -nodes -sha256 -subj '/CN=127.0.0.1' -extensions EXT -config ssl.conf
```
2. create `.cert` and `/apps/frontend/.cert`
3. copy the certificate to the folders

## Installing dependencies

### prerequisites
1. install:
  1. nodejs 18+
  2. npm
  3. docker
1. install pnpm
```shell
npm install -g pnpm
```

### steps
1. install node modules
```shell
pnpm install
```
> in windows you will have to use wsl for now


## Running

1. update the aws tokens in the `.env` file

2. start the services
```shell
nx serve manager 
nx serve backend
nx serve frontend
```

> make sure that tasks manager is running, refer to the readme in `tasks` repository to find out how to run it`

## releasing new version

1. check the current version in the `libs/client/package.json` file

2.
```shell
nx run client:publish --ver <new_version>
```






