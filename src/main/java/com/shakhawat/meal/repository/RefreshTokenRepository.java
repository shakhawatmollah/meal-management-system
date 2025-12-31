package com.shakhawat.meal.repository;

import com.shakhawat.meal.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByEmployeeIdAndRevokedFalse(Long employeeId);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.employee.id = :employeeId")
    void revokeAllByEmployeeId(Long employeeId);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now")
    void deleteExpiredTokens(Instant now);

    boolean existsByTokenAndRevokedFalse(String token);
}
