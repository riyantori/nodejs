const { Pool } = require('pg')
const { nanoid } = require("nanoid");
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require("../../exceptions/NotFoundError");
const { mapDBModelSong } = require('../../utils/dbModelSong');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class SongsService {
    constructor(){
        this._pool = new Pool();
    }

    async addSong({
        title, year, genre, performer, duration, owner
    }) {
        const id = nanoid(16);

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            values: [id, title, year, genre, performer, duration, "albumId", owner],
        };
        console.log(query.values)
        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }

        return result.rows[0].id;
    }

/*    async getSongs(title, performer) {
        let result = await this._pool.query('SELECT id, title, performer FROM songs')

        if (title !== undefined) {
            const query = {
                text: `SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE $1`,
                values: [`%${title}%`]
            };
            console.log(`${title}`);
            result = await this._pool.query(query);
        }
        if (performer !== undefined) {
            result = await this._pool.query(`SELECT id, title, performer FROM songs WHERE LOWER(performer) LIKE '%${performer}%'`);
        }
        return result.rows.map(mapDBModelSong);
    } */

    async getSong(owner) {
        const query = {
            text: 'SELECT songs.* FROM songs LEFT JOIN collaborations ON collaborations.song_id = songs.id WHERE songs.owner = $1 OR collaborations.user_id = $1 GROUP BY songs.id',
            values: [owner],
        };
        const result = await this._pool.query(query);
        return result.rows.map(mapDBModelSong);
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);

        if(!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan')
        }

        return result.rows.map(mapDBModelSong)[0];
    }

    async editSongById( id, { 
        title, year, genre, performer, duration, albumId
    }) {
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal diperbarui lagu. Id tidak ditemukan');
        }
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        }
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan')
        }
    }

    async verifySongOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM songs WHERE id=$1',
            values: [id],
        };
        
        const result = await this._pool.query(query);

        if(!result.rows.length){
            throw new NotFoundError('Lagu tidak ditemukan')
        }

        const song = result.rows[0];

        if (song.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini.')
        }
    }

    async getUsersByUsername (username) {
        const query = {
            text: 'SELECT id, username, fullname, FROM users WHERE username LIKE $1',
            values: [`%${username}%`],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }
}

module.exports = SongsService;