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

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                       Authentication authentication) throws IOException, ServletException {

        if (response.isCommitted()) {
            logger.debug("Response has already been committed.");
            return;
        }

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String googleId = oauth2User.getName();
        String profilePictureUrl = oauth2User.getAttribute("picture");

        // Find or create user
        User user = userService.findOrCreateGoogleUser(email, name, googleId, profilePictureUrl);

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(email, user.getId(), user.getRole());

        // Redirect to frontend with token and user info
        String redirectUrl = "http://localhost:3000/auth-success?token=" + token + "&email=" + email + "&fullName=" + (name != null ? java.net.URLEncoder.encode(name, "UTF-8") : "");
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
