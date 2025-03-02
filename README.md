# Nimman
Infrastructure for Node.js build small project

## Required
- VM minimum required
  - ram 2gb
  - 1 CPU
- Node.js version 24
- Postgres 17
- Docker & Docker Compose
- Nginx

## Install
```
cd /var


git clone https://github.com/dukerspace/nimman www

apt install make
```

## Run
install standard
```
make install
```
install nginx and configs
```
make nginx
```
run db
```
make db
```
and config yours projects
