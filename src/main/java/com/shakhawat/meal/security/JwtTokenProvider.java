package com.shakhawat.meal.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secret:MySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong!@#$%^&*()}")
    private String jwtSecret;

    @Value("${jwt.expiration:900000}") // 15 minutes
    private long jwtExpiration;

    @Getter
    @Value("${jwt.refresh-expiration:2592000000}") // 30 days
    private long refreshTokenExpiration;

    private SecretKey key;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            throw new IllegalArgumentException("JWT secret key must be configured.");
        }
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate access token (short-lived)
     */
    public String generateAccessToken(Authentication authentication) {
        String username = authentication.getName();
        Instant now = Instant.now();

        Instant expirationTime = now.plusMillis(jwtExpiration);
        Date expirationDate = Date.from(expirationTime);

        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .claim("type", "access")
                .issuedAt(Date.from(now))
                .expiration(expirationDate)
                .signWith(key)
                .compact();
    }

    /**
     * Generate access token from email
     */
    public String generateAccessTokenFromEmail(String email, String roles) {
        Instant now = Instant.now();
        Instant expiryInstant = now.plusMillis(jwtExpiration);
        Date expiryDate = Date.from(expiryInstant);
        return Jwts.builder()
                .subject(email)
                .claim("roles", roles)
                .claim("type", "access")
                .issuedAt(Date.from(now))
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Generate refresh token (long-lived)
     */
    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }
}
