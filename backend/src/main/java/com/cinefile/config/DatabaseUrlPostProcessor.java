package com.cinefile.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

public class DatabaseUrlPostProcessor implements EnvironmentPostProcessor {
    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String existing = environment.getProperty("spring.datasource.url");
        if (existing != null && existing.startsWith("jdbc:")) return;

        String dbUrl = firstNonNull(
                environment.getProperty("DB_URL"),
                environment.getProperty("DATABASE_URL"),
                System.getenv("DB_URL"),
                System.getenv("DATABASE_URL")
        );
        if (dbUrl == null || dbUrl.isBlank()) return;

        String username = firstNonNull(environment.getProperty("DB_USER"), System.getenv("DB_USER"));
        String password = firstNonNull(environment.getProperty("DB_PASS"), System.getenv("DB_PASS"));

        try {
            String jdbc;
            String user = username;
            String pass = password;
            if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
                // Parse postgres URL: postgres://user:pass@host:port/db
                URI uri = URI.create(dbUrl.replace("postgres://", "postgresql://"));
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String db = (path != null && path.length() > 1) ? path.substring(1) : "postgres";
                String[] ui = (uri.getUserInfo() != null ? uri.getUserInfo() : ":").split(":", 2);
                if (user == null || user.isBlank()) user = ui.length > 0 ? ui[0] : null;
                if (pass == null || pass.isBlank()) pass = ui.length > 1 ? ui[1] : null;
                String ssl = uri.getQuery() != null && uri.getQuery().contains("sslmode=") ? "" : "?sslmode=require";
                jdbc = String.format("jdbc:postgresql://%s:%d/%s%s", host, port, db, ssl);
            } else if (dbUrl.startsWith("jdbc:")) {
                jdbc = dbUrl;
            } else {
                // Assume host:port/db
                jdbc = "jdbc:postgresql://" + dbUrl;
            }

            Map<String, Object> map = new HashMap<>();
            map.put("spring.datasource.url", jdbc);
            if (user != null) map.put("spring.datasource.username", user);
            if (pass != null) map.put("spring.datasource.password", pass);
            environment.getPropertySources().addFirst(new MapPropertySource("cinefile-dburl", map));
        } catch (Exception ignored) { }
    }

    private static String firstNonNull(String... vals) {
        for (String v : vals) if (v != null && !v.isBlank()) return v;
        return null;
    }
}

