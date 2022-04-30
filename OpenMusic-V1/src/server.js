require('dotenv').config();

const Hapi = require("@hapi/hapi");
const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');

const init = async () => {
    const songsService = new SongsService();
    const albumsService = new AlbumsService();
    const usersService = new UsersService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*']
            },
        },   
    });

   await server.register([
       {
            plugin: songs,
            options: {
                service: songsService,
                validator: SongsValidator,
            },
       },
       {
           plugin: albums,
           options: {
               service: albumsService,
               validator: AlbumsValidator,
           },
       },
       {
           plugin: users,
           option: {
               service: usersService,
               validator:  UsersValidator,
           },
       },
    ]);

   await server.start();
   console.log(`Server berjalan pada ${server.info.uri}`)
}
init();