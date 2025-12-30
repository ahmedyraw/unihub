package com.example.unihub.config;

import com.example.unihub.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseConstraintUpdater implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            if (!tableExists("notifications")) {
                log.info("Skipping notifications_type_check update: notifications table does not exist yet");
                return;
            }

            String allowedValues = Arrays.stream(NotificationType.values())
                .map(Enum::name)
                .map(value -> "'" + value + "'")
                .collect(Collectors.joining(", "));

            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
            jdbcTemplate.execute(
                "ALTER TABLE notifications ADD CONSTRAINT notifications_type_check " +
                "CHECK (type IN (" + allowedValues + "))"
            );
            log.info("notifications_type_check constraint updated successfully with values: {}", allowedValues);
        } catch (Exception ex) {
            log.warn("Skipping notifications_type_check update: {}", ex.getMessage());
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = ?",
            Integer.class,
            tableName
        );
        return count != null && count > 0;
    }
}
