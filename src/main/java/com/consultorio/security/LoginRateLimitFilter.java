package com.consultorio.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Filtro de rate limiting para el endpoint de login.
 *
 * Aplica un límite de 5 intentos de login cada 15 minutos por IP.
 * Actúa como segunda línea de defensa si el nginx es bypasseado (acceso directo al puerto 8080).
 *
 * Algoritmo: Token Bucket — se recargan 5 tokens cada 15 minutos.
 * Responde 429 Too Many Requests con header Retry-After si se supera el límite.
 */
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(LoginRateLimitFilter.class);

    private static final String LOGIN_PATH = "/api/auth/login";
    private static final int MAX_REQUESTS = 5;
    private static final Duration REFILL_DURATION = Duration.ofMinutes(15);

    // Un bucket por IP — se limpia automáticamente al no recibir más requests
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Solo aplicar al endpoint de login
        if (!LOGIN_PATH.equals(request.getServletPath())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        Bucket bucket = buckets.computeIfAbsent(clientIp, this::createNewBucket);

        if (bucket.tryConsume(1)) {
            // Tiene tokens disponibles — continuar con la request
            filterChain.doFilter(request, response);
        } else {
            // Sin tokens — rechazar con 429
            log.warn("Rate limit excedido para login desde IP: {}", clientIp);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(REFILL_DURATION.toSeconds()));
            response.getWriter().write(
                "{\"status\":429,\"error\":\"Too Many Requests\"," +
                "\"message\":\"Demasiados intentos de login. Esperá 15 minutos antes de intentar nuevamente.\"}"
            );
        }
    }

    private Bucket createNewBucket(String ip) {
        Bandwidth limit = Bandwidth.classic(
            MAX_REQUESTS,
            Refill.greedy(MAX_REQUESTS, REFILL_DURATION)
        );
        return Bucket.builder().addLimit(limit).build();
    }

    /**
     * Extrae la IP real del cliente, considerando proxies y load balancers.
     * Prioriza X-Forwarded-For (seteado por nginx) sobre la IP directa.
     */
    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // X-Forwarded-For puede contener múltiples IPs: "client, proxy1, proxy2"
            return xff.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
