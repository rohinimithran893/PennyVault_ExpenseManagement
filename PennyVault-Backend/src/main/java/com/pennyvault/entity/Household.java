package com.pennyvault.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "households")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Household {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id", nullable = false, unique = true)
    private User owner;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
