package Musica.plugins

import io.ktor.server.application.*

fun Application.configureDatabase() {
    DatabaseFactory.init()
}
