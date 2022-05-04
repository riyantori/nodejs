const mapDBModelSong = ({
    id,
    name,
    title,
    year,
    genre,
    performer,
    duration,
    album_id,
    username,
}) => ({
    id,
    name,
    title,
    year,
    genre,
    performer,
    duration,
    albumId: album_id,
    username,
});

module.exports = { mapDBModelSong };