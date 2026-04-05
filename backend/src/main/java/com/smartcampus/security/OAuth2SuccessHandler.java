package com.smartcampus.security;

import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import com.smartcampus.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserService userService;

    private static final String REDIRECT_URL = "http://localhost:3000/auth-success";

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        // Extract user info from OAuth2 provider
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String picture = oauth2User.getAttribute("picture");
        String googleId = oauth2User.getName(); // OAuth2 subject ID

        // Find or create user in database
        User user = userService.findOrCreateGoogleUser(email, name, googleId, picture);

        // Generate JWT token
        String jwtToken = jwtTokenProvider.generateToken(
                user.getEmail(),
                user.getId(),
                user.getRole()
        );

        // Redirect to frontend with token
        String redirectUrl = REDIRECT_URL + "?token=" + URLEncoder.encode(jwtToken, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
