package com.cinefile.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank @Size(min=3,max=50)
    private String username;
    @NotBlank @Size(min=3,max=100)
    private String password;
}

@Data
class RegisterRequest {
    @NotBlank @Size(min=3,max=50)
    private String username;
    @NotBlank @Size(min=3,max=100)
    private String password;
    private String email;
}

@Data
class TokenResponse {
    private String token;
    private String username;
    private String role;
    public TokenResponse(String token, String username, String role) {
        this.token = token; this.username = username; this.role = role;
    }
}

