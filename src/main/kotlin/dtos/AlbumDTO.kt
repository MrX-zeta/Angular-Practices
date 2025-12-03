package Musica.dtos



import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class CreateAlbumRequest(
    val title: String,
    val releaseYear: Int,
    val artistId: String
)

@Serializable
data class UpdateAlbumRequest(
    val title: String? = null,
    val releaseYear: Int? = null
)

@Serializable
data class AlbumResponse(
    val id: String,
    val title: String,
    val releaseYear: Int,
    val artistId: String,
    val createdAt: String,
    val updatedAt: String
)