package Musica.dtos

import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class CreateArtistaRequest(
    val name: String,
    val genre: String?
)

@Serializable
data class UpdateArtistaRequest(
    val name: String? = null,
    val genre: String? = null
)

@Serializable
data class ArtistaResponse(
    val id: String,
    val name: String,
    val genre: String?,
    val createdAt: String,
    val updatedAt: String
)