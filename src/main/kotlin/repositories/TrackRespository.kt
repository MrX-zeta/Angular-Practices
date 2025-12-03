package Musica.repositories



import Musica.models.Track
import Musica.models.Tracks
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class TrackRepository {

    fun createTrack(title: String, duration: Int, albumId: UUID): UUID = transaction {
        // Verificar que el álbum existe
        val albumExists = Musica.models.Albumes.select { Musica.models.Albumes.id eq albumId }
                .count() > 0

        if (!albumExists) {
            throw IllegalArgumentException("El álbum con ID $albumId no existe")
        }

        Tracks.insert {
            it[Tracks.title] = title
            it[Tracks.duration] = duration
            it[Tracks.albumId] = albumId
        } get Tracks.id
    }

    fun getAllTracks(): List<Track> = transaction {
        Tracks.selectAll().map { rowToTrack(it) }
    }

    fun getTrackById(id: UUID): Track? = transaction {
        Tracks.select { Tracks.id eq id }
            .singleOrNull()
            ?.let { rowToTrack(it) }
    }

    fun getTracksByAlbumId(albumId: UUID): List<Track> = transaction {
        Tracks.select { Tracks.albumId eq albumId }.map { rowToTrack(it) }
    }

    fun updateTrack(id: UUID, title: String?, duration: Int?): Boolean = transaction {
        val updateCount = Tracks.update({ Tracks.id eq id }) { update ->
            title?.let { update[Tracks.title] = it }
            duration?.let { update[Tracks.duration] = it }
            update[Tracks.updatedAt] = java.time.Instant.now()
        }
        updateCount > 0
    }

    fun deleteTrack(id: UUID): Boolean = transaction {
        val deleteCount = Tracks.deleteWhere { Tracks.id eq id }
        deleteCount > 0
    }

    private fun rowToTrack(row: ResultRow): Track = Track(
        id = row[Tracks.id],
        title = row[Tracks.title],
        duration = row[Tracks.duration],
        albumId = row[Tracks.albumId],
        createdAt = row[Tracks.createdAt],
        updatedAt = row[Tracks.updatedAt]
    )
}