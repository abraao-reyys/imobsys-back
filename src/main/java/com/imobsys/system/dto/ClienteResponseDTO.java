package com.imobsys.system.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ClienteResponseDTO(
        UUID id,
        String nome,
        String rg,
        String cpf,
        String email,
        String telefone,
        Double renda,
        LocalDateTime dataCadastro
) {}
