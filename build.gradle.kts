plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ktor)
    alias(libs.plugins.kotlin.plugin.serialization)
}

group = "Musica"
version = "0.0.1"

application {
    mainClass = "io.ktor.server.netty.EngineMain"
}

dependencies {
    implementation("io.ktor:ktor-server-core-jvm:2.3.3")
    implementation("io.ktor:ktor-server-content-negotiation-jvm:2.3.3")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm:2.3.3")
    implementation("io.ktor:ktor-server-netty-jvm:2.3.3")
    implementation("io.ktor:ktor-server-status-pages:2.3.3")
    implementation("io.ktor:ktor-server-auth:2.3.3")
    implementation("io.ktor:ktor-server-auth-jwt:2.3.3")
    implementation("com.auth0:java-jwt:4.4.0")
    implementation("org.jetbrains.exposed:exposed-core:0.41.1")
    implementation("org.jetbrains.exposed:exposed-dao:0.41.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.41.1")
    implementation("org.jetbrains.exposed:exposed-java-time:0.41.1")
    implementation("org.postgresql:postgresql:42.6.0")
    implementation("com.zaxxer:HikariCP:5.0.1")
    implementation("ch.qos.logback:logback-classic:1.4.8")
    testImplementation("io.ktor:ktor-server-tests-jvm:2.3.3")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:1.9.0")


}
