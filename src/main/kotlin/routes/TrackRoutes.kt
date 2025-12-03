package Musica.routes


import Musica.dtos.*
import Musica.repositories.TrackRepository
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*

fun Application.trackRoutes() {
    val trackRepository = TrackRepository()

    routing {
        //authenticate("auth-jwt") {
            route("/api/tracks") {
                // CREATE
                post {
                    try {
                        val request = call.receive<CreateTrackRequest>()

                        if (request.title.isBlank()) {
                            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "El título es requerido"))
                            return@post
                        }

                        if (request.duration <= 0) {
                            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "La duración debe ser mayor a 0"))
                            return@post
                        }

                        val albumId = UUID.fromString(request.albumId)
                        val trackId = trackRepository.createTrack(request.title, request.duration, albumId)

                        call.respond(HttpStatusCode.Created, mapOf("id" to trackId.toString()))
                    } catch (e: IllegalArgumentException) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "ID de álbum inválido")))
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Error desconocido")))
                    }
                }

                // READ ALL
                get {
                    try {
                        val tracks = trackRepository.getAllTracks()
                        val response = tracks.map { track ->
                            TrackResponse(
                                id = track.id.toString(),
                                title = track.title,
                                duration = track.duration,
                                albumId = track.albumId.toString(),
                                createdAt = track.createdAt.toString(),
                                updatedAt = track.updatedAt.toString()
                            )
                        }
                        call.respond(HttpStatusCode.OK, response)
                    } catch (e: Exception) {
                        call.respond(HttpStatusCode.InternalServerError, mapOf("error" to (e.message ?: "Error interno")))
                    }
                }

                // READ BY ID
                get("/{id}") {
                    try {
                        val id = UUID.fromString(call.parameters["id"])
                        val track = trackRepository.getTrackById(id)

                        if (track == null) {
                            call.respond(HttpStatusCode.NotFound, mapOf("error" to "Track no encontrado"))
                            return@get
                        }

                        val response = TrackResponse(
                            id = track.id.toString(),
                            title = track.title,
                            duration = track.duration,
                            albumId = track.albumId.toString(),
                            createdAt = track.createdAt.toString(),
                            updatedAt = track.updatedAt.toString()
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
                        val request = call.receive<UpdateTrackRequest>()

                        if (request.title == null && request.duration == null) {
                            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Se requiere al menos un campo para actualizar"))
                            return@put
                        }

                        request.duration?.let {
                            if (it <= 0) {
                                call.respond(HttpStatusCode.BadRequest, mapOf("error" to "La duración debe ser mayor a 0"))
                                return@put
                            }
                        }

                        val success = trackRepository.updateTrack(id, request.title, request.duration)

                        if (success) {
                            call.respond(HttpStatusCode.OK, mapOf("message" to "Track actualizado correctamente"))
                        } else {
                            call.respond(HttpStatusCode.NotFound, mapOf("error" to "Track no encontrado"))
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

                        trackRepository.deleteTrack(id)
                        call.respond(HttpStatusCode.OK, mapOf("message" to "Track eliminado correctamente"))
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