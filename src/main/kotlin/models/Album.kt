package Musica.models

import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp
import java.time.Instant
import java.util.*

object Albumes : Table("albumes") {
    val id: Column<UUID> = uuid("id").default(UUID.randomUUID())
    override val primaryKey = PrimaryKey(id)

    val title = varchar("title", 150)
    val releaseYear = integer("release_year").check { it greaterEq 1900 }
    val artistId = uuid("artist_id").references(Artistas.id)
    val createdAt = timestamp("created_at").default(Instant.now())
    val updatedAt = timestamp("updated_at").default(Instant.now())
}

data class Album(
    val id: UUID,
    val title: String,
    val releaseYear: Int,
    val artistId: UUID,
    val createdAt: Instant,
    val updatedAt: Instant
)