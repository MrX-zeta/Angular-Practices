package Musica.models

import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp
import java.time.Instant
import java.util.*

object Tracks : Table("tracks") {
    val id = uuid("id").default(UUID.randomUUID())
    override val primaryKey = PrimaryKey(id)

    val title = varchar("title", 150)
    val duration = integer("duration").check { it greater 0 }
    val albumId = uuid("album_id").references(Albumes.id)
    val createdAt = timestamp("created_at").default(Instant.now())
    val updatedAt = timestamp("updated_at").default(Instant.now())
}

data class Track(
    val id: UUID,
    val title: String,
    val duration: Int,
    val albumId: UUID,
    val createdAt: Instant,
    val updatedAt: Instant
)