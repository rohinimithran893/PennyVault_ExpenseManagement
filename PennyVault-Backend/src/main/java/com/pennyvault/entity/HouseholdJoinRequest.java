package com.pennyvault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "household_join_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseholdJoinRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "household_id", nullable = false)
    private Long householdId;

    @Column(name = "requester_user_id", nullable = false)
    private Long requesterUserId;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by_user_id")
    private Long reviewedByUserId;
}
