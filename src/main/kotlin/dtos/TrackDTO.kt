package Musica.dtos


import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class CreateTrackRequest(
    val title: String,
    val duration: Int,
    val albumId: String
)

@Serializable
data class UpdateTrackRequest(
    val title: String? = null,
    val duration: Int? = null
)

@Serializable
data class TrackResponse(
    val id: String,
    val title: String,
    val duration: Int,
    val albumId: String,
    val createdAt: String,
    val updatedAt: String
)