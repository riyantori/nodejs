const ClientError = require("../../exceptions/ClientError");

class SongsHandler {
    constructor(service, validator){
        this._service = service;
        this._validator = validator;

        this.postSongHandler = this.postSongHandler.bind(this);
        this.getSongsHandler = this.getSongsHandler.bind(this);
        this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
        this.editSongByIdHandler = this.editSongByIdHandler.bind(this);
        this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
    }

    async postSongHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const {
                title, year, genre, performer, duration, albumId
            } = request.payload;
            const { id: credentialId } = request.auth.credentials;
    
            const songId = await this._service.addSong({
                title, year, genre, performer, duration, albumId, owner: credentialId
            }); 
    
            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan',
                data: {
                    songId,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            //Server Error!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async getSongsHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentialId;
            const songs = await this._service.getSongs(credentialId);
            return {
                status: 'success',
                data: {
                    songs,
                },
            };
        }catch(error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            //Server Error!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });
            response.code(500);
            console.error(error);
            return response;
        }  
    }

    async getSongByIdHandler(request, h) {
        try{ 
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._service.verifySongAccess(id, credentialId);
            const song = await this._service.getSongById(id);
            return {
                status: 'success',
                data: {
                    song,
                },
            };
        }catch(error){
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            //Server Error!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }

    async editSongByIdHandler(request, h) {
        try {
            this._validator.validateSongPayload(request.payload);
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;
            await this._service.verifySongAccess( id, credentialId);
            await this._service.editSongById(id, request.payload);
            return {
                status: 'success',
                message: 'Lagu berhasil diperbarui',
            };
        }catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                     status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            //Server Error!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
        
    }

    async deleteSongByIdHandler(request, h) {
        try{
            const { id } = request.params;
            const { id: credentialId} = request.auth.credentials;
            await this._service.verifySongOwner(id, credentialId);
            await this._service.deleteSongById(id);
            return {
                status: 'success',
                message: 'Lagu berhasil dihapus',
            };
        }catch(error){
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }

            //Server Error!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.'
            });
            response.code(500);
            console.error(error);
            return response;
        };
    }
}

module.exports = SongsHandler;