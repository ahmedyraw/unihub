package com.example.unihub.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class PasswordValidator {

    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");

    public static List<String> validate(String password) {
        List<String> errors = new ArrayList<>();

        if (password == null || password.length() < MIN_LENGTH) {
            errors.add("Password must be at least " + MIN_LENGTH + " characters long");
        }

        if (password != null) {
            if (!UPPERCASE_PATTERN.matcher(password).find()) {
                errors.add("Password must contain at least one uppercase letter");
            }
            if (!LOWERCASE_PATTERN.matcher(password).find()) {
                errors.add("Password must contain at least one lowercase letter");
            }
            if (!DIGIT_PATTERN.matcher(password).find()) {
                errors.add("Password must contain at least one digit");
            }
            if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
                errors.add("Password must contain at least one special character (!@#$%^&*...)");
            }
        }

        return errors;
    }

    public static boolean isValid(String password) {
        return validate(password).isEmpty();
    }
}
