package com.imobsys.system.dto;

import java.util.UUID;

public record CorretorResponseDTO(
        UUID id,
        String nome,
        String rg,
        String cpf,
        String email,
        String telefone
) {}
