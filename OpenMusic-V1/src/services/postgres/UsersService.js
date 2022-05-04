const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const bcrypt = require('bcrypt');
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UsersService {
    constructor(collaborationService){
        this._poll = new Pool();
        this._collaborationService = collaborationService;
    }

    async addUser({ username, password, fullname}) {
        //TODO: Verifikasi username, pastikan belum terdafatar
        await this.verifyNewUsername(username)
        //TODO: Bila verifikasi lolos, maka masukan user baru ke database
        const id = `user-${nanoid(16)}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = {
            text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashedPassword, fullname],
        }

        const result = await this._poll.query(query);

        if (!result.rows.length) {
            throw new InvariantError('User gagal ditambahkan')
        }

        return result.rows[0].id;
    }

    async verifyNewUsername(username) {
        const query = {
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username],
        }

        const result = await this._poll.query(query);

        if (result.rows.length > 0) {
            throw new InvariantError('Gagal menambah user. Username sudah digunakan');
        }
    }

    async getUserById(userId) {
        const query = {
            text: 'SELECT id, username, fullname FROM users WHERE id = $1',
            values: [userId],
        }

        const result = await this._poll.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('User tidak ditemukan');
        }

        return result.rows[0];
    }

    async verifyUserCrendtial(username, password) {
        const query = {
            text: 'SELECT id, password FROM users WHERE username=$1',
            values: [username],
        };

        const result = await this._poll.query(query);

        if(!result.rows.length) {
            throw new AuthenticationError('Kredensial yang anda berikan salah');
        }

        const { id, password: hashedPassword } = result.rows[0];
        const match = await bcrypt.compare(password, hashedPassword);

        if(!match) {
            throw new AuthenticationError('Kredensial yang anda berikan salah')
        }

        return id;
    }

    async verifySongAccess(songId, userId) {
        try{
            await this.verifySongOwner(songId, userId)
        }catch(error){
            if (error instanceof NotFoundError){
                throw error;
            }
        }

        try{
            await this._collaborationService.verifyCollaborator(songId, userId);
        }catch{
            throw error;
        }

    }
}

module.exports = UsersService;