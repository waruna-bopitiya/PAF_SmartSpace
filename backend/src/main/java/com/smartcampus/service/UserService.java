package com.smartcampus.service;

import com.smartcampus.model.User;
import com.smartcampus.model.UserRole;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Find or create user from Google OAuth
     */
    public User findOrCreateGoogleUser(String email, String name, String googleId, String profilePictureUrl) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Update Google info if not already set
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setProfilePictureUrl(profilePictureUrl);
                user.onUpdate();
                userRepository.save(user);
            }
            return user;
        }
        
        // Create new user
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFullName(name);
        newUser.setGoogleId(googleId);
        newUser.setProfilePictureUrl(profilePictureUrl);
        newUser.setRole(UserRole.fromString("USER"));
        newUser.onCreate();
        
        return userRepository.save(newUser);
    }

    /**
     * Find user by Google ID
     */
    public Optional<User> findByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId);
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Get user by ID
     */
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    /**
     * Create a new user with email and password
     */
    public User createUser(String email, String password, String fullName, UserRole role) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("User with email " + email + " already exists");
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setFullName(fullName);
        newUser.setRole(role);
        newUser.setActive(true);
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(newUser);
    }

    /**
     * Create admin user
     */
    public User createAdminUser(String email, String password, String fullName) {
        return createUser(email, password, fullName, UserRole.ADMIN);
    }

    /**
     * Get all users from database
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get all users by role
     */
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    /**
     * Delete user by ID
     */
    public boolean deleteUser(String id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Update user
     */
    public User updateUser(String id, User updatedUser) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            if (updatedUser.getFullName() != null) {
                user.setFullName(updatedUser.getFullName());
            }
            if (updatedUser.getDepartment() != null) {
                user.setDepartment(updatedUser.getDepartment());
            }
            if (updatedUser.getPhoneNumber() != null) {
                user.setPhoneNumber(updatedUser.getPhoneNumber());
            }
            if (updatedUser.getActive() != null) {
                user.setActive(updatedUser.getActive());
            }
            user.onUpdate();
            return userRepository.save(user);
        }
        throw new IllegalArgumentException("User not found with id: " + id);
    }
}
