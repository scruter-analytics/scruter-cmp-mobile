// Scruter CMP for Android apps (docs/CMP-MOBILE.md of the Scruter monorepo): the module `net.scruter.cmp:scruter-cmp`,
// its Compose companion `net.scruter.cmp:scruter-cmp-compose`, the example app and the budget app that measures the
// module after R8. Independent of Scruter Analytics (github.com/scruter-analytics/scruter-mobile).
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "scruter-cmp-android"
include(":scruter-cmp", ":scruter-cmp-compose", ":sample-cmp", ":budget-cmp")
