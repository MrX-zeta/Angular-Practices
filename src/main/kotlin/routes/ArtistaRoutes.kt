package Musica.routes



import Musica.dtos.*
import Musica.repositories.ArtistaRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

fun Application.artistaRoutes() {
    val artistaRepository = ArtistaRepository()

    routing {
        //authenticate("auth-jwt") {
            route("/api/artistas") {

                post {
                    try {
                        val request = call.receive<CreateArtistaRequest>()

                        if (request.name.isBlank()) {
                            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "El nombre es requerido"))
                            return@post
                        }

                        val artistaId = artistaRepository.createArtista(request.name, request.genre)

                        call.respond(HttpStatusCode.Created, mapOf("id" to artistaId.toString()))
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Error desconocido")))
                    }
                }


                get {
                    try {
                        val artistas = artistaRepository.getAllArtistas()
                        val response = artistas.map { artista ->
                            ArtistaResponse(
                                id = artista.id.toString(),
                                name = artista.name,
                                genre = artista.genre,
                                createdAt = artista.createdAt.toString(),
                                updatedAt = artista.updatedAt.toString()
                            )
                        }
                        call.respond(HttpStatusCode.OK, response)
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error interno")))
                    }
                }


                get("/{id}") {
                    try {
                        val id = UUID.fromString(call.parameters["id"])
                        val artista = artistaRepository.getArtistaById(id)

                        if (artista == null) {
                            call.respond(HttpStatusCode.NotFound, mapOf("error" to "Artista no encontrado"))
                            return@get
                        }

                        val response = ArtistaResponse(
                            id = artista.id.toString(),
                            name = artista.name,
                            genre = artista.genre,
                            createdAt = artista.createdAt.toString(),
                            updatedAt = artista.updatedAt.toString()
                        )
                        call.respond(HttpStatusCode.OK, response)
                    } catch (_: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to "ID inválido"))
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error interno")))
                    }
                }

                // UPDATE
                put("/{id}") {
                    try {
                        val id = UUID.fromString(call.parameters["id"])
                        val request = call.receive<UpdateArtistaRequest>()

                        if (request.name == null && request.genre == null) {
                            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Se requiere al menos un campo para actualizar"))
                            return@put
                        }

                        val success = artistaRepository.updateArtista(id, request.name, request.genre)

                        if (success) {
                            call.respond(HttpStatusCode.OK, mapOf("message" to "Artista actualizado correctamente"))
                        } else {
                            call.respond(HttpStatusCode.NotFound, mapOf("error" to "Artista no encontrado"))
                        }
                    } catch (_: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to "ID inválido"))
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error interno")))
                    }
                }

                // DELETE
                delete("/{id}") {
                    try {
                        val id = UUID.fromString(call.parameters["id"])

                        artistaRepository.deleteArtista(id)
                        call.respond(HttpStatusCode.OK, mapOf("message" to "Artista eliminado correctamente"))
                    } catch (e: IllegalStateException) {
                        call.respond(HttpStatusCode.Conflict, mapOf("error" to (e.message ?: "No se puede eliminar el artista")))
                    } catch (_: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to "ID inválido"))
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error interno")))
                    }
                }
            }
        //}
    }
}