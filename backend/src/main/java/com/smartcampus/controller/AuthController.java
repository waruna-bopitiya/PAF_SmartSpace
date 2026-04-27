package com.smartcampus.controller;

import java.util.Map;
import java.util.Optional;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.LoginRequest;
import com.smartcampus.dto.LoginResponse;
import com.smartcampus.dto.RegisterRequest;
import com.smartcampus.dto.UserDTO;
import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.service.UserService;
import com.smartcampus.service.LoginAttemptService;
import com.smartcampus.util.JwtTokenProvider;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserService userService;

    @Autowired
    private LoginAttemptService loginAttemptService;

    @Autowired
    private ModelMapper modelMapper;

    /**
     * Traditional email/password login
     * POST /auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        String email = loginRequest.getEmail();

        if (loginAttemptService.isBlocked(email)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Account is locked due to too many failed attempts. Please try again after 1 minute.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            loginRequest.getPassword()));

            Optional<User> user = userService.findByEmail(email);
            if (user.isPresent()) {
                loginAttemptService.loginSucceeded(email);
                String token = jwtTokenProvider.generateToken(
                        user.get().getEmail(),
                        user.get().getId(),
                        user.get().getRole());
                return ResponseEntity.ok(new LoginResponse(
                        token,
                        user.get().getEmail(),
                        user.get().getFullName(),
                        user.get().getRole().toString()));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");

        } catch (AuthenticationException e) {
            loginAttemptService.loginFailed(email);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
    }

    /**
     * Create a new user account
     * POST /auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            UserRole requestedRole = UserRole.USER;
            if (registerRequest.getRole() != null && !registerRequest.getRole().isBlank()) {
                requestedRole = UserRole.fromString(registerRequest.getRole());
            }

            if (requestedRole != UserRole.USER) {
                return ResponseEntity.badRequest().body("Only USER role is allowed for account creation");
            }

            User createdUser = userService.createUser(
                    registerRequest.getEmail(),
                    registerRequest.getPassword(),
                    registerRequest.getFullName(),
                    UserRole.USER);

            UserDTO response = new UserDTO();
            response.setId(createdUser.getId());
            response.setEmail(createdUser.getEmail());
            response.setFullName(createdUser.getFullName());
            response.setRole(createdUser.getRole().name());
            response.setActive(createdUser.getActive());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating user account");
        }
    }

    /**
     * Create admin user
     * POST /auth/admin/create
     * Request body: { "email": "admin@example.com", "password": "password123",
     * "fullName": "Admin User" }
     */
    @PostMapping("/admin/create")
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String fullName = request.get("fullName");

            if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
                return ResponseEntity.badRequest().body("Email and password are required");
            }

            if (password.length() < 6) {
                return ResponseEntity.badRequest().body("Password must be at least 6 characters");
            }

            if (fullName == null || fullName.isEmpty()) {
                fullName = email;
            }

            User adminUser = userService.createAdminUser(email, password, fullName);
            UserDTO userDTO = modelMapper.map(adminUser, UserDTO.class);

            return ResponseEntity.status(HttpStatus.CREATED).body(userDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating admin user");
        }
    }

    /**
     * Validate JWT token
     * GET /auth/validate
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            if (jwtTokenProvider.validateToken(token)) {
                String email = jwtTokenProvider.getEmailFromToken(token);
                String userId = jwtTokenProvider.getUserIdFromToken(token);
                return ResponseEntity.ok(new LoginResponse(token, email, "Valid"));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token validation failed");
        }
    }

    /**
     * Logout (frontend handles token removal)
     * POST /auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok("Logout successful");
    }

    /**
     * Get current user info (from JWT)
     * GET /auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            String bearerToken = token;
            if (bearerToken.startsWith("Bearer ")) {
                bearerToken = bearerToken.substring(7);
            }

            String email = jwtTokenProvider.getEmailFromToken(bearerToken);
            Optional<User> user = userService.findByEmail(email);

            if (user.isPresent()) {
                UserDTO userDTO = modelMapper.map(user.get(), UserDTO.class);
                return ResponseEntity.ok(userDTO);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }

    /**
     * Refresh JWT token
     * POST /auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String token) {
        try {
            String bearerToken = token;
            if (bearerToken.startsWith("Bearer ")) {
                bearerToken = bearerToken.substring(7);
            }

            if (!jwtTokenProvider.validateToken(bearerToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            String userId = jwtTokenProvider.getUserIdFromToken(bearerToken);
            String email = jwtTokenProvider.getEmailFromToken(bearerToken);

            Optional<User> user = userService.getUserById(userId);
            if (user.isPresent()) {
                String newToken = jwtTokenProvider.generateToken(email, userId, user.get().getRole());
                return ResponseEntity.ok(new LoginResponse(
                        newToken,
                        email,
                        user.get().getFullName(),
                        user.get().getRole().toString()));
            }

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token refresh failed");
        }
    }
}
