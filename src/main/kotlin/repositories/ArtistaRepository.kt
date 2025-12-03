package Musica.repositories



import Musica.models.Artista
import Musica.models.Artistas
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class ArtistaRepository {

    fun createArtista(name: String, genre: String?): UUID = transaction {
        Artistas.insert {
            it[Artistas.name] = name
            it[Artistas.genre] = genre
        } get Artistas.id
    }

    fun getAllArtistas(): List<Artista> = transaction {
        Artistas.selectAll().map { rowToArtista(it) }
    }

    fun getArtistaById(id: UUID): Artista? = transaction {
        Artistas.select { Artistas.id eq id }
            .singleOrNull()
            ?.let { rowToArtista(it) }
    }

    fun updateArtista(id: UUID, name: String?, genre: String?): Boolean = transaction {
        val updateCount = Artistas.update({ Artistas.id eq id }) { update ->
            name?.let { update[Artistas.name] = it }
            genre?.let { update[Artistas.genre] = it }
            update[Artistas.updatedAt] = java.time.Instant.now()
        }
        updateCount > 0
    }

    fun deleteArtista(id: UUID): Boolean = transaction {
        // Verificar si tiene álbumes antes de borrar (protección contra borrado en cascada)
        val hasAlbumes = Musica.models.Albumes.select { Musica.models.Albumes.artistId eq id }
                .count() > 0

        if (hasAlbumes) {
            throw IllegalStateException("No se puede eliminar el artista ")
        }

        val deleteCount = Artistas.deleteWhere { Artistas.id eq id }
        deleteCount > 0
    }

    private fun rowToArtista(row: ResultRow): Artista = Artista(
        id = row[Artistas.id],
        name = row[Artistas.name],
        genre = row[Artistas.genre],
        createdAt = row[Artistas.createdAt],
        updatedAt = row[Artistas.updatedAt]
    )
}