package com.example.unihub.util;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {

    @Test
    void testValidPassword() {
        String validPassword = "Test@1234";
        assertTrue(PasswordValidator.isValid(validPassword));
        assertTrue(PasswordValidator.validate(validPassword).isEmpty());
    }

    @Test
    void testPasswordTooShort() {
        String shortPassword = "Test@12";
        List<String> errors = PasswordValidator.validate(shortPassword);
        assertFalse(errors.isEmpty());
        assertTrue(errors.stream().anyMatch(e -> e.contains("at least 8 characters")));
    }

    @Test
    void testPasswordMissingUppercase() {
        String password = "test@1234";
        List<String> errors = PasswordValidator.validate(password);
        assertFalse(errors.isEmpty());
        assertTrue(errors.stream().anyMatch(e -> e.contains("uppercase")));
    }

    @Test
    void testPasswordMissingLowercase() {
        String password = "TEST@1234";
        List<String> errors = PasswordValidator.validate(password);
        assertFalse(errors.isEmpty());
        assertTrue(errors.stream().anyMatch(e -> e.contains("lowercase")));
    }

    @Test
    void testPasswordMissingDigit() {
        String password = "Test@abcd";
        List<String> errors = PasswordValidator.validate(password);
        assertFalse(errors.isEmpty());
        assertTrue(errors.stream().anyMatch(e -> e.contains("digit")));
    }

    @Test
    void testPasswordMissingSpecialChar() {
        String password = "Test1234";
        List<String> errors = PasswordValidator.validate(password);
        assertFalse(errors.isEmpty());
        assertTrue(errors.stream().anyMatch(e -> e.contains("special character")));
    }

    @Test
    void testNullPassword() {
        List<String> errors = PasswordValidator.validate(null);
        assertFalse(errors.isEmpty());
    }

    @Test
    void testMultipleErrors() {
        String weakPassword = "test";
        List<String> errors = PasswordValidator.validate(weakPassword);
        assertTrue(errors.size() >= 3);
    }
}
