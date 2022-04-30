const mapDBModelSong = ({
    id,
    name,
    title,
    year,
    genre,
    performer,
    duration,
    album_id,
}) => ({
    id,
    name,
    title,
    year,
    genre,
    performer,
    duration,
    albumId: album_id,
});

module.exports = { mapDBModelSong };