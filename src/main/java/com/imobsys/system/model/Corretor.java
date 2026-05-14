package com.imobsys.system.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "tb_corretores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Corretor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;
    private String rg;

    @Column(unique = true, nullable = false)
    private String cpf;

    @Column(unique = true)
    private String email;
    private String telefone;
}