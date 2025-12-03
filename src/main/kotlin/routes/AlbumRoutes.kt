package Musica.routes

import Musica.dtos.*
import Musica.repositories.AlbumRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

fun Application.albumRoutes() {
    val albumRepository = AlbumRepository()

    routing {
        //authenticate("auth-jwt") {//
            route("/api/albumes") {
                // CREATE
                post {
                    try {
                        val request = call.receive<CreateAlbumRequest>()

                        if (request.title.isBlank()) {
                            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "El título es requerido"))
                            return@post
                        }

                        if (request.releaseYear < 1900) {
                            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "El año de lanzamiento debe ser mayor o igual a 1900"))
                            return@post
                        }

                        val artistId = UUID.fromString(request.artistId)
                        val albumId = albumRepository.createAlbum(request.title, request.releaseYear, artistId)

                        call.respond(HttpStatusCode.Created, mapOf("id" to albumId.toString()))
                    } catch (e: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "ID de artista inválido")))
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Error desconocido")))
                    }
                }

                // READ BY ID
                get("/{id}") {
                    try {
                        val id = UUID.fromString(call.parameters["id"])
                        val album = albumRepository.getAlbumById(id)

                        if (album == null) {
                            call.respond(HttpStatusCode.NotFound, mapOf("error" to "Álbum no encontrado"))
                            return@get
                        }

                        val response = AlbumResponse(
                            id = album.id.toString(),
                            title = album.title,
                            releaseYear = album.releaseYear,
                            artistId = album.artistId.toString(),
                            createdAt = album.createdAt.toString(),
                            updatedAt = album.updatedAt.toString()
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
                        val request = call.receive<UpdateAlbumRequest>()

                        if (request.title == null && request.releaseYear == null) {
                            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Se requiere al menos un campo para actualizar"))
                            return@put
                        }

                        request.releaseYear?.let {
                            if (it < 1900) {
                                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "El año de lanzamiento debe ser mayor o igual a 1900"))
                                return@put
                            }
                        }

                        val success = albumRepository.updateAlbum(id, request.title, request.releaseYear)

                        if (success) {
                            call.respond(HttpStatusCode.OK, mapOf("message" to "Álbum actualizado correctamente"))
                        } else {
                            call.respond(HttpStatusCode.NotFound, mapOf("error" to "Álbum no encontrado"))
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

                        albumRepository.deleteAlbum(id)
                        call.respond(HttpStatusCode.OK, mapOf("message" to "Álbum eliminado correctamente"))
                    } catch (e: IllegalStateException) {
                        call.respond(HttpStatusCode.Conflict, mapOf("error" to (e.message ?: "No se puede eliminar el álbum")))
                    } catch (_: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to "ID inválido"))
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error interno")))
                    }
                }
            }

    }
}