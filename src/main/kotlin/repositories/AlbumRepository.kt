package Musica.repositories

import Musica.models.Album
import Musica.models.Albumes
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class AlbumRepository {

    fun createAlbum(title: String, releaseYear: Int, artistId: UUID): UUID = transaction {
        val artistaExists = Musica.models.Artistas.select { Musica.models.Artistas.id eq artistId }
                .count() > 0

        if (!artistaExists) {
            throw IllegalArgumentException("El artista con ID $artistId no existe")
        }

        Albumes.insert {
            it[Albumes.title] = title
            it[Albumes.releaseYear] = releaseYear
            it[Albumes.artistId] = artistId
        } get Albumes.id
    }

    fun getAllAlbumes(): List<Album> = transaction {
        Albumes.selectAll().map { rowToAlbum(it) }
    }

    fun getAlbumById(id: UUID): Album? = transaction {
        Albumes.select { Albumes.id eq id }
            .singleOrNull()?.let { rowToAlbum(it) }
    }

    fun getAlbumesByArtistId(artistId: UUID): List<Album> = transaction {
        Albumes.select { Albumes.artistId eq artistId }.map { rowToAlbum(it) }
    }

    fun updateAlbum(id: UUID, title: String?, releaseYear: Int?): Boolean = transaction {
        val updateCount = Albumes.update({ Albumes.id eq id }) { update ->
            title?.let { update[Albumes.title] = it }
            releaseYear?.let { update[Albumes.releaseYear] = it }
            update[Albumes.updatedAt] = java.time.Instant.now()
        }
        updateCount > 0
    }

    fun deleteAlbum(id: UUID): Boolean = transaction {

        val hasTracks = Musica.models.Tracks.select { Musica.models.Tracks.albumId eq id }
                .count() > 0

        if (hasTracks) {
            throw IllegalStateException("No se puede eliminar el álbum ")
        }

        val deleteCount = Albumes.deleteWhere { Albumes.id eq id }
        deleteCount > 0
    }

    private fun rowToAlbum(row: ResultRow): Album = Album(
        id = row[Albumes.id],
        title = row[Albumes.title],
        releaseYear = row[Albumes.releaseYear],
        artistId = row[Albumes.artistId],
        createdAt = row[Albumes.createdAt],
        updatedAt = row[Albumes.updatedAt]
    )
}