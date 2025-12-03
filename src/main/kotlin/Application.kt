package Musica

import Musica.plugins.configureDatabase
import Musica.plugins.configureRouting
import Musica.plugins.configureSerialization
import io.ktor.server.application.*
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty

fun main() {
    embeddedServer(Netty, port = 3000, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    configureSerialization()
    configureDatabase()

    configureRouting()
}
