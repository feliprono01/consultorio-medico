package com.consultorio.dto;

public class AuthResponseDTO {
    private String token;
    private String role;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(String token, String role) {
        this.token = token;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public static AuthResponseDTOBuilder builder() {
        return new AuthResponseDTOBuilder();
    }

    public static class AuthResponseDTOBuilder {
        private String token;
        private String role;

        public AuthResponseDTOBuilder token(String token) {
            this.token = token;
            return this;
        }

        public AuthResponseDTOBuilder role(String role) {
            this.role = role;
            return this;
        }

        public AuthResponseDTO build() {
            return new AuthResponseDTO(token, role);
        }
    }
}
