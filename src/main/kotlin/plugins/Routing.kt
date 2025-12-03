package Musica.plugins

import Musica.routes.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respond(mapOf("message" to "API de Catálogo Musical"))
        }

        artistaRoutes()
        albumRoutes()
        trackRoutes()
    }
}