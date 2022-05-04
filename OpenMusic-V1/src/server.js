require('dotenv').config();

const Jwt = require("@hapi/jwt");
const Hapi = require("@hapi/hapi");
const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const authentication = require('./api/authentications')
const collaborations = require('./api/collaborations');
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');
const CollaborationsValidator = require('./validator/collaborations')
const TokenManager = require('./tokenize/TokenManager');
const { register } = require('./api/users');

const init = async () => {
    const collaborationService = new CollaborationsService();
    const songsService = new SongsService(collaborationService);
    const albumsService = new AlbumsService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    
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
            plugin: Jwt,
        },
    ]);

    //mendefinisikan strategy authentifikasi Jwt
    server.auth.strategy('songsapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credential: {
                id: artifacts.decoded.payload.id,
            },
        }),
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
       {
           plugin: authentication,
           option: {
               authenticationsService,
               usersService,
               tokenManager: TokenManager,
               validator: AuthenticationsValidator,
           },
       },
       {
           plugin: collaborations,
           options: {
               collaborationService,
               songsService,
               validator: CollaborationsValidator,
           },
       },
    ]);

   await server.start();
   console.log(`Server berjalan pada ${server.info.uri}`)
}
init();