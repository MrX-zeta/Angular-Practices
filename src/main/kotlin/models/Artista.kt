package Musica.models

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp
import java.time.Instant
import java.util.*

object Artistas : Table("artistas") {
    val id = uuid("id").default(UUID.randomUUID())
    val name = varchar("name", 100)
    val genre = varchar("genre", 50).nullable()
    val createdAt = timestamp("created_at").default(Instant.now())
    val updatedAt = timestamp("updated_at").default(Instant.now())

    override val primaryKey = PrimaryKey(id)
}

data class Artista(
    val id: UUID,
    val name: String,
    val genre: String?,
    val createdAt: Instant,
    val updatedAt: Instant
)